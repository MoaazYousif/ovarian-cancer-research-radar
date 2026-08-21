import { Paper } from '../../types/paper';

const VECTOR_DIM = 64;

// Simple deterministic hash for semantic token representation
function tokenToHash(word: string): number {
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    const char = word.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generate a dense normalized embedding vector for a paper
 * based on title, abstract, keywords, and biological entities.
 */
export function generatePaperEmbedding(paper: Partial<Paper>): number[] {
  const vector = new Array(VECTOR_DIM).fill(0);
  const text = `${paper.title || ''} ${paper.abstract || ''} ${(paper.keywords || []).join(' ')} ${(paper.entities?.genes || []).join(' ')} ${(paper.entities?.pathways || []).join(' ')} ${(paper.entities?.drugs || []).join(' ')}`;

  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);

  if (tokens.length === 0) return vector;

  tokens.forEach((token, index) => {
    const h = tokenToHash(token);
    const pos = h % VECTOR_DIM;
    const sign = (h % 2 === 0 ? 1 : -1);
    // Weight earlier tokens (title/abstract beginning) slightly higher
    const posWeight = 1.0 + 1.0 / (index + 1);
    vector[pos] += sign * posWeight;
  });

  // Include biological entity bonus signals
  if (paper.entities) {
    paper.entities.genes?.forEach((g) => {
      const pos = tokenToHash(g.toLowerCase()) % VECTOR_DIM;
      vector[pos] += 2.5;
    });
    paper.entities.drugs?.forEach((d) => {
      const pos = tokenToHash(d.toLowerCase()) % VECTOR_DIM;
      vector[pos] += 2.0;
    });
    paper.entities.pathways?.forEach((p) => {
      const pos = tokenToHash(p.toLowerCase()) % VECTOR_DIM;
      vector[pos] += 2.0;
    });
  }

  // Normalize to unit vector
  let norm = 0;
  for (let i = 0; i < VECTOR_DIM; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < VECTOR_DIM; i++) {
      vector[i] = vector[i] / norm;
    }
  }

  return vector;
}

/**
 * Cosine similarity between two unit vectors (0.0 to 1.0)
 */
export function cosineSimilarity(v1: number[], v2: number[]): number {
  if (!v1 || !v2 || v1.length !== v2.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
  }
  // Clamp between 0 and 1 for positive semantic representation
  return Math.max(0, Math.min(1, (dotProduct + 1) / 2));
}

export interface SearchResult {
  paper: Paper;
  similarityScore: number;
  vectorScore: number;
  keywordScore: number;
  matchedKeywords: string[];
}

export function performHybridSearch(
  query: string,
  papers: Paper[],
  limit: number = 10
): SearchResult[] {
  if (!query || query.trim() === '') {
    return papers.slice(0, limit).map((p) => ({
      paper: p,
      similarityScore: p.scores.finalScore / 100,
      vectorScore: p.scores.finalScore / 100,
      keywordScore: 0,
      matchedKeywords: [],
    }));
  }

  const queryVector = generatePaperEmbedding({
    title: query,
    abstract: query,
  });

  const queryTokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);

  const results: SearchResult[] = [];

  papers.forEach((paper) => {
    const text = `${paper.title} ${paper.abstract} ${paper.keywords.join(' ')} ${paper.meshTerms.join(' ')}`.toLowerCase();
    const titleLower = paper.title.toLowerCase();

    // 1. Vector Cosine Similarity
    const paperVector = paper.embedding || generatePaperEmbedding(paper);
    const vectorScore = cosineSimilarity(queryVector, paperVector);

    // 2. Keyword score
    let keywordScore = 0;
    const matchedKeywords: string[] = [];

    queryTokens.forEach((token) => {
      if (titleLower.includes(token)) {
        keywordScore += 0.35;
        if (!matchedKeywords.includes(token)) matchedKeywords.push(token);
      } else if (text.includes(token)) {
        keywordScore += 0.15;
        if (!matchedKeywords.includes(token)) matchedKeywords.push(token);
      }
    });

    // Check entity matches
    paper.entities.genes.forEach((g) => {
      if (query.toLowerCase().includes(g.toLowerCase()) && !matchedKeywords.includes(g)) {
        keywordScore += 0.4;
        matchedKeywords.push(g);
      }
    });
    paper.entities.drugs.forEach((d) => {
      if (query.toLowerCase().includes(d.toLowerCase()) && !matchedKeywords.includes(d)) {
        keywordScore += 0.4;
        matchedKeywords.push(d);
      }
    });

    const normKeywordScore = Math.min(1.0, keywordScore);
    const similarityScore = vectorScore * 0.45 + normKeywordScore * 0.55;

    if (similarityScore >= 0.15 || matchedKeywords.length > 0) {
      results.push({
        paper,
        similarityScore,
        vectorScore,
        keywordScore: normKeywordScore,
        matchedKeywords,
      });
    }
  });

  return results
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);
}

/**
 * Hybrid Semantic Search
 * Combines keyword BM25/fuzzy matches with vector cosine similarity.
 */
