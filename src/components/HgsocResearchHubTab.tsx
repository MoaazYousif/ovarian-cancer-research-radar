import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  Dna,
  Target,
  Activity,
  FlaskConical,
  Layers,
  Search,
  RefreshCw,
  ExternalLink,
  Filter,
  Check,
  Zap,
} from 'lucide-react';
import { Paper } from '../types/paper';
import { UserProfile } from '../types/profile';
import { PaperCard } from './PaperCard';
import { runIngestionPipeline, PipelineExecutionReport } from '../services/ingestion/pipeline';

interface HgsocResearchHubTabProps {
  papers: Paper[];
  userProfile: UserProfile;
  onSelectPaper: (paper: Paper) => void;
  onToggleSave: (id: string) => void;
  onToggleRead: (id: string) => void;
  onFeedback: (id: string, feedback: 'up' | 'down') => void;
  onSelectEntity: (type: 'genes' | 'drugs' | 'pathways' | 'biomarkers' | 'technologies', name: string) => void;
  onOpenSocial: (paper: Paper) => void;
  onPapersIngested: (newPapers: Paper[]) => void;
}

export interface HubTopicConfig {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  query: string;
  badge: string;
  color: string;
  gradient: string;
  borderColor: string;
  keywords: string[];
}

export const HUB_TOPICS: HubTopicConfig[] = [
  {
    id: 'all_hgsoc',
    name: 'All High-Grade Serous Ovarian Literature',
    category: 'General HGSOC',
    icon: Sparkles,
    description: 'Comprehensive overview of all indexed literature and clinical cohorts for High-Grade Serous Ovarian Carcinoma.',
    query: '(HGSOC OR "high grade serous ovarian cancer" OR "high-grade serous carcinoma")',
    badge: 'HGSOC All',
    color: 'text-[#c4a484]',
    gradient: 'from-[#c4a484]/20 via-white/5 to-transparent',
    borderColor: 'border-[#c4a484]/40',
    keywords: ['HGSOC', 'TP53', 'Survival', 'Carcinoma'],
  },
  {
    id: 'ml_ai',
    name: 'Machine Learning & AI in HGSOC',
    category: 'Computational Oncology',
    icon: Cpu,
    description: 'Computational algorithms, deep learning models, digital pathology computer vision, and therapy response prediction.',
    query: '("machine learning" OR "deep learning" OR "artificial intelligence" OR "neural network" OR "predictive model" OR "computational biology") AND (HGSOC OR "high grade serous ovarian")',
    badge: 'AI & ML',
    color: 'text-cyan-400',
    gradient: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
    borderColor: 'border-cyan-500/40',
    keywords: ['Machine Learning', 'Deep Learning', 'Neural Network', 'AI in Oncology', 'Computational'],
  },
  {
    id: 'ai_oncology',
    name: 'AI in Clinical Oncology & Diagnostics',
    category: 'Diagnostic AI',
    icon: Zap,
    description: 'Artificial intelligence applications in histological slide triage, hidden pattern recognition, and clinical decision support.',
    query: '("artificial intelligence" OR "AI in oncology" OR "digital pathology" OR "computational oncology" OR "radiomics") AND (HGSOC OR "high grade serous ovarian")',
    badge: 'AI Oncology',
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
    borderColor: 'border-blue-500/40',
    keywords: ['AI in Oncology', 'Digital Pathology', 'Radiomics', 'Clinical Decision Support'],
  },
  {
    id: 'multi_omics',
    name: 'Multi-omics & Proteogenomics',
    category: 'Genomics & Proteomics',
    icon: Dna,
    description: 'Integration of whole genome/exome sequencing (WGS/WES) with transcriptomics, proteomics, and phosphoproteomics.',
    query: '("multi-omics" OR "proteogenomics" OR "transcriptomics" OR "single-cell" OR "epigenomics" OR "CPTAC" OR "TCGA") AND (HGSOC OR "high-grade serous ovarian")',
    badge: 'Multi-omics',
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 via-purple-500/5 to-transparent',
    borderColor: 'border-purple-500/40',
    keywords: ['Multi-omics', 'Proteogenomics', 'Single-Cell RNA-seq', 'CPTAC', 'TCGA'],
  },
  {
    id: 'precision_oncology',
    name: 'Precision Oncology & Targeted Therapies',
    category: 'Targeted Therapeutics',
    icon: Target,
    description: 'Synthetic lethality approaches, CCNE1/CDK2 targeting, and ATR/PARP inhibitor combinations based on tumor genomic profiles.',
    query: '("precision oncology" OR "targeted therapy" OR "synthetic lethality" OR "actionable mutation" OR "personalized medicine") AND (HGSOC OR "high grade serous ovarian")',
    badge: 'Precision',
    color: 'text-amber-400',
    gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
    borderColor: 'border-amber-500/40',
    keywords: ['Precision Oncology', 'Synthetic Lethality', 'Targeted Therapy', 'CDK2', 'PARP'],
  },
  {
    id: 'biomarkers',
    name: 'Biomarkers & ctDNA Liquid Biopsy',
    category: 'Translational Diagnostics',
    icon: Activity,
    description: 'Liquid biopsy for monitoring reversion mutations, circulating tumor DNA (ctDNA), and precise FOLR1 and HRD stratification.',
    query: '("biomarker" OR "liquid biopsy" OR "circulating tumor DNA" OR "ctDNA" OR "reversion mutation" OR "HRD score") AND (HGSOC OR "high grade serous ovarian")',
    badge: 'Biomarkers',
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    borderColor: 'border-emerald-500/40',
    keywords: ['ctDNA', 'Liquid Biopsy', 'Biomarkers', 'HRD', 'FOLR1', 'Reversion Mutations'],
  },
  {
    id: 'adcs',
    name: 'Antibody-Drug Conjugates (ADCs)',
    category: 'Novel Therapeutics',
    icon: FlaskConical,
    description: 'Mirvetuximab soravtansine, Trastuzumab deruxtecan, and next-generation cytotoxic payloads targeting folate receptor alpha and HER2.',
    query: '("antibody-drug conjugate" OR "ADC" OR "mirvetuximab" OR "trastuzumab deruxtecan" OR "payload" OR "DM4" OR "DXd") AND (HGSOC OR "high grade serous ovarian")',
    badge: 'ADCs',
    color: 'text-rose-400',
    gradient: 'from-rose-500/20 via-rose-500/5 to-transparent',
    borderColor: 'border-rose-500/40',
    keywords: ['ADC', 'Mirvetuximab soravtansine', 'Trastastuzumab deruxtecan', 'FOLR1', 'ERBB2'],
  },
  {
    id: 'spatial_tme',
    name: 'Spatial Transcriptomics & Microenvironment',
    category: 'Tumor Immunology',
    icon: Layers,
    description: 'Spatial cellular dissection of tumor-stroma interactions, cancer-associated fibroblasts (CAFs), and immune exclusion niches.',
    query: '("spatial transcriptomics" OR "tumor microenvironment" OR "cancer-associated fibroblasts" OR "CAF" OR "immune exclusion" OR "Visium") AND (HGSOC OR "high grade serous ovarian")',
    badge: 'Spatial TME',
    color: 'text-teal-400',
    gradient: 'from-teal-500/20 via-teal-500/5 to-transparent',
    borderColor: 'border-teal-500/40',
    keywords: ['Spatial Transcriptomics', 'Microenvironment', 'CAF', 'TGFB1', 'Immune Exclusion'],
  },
];

