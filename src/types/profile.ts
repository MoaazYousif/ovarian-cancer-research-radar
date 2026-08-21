import { OvarianSubtype } from './paper';

export interface ScoringWeights {
  relevance: number;       // default: 0.25
  hgsoc: number;           // default: 0.20
  importance: number;      // default: 0.25
  personalization: number; // default: 0.20
  novelty: number;         // default: 0.10
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  primaryDisease: string;
  primarySubtype: OvarianSubtype;
  monitoredSubtypes: OvarianSubtype[];

  // General Research Interests (Configurable, no hardcoded genes)
  researchInterests: string[];
  methodsAndTechnologies: string[];
  therapeuticAreas: string[];
  pathwaysOfFocus: string[];
  monitoredJournals: string[];

  // Dynamically pinned entities
  pinnedEntities: {
    category: 'gene' | 'pathway' | 'drug' | 'biomarker' | 'technology';
    name: string;
    addedAt: string;
  }[];

  // NCBI / PubMed live integration credentials
  ncbiApiKey?: string;
  ncbiEmail?: string;

  // Scoring weights configuration
  scoringWeights: ScoringWeights;

  // Notification / Ingestion frequency
  ingestionIntervalHours: number;
  autoAiSummarizeTopPapers: boolean;
  minScoreForAutoSummary: number;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr_default_researcher',
  name: 'Ovarian Cancer Bioinformatics Lab',
  email: 'moaazmoh777@gmail.com',
  role: 'Bioinformatics & Computational Oncology Researcher',
  primaryDisease: 'Ovarian cancer',
  primarySubtype: 'HGSOC',
  monitoredSubtypes: [
    'HGSOC',
    'Low-grade serous',
    'Clear cell',
    'Endometrioid',
    'Mucinous',
    'Borderline',
    'Other epithelial',
    'Non-epithelial',
    'Mixed',
    'Unspecified',
  ],
  researchInterests: [
    'Biomarkers',
    'Gene expression',
    'Differential expression',
    'RNA-seq',
    'Bulk RNA-seq',
    'Single-cell RNA-seq',
    'Spatial transcriptomics',
    'Genomics',
    'Transcriptomics',
    'Multi-omics',
    'Precision oncology',
    'Molecular classification',
    'Prognostic biomarkers',
    'Diagnostic biomarkers',
    'Predictive biomarkers',
    'Therapeutic targets',
    'Drug targets',
    'Survival analysis',
    'Cancer pathways',
    'PPI networks',
    'Functional enrichment',
    'Drug resistance',
    'Platinum resistance',
    'PARP inhibitors',
    'Homologous recombination deficiency (HRD)',
    'BRCA-related biology',
    'Immunotherapy',
    'Antibody-drug conjugates (ADCs)',
    'Targeted therapy',
    'Cancer cell cycle',
    'DNA damage response',
    'Computational biology',
    'Machine learning in cancer',
    'Artificial intelligence in oncology',
  ],
  methodsAndTechnologies: [
    'Single-cell RNA-seq',
    'Spatial transcriptomics',
    'Bulk RNA-seq',
    'Multi-omics integration',
    'Liquid biopsy',
    'Long-read sequencing',
    'CRISPR screens',
    'Machine learning',
    'Deep learning',
    'Survival deconvolution',
    'Copy number alteration analysis',
    'Proteomics / CPTAC',
  ],
  therapeuticAreas: [
    'PARP inhibitors (Olaparib, Niraparib, Rucaparib)',
    'Platinum chemotherapy (Carboplatin, Cisplatin)',
    'Antibody-drug conjugates (Mirvetuximab, Trastuzumab deruxtecan)',
    'Anti-angiogenics (Bevacizumab)',
    'Immune checkpoint blockade (PD-1, PD-L1, CTLA-4)',
    'ATR / WEE1 / CHK1 inhibitors',
    'CDK2 / CDK4/6 inhibitors',
  ],
  pathwaysOfFocus: [
    'Homologous recombination repair (HRR)',
    'DNA damage response (DDR)',
    'Replication stress',
    'PI3K/AKT/mTOR signaling',
    'Cell cycle checkpoints (G1/S, G2/M)',
    'p53 signaling pathway',
    'Epithelial-mesenchymal transition (EMT)',
    'Immune microenvironment & T-cell exhaustion',
  ],
  monitoredJournals: [
    'Gynecologic Oncology',
    'Journal of Clinical Oncology',
    'Clinical Cancer Research',
    'Cancer Research',
    'Annals of Oncology',
    'International Journal of Gynecological Cancer',
    'ESMO Open',
    'Nature Cancer',
    'Cancer Discovery',
    'Molecular Cancer',
    'Lancet Oncology',
    'Cell Reports Medicine',
    'Genome Medicine',
  ],
  pinnedEntities: [],
  scoringWeights: {
    relevance: 0.25,
    hgsoc: 0.20,
    importance: 0.25,
    personalization: 0.20,
    novelty: 0.10,
  },
  ingestionIntervalHours: 6,
  autoAiSummarizeTopPapers: true,
  minScoreForAutoSummary: 80,
};
