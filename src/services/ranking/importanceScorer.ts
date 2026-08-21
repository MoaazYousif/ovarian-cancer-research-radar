import { StudyType } from '../../types/paper';

export interface ImportanceScoreResult {
  importanceScore: number; // 0 - 100
  studyType: StudyType;
  sampleSize?: number;
  importanceReason: string;
}

export function computeScientificImportanceScore(
  title: string,
  abstract: string,
  journal: string,
  citationCount: number = 0,
  openAccess: boolean = false
): ImportanceScoreResult {
  const text = `${title} ${abstract}`.toLowerCase();

  let detectedStudyType: StudyType = 'In Vitro / In Vivo Experimental';
  let baseScore = 60;
  let reason = '';

  // Extract sample size if present (e.g., "n = 452", "452 patients", "cohort of 320")
  let sampleSize: number | undefined = undefined;
  const sampleMatch = text.match(/(?:n\s*=\s*|cohort of\s*|among\s*|including\s*)(\d{2,5})\s*(?:patients|samples|cases|individuals|tumors)/i);
  if (sampleMatch && sampleMatch[1]) {
    sampleSize = parseInt(sampleMatch[1], 10);
  }

  // 1. Study Hierarchy Classification
  if (
    text.includes('phase 3') ||
    text.includes('phase iii') ||
    text.includes('randomized controlled trial') ||
    text.includes('rct') ||
    text.includes('double-blind, randomized')
  ) {
    detectedStudyType = 'Phase III Trial';
    baseScore = 95;
    reason = 'Tier 1 Highest Evidence: Phase III randomized controlled trial with practice-informing clinical outcomes.';
  } else if (text.includes('tcga') || text.includes('cptac') || text.includes('icgc') || text.includes('consortium')) {
    detectedStudyType = 'Major Consortium (TCGA/CPTAC/ICGC)';
    baseScore = 92;
    reason = 'Tier 1 Multi-omics Consortium: High-dimensional multi-institutional genomic/proteomic repository.';
  } else if (text.includes('phase 2') || text.includes('phase ii') || text.includes('clinical trial')) {
    detectedStudyType = 'Phase II Trial';
    baseScore = 86;
    reason = 'Tier 2 Clinical Trial: Prospective Phase II therapeutic/interventional trial.';
  } else if (
    text.includes('spatial transcriptomics') ||
    text.includes('single-cell rna') ||
    text.includes('scrna-seq') ||
    text.includes('single cell rna-seq')
  ) {
    detectedStudyType = 'Single-Cell / Spatial Study';
    baseScore = 84;
    reason = 'High-Resolution Discovery: Single-cell/spatial profiling dissecting tumor microenvironment heterogeneity.';
  } else if (
    (text.includes('multi-omics') || text.includes('proteogenomic') || text.includes('transcriptome')) &&
    (text.includes('independent cohort') || text.includes('external validation'))
  ) {
    detectedStudyType = 'Translational & Multi-omics';
    baseScore = 82;
    reason = 'Translational Discovery: Multi-omics molecular characterization with independent cohort validation.';
  } else if (text.includes('prospective') || (sampleSize && sampleSize > 300)) {
    detectedStudyType = 'Prospective Cohort';
    baseScore = 78;
    reason = `Large Clinical Cohort${sampleSize ? ` (n=${sampleSize})` : ''}: Prospective or high-powered validation dataset.`;
  } else if (text.includes('systematic review') || text.includes('meta-analysis')) {
    detectedStudyType = 'Systematic Review / Meta-analysis';
    baseScore = 76;
    reason = 'Evidence Synthesis: Systematic review and meta-analysis of aggregated clinical datasets.';
  } else if (text.includes('retrospective') || text.includes('institutional cohort')) {
    detectedStudyType = 'Retrospective Cohort';
    baseScore = 68;
    reason = 'Observational Study: Retrospective clinical cohort evaluating patient outcomes or biomarkers.';
  } else if (text.includes('in silico') || text.includes('bioinformatic') || text.includes('machine learning')) {
    detectedStudyType = 'Computational / Bioinformatic';
    baseScore = 66;
    reason = 'Computational Investigation: In silico modeling, differential expression, or machine learning biomarker discovery.';
  } else if (text.includes('case report') || text.includes('editorial') || text.includes('commentary')) {
    detectedStudyType = 'Case Report / Commentary';
    baseScore = 38;
    reason = 'Descriptive / Commentary: Single case report or narrative discussion with limited statistical generalizability.';
  } else {
    detectedStudyType = 'In Vitro / In Vivo Experimental';
    baseScore = 64;
    reason = 'Experimental Biology: Preclinical in vitro / in vivo functional assay exploring cellular mechanisms.';
  }

  // 2. Adjustments based on Sample Size
  let scoreAdjustment = 0;
  if (sampleSize) {
    if (sampleSize > 1000) scoreAdjustment += 6;
    else if (sampleSize > 300) scoreAdjustment += 4;
    else if (sampleSize > 100) scoreAdjustment += 2;
  }

  // 3. Validation Indicators
  if (text.includes('independently validated') || text.includes('external cohort validation')) {
    scoreAdjustment += 4;
  }
  if (text.includes('patient-derived xenograft') || text.includes('pdx') || text.includes('organoid')) {
    scoreAdjustment += 3;
  }

  // 4. Journal Impact weight (modest modifier, max +5 / -2, never excludes non-prestigious journals)
  const topTierJournals = [
    'nature',
    'cell',
    'science',
    'cancer discovery',
    'nature cancer',
    'nature medicine',
    'lancet oncology',
    'journal of clinical oncology',
    'clinical cancer research',
    'cancer research',
    'annals of oncology',
    'molecular cancer',
  ];
  const journalLower = journal.toLowerCase();
  if (topTierJournals.some((j) => journalLower.includes(j))) {
    scoreAdjustment += 5;
  }

  // 5. Open Access indicator
  if (openAccess) {
    scoreAdjustment += 1;
  }

  const finalImportance = Math.min(100, Math.max(10, baseScore + scoreAdjustment));

  return {
    importanceScore: Math.round(finalImportance),
    studyType: detectedStudyType,
    sampleSize,
    importanceReason: reason,
  };
}
