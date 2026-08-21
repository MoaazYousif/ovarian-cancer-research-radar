import { OvarianSubtype } from './paper';

export type EntityCategory =
  | 'gene'
  | 'protein'
  | 'pathway'
  | 'drug'
  | 'biomarker'
  | 'mutation'
  | 'technology'
  | 'dataset';

export interface EntityTrend {
  id: string;
  name: string;
  category: EntityCategory;
  standardizedId?: string;
  totalPapers: number;
  recentPapersCount: number;
  previousPapersCount: number;
  growthRatePercent: number;
  hgsocSpecificityRatio: number;
  averageImportanceScore: number;
  isEmerging: boolean;
  emergingBadge?: '🔥 Emerging' | '🚀 Accelerating' | '⚡ Breakthrough' | '🔬 High Velocity' | string;
  topAssociatedPapers: {
    id: string;
    title: string;
    journal: string;
    publicationDate: string;
    finalScore: number;
    ovarianSubtype: OvarianSubtype;
  }[];
  coOccurringEntities: {
    name: string;
    category: EntityCategory;
    coCount: number;
  }[];
  temporalTrend: {
    period: string;
    count: number;
  }[];
}

export interface EmergingEntity {
  name: string;
  type: 'genes' | 'drugs' | 'pathways' | 'biomarkers' | 'technologies' | 'datasets';
  growthRate: number;
  paperCount: number;
  recentCount: number;
  hgsocRatio: number;
  badge?: string;
  coOccurringWith: string[];
}

export interface TrendAnalysisSummary {
  emergingGenes: EmergingEntity[];
  emergingPathways: EmergingEntity[];
  emergingDrugs: EmergingEntity[];
  emergingBiomarkers: EmergingEntity[];
  emergingTechnologies: EmergingEntity[];
  emergingDatasets: EmergingEntity[];
  allTrends: EntityTrend[];
}

export interface ResearchGap {
  id: string;
  title: string;
  category: 'Understudied Pathway' | 'Unvalidated Biomarker' | 'Resistance Mechanism' | 'Subtype Disparity' | string;
  description: string;
  evidenceSummary: string;
  affectedSubtypes: OvarianSubtype[];
  relatedEntities: string[];
  paperCount: number;
  recommendedAction: string;
}
