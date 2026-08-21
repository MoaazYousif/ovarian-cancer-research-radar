import React from 'react';
import {
  Sparkles,
  Cpu,
  Zap,
  Dna,
  Target,
  Activity,
  FlaskConical,
  Layers,
} from 'lucide-react';
import { Paper, OvarianSubtype } from './paper';

export type ResearchDomainId =
  | 'general_hgsoc'
  | 'ml_ai'
  | 'ai_oncology'
  | 'multi_omics'
  | 'precision_oncology'
  | 'biomarkers'
  | 'adcs'
  | 'spatial_tme';

export interface ResearchDomainConfig {
  id: ResearchDomainId;
  name: string;
  category: string;
  iconName: string;
  description: string;
  query: string;
  badge: string;
  color: string;
  bgColor: string;
  gradient: string;
  borderColor: string;
  keywords: string[];
}

export const RESEARCH_DOMAINS: ResearchDomainConfig[] = [
  {
    id: 'general_hgsoc',
    name: 'General HGSOC',
    category: 'High-Grade Serous Biology',
    iconName: 'Sparkles',
    description: 'Comprehensive baseline literature, pathology, staging, and fundamental biology of High-Grade Serous Ovarian Carcinoma.',
    query: '(HGSOC OR "high grade serous ovarian cancer" OR "high-grade serous carcinoma" OR "high grade serous carcinoma")',
    badge: 'General HGSOC',
    color: 'text-[#c4a484]',
    bgColor: 'bg-[#c4a484]/10',
    gradient: 'from-[#c4a484]/20 via-white/5 to-transparent',
    borderColor: 'border-[#c4a484]/40',
    keywords: ['HGSOC', 'TP53', 'fallopian', 'STIC', 'carcinoma', 'serous ovarian', 'staging', 'cytoreduction'],
  },
  {
    id: 'ml_ai',
    name: 'Machine Learning & AI in HGSOC',
    category: 'Computational Oncology',
    iconName: 'Cpu',
    description: 'Computational algorithms, deep learning neural networks, bioinformatic modeling, and therapy response prediction algorithms.',
    query: '("machine learning" OR "deep learning" OR "artificial intelligence" OR "neural network" OR "predictive model" OR "computational biology" OR "in silico") AND (HGSOC OR "ovarian cancer" OR "ovarian carcinoma")',
    badge: 'AI & ML',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    gradient: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
    borderColor: 'border-cyan-500/40',
    keywords: ['machine learning', 'deep learning', 'neural network', 'computational', 'random forest', 'transformer', 'algorithm', 'in silico', 'prediction model'],
  },
  {
    id: 'ai_oncology',
    name: 'AI in Clinical Oncology & Diagnostics',
    category: 'Diagnostic AI',
    iconName: 'Zap',
    description: 'Artificial intelligence applications in histological slide triage, digital pathology vision, radiomics, and clinical decision support systems.',
    query: '("artificial intelligence" OR "AI in oncology" OR "digital pathology" OR "computational pathology" OR "radiomics" OR "image analysis" OR "clinical decision support") AND ("ovarian cancer" OR "HGSOC" OR "ovarian carcinoma")',
    badge: 'Diagnostic AI',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
    borderColor: 'border-blue-500/40',
    keywords: ['digital pathology', 'radiomics', 'diagnostic ai', 'image analysis', 'clinical decision support', 'histopathology slide', 'computer vision', 'wsi', 'segmentation'],
  },
  {
    id: 'multi_omics',
    name: 'Multi-omics & Proteogenomics',
    category: 'Genomics & Proteomics',
    iconName: 'Dna',
    description: 'Integration of whole genome/exome sequencing (WGS/WES) with transcriptomics, mass-spectrometry proteomics, and phosphoproteomics.',
    query: '("multi-omics" OR "proteogenomics" OR "transcriptomics" OR "proteomics" OR "single-cell" OR "epigenomics" OR "phosphoproteomics" OR "CPTAC" OR "TCGA") AND ("ovarian cancer" OR "HGSOC")',
    badge: 'Multi-omics',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    gradient: 'from-purple-500/20 via-purple-500/5 to-transparent',
    borderColor: 'border-purple-500/40',
    keywords: ['multi-omics', 'proteogenomics', 'transcriptomics', 'proteomics', 'phosphoproteomics', 'CPTAC', 'TCGA', 'WGS', 'WES', 'epigenomics', 'RNA-seq', 'mass spectrometry'],
  },
  {
    id: 'precision_oncology',
    name: 'Precision Oncology & Targeted Therapies',
    category: 'Targeted Therapeutics',
    iconName: 'Target',
    description: 'Synthetic lethality approaches, CCNE1/CDK2 targeting, PARP inhibitor combinations, ATR/WEE1 inhibitors, and personalized genomic medicine.',
    query: '("precision oncology" OR "targeted therapy" OR "synthetic lethality" OR "actionable mutation" OR "PARP inhibitor" OR "olaparib" OR "niraparib" OR "CDK2" OR "CCNE1" OR "ATR inhibitor") AND ("ovarian cancer" OR "HGSOC")',
    badge: 'Targeted Tx',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
    borderColor: 'border-amber-500/40',
    keywords: ['precision oncology', 'targeted therapy', 'synthetic lethality', 'parp inhibitor', 'olaparib', 'niraparib', 'rucaparib', 'ccne1', 'cdk2', 'atr', 'wee1', 'targeted'],
  },
  {
    id: 'biomarkers',
    name: 'Biomarkers & ctDNA Liquid Biopsy',
    category: 'Translational Diagnostics',
    iconName: 'Activity',
    description: 'Liquid biopsy for early recurrence, circulating tumor DNA (ctDNA) tracking of reversion mutations, HRD stratification, and CA-125 kinetics.',
    query: '("biomarker" OR "liquid biopsy" OR "circulating tumor DNA" OR "ctDNA" OR "reversion mutation" OR "HRD score" OR "minimal residual disease" OR "MRD") AND ("ovarian cancer" OR "HGSOC")',
    badge: 'Biomarkers',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    borderColor: 'border-emerald-500/40',
    keywords: ['ctdna', 'liquid biopsy', 'biomarker', 'reversion mutation', 'hrd score', 'homologous recombination deficiency', 'mrd', 'minimal residual disease', 'cfdna', 'methylation'],
  },
  {
    id: 'adcs',
    name: 'Antibody-Drug Conjugates (ADCs)',
    category: 'Novel Therapeutics',
    iconName: 'FlaskConical',
    description: 'Mirvetuximab soravtansine, Trastuzumab deruxtecan, Claudin-6 ADCs, and next-generation cytotoxic payloads targeting folate receptor alpha and HER2.',
    query: '("antibody-drug conjugate" OR "ADC" OR "mirvetuximab" OR "trastuzumab deruxtecan" OR "T-DXd" OR "folate receptor" OR "FOLR1" OR "claudin-6" OR "CLDN6" OR "payload") AND ("ovarian cancer" OR "HGSOC")',
    badge: 'ADCs',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    gradient: 'from-rose-500/20 via-rose-500/5 to-transparent',
    borderColor: 'border-rose-500/40',
    keywords: ['adc', 'antibody-drug conjugate', 'mirvetuximab', 'soravtansine', 'trastuzumab deruxtecan', 'folr1', 'folate receptor', 'cldn6', 'claudin-6', 'payload', 'dxd', 'dm4'],
  },
  {
    id: 'spatial_tme',
    name: 'Spatial Transcriptomics & Microenvironment',
    category: 'Tumor Immunology',
    iconName: 'Layers',
    description: 'Spatial cellular dissection of tumor-stroma interactions, cancer-associated fibroblasts (CAFs), immune exclusion niches, and tertiary lymphoid structures.',
    query: '("spatial transcriptomics" OR "tumor microenvironment" OR "cancer-associated fibroblasts" OR "CAF" OR "immune exclusion" OR "visium" OR "xenium" OR "cosmx" OR "single cell spatial") AND ("ovarian cancer" OR "HGSOC")',
    badge: 'Spatial TME',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    gradient: 'from-teal-500/20 via-teal-500/5 to-transparent',
    borderColor: 'border-teal-500/40',
    keywords: ['spatial transcriptomics', 'tumor microenvironment', 'cancer-associated fibroblast', 'caf', 'immune exclusion', 'visium', 'xenium', 'single-cell spatial', 'tgfb1', 'cd8+ t cell', 'stroma'],
  },
];

