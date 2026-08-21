import React, { useState } from 'react';
import { Paper, OvarianSubtype } from '../types/paper';
import { UserProfile } from '../types/profile';
import {
  RESEARCH_DOMAINS,
  ResearchDomainConfig,
  ResearchDomainId,
  classifyPaperDomains,
  isPaperNewToday,
} from '../types/researchDomains';
import { runIngestionPipeline } from '../services/ingestion/pipeline';
import { PaperCard } from './PaperCard';
import {
  Sparkles,
  RefreshCw,
  Clock,
  Calendar,
  Layers,
  Cpu,
  Zap,
  Dna,
  Target,
  Activity,
  FlaskConical,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';

interface DailyPapersTabProps {
  papers: Paper[];
  userProfile: UserProfile;
  onSelectPaper: (paper: Paper) => void;
  onToggleSave: (paperId: string) => void;
  onToggleRead: (paperId: string) => void;
  onFeedback: (paperId: string, feedback: 'up' | 'down') => void;
  onSelectEntity: (type: 'genes' | 'drugs' | 'pathways' | 'biomarkers' | 'technologies', name: string) => void;
  onOpenSocial: (paper: Paper) => void;
  onPapersIngested: (newPapers: Paper[]) => void;
}

export const DailyPapersTab: React.FC<DailyPapersTabProps> = ({
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
  const [activeDomainFilter, setActiveDomainFilter] = useState<ResearchDomainId | 'all'>('all');
  const [activeSubtypeFilter, setActiveSubtypeFilter] = useState<OvarianSubtype | 'all'>('all');
  const [updatingDomainId, setUpdatingDomainId] = useState<string | null>(null);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Filter for today's papers or newly ingested
  const todayPapers = papers.filter(isPaperNewToday);

  // Group papers by domain
  const papersByDomain: Record<ResearchDomainId, Paper[]> = {
    general_hgsoc: [],
    ml_ai: [],
    ai_oncology: [],
    multi_omics: [],
    precision_oncology: [],
    biomarkers: [],
    adcs: [],
    spatial_tme: [],
  };

  todayPapers.forEach((paper) => {
    // Check subtype filter
    if (activeSubtypeFilter !== 'all' && paper.ovarianSubtype !== activeSubtypeFilter) {
      return;
    }

    const matchedDomains = classifyPaperDomains(paper);
    matchedDomains.forEach((domId) => {
      if (papersByDomain[domId]) {
        papersByDomain[domId].push(paper);
      }
    });
  });

  const getDomainIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4" />;
      case 'Zap':
        return <Zap className="w-4 h-4" />;
      case 'Dna':
        return <Dna className="w-4 h-4" />;
      case 'Target':
        return <Target className="w-4 h-4" />;
      case 'Activity':
        return <Activity className="w-4 h-4" />;
      case 'FlaskConical':
        return <FlaskConical className="w-4 h-4" />;
      case 'Layers':
        return <Layers className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Fetch today's papers for a specific single domain
  const handleUpdateDomain = async (domain: ResearchDomainConfig) => {
    setUpdatingDomainId(domain.id);
    setStatusMessage(`Querying NCBI PubMed for today's updates in "${domain.name}"...`);

    try {
      const todayQuery = `${domain.query} AND (hasabstract[text])`;
      const report = await runIngestionPipeline(
        todayQuery,
        2, // 2 days to safely capture today worldwide across timezones
        15,
        papers,
        userProfile,
        (msg) => setStatusMessage(msg)
      );

      if (report.newPapers.length > 0) {
        onPapersIngested(report.newPapers);
        setStatusMessage(`✨ Successfully fetched ${report.newPapers.length} new paper(s) for ${domain.name}!`);
      } else {
        setStatusMessage(`✅ Up to date: No new papers published in the last few hours for ${domain.name}.`);
      }
    } catch (err: any) {
      console.error('Error updating domain:', err);
      setStatusMessage(`Error updating ${domain.name}: ${err.message || 'Network error'}`);
    } finally {
      setUpdatingDomainId(null);
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };

  // Global Refresh All 8 Sections for Today
  const handleRefreshAllToday = async () => {
    setIsUpdatingAll(true);
    setStatusMessage('Scanning NCBI PubMed & PMC for all 8 categories published today...');

    let totalNew = 0;
    try {
      const globalQuery = '(ovarian cancer OR HGSOC OR "ovarian carcinoma" OR "high-grade serous") AND (hasabstract[text])';
      const report = await runIngestionPipeline(
        globalQuery,
        2,
        40,
        papers,
        userProfile,
        (msg) => setStatusMessage(msg)
      );

      totalNew = report.newPapers.length;
      if (totalNew > 0) {
        onPapersIngested(report.newPapers);
        setStatusMessage(`🎉 Ingested & categorized ${totalNew} new papers published today across all 8 domains!`);
      } else {
        setStatusMessage('✅ All 8 research categories are completely up to date with NCBI today.');
      }
    } catch (err: any) {
      console.error('Error refreshing all domains:', err);
      setStatusMessage(`Failed to complete daily sync: ${err.message || 'Network error'}`);
    } finally {
      setIsUpdatingAll(false);
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };

  const visibleDomains =
    activeDomainFilter === 'all'
      ? RESEARCH_DOMAINS
      : RESEARCH_DOMAINS.filter((d) => d.id === activeDomainFilter);

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-8" dir="ltr">
      {/* Top Banner with Daily Control Panel */}
      <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-emerald-500/10 via-[#c4a484]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Live Daily Dispatch
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#c4a484]" />
                {todayDateString}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif text-white font-bold tracking-tight">
              Today's New Ovarian Cancer Papers & 8-Domain Matrix
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed font-sans">
              Dedicated real-time feed tracking new publications from NCBI PubMed and PMC released today. Every study is automatically classified into its corresponding ovarian subtype and specialized scientific domain, with dedicated per-section daily sync triggers.
            </p>
          </div>

          {/* Action Button: Refresh All 8 Sections */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleRefreshAllToday}
              disabled={isUpdatingAll || Boolean(updatingDomainId)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-[#c4a484] text-slate-950 font-bold text-xs sm:text-sm hover:opacity-95 shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isUpdatingAll ? 'animate-spin' : ''}`} />
              <span>{isUpdatingAll ? 'Syncing All 8 Domains...' : "Refresh All Today's Papers"}</span>
            </button>
          </div>
        </div>

        {/* Status Toast / Progress Message */}
        {statusMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-[#161616] border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span className="font-sans">{statusMessage}</span>
          </div>
        )}

        {/* Domain Navigation Chips & Counts */}
        <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-sans font-bold flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#c4a484]" />
              Filter by Category Matrix ({todayPapers.length} Total Papers Today):
            </span>

            {/* Subtype Quick Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 text-[11px]">Subtype:</span>
              <select
                value={activeSubtypeFilter}
                onChange={(e) => setActiveSubtypeFilter(e.target.value as any)}
                className="bg-[#0a0a0a] border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-[#c4a484]"
              >
                <option value="all">All Subtypes</option>
                <option value="HGSOC">HGSOC Only</option>
                <option value="Clear cell">Clear Cell</option>
                <option value="Low-grade serous">Low-Grade Serous</option>
                <option value="Endometrioid">Endometrioid</option>
                <option value="Mucinous">Mucinous</option>
                <option value="Borderline">Borderline</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveDomainFilter('all')}
              className={`text-xs px-3.5 py-2 rounded-xl border transition-all cursor-pointer font-sans flex items-center gap-2 ${
                activeDomainFilter === 'all'
                  ? 'bg-white/15 text-white font-bold border-[#c4a484]'
                  : 'bg-[#0a0a0a] text-slate-400 border-white/5 hover:text-white hover:border-white/20'
              }`}
            >
              <span>All 8 Categories</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-white font-mono text-[10px]">
                {todayPapers.length}
              </span>
            </button>

            {RESEARCH_DOMAINS.map((domain) => {
              const count = papersByDomain[domain.id].length;
              const isActive = activeDomainFilter === domain.id;
              return (
                <button
                  key={domain.id}
                  onClick={() => setActiveDomainFilter(domain.id)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-sans flex items-center gap-2 ${
                    isActive
                      ? `${domain.bgColor} ${domain.color} font-bold ${domain.borderColor} shadow-md`
                      : 'bg-[#0a0a0a] text-slate-400 border-white/5 hover:text-slate-200 hover:border-white/20'
                  }`}
                >
                  <span className={isActive ? domain.color : 'text-slate-400'}>
                    {getDomainIcon(domain.iconName)}
                  </span>
                  <span>{domain.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
                      count > 0 ? `${domain.bgColor} ${domain.color} font-bold` : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 8 CATEGORY SECTIONS */}
      <div className="space-y-8">
        {visibleDomains.map((domain) => {
          const sectionPapers = papersByDomain[domain.id];
          const isCollapsed = collapsedSections[domain.id];
          const isUpdatingThis = updatingDomainId === domain.id;

          return (
            <div
              key={domain.id}
              className={`bg-[#111111] border rounded-3xl overflow-hidden transition-all shadow-xl ${
                sectionPapers.length > 0 ? 'border-white/10' : 'border-white/5'
              }`}
            >
              {/* Section Header */}
              <div
                className={`p-5 sm:p-6 bg-gradient-to-r ${domain.gradient} border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`p-2.5 rounded-2xl ${domain.bgColor} ${domain.color} border ${domain.borderColor}`}>
                    {getDomainIcon(domain.iconName)}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-serif text-white font-bold">{domain.name}</h3>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/10">
                        {domain.category}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                          sectionPapers.length > 0
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-white/5 text-slate-500'
                        }`}
                      >
                        {sectionPapers.length} new today
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 max-w-2xl font-sans leading-relaxed">
                      {domain.description}
                    </p>
                  </div>
                </div>

                {/* Section Controls */}
                <div className="flex items-center gap-2 self-end md:self-center font-sans">
                  {/* Dedicated Daily Refresh Button for THIS section */}
                  <button
                    onClick={() => handleUpdateDomain(domain)}
                    disabled={isUpdatingThis || isUpdatingAll}
                    className={`text-xs px-3.5 py-2 rounded-xl border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      domain.bgColor
                    } ${domain.color} ${domain.borderColor} hover:brightness-125 disabled:opacity-50`}
                    title={`Fetch today's new papers for ${domain.name} directly from PubMed`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingThis ? 'animate-spin' : ''}`} />
                    <span>{isUpdatingThis ? 'Fetching...' : 'Update Section'}</span>
                  </button>

                  {/* PubMed External Direct Link */}
                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(
                      `${domain.query} AND ("last 2 days"[dp])`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs transition-all"
                    title="View live search for today on NCBI PubMed"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Expand / Collapse Section */}
                  <button
                    onClick={() => toggleSection(domain.id)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title={isCollapsed ? 'Expand section' : 'Collapse section'}
                  >
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Section Body */}
              {!isCollapsed && (
                <div className="p-5 sm:p-6 space-y-4">
                  {sectionPapers.length === 0 ? (
                    /* Zero papers state for this domain today */
                    <div className="bg-[#0a0a0a] border border-dashed border-white/10 rounded-2xl p-8 text-center space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                        <Clock className="w-5 h-5" />
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 font-sans">
                        No new papers recorded in <strong className="text-white">{domain.name}</strong> yet today.
                      </p>
                      <button
                        onClick={() => handleUpdateDomain(domain)}
                        disabled={isUpdatingThis}
                        className={`text-xs px-4 py-2 rounded-xl border font-bold inline-flex items-center gap-2 cursor-pointer transition-all ${domain.bgColor} ${domain.color} ${domain.borderColor} hover:brightness-125`}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingThis ? 'animate-spin' : ''}`} />
                        <span>Check PubMed Live for Today's Publications in this Category</span>
                      </button>
                    </div>
                  ) : (
                    /* List of papers for this domain */
                    <div className="space-y-4">
                      {sectionPapers.map((paper) => (
                        <div key={paper.id} className="relative">
                          <PaperCard
                            paper={paper}
                            onSelect={onSelectPaper}
                            onToggleSave={onToggleSave}
                            onToggleRead={onToggleRead}
                            onFeedback={onFeedback}
                            onSelectEntity={onSelectEntity}
                            onOpenSocial={onOpenSocial}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
