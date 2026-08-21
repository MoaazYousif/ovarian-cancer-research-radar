import { OvarianSubtype } from '../../types/paper';
import { DiseaseClassificationResult } from '../classification/diseaseClassifier';

export interface RelevanceScoreResult {
  relevanceScore: number; // 0 - 100
  hgsocScore: number;     // 0 - 100
  relevanceReason: string;
  hgsocReason: string;
}

export function computeRelevanceAndHgsocScores(
  diseaseResult: DiseaseClassificationResult,
  subtype: OvarianSubtype,
  subtypeConfidence: number,
  title: string,
  abstract: string,
  keywords: string[] = []
): RelevanceScoreResult {
  const fullText = `${title} ${abstract} ${keywords.join(' ')}`.toLowerCase();
  const titleLower = title.toLowerCase();

  // 1. Calculate base Ovarian Relevance (0-100)
  let relevance = 0;
  let relevanceReason = '';

  if (diseaseResult.relevanceCategory === 'Direct Ovarian Cancer') {
    relevance = 85;
    if (titleLower.includes('ovarian') || titleLower.includes('hgsoc') || titleLower.includes('hgsc')) {
      relevance += 10;
    }
    // Boost if molecular / therapeutic / genomic
    if (
      fullText.includes('biomarker') ||
      fullText.includes('rna-seq') ||
      fullText.includes('single-cell') ||
      fullText.includes('resistance') ||
      fullText.includes('therapeutic target') ||
      fullText.includes('mutation')
    ) {
      relevance = Math.min(100, relevance + 5);
    }
    relevanceReason = 'High primary relevance: Core study subject focused directly on ovarian cancer molecular/clinical biology.';
  } else if (diseaseResult.relevanceCategory === 'Related Ovarian Malignancy') {
    relevance = 65;
    relevanceReason = 'Moderate relevance: Ovarian cancer included as part of broader gynecologic or multi-tumor investigation.';
  } else if (diseaseResult.relevanceCategory === 'Incidental Mention') {
    relevance = 30;
    relevanceReason = 'Low relevance: Ovarian cancer mentioned only incidentally in background/discussion.';
  } else {
    relevance = 10;
    relevanceReason = 'Marginal/non-relevant: Little or no direct connection to ovarian cancer.';
  }

  // 2. Calculate HGSOC Priority Score (0-100)
  // Direct HGSOC study ≈ 90–100
  // General epithelial ovarian cancer study ≈ 50–70
  // Ovarian cancer study with no subtype ≈ 30–50
  // Other subtype (Clear cell, LGSOC, Endometrioid) ≈ 40-60 (kept in DB, prioritized contextually)
  // Unrelated ovarian cancer mention < 20
  let hgsocScore = 0;
  let hgsocReason = '';

  if (subtype === 'HGSOC') {
    if (titleLower.includes('high-grade serous') || titleLower.includes('hgsoc') || titleLower.includes('hgsc')) {
      hgsocScore = Math.min(100, 92 + Math.floor(subtypeConfidence * 0.08));
      hgsocReason = 'Highest priority (95+): Dedicated High-Grade Serous Ovarian Carcinoma study explicitly defined in title.';
    } else {
      hgsocScore = Math.min(95, 85 + Math.floor(subtypeConfidence * 0.1));
      hgsocReason = 'High priority (85-95): Cohort verified as HGSOC / High-Grade Serous Carcinoma.';
    }
  } else if (subtype === 'Mixed') {
    hgsocScore = 70;
    hgsocReason = 'Substantial priority (70): Multi-subtype cohort including substantial High-Grade Serous population.';
  } else if (subtype === 'Other epithelial') {
    hgsocScore = 60;
    hgsocReason = 'Moderate priority (60): General Epithelial Ovarian Cancer study with broad translational applicability to HGSOC.';
  } else if (subtype === 'Unspecified') {
    hgsocScore = 45;
    hgsocReason = 'Baseline priority (45): Ovarian cancer study without explicit histological subtype designation.';
  } else if (subtype === 'Clear cell' || subtype === 'Endometrioid' || subtype === 'Low-grade serous') {
    hgsocScore = 40;
    hgsocReason = `Non-HGSOC specific (${subtype}): Retained for comparative subtype biology and cross-ovarian insights.`;
  } else if (subtype === 'Mucinous' || subtype === 'Borderline') {
    hgsocScore = 30;
    hgsocReason = `Distinct subtype (${subtype}): Histologically distinct from High-Grade Serous pathology.`;
  } else {
    hgsocScore = 15;
    hgsocReason = 'Non-epithelial or non-specific subtype with low HGSOC specificity.';
  }

  return {
    relevanceScore: Math.round(relevance),
    hgsocScore: Math.round(hgsocScore),
    relevanceReason,
    hgsocReason,
  };
}
