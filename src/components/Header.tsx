import React from 'react';
import {
  Search,
  Flame,
  Sparkles,
  Bookmark,
  Settings,
  RefreshCw,
  Layers,
  Clock,
  Database,
  TrendingUp,
  ExternalLink,
  Cpu,
  Trash2,
  CalendarCheck,
} from 'lucide-react';
import { FilterOptions, Paper } from '../types/paper';
import { UserProfile } from '../types/profile';
import { isPaperNewToday } from '../types/researchDomains';

export type ActiveTabType =
  | 'feed'
  | 'dailyPapers'
  | 'census'
  | 'hgsocHub'
  | 'trends'
  | 'timeline'
  | 'entities'
  | 'subtypes'
  | 'search'
  | 'gaps';

interface HeaderProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  savedCount: number;
  totalCount: number;
  hgsocCount: number;
  todayCount?: number;
  userProfile: UserProfile;
  activeTab: ActiveTabType;
  onTabChange: (tab: ActiveTabType) => void;
  onOpenDigest: () => void;
  onOpenProfile: () => void;
  onOpenIngestion: () => void;
  onOpenNcbiModal: () => void;
  onFetchTodayPapers: () => void;
  onClearFeed?: () => void;
  isFetchingToday?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  filters,
  onFilterChange,
  savedCount,
  totalCount,
  todayCount = 0,
  activeTab,
  onTabChange,
  onOpenDigest,
  onOpenProfile,
  onOpenNcbiModal,
  onFetchTodayPapers,
  onClearFeed,
  isFetchingToday = false,
}) => {
  return (
    <header className="border-b border-white/5 bg-[#0a0a0a] sticky top-0 z-40 backdrop-blur-md" dir="ltr">
      {/* Top tier brand and primary navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('feed')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c4a484]/20 via-white/5 to-transparent border border-[#c4a484]/30 flex items-center justify-center shadow-[0_0_15px_rgba(196,164,132,0.15)]">
                <Layers className="w-5 h-5 text-[#c4a484]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-serif tracking-[0.05em] text-[#c4a484] font-bold">
                    Ovarian Research Radar
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#c4a484]/15 text-[#c4a484] border border-[#c4a484]/30 font-bold">
                    8-Domain Oncology
                  </span>
                </div>
                <p className="text-[10px] tracking-wider text-slate-400 font-sans">
                  Real-time Literature Intelligence & Biomarker Discovery
                </p>
              </div>
            </div>

            {/* Navigation tabs */}
            <nav className="hidden lg:flex items-center gap-1 ml-4 border-l border-white/10 pl-6 text-xs font-sans">
              {/* Daily Papers Tab (NEW - Focus of User Request) */}
              <button
                onClick={() => onTabChange('dailyPapers')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'dailyPapers'
                    ? 'text-white bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-transparent border-b-2 border-emerald-400 font-bold shadow-sm'
                    : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Daily Papers</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  {todayCount} Today
                </span>
              </button>

              {/* PubMed Census Tab */}
              <button
                onClick={() => onTabChange('census')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'census'
                    ? 'text-white bg-[#c4a484]/20 border-b-2 border-[#c4a484] font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-[#c4a484]" />
                <span>PubMed Census & Stats</span>
              </button>

              <button
                onClick={() => onTabChange('feed')}
                className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'feed'
                    ? 'text-white bg-white/5 border-b-2 border-[#c4a484] font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                Literature Feed
              </button>

              <button
                onClick={() => onTabChange('hgsocHub')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'hgsocHub'
                    ? 'text-white bg-gradient-to-r from-[#c4a484]/20 to-cyan-500/20 border-b-2 border-cyan-400 font-bold'
                    : 'text-cyan-300/80 hover:text-cyan-200 hover:bg-white/[0.02]'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>HGSOC Focus Hub</span>
              </button>

              <button
                onClick={() => onTabChange('trends')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'trends'
                    ? 'text-white bg-white/5 border-b-2 border-[#c4a484] font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#c4a484]" />
                <span>Trends & Charts</span>
              </button>

              <button
                onClick={() => onTabChange('timeline')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'timeline'
                    ? 'text-white bg-white/5 border-b-2 border-[#c4a484] font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-[#c4a484]" />
                <span>Timeline</span>
              </button>

              <button
                onClick={() => onTabChange('entities')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'entities'
                    ? 'text-white bg-white/5 border-b-2 border-[#c4a484] font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-[#c4a484]" />
                <span>Target Radar</span>
              </button>

              <button
                onClick={() => onTabChange('subtypes')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'subtypes'
                    ? 'text-white bg-[#c4a484]/20 border-b-2 border-[#c4a484] font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#c4a484]" />
                <span>Subtypes & 8 Domains</span>
              </button>

              <button
                onClick={() => onTabChange('search')}
                className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'search'
                    ? 'text-white bg-white/5 border-b-2 border-[#c4a484] font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                Semantic Search
              </button>

              <button
                onClick={() => onTabChange('gaps')}
                className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'gaps'
                    ? 'text-white bg-white/5 border-b-2 border-[#c4a484] font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                Research Gaps
              </button>
            </nav>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Live Refresh for Today's Papers */}
            <button
              onClick={onFetchTodayPapers}
              disabled={isFetchingToday}
              className="relative group flex items-center gap-1.5 text-xs font-sans font-bold px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/30 to-[#c4a484]/20 border border-emerald-500/40 text-emerald-300 hover:text-white hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer disabled:opacity-50"
              title="Query NCBI E-Utilities for papers published today worldwide"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isFetchingToday ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              <span>{isFetchingToday ? 'Querying NCBI...' : "Fetch Today's Papers"}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </button>

            {/* Direct NCBI / PubMed Configuration */}
            <button
              onClick={onOpenNcbiModal}
              className="flex items-center gap-1.5 text-xs font-sans font-medium px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              title="Configure NCBI E-Utilities API Key & Custom PubMed Parameters"
            >
              <Database className="w-3.5 h-3.5 text-[#c4a484]" />
              <span className="hidden sm:inline">NCBI Direct</span>
            </button>

            {/* Daily Digest Modal */}
            <button
              onClick={onOpenDigest}
              className="flex items-center gap-1.5 text-xs font-sans px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#c4a484] to-[#d6ba9c] text-slate-950 font-bold hover:opacity-95 shadow-[0_0_15px_rgba(196,164,132,0.25)] transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">Daily Digest</span>
            </button>

            {/* Clear Feed Button if papers exist */}
            {totalCount > 0 && onClearFeed && (
              <button
                onClick={onClearFeed}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer"
                title="Clear current paper feed to start a new search query"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Saved Papers Toggle */}
            <button
              onClick={() => onFilterChange({ ...filters, savedOnly: !filters.savedOnly })}
              className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
                filters.savedOnly
                  ? 'bg-[#c4a484]/15 border-[#c4a484] text-[#c4a484]'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
              title="Filter by saved bookmark papers"
            >
              <Bookmark className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#c4a484] text-slate-950 text-[9px] font-bold flex items-center justify-center font-mono">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Profile Settings */}
            <button
              onClick={onOpenProfile}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-[#c4a484]/40 transition-all cursor-pointer"
              title="Research Profile & Scoring Weights"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-bar: Search Input & Quick Date Selector */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/5">
          {/* Search bar & PubMed direct link */}
          <div className="flex items-center gap-2 flex-1 min-w-[280px] max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by genes, drugs, pathways, authors, or concepts (e.g., CCNE1, ADCs, FOLR1, Spatial, PARPi)..."
                value={filters.searchQuery}
                onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
                className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#c4a484] focus:ring-1 focus:ring-[#c4a484]/50 transition-all font-sans"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Direct External Search in PubMed button */}
            <a
              href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(
                filters.searchQuery ? `(${filters.searchQuery}) AND (ovarian cancer OR HGSOC)` : 'ovarian cancer high grade serous[Title/Abstract]'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-[#c4a484]/15 border border-white/10 hover:border-[#c4a484]/40 text-slate-300 hover:text-[#c4a484] text-xs font-sans whitespace-nowrap transition-all cursor-pointer"
              title="Search directly in official NCBI PubMed repository"
            >
              <span>PubMed Live</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Date range selector buttons */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-[11px] opacity-60 mr-1 hidden sm:inline font-sans">Date:</span>
            {(
              [
                { key: '24h', label: '24h' },
                { key: '7d', label: '7d' },
                { key: '30d', label: '30d' },
                { key: '90d', label: '90d' },
                { key: 'all', label: 'All Time' },
              ] as const
            ).map((range) => (
              <button
                key={range.key}
                onClick={() => onFilterChange({ ...filters, dateRange: range.key })}
                className={`px-2.5 py-1 rounded-lg transition-all font-sans text-xs cursor-pointer ${
                  filters.dateRange === range.key
                    ? 'bg-[#c4a484]/20 border border-[#c4a484]/60 text-[#c4a484] font-bold'
                    : 'bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
