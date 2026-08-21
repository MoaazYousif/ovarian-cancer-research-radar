export type OvarianSubtype =
  | 'HGSOC'
  | 'Low-grade serous'
  | 'Clear cell'
  | 'Endometrioid'
  | 'Mucinous'
  | 'Borderline'
  | 'Other epithelial'
  | 'Non-epithelial'
  | 'Unspecified'
  | 'Mixed';

export type StudyType =
  | 'Phase III Trial'
  | 'Phase II Trial'
  | 'Phase I Trial'
  | 'Randomized Controlled Trial'
  | 'Major Consortium (TCGA/CPTAC/ICGC)'
  | 'Prospective Cohort'
  | 'Translational & Multi-omics'
  | 'Single-Cell / Spatial Study'
  | 'Retrospective Cohort'
  | 'In Vitro / In Vivo Experimental'
  | 'Computational / Bioinformatic'
  | 'Systematic Review / Meta-analysis'
  | 'Case Report / Commentary'
  | 'Preprint';

export interface Author {
  name: string;
  affiliation?: string;
  isFirstAuthor?: boolean;
  isCorrespondingAuthor?: boolean;
}

export interface ExtractedEntities {
  genes: string[];
  proteins: string[];
  pathways: string[];
  drugs: string[];
  biomarkers: string[];
  mutations: string[];
  technologies: string[];
  datasets: string[];
}

export interface StructuredAiSummary {
  tldr: string;
  researchQuestion: string;
  studyDesign: string;
  methodsSummary: string;
  mainFindings: string[];
  clinicalSignificance: string;
  biologicalSignificance: string;
  limitations: string;
  evidenceLevel: 'Abstract-based analysis' | 'Full-text verified' | 'Preprint analysis';
  ovarianSubtypeRationale: string;
  hgsocRelevance: string;
  personalResearchRelevance: string;
  emergingEntities: string[];
  researchImplications: string;
  generatedAt: string;
}

export interface PaperScores {
  relevanceScore: number;       // 0 - 100
  hgsocScore: number;           // 0 - 100
  importanceScore: number;      // 0 - 100
  personalizationScore: number; // 0 - 100
  noveltyScore: number;          // 0 - 100
  finalScore: number;           // 0 - 100 (weighted)
  scoreBreakdownRationale: {
    relevanceReason: string;
    hgsocReason: string;
    importanceReason: string;
    personalizationReason: string;
    noveltyReason: string;
  };
}

export interface Paper {
  id: string;
  title: string;
  abstract: string;
  doi?: string;
  pmid?: string;
  pmcid?: string;
  journal: string;
  publisher?: string;
  publicationDate: string;        // ISO YYYY-MM-DD
  onlinePublicationDate?: string;
  authors: Author[];
  affiliations: string[];
  keywords: string[];
  meshTerms: string[];
  studyType: StudyType;
  sampleSize?: number;
  sources: ('PubMed' | 'Europe PMC' | 'OpenAlex' | 'Crossref')[];
  citationCount: number;
  openAccess: boolean;
  fullTextUrl?: string;
  pdfUrl?: string;

  // Disease & Subtype
  disease: string;
  ovarianSubtype: OvarianSubtype;
  ovarianSubtypeConfidence: number; // 0 - 100
  subtypeEvidenceRationale: string;

  // Scores
  scores: PaperScores;

  // Extracted Biological Entities
  entities: ExtractedEntities;

  // AI Structured Summary
  aiSummary?: StructuredAiSummary;
  isAiSummarized: boolean;

  // Semantic & Vector Representation
  embedding?: number[];

  // User engagement
  isSaved?: boolean;
  isRead?: boolean;
  isNewlyIngested?: boolean;
  ingestedAt?: string;
  feedback?: 'up' | 'down' | null;
  userNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterOptions {
  searchQuery: string;
  subtypes: OvarianSubtype[];
  studyTypes: StudyType[];
  dateRange: '24h' | '7d' | '30d' | '90d' | '1y' | 'all';
  minFinalScore: number;
  minHgsocScore: number;
  openAccessOnly: boolean;
  aiSummarizedOnly: boolean;
  savedOnly: boolean;
  unreadOnly: boolean;
  newlyIngestedOnly?: boolean;
  selectedEntity?: { type: keyof ExtractedEntities; name: string } | null;
  sortBy: 'finalScore' | 'publicationDate' | 'importanceScore' | 'hgsocScore' | 'citationCount' | 'noveltyScore' | 'personalizationScore' | 'recentIngestion';
  sortOrder: 'asc' | 'desc';
}
