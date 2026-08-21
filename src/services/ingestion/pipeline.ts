import { Paper } from '../../types/paper';
import { UserProfile } from '../../types/profile';
import { searchPubMedArticles, RawPubMedArticle } from './pubmed';
import { enrichWithEuropePmc, searchEuropePmcArticles } from './europePmc';
import { enrichWithOpenAlex } from './openalex';
import { deduplicatePapers } from './deduplicator';
import { classifyOvarianCancerDisease } from '../classification/diseaseClassifier';
import { classifyOvarianSubtype } from '../classification/subtypeClassifier';
import { computeRelevanceAndHgsocScores } from '../ranking/relevanceScorer';
import { computeScientificImportanceScore } from '../ranking/importanceScorer';
import { computePersonalizationScore } from '../ranking/personalizationScorer';
import { computeNoveltyScore } from '../ranking/noveltyScorer';
import { computeFinalScore } from '../ranking/finalScorer';
import { extractBiologicalEntities } from '../entities/extractor';
import { generatePaperEmbedding } from '../embeddings/semanticEngine';
import { generateStructuredAiSummary } from '../ai/geminiSummarizer';

export interface PipelineExecutionReport {
  timestamp: string;
  query: string;
  papersRetrieved: number;
  duplicatesRemoved: number;
  relevantPapersKept: number;
  rejectedNonOvarian: number;
  highPriorityCount: number;
  hgsocCount: number;
  summariesGenerated: number;
  newPapers: Paper[];
  logs: string[];
}