export const HgsocResearchHubTab: React.FC<HgsocResearchHubTabProps> = ({
  papers,
  userProfile,
  onSelectPaper,
  onToggleSave,
  onToggleRead,
  onFeedback,
  onSelectEntity,
  onOpenSocial,
  onPapersIngested,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all_hgsoc');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedStudyType, setSelectedStudyType] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [lastReport, setLastReport] = useState<PipelineExecutionReport | null>(null);

  const currentTopic = HUB_TOPICS.find((t) => t.id === selectedTopicId) || HUB_TOPICS[0];

  // Match papers for the active topic
  const topicPapers = papers.filter((paper) => {
    // Must be HGSOC
    if (!paper) return false;
    if (paper.ovarianSubtype !== 'HGSOC') return false;

    // Filter by topic keywords
    if (selectedTopicId !== 'all_hgsoc' && currentTopic?.keywords) {
      const fullText = (
        (paper.title || '') +
        ' ' +
        (paper.abstract || '') +
        ' ' +
        (paper.keywords || []).join(' ') +
        ' ' +
        (paper.meshTerms || []).join(' ') +
        ' ' +
        (paper.entities?.genes || []).join(' ') +
        ' ' +
        (paper.entities?.drugs || []).join(' ') +
        ' ' +
        (paper.entities?.technologies || []).join(' ')
      ).toLowerCase();

      const matchesKeyword = currentTopic.keywords.some((kw) =>
        fullText.includes(kw.toLowerCase())
      );

      if (!matchesKeyword) return false;
    }

    // Study type filter
    if (selectedStudyType !== 'all' && paper.studyType !== selectedStudyType) {
      return false;
    }

    // Min score
    const finalScore = paper.scores?.finalScore ?? 0;
    if (finalScore < minScore) return false;

    // Search query in tab
    if (searchFilter && searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      const title = (paper.title || '').toLowerCase();
      const abstract = (paper.abstract || '').toLowerCase();
      const journal = (paper.journal || '').toLowerCase();
      const authors = (paper.authors || []).map((a) => (a?.name || '').toLowerCase());
      const match =
        title.includes(q) ||
        abstract.includes(q) ||
        authors.some((a) => a.includes(q)) ||
        journal.includes(q);
      if (!match) return false;
    }

    return true;
  });

  // Trigger Live Ingestion from NCBI for this specific topic
  const handleLiveFetchTopic = async (days = 90, retmax = 25) => {
    setIsLoading(true);
    setStatusMsg(`Connecting to NCBI E-Utilities for ${currentTopic.name}...`);
    setProgress(15);

    try {
      const report = await runIngestionPipeline(
        currentTopic.query,
        days,
        retmax,
        papers,
        userProfile,
        (status, p) => {
          setStatusMsg(status);
          setProgress(p);
        }
      );

      setLastReport(report);
      if (report.newPapers.length > 0) {
        onPapersIngested(report.newPapers);
      }
    } catch (err: any) {
      console.error('Error in topic live fetch:', err);
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  return (
    <div className="space-y-8" dir="ltr">
      {/* Hero Header */}
      <div className={`bg-gradient-to-br ${currentTopic.gradient} border ${currentTopic.borderColor} rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/10 text-[#c4a484] border border-white/15 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>HGSOC Specialized Research Hub</span>
              </span>
              <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 ${currentTopic.color}`}>
                {currentTopic.badge}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif text-white font-bold tracking-wide">
              {currentTopic.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              {currentTopic.description}
            </p>
          </div>

          {/* Action Button: Live Fetch from NCBI */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto flex-shrink-0">
            <button
              onClick={() => handleLiveFetchTopic(90, 20)}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#c4a484] to-[#d6ba9c] text-slate-950 font-bold text-xs hover:opacity-95 shadow-[0_0_20px_rgba(196,164,132,0.3)] transition-all cursor-pointer whitespace-nowrap disabled:opacity-50`}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Connecting to NCBI...' : 'Fetch Topic from PubMed'}</span>
            </button>

            <a
              href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(currentTopic.query)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-sans transition-all cursor-pointer"
            >
              <span>Search on PubMed</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Live Loading Bar */}
        {isLoading && (
          <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-sans text-white">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#c4a484]" />
                <span>{statusMsg}</span>
              </span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#c4a484] to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Report Banner */}
        {lastReport && !isLoading && (
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-sans text-emerald-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>
                Topic updated: {lastReport.relevantPapersKept} new papers retrieved and indexed!
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Topics Selector Pills (Interactive Tabs) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-300 font-sans">
          <span className="font-bold flex items-center gap-2 text-white">
            <Filter className="w-4 h-4 text-[#c4a484]" />
            <span>Select Specialized Research Domain:</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {HUB_TOPICS.length} Featured Hubs
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
          {HUB_TOPICS.map((topic) => {
            const Icon = topic.icon;
            const isSelected = selectedTopicId === topic.id;
            const countForThisTopic = papers.filter((p) => {
              if (p.ovarianSubtype !== 'HGSOC') return false;
              if (topic.id === 'all_hgsoc') return true;
              const fullText = (
                p.title +
                ' ' +
                p.abstract +
                ' ' +
                p.keywords.join(' ') +
                ' ' +
                p.entities.technologies.join(' ')
              ).toLowerCase();
              return topic.keywords.some((kw) => fullText.includes(kw.toLowerCase()));
            }).length;

            return (
              <button
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? `bg-[#1a1a1a] ${topic.borderColor} ring-2 ring-[#c4a484]/50 shadow-[0_0_20px_rgba(196,164,132,0.2)]`
                    : 'bg-[#111111] border-white/5 hover:border-white/20 hover:bg-[#161616]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2 rounded-xl bg-white/5 ${topic.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-bold">
                    {countForThisTopic} papers
                  </span>
                </div>

                <div>
                  <h3 className={`text-xs font-bold font-sans leading-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {topic.name}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400 mt-1 leading-none truncate">
                    {topic.category}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-Filters Bar within the Hub */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        {/* Search within this topic */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search within ${currentTopic.name}...`}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#c4a484] font-sans"
          />
        </div>

        {/* Study Type Sub-filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-sans">Study Type:</span>
          <select
            value={selectedStudyType}
            onChange={(e) => setSelectedStudyType(e.target.value)}
            className="bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c4a484] font-sans cursor-pointer"
          >
            <option value="all">All Study Types</option>
            <option value="Phase III Trial">Phase III Trials</option>
            <option value="Phase II Trial">Phase II Trials</option>
            <option value="Single-Cell / Spatial Study">Single-Cell / Spatial Studies</option>
            <option value="Translational & Multi-omics">Translational & Multi-omics</option>
            <option value="Major Consortium (TCGA/CPTAC/ICGC)">Major Consortia (TCGA/CPTAC)</option>
            <option value="Prospective Cohort">Prospective Cohorts</option>
            <option value="Systematic Review / Meta-analysis">Systematic Reviews</option>
          </select>
        </div>

        {/* Min score selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-sans">Min Score:</span>
          <select
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c4a484] font-sans cursor-pointer"
          >
            <option value={0}>All Scores (0+)</option>
            <option value={80}>High Impact (80+)</option>
            <option value={90}>Elite Tier (90+)</option>
            <option value={95}>Landmark Tier (95+)</option>
          </select>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-serif text-white font-bold">
            Targeted Literature:
          </span>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#c4a484]/15 border border-[#c4a484]/30 text-[#c4a484] font-bold">
            {topicPapers.length} articles
          </span>
        </div>

        <button
          onClick={() => handleLiveFetchTopic(365, 30)}
          disabled={isLoading}
          className="text-xs text-[#c4a484] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Fetch more from PubMed</span>
        </button>
      </div>

      {/* Papers Loop */}
      {topicPapers.length === 0 ? (
        <div className="bg-[#111111] border border-white/5 rounded-3xl p-12 text-center space-y-4">
          <p className="text-base font-serif text-white font-bold">
            No papers currently match this specialized domain in the local workspace.
          </p>
          <p className="text-xs text-slate-400 font-sans max-w-lg mx-auto">
            Click below to query NCBI PubMed live for the latest peer-reviewed studies in this domain.
          </p>
          <button
            onClick={() => handleLiveFetchTopic(365, 25)}
            disabled={isLoading}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#c4a484] to-[#d6ba9c] text-slate-950 font-bold text-xs hover:opacity-95 shadow-[0_0_20px_rgba(196,164,132,0.3)] transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Fetch {currentTopic.name} from PubMed</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {topicPapers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              onSelect={onSelectPaper}
              onToggleSave={onToggleSave}
              onToggleRead={onToggleRead}
              onFeedback={onFeedback}
              onSelectEntity={onSelectEntity}
              onOpenSocial={onOpenSocial}
            />
          ))}
        </div>
      )}
    </div>
  );
};
