import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Cpu,
  Dna,
  Target,
  FlaskConical,
  Activity,
  Layers,
  Check,
  AlertCircle,
  ChevronDown,
  Search,
} from 'lucide-react';
import { Paper, FilterOptions } from '../types/paper';
import { UserProfile } from '../types/profile';
import { runIngestionPipeline, PipelineExecutionReport } from '../services/ingestion/pipeline';

interface HgsocLiveTopicSyncBarProps {
  papers: Paper[];
  userProfile: UserProfile;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onPapersIngested: (newPapers: Paper[]) => void;
}

export interface HgsocTopicPreset {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  query: string;
  badge: string;
  color: string;
  borderColor: string;
  bgLight: string;
}

export const HGSOC_TOPIC_PRESETS: HgsocTopicPreset[] = [
  {
    id: 'ml_ai',
    title: 'AI & Machine Learning',
    subtitle: 'Computational Oncology & Deep Learning',
    icon: Cpu,
    query: '(Machine learning OR "artificial intelligence" OR "deep learning" OR "neural network" OR computational) AND (HGSOC OR "high grade serous ovarian")',
    badge: 'AI / ML',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/40 hover:border-cyan-400',
    bgLight: 'bg-cyan-500/10 hover:bg-cyan-500/20',
  },
  {
    id: 'multi_omics',
    title: 'Multi-omics & Proteomics',
    subtitle: 'Proteogenomics & Single-Cell',
    icon: Dna,
    query: '("multi-omics" OR "proteogenomics" OR "transcriptomics" OR "single-cell" OR "epigenomics") AND (HGSOC OR "high-grade serous ovarian")',
    badge: 'Multi-omics',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/40 hover:border-purple-400',
    bgLight: 'bg-purple-500/10 hover:bg-purple-500/20',
  },
  {
    id: 'precision_oncology',
    title: 'Targeted Therapies & HRD',
    subtitle: 'PARP Inhibitors & Synthetic Lethality',
    icon: Target,
    query: '("precision oncology" OR "targeted therapy" OR "synthetic lethality" OR "actionable mutation" OR "PARP inhibitor") AND (HGSOC OR "high grade serous ovarian")',
    badge: 'Precision',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    bgLight: 'bg-amber-500/10 hover:bg-amber-500/20',
  },
  {
    id: 'biomarkers',
    title: 'Biomarkers & ctDNA',
    subtitle: 'Liquid Biopsy & Reversion Mutations',
    icon: Activity,
    query: '(biomarker OR "liquid biopsy" OR "circulating tumor DNA" OR ctDNA OR FOLR1 OR "reversion mutation") AND (HGSOC OR "high grade serous ovarian")',
    badge: 'Biomarkers',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    bgLight: 'bg-emerald-500/10 hover:bg-emerald-500/20',
  },
  {
    id: 'adcs',
    title: 'Antibody-Drug Conjugates',
    subtitle: 'Mirvetuximab, T-DXd & Novel Payloads',
    icon: FlaskConical,
    query: '("antibody-drug conjugate" OR "ADC" OR "mirvetuximab" OR "trastuzumab deruxtecan" OR "payload") AND (HGSOC OR "high grade serous ovarian")',
    badge: 'ADCs',
    color: 'text-rose-400',
    borderColor: 'border-rose-500/40 hover:border-rose-400',
    bgLight: 'bg-rose-500/10 hover:bg-rose-500/20',
  },
  {
    id: 'spatial_tme',
    title: 'Spatial Biology & TME',
    subtitle: 'CAFs & Immune Exclusion',
    icon: Layers,
    query: '("spatial transcriptomics" OR "tumor microenvironment" OR "cancer-associated fibroblasts" OR CAF OR "immune exclusion") AND (HGSOC OR "high grade serous ovarian")',
    badge: 'Spatial TME',
    color: 'text-sky-400',
    borderColor: 'border-sky-500/40 hover:border-sky-400',
    bgLight: 'bg-sky-500/10 hover:bg-sky-500/20',
  },
];