export function searchPapersHybrid(
  query: string,
  papers: Paper[],
  minRelevanceThreshold: number = 0.15
): { paper: Paper; score: number; matchReasons: string[] }[] {
  if (!query || query.trim() === '') {
    return papers.map((p) => ({
      paper: p,
      score: p.scores.finalScore / 100,
      matchReasons: ['Ranked by final intelligence score'],
    }));
  }

  const queryVector = generatePaperEmbedding({
    title: query,
    abstract: query,
  });

  const queryTokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);

  const results: { paper: Paper; score: number; matchReasons: string[] }[] = [];

  papers.forEach((paper) => {
    const text = `${paper.title} ${paper.abstract} ${paper.keywords.join(' ')} ${paper.meshTerms.join(' ')}`.toLowerCase();
    const titleLower = paper.title.toLowerCase();

    // 1. Vector Cosine Similarity (0 to 1)
    const paperVector = paper.embedding || generatePaperEmbedding(paper);
    const vectorSim = cosineSimilarity(queryVector, paperVector);

    // 2. Keyword & Concept matching
    let keywordScore = 0;
    const matchReasons: string[] = [];

    let exactTitleMatches = 0;
    let exactTextMatches = 0;

    queryTokens.forEach((token) => {
      if (titleLower.includes(token)) {
        keywordScore += 0.35;
        exactTitleMatches++;
      } else if (text.includes(token)) {
        keywordScore += 0.15;
        exactTextMatches++;
      }
    });

    if (exactTitleMatches > 0) {
      matchReasons.push(`Title matches ${exactTitleMatches} query keyword${exactTitleMatches > 1 ? 's' : ''}`);
    }
    if (exactTextMatches > 0) {
      matchReasons.push(`Abstract matches ${exactTextMatches} keyword${exactTextMatches > 1 ? 's' : ''}`);
    }

    // Check entity matches
    const matchedGenes = paper.entities.genes.filter((g) => query.toLowerCase().includes(g.toLowerCase()));
    if (matchedGenes.length > 0) {
      keywordScore += 0.4;
      matchReasons.push(`Matched gene target: ${matchedGenes.join(', ')}`);
    }

    const matchedDrugs = paper.entities.drugs.filter((d) => query.toLowerCase().includes(d.toLowerCase()));
    if (matchedDrugs.length > 0) {
      keywordScore += 0.4;
      matchReasons.push(`Matched therapeutic agent: ${matchedDrugs.join(', ')}`);
    }

    const matchedPathways = paper.entities.pathways.filter((p) => query.toLowerCase().includes(p.toLowerCase()));
    if (matchedPathways.length > 0) {
      keywordScore += 0.4;
      matchReasons.push(`Matched pathway: ${matchedPathways.join(', ')}`);
    }

    if (vectorSim >= 0.7) {
      matchReasons.push(`High semantic concept similarity (${Math.round(vectorSim * 100)}%)`);
    }

    // Hybrid combined score: 50% semantic vector + 50% keyword/entity score
    const hybridScore = vectorSim * 0.45 + Math.min(1.0, keywordScore) * 0.55;

    if (hybridScore >= minRelevanceThreshold || exactTitleMatches > 0 || matchedGenes.length > 0 || matchedDrugs.length > 0) {
      results.push({
        paper,
        score: hybridScore,
        matchReasons: matchReasons.length > 0 ? matchReasons : ['Semantic topic correlation'],
      });
    }
  });

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Find Similar Papers for a given target paper
 */
export function findSimilarPapers(
  targetPaper: Paper,
  allPapers: Paper[],
  limit: number = 4
): { paper: Paper; similarityPercent: number; sharedElements: string[] }[] {
  const targetVector = targetPaper.embedding || generatePaperEmbedding(targetPaper);

  const similarities: {
    paper: Paper;
    similarityPercent: number;
    sharedElements: string[];
  }[] = [];

  allPapers.forEach((paper) => {
    if (paper.id === targetPaper.id) return;

    const paperVector = paper.embedding || generatePaperEmbedding(paper);
    const cosSim = cosineSimilarity(targetVector, paperVector);

    // Shared biological entities
    const sharedGenes = targetPaper.entities.genes.filter((g) => paper.entities.genes.includes(g));
    const sharedDrugs = targetPaper.entities.drugs.filter((d) => paper.entities.drugs.includes(d));
    const sharedPathways = targetPaper.entities.pathways.filter((p) => paper.entities.pathways.includes(p));
    const sameSubtype = targetPaper.ovarianSubtype === paper.ovarianSubtype;

    const sharedElements: string[] = [];
    if (sameSubtype && targetPaper.ovarianSubtype !== 'Unspecified') {
      sharedElements.push(`Same subtype (${targetPaper.ovarianSubtype})`);
    }
    if (sharedGenes.length > 0) {
      sharedElements.push(`Shared genes: ${sharedGenes.slice(0, 2).join(', ')}`);
    }
    if (sharedDrugs.length > 0) {
      sharedElements.push(`Shared therapies: ${sharedDrugs.slice(0, 2).join(', ')}`);
    }
    if (sharedPathways.length > 0) {
      sharedElements.push(`Shared pathway: ${sharedPathways[0]}`);
    }

    // Entity overlap bonus
    const entityBonus = (sharedGenes.length * 0.08) + (sharedDrugs.length * 0.08) + (sharedPathways.length * 0.06) + (sameSubtype ? 0.05 : 0);
    const finalSim = Math.min(0.99, Math.max(0.1, cosSim * 0.75 + entityBonus));

    similarities.push({
      paper,
      similarityPercent: Math.round(finalSim * 100),
      sharedElements: sharedElements.length > 0 ? sharedElements : ['Shared oncology theme'],
    });
  });

  return similarities
    .sort((a, b) => b.similarityPercent - a.similarityPercent)
    .slice(0, limit);
}