export async function runIngestionPipeline(
  query: string,
  dateRangeDays: number,
  limit: number,
  existingPapers: Paper[],
  userProfile: UserProfile,
  onProgress?: (status: string, progressPercent: number) => void
): Promise<PipelineExecutionReport> {
  const logs: string[] = [];
  const addLog = (msg: string) => {
    logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
  };

  addLog(`Initiating Ingestion Pipeline for query: "${query}" (Range: last ${dateRangeDays} days)`);
  onProgress?.('Querying NCBI PubMed E-Utilities and Europe PMC APIs...', 10);

  // 1. Fetch from PubMed & PMC in parallel
  let pubmedArticles: RawPubMedArticle[] = [];
  let pmcArticles: RawPubMedArticle[] = [];

  try {
    const [pmResults, pmcResults] = await Promise.allSettled([
      searchPubMedArticles(
        query,
        limit,
        dateRangeDays,
        userProfile.ncbiApiKey,
        userProfile.ncbiEmail
      ),
      searchEuropePmcArticles(query, Math.min(limit, 30))
    ]);

    if (pmResults.status === 'fulfilled') {
      pubmedArticles = pmResults.value;
    }
    if (pmcResults.status === 'fulfilled') {
      pmcArticles = pmcResults.value;
    }
  } catch (e) {
    console.warn('Error during parallel fetch:', e);
  }

  const rawArticles = [...pubmedArticles, ...pmcArticles];
  addLog(`Retrieved ${pubmedArticles.length} from PubMed and ${pmcArticles.length} from PMC (${rawArticles.length} total candidates)`);
  onProgress?.(`Retrieved ${rawArticles.length} records from PubMed & PMC. Deduplicating...`, 30);

  // 2. Deduplicate
  const { unique: uniqueRaw, duplicatesCount } = deduplicatePapers(rawArticles, existingPapers);
  addLog(`Deduplication filtered out ${duplicatesCount} duplicate papers; ${uniqueRaw.length} unique candidates remain`);
  onProgress?.(`Processing ${uniqueRaw.length} unique papers through classification engine...`, 50);

  // 3. Process each candidate paper through NLP, Classification, Scoring & Entity Discovery
  const newPapers: Paper[] = [];
  let rejectedCount = 0;
  let hgsocCount = 0;
  let summariesCount = 0;

  for (let i = 0; i < uniqueRaw.length; i++) {
    const raw = uniqueRaw[i];
    const progress = 50 + Math.floor((i / uniqueRaw.length) * 35);
    onProgress?.(`Analyzing paper ${i + 1}/${uniqueRaw.length}: "${raw.title.slice(0, 40)}..."`, progress);

    // A. Disease Classification
    const diseaseResult = classifyOvarianCancerDisease(raw.title, raw.abstract, raw.meshTerms, raw.keywords);
    if (!diseaseResult.isOvarianCancer && diseaseResult.confidence < 50) {
      rejectedCount++;
      addLog(`Rejected non-ovarian record: "${raw.title.slice(0, 45)}..."`);
      continue;
    }

    // B. Subtype Classification
    const subtypeResult = classifyOvarianSubtype(raw.title, raw.abstract, raw.keywords);
    if (subtypeResult.isHGSOC) {
      hgsocCount++;
    }

    // C. Scores
    const relAndHgsoc = computeRelevanceAndHgsocScores(
      diseaseResult,
      subtypeResult.subtype,
      subtypeResult.confidence,
      raw.title,
      raw.abstract,
      raw.keywords
    );

    const importanceResult = computeScientificImportanceScore(
      raw.title,
      raw.abstract,
      raw.journal,
      0,
      Boolean(raw.pmcid)
    );

    const personalizationResult = computePersonalizationScore(
      raw.title,
      raw.abstract,
      raw.keywords,
      userProfile
    );

    const noveltyResult = computeNoveltyScore(
      raw.title,
      raw.abstract,
      raw.publicationDate
    );

    const scores = computeFinalScore(
      {
        relevanceScore: relAndHgsoc.relevanceScore,
        hgsocScore: relAndHgsoc.hgsocScore,
        importanceScore: importanceResult.importanceScore,
        personalizationScore: personalizationResult.personalizationScore,
        noveltyScore: noveltyResult.noveltyScore,
        relevanceReason: relAndHgsoc.relevanceReason,
        hgsocReason: relAndHgsoc.hgsocReason,
        importanceReason: importanceResult.importanceReason,
        personalizationReason: personalizationResult.personalizationReason,
        noveltyReason: noveltyResult.noveltyReason,
      },
      userProfile.scoringWeights
    );

    // D. Dynamic Entity Extraction (NO PREDEFINED HARDCODED GENE LIST)
    const entities = extractBiologicalEntities(
      raw.title,
      raw.abstract,
      raw.meshTerms,
      raw.keywords
    );

    // E. Assemble Paper object
    const paperId = raw.pmid ? `pmid_${raw.pmid}` : `pap_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const nowIso = new Date().toISOString();

    const paper: Paper = {
      id: paperId,
      title: raw.title,
      abstract: raw.abstract,
      doi: raw.doi,
      pmid: raw.pmid,
      pmcid: raw.pmcid,
      journal: raw.journal,
      publicationDate: raw.publicationDate,
      authors: raw.authors,
      affiliations: raw.affiliations,
      keywords: raw.keywords,
      meshTerms: raw.meshTerms,
      studyType: importanceResult.studyType,
      sampleSize: importanceResult.sampleSize,
      sources: ['PubMed'],
      citationCount: 0,
      openAccess: Boolean(raw.pmcid),
      fullTextUrl: raw.pmcid
        ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${raw.pmcid}/`
        : raw.doi
        ? `https://doi.org/${raw.doi}`
        : raw.pmid
        ? `https://pubmed.ncbi.nlm.nih.gov/${raw.pmid}/`
        : undefined,
      disease: 'Ovarian cancer',
      ovarianSubtype: subtypeResult.subtype,
      ovarianSubtypeConfidence: subtypeResult.confidence,
      subtypeEvidenceRationale: subtypeResult.evidenceRationale,
      scores,
      entities,
      isAiSummarized: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // F. Embedding vector
    paper.embedding = generatePaperEmbedding(paper);

    // G. Generate AI Summary for high-priority papers (score >= user threshold)
    if (userProfile.autoAiSummarizeTopPapers && scores.finalScore >= userProfile.minScoreForAutoSummary) {
      try {
        const aiSummary = await generateStructuredAiSummary(paper, userProfile);
        paper.aiSummary = aiSummary;
        paper.isAiSummarized = true;
        summariesCount++;
      } catch (e) {
        console.warn('AI summary failed for', paper.id, e);
      }
    }

    newPapers.push(paper);
  }

  onProgress?.('Ingestion pipeline completed successfully.', 100);
  addLog(`Pipeline complete: ${newPapers.length} relevant ovarian papers integrated (${hgsocCount} HGSOC, ${summariesCount} structured summaries generated)`);

  const highPriorityCount = newPapers.filter((p) => p.scores.finalScore >= 80).length;

  return {
    timestamp: new Date().toISOString(),
    query,
    papersRetrieved: rawArticles.length,
    duplicatesRemoved: duplicatesCount,
    relevantPapersKept: newPapers.length,
    rejectedNonOvarian: rejectedCount,
    highPriorityCount,
    hgsocCount,
    summariesGenerated: summariesCount,
    newPapers,
    logs,
  };
}