export const HgsocLiveTopicSyncBar: React.FC<HgsocLiveTopicSyncBarProps> = ({
  papers,
  userProfile,
  filters,
  onFilterChange,
  onPapersIngested,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<HgsocTopicPreset | null>(null);
  const [customQuery, setCustomQuery] = useState<string>('');
  const [dateRangeDays, setDateRangeDays] = useState<number>(90);
  const [limit, setLimit] = useState<number>(20);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [lastReport, setLastReport] = useState<PipelineExecutionReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Execute Live Fetch for a given query
  const handleFetchTopic = async (topicQuery: string, presetName?: string) => {
    setIsLoading(true);
    setError(null);
    setStatusMsg(`Connecting to NCBI E-Utilities to fetch ${presetName || 'requested topic'}...`);
    setProgressPercent(10);

    try {
      const report = await runIngestionPipeline(
        topicQuery,
        dateRangeDays,
        limit,
        papers,
        userProfile,
        (status, percent) => {
          setStatusMsg(status);
          setProgressPercent(percent);
        }
      );

      setLastReport(report);
      if (report.newPapers.length > 0) {
        onPapersIngested(report.newPapers);
      }

      // Automatically reset score barrier so all freshly fetched papers show immediately
      onFilterChange({
        ...filters,
        subtypes: ['HGSOC'],
        searchQuery: '',
        minFinalScore: 0,
        minHgsocScore: 0,
        dateRange: 'all',
        sortBy: 'recentIngestion',
        sortOrder: 'desc',
        newlyIngestedOnly: false,
      });
    } catch (err: any) {
      console.error('Error fetching live HGSOC topic:', err);
      setError(err.message || 'Error communicating with NCBI E-Utilities.');
    } finally {
      setIsLoading(false);
      setProgressPercent(100);
    }
  };

  const handleSelectPreset = (preset: HgsocTopicPreset) => {
    setSelectedPreset(preset);
    setCustomQuery(preset.query);
    // Instant live fetch on topic selection
    handleFetchTopic(preset.query, preset.title);
  };

  return (
    <section className="bg-gradient-to-br from-[#121212] via-[#0f0f0f] to-[#151515] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5" dir="ltr">
      {/* Top Header with title & Live Sync Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c4a484]/20 via-[#c4a484]/10 to-transparent border border-[#c4a484]/40 flex items-center justify-center text-[#c4a484] shadow-[0_0_15px_rgba(196,164,132,0.15)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-serif text-white font-bold">
                Live On-Demand NCBI Literature Ingestion
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                NCBI E-Utilities Live
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Select a clinical focus area or enter a custom query to fetch verified papers live from PubMed.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-sans text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Advanced Query Settings' : 'Customize Date & Paper Limit'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Quick Topic Buttons Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-300 font-sans">
          <span className="font-bold flex items-center gap-1.5 text-white">
            <span>⚡ High-Yield HGSOC Focus Areas (Click to Ingest Live):</span>
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Directly calls PubMed E-Utilities, parses abstracts & scores biomarkers
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {HGSOC_TOPIC_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isCurrentlySelected = selectedPreset?.id === preset.id;

            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                disabled={isLoading}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2.5 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isCurrentlySelected
                    ? `${preset.bgLight} ${preset.borderColor} ring-1 ring-[#c4a484]/40 shadow-[0_0_15px_rgba(196,164,132,0.15)]`
                    : `bg-[#161616] border-white/5 hover:border-white/20 hover:bg-[#1c1c1c]`
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-1.5 rounded-lg bg-white/5 ${preset.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/10 ${preset.color}`}>
                    {preset.badge}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-white leading-tight font-sans">
                    {preset.title}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-400 mt-1 leading-none truncate">
                    {preset.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Custom Query & Settings Section */}
      <div className={`space-y-4 pt-3 border-t border-white/5 ${isExpanded ? 'block' : 'hidden sm:block'}`}>
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter custom PubMed query (e.g., 'CCNE1 amplification', 'folate receptor alpha ADC', 'spatial single-cell')..."
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#c4a484] focus:ring-1 focus:ring-[#c4a484]/50 transition-all font-sans"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Date Range Selector */}
            <select
              value={dateRangeDays}
              onChange={(e) => setDateRangeDays(Number(e.target.value))}
              className="bg-[#0d0d0d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c4a484] font-sans cursor-pointer"
            >
              <option value={30}>Past 30 Days</option>
              <option value={90}>Past 90 Days</option>
              <option value={365}>Past Year</option>
              <option value={1095}>Past 3 Years</option>
              <option value={0}>All Time</option>
            </select>

            {/* Retmax limit */}
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-[#0d0d0d] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c4a484] font-sans cursor-pointer"
            >
              <option value={10}>10 Papers</option>
              <option value={20}>20 Papers</option>
              <option value={40}>40 Papers</option>
            </select>

            {/* Custom Fetch Button */}
            <button
              onClick={() => handleFetchTopic(customQuery || '(HGSOC OR "high grade serous ovarian")', 'Custom Query')}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c4a484] to-[#d6ba9c] text-slate-950 font-bold text-xs hover:opacity-95 shadow-[0_0_15px_rgba(196,164,132,0.3)] transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Ingesting...' : 'Fetch from NCBI Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress & Live Loading Indicator */}
      {isLoading && (
        <div className="bg-white/[0.02] border border-[#c4a484]/30 rounded-xl p-4 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="text-[#c4a484] font-bold flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{statusMsg}</span>
            </span>
            <span className="font-mono text-white text-xs">{progressPercent}%</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#c4a484] to-emerald-400 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 flex items-center gap-3 text-xs text-rose-300 font-sans">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Last Report Banner */}
      {lastReport && !isLoading && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <p className="text-white font-bold">
                Successfully ingested and scored {lastReport.relevantPapersKept} papers from NCBI!
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Identified {lastReport.hgsocCount} HGSOC papers and {lastReport.highPriorityCount} high-priority studies (Score ≥ 80).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                onFilterChange({
                  ...filters,
                  newlyIngestedOnly: true,
                  subtypes: [],
                  studyTypes: [],
                  searchQuery: '',
                  minFinalScore: 0,
                  minHgsocScore: 0,
                  dateRange: 'all',
                  sortBy: 'recentIngestion',
                  sortOrder: 'desc',
                });
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-sans text-xs font-bold hover:bg-emerald-400 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Show {lastReport.relevantPapersKept} Newly Ingested Only</span>
            </button>

            <button
              onClick={() => {
                onFilterChange({
                  ...filters,
                  newlyIngestedOnly: false,
                  subtypes: ['HGSOC'],
                  searchQuery: '',
                  minFinalScore: 0,
                  minHgsocScore: 0,
                  dateRange: 'all',
                  sortBy: 'recentIngestion',
                  sortOrder: 'desc',
                });
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-sans text-xs font-medium cursor-pointer"
            >
              Show All HGSOC Papers
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
