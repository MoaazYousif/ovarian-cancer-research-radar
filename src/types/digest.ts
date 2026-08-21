import { Paper } from './paper';
import { EmergingEntity } from './entities';

export interface ResearchDigest {
  date: string;
  totalNewPapers: number;
  relevantPapersCount: number;
  highPriorityCount: number;
  hgsocCount: number;
  topPaper: Paper;
  highPriorityPapers: Paper[];
  emergingGenes: EmergingEntity[];
  emergingPathways: EmergingEntity[];
  emergingTherapies: EmergingEntity[];
  emergingBiomarkers: EmergingEntity[];
  fastestGrowingTopics: {
    topic: string;
    growth: string;
    papersCount: number;
  }[];
  clinicalTrialAlerts: Paper[];
  executiveSummary: string;
}