/**
 * Determine which domains match a given paper
 */
export function classifyPaperDomains(paper: Paper): ResearchDomainId[] {
  if (!paper) return ['general_hgsoc'];
  const matchedDomains: ResearchDomainId[] = [];
  const title = paper.title || '';
  const abstract = paper.abstract || '';
  const keywords = Array.isArray(paper.keywords) ? paper.keywords.join(' ') : '';
  const meshTerms = Array.isArray(paper.meshTerms) ? paper.meshTerms.join(' ') : '';
  const genes = Array.isArray(paper.entities?.genes) ? paper.entities.genes.join(' ') : '';
  const drugs = Array.isArray(paper.entities?.drugs) ? paper.entities.drugs.join(' ') : '';
  const tech = Array.isArray(paper.entities?.technologies) ? paper.entities.technologies.join(' ') : '';
  const biomarkers = Array.isArray(paper.entities?.biomarkers) ? paper.entities.biomarkers.join(' ') : '';
  const pathways = Array.isArray(paper.entities?.pathways) ? paper.entities.pathways.join(' ') : '';

  const fullText = `${title} ${abstract} ${keywords} ${meshTerms} ${genes} ${drugs} ${tech} ${biomarkers} ${pathways}`.toLowerCase();

  RESEARCH_DOMAINS.forEach((domain) => {
    if (domain.id === 'general_hgsoc') {
      if (paper.ovarianSubtype === 'HGSOC') {
        matchedDomains.push('general_hgsoc');
      }
      return;
    }

    const matches = (domain.keywords || []).some((kw) => kw && fullText.includes(kw.toLowerCase()));
    if (matches) {
      matchedDomains.push(domain.id);
    }
  });

  // Default fallback if no specific domain matched
  if (matchedDomains.length === 0) {
    if (paper.ovarianSubtype === 'HGSOC') {
      matchedDomains.push('general_hgsoc');
    } else {
      matchedDomains.push('precision_oncology');
    }
  }

  return matchedDomains;
}

/**
 * Checks if a paper was published today or newly ingested within the current session/24h
 */
export function isPaperNewToday(paper: Paper): boolean {
  if (!paper) return false;
  if (paper.isNewlyIngested) return true;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (paper.publicationDate === todayStr || paper.onlinePublicationDate === todayStr) {
    return true;
  }

  // Also check if ingested within the last 24 hours
  if (paper.ingestedAt) {
    const ingestedTime = new Date(paper.ingestedAt).getTime();
    if (!isNaN(ingestedTime)) {
      const diffHours = (now.getTime() - ingestedTime) / (1000 * 60 * 60);
      if (diffHours <= 24) return true;
    }
  }

  // Check publication date within last 2 days (timezone discrepancies)
  if (paper.publicationDate) {
    const pubTime = new Date(paper.publicationDate).getTime();
    if (!isNaN(pubTime)) {
      const diffDays = (now.getTime() - pubTime) / (1000 * 60 * 60 * 24);
      return diffDays <= 2;
    }
  }
  return false;
}
