import React, { useState, useEffect } from 'react';
import { paperStore } from './services/storage/paperStore';
import { Paper, FilterOptions, OvarianSubtype } from './types/paper';
import { UserProfile } from './types/profile';
import { Header, ActiveTabType } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { FilterSidebar } from './components/FilterSidebar';
import { PaperCard } from './components/PaperCard';
import { PaperDetailModal } from './components/PaperDetailModal';
import { EmergingEntitiesRadar } from './components/EmergingEntitiesRadar';
import { ResearchTimeline } from './components/ResearchTimeline';
import { SubtypeLandscape } from './components/SubtypeLandscape';
import { SemanticSearchTab } from './components/SemanticSearchTab';
import { ResearchGapsTab } from './components/ResearchGapsTab';
import { ResearchDigestModal } from './components/ResearchDigestModal';
import { UserProfileModal } from './components/UserProfileModal';
import { LiveIngestionModal } from './components/LiveIngestionModal';
import { SocialPostGeneratorModal } from './components/SocialPostGeneratorModal';
import { ResearchTrendsTab } from './components/ResearchTrendsTab';
import { NcbiLiveIntegrationModal } from './components/NcbiLiveIntegrationModal';
import { HgsocLiveTopicSyncBar } from './components/HgsocLiveTopicSyncBar';
import { HgsocResearchHubTab } from './components/HgsocResearchHubTab';
import { DailyPapersTab } from './components/DailyPapersTab';
import { GlobalPubMedCensusDashboard } from './components/GlobalPubMedCensusDashboard';
import { runIngestionPipeline } from './services/ingestion/pipeline';
import { isPaperNewToday, RESEARCH_DOMAINS } from './types/researchDomains';
import { ArrowUpDown, CheckCircle2, X, Sparkles, BookOpen, RefreshCw } from 'lucide-react';

export function App() {
  const [papers, setPapers] = useState<Paper[]>(paperStore.getPapers());
  const [profile, setProfile] = useState<UserProfile>(paperStore.getProfile());
  const [activeTab, setActiveTab] = useState<ActiveTabType>('feed');
  const [isFetchingToday, setIsFetchingToday] = useState(false);
  const [isFetchingFiltered, setIsFetchingFiltered] = useState(false);
  const [todayToast, setTodayToast] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    subtypes: [],
    studyTypes: [],
    dateRange: 'all',
    minFinalScore: 0,
    minHgsocScore: 0,
    openAccessOnly: false,
    aiSummarizedOnly: false,
    savedOnly: false,
    unreadOnly: false,
    selectedEntity: null,
    sortBy: 'finalScore',
    sortOrder: 'desc',
  });

  // Modals state
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [socialPaper, setSocialPaper] = useState<Paper | null>(null);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [isDigestOpen, setIsDigestOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isIngestionOpen, setIsIngestionOpen] = useState(false);
  const [isNcbiModalOpen, setIsNcbiModalOpen] = useState(false);

  // Subscribe to paper store changes
  useEffect(() => {
    const unsubscribe = paperStore.subscribe(() => {
      setPapers(paperStore.getPapers());
      setProfile(paperStore.getProfile());
    });
    return () => unsubscribe();
  }, []);

  const filteredPapers = paperStore.filterPapers(filters);
  const trends = paperStore.getTrends();
  const researchGaps = paperStore.getResearchGaps();
  const digest = isDigestOpen ? paperStore.generateDailyDigest() : null;

  // Calculate today's papers count
  const todayPapersCount = papers.filter(isPaperNewToday).length;

  // Handlers
  const handleToggleSave = (id: string) => {
    paperStore.toggleSavePaper(id);
    if (selectedPaper && selectedPaper.id === id) {
      setSelectedPaper({ ...selectedPaper, isSaved: !selectedPaper.isSaved });
    }
  };

  const handleToggleRead = (id: string) => {
    paperStore.toggleReadPaper(id);
    if (selectedPaper && selectedPaper.id === id) {
      setSelectedPaper({ ...selectedPaper, isRead: !selectedPaper.isRead });
    }
  };

  const handleFeedback = (id: string, feedback: 'up' | 'down') => {
    paperStore.setPaperFeedback(id, feedback);
    if (selectedPaper && selectedPaper.id === id) {
      setSelectedPaper({ ...selectedPaper, feedback: selectedPaper.feedback === feedback ? null : feedback });
    }
  };

  const handleUpdatePaper = (paper: Paper) => {
    paperStore.updatePaper(paper);
    if (selectedPaper && selectedPaper.id === paper.id) {
      setSelectedPaper(paper);
    }
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    paperStore.updateProfile(newProfile);
  };

  const handlePapersIngested = (newPapers: Paper[]) => {
    paperStore.addPapers(newPapers);
  };

  const handleClearFeed = () => {
    paperStore.clearAllPapers();
  };

  const handleLoadLandmarkCohort = () => {
    paperStore.loadLandmarkCohort();
  };

  const handleSelectEntity = (type: 'genes' | 'drugs' | 'pathways' | 'biomarkers' | 'technologies', name: string) => {
    setFilters({
      ...filters,
      selectedEntity: { type, name },
    });
    setActiveTab('feed');
  };

  const handleSelectSubtype = (st: OvarianSubtype) => {
    setFilters({
      ...filters,
      subtypes: [st],
    });
    setActiveTab('feed');
  };

  const handleOpenSocialModal = (paper: Paper) => {
    setSocialPaper(paper);
    setIsSocialModalOpen(true);
  };

  const handleFetchTodayPapers = async () => {
    setIsFetchingToday(true);
    setTodayToast('Connecting to NCBI E-Utilities to inspect publications released today...');
    try {
      const query = '(ovarian cancer OR HGSOC OR "high-grade serous" OR "ovarian neoplasm") AND (hasabstract[text])';
      const report = await runIngestionPipeline(
        query,
        2, // 2 days to capture everything today worldwide timezone-safe
        30,
        papers,
        profile,
        (status) => setTodayToast(status)
      );

      if (report.newPapers.length > 0) {
        handlePapersIngested(report.newPapers);
        setTodayToast(`✨ Successfully fetched & indexed ${report.newPapers.length} new papers published today!`);
      } else {
        setTodayToast('✅ You are up to date! No additional new papers published in the last few hours.');
      }

      setFilters((prev) => ({ ...prev, dateRange: '24h', minFinalScore: 0, minHgsocScore: 0 }));
      setActiveTab('dailyPapers');
    } catch (err: any) {
      console.error('Error fetching today papers:', err);
      setTodayToast('Failed to connect to NCBI: ' + (err.message || 'Network error'));
    } finally {
      setIsFetchingToday(false);
      setTimeout(() => {
        setTodayToast(null);
      }, 8000);
    }
  };

  const handleFetchFilteredLive = async () => {
    setIsFetchingFiltered(true);
    let targetTerm = 'ovarian cancer';
    let label = 'selected filter';

    if (filters.subtypes && filters.subtypes.length > 0) {
      targetTerm = `"${filters.subtypes[0]}" ovarian cancer`;
      label = filters.subtypes[0];
    } else if (filters.searchQuery && filters.searchQuery.trim()) {
      targetTerm = `(${filters.searchQuery}) AND ("ovarian cancer" OR HGSOC)`;
      label = `"${filters.searchQuery}"`;
    } else if (filters.studyTypes && filters.studyTypes.length > 0) {
      targetTerm = `"${filters.studyTypes[0]}" AND ("ovarian cancer" OR HGSOC)`;
      label = filters.studyTypes[0];
    } else if (filters.selectedEntity) {
      targetTerm = `"${filters.selectedEntity.name}" AND ("ovarian cancer" OR HGSOC)`;
      label = `${filters.selectedEntity.name} (${filters.selectedEntity.type})`;
    }

    setTodayToast(`Querying PubMed live for ${label}...`);

    try {
      const query = `${targetTerm} AND (hasabstract[text])`;
      const report = await runIngestionPipeline(
        query,
        180,
        25,
        papers,
        profile,
        (status) => setTodayToast(status)
      );

      if (report.newPapers.length > 0) {
        handlePapersIngested(report.newPapers);
        setTodayToast(`✨ Ingested ${report.newPapers.length} verified studies matching ${label} from PubMed!`);
        // Reset score barrier so newly fetched papers show up
        setFilters((prev) => ({ ...prev, minFinalScore: 0, minHgsocScore: 0 }));
      } else {
        setTodayToast(`✅ No new matching records found in PubMed for ${label}.`);
      }
    } catch (err: any) {
      console.error('Error fetching filtered papers:', err);
      setTodayToast('Failed to connect to PubMed: ' + (err.message || 'Network error'));
    } finally {
      setIsFetchingFiltered(false);
      setTimeout(() => {
        setTodayToast(null);
      }, 8000);
    }
  };

  const savedCount = papers.filter((p) => p.isSaved).length;
  const hgsocCount = papers.filter((p) => p.ovarianSubtype === 'HGSOC').length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300 font-sans flex flex-col selection:bg-[#c4a484]/30 selection:text-white relative" dir="ltr">
      {/* Top Notification Toast for Today's Updates */}
      {todayToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#161616] border border-emerald-500/40 rounded-2xl p-4 shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-start gap-3 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs text-white font-sans leading-relaxed">
            {todayToast}
          </div>
          <button
            onClick={() => setTodayToast(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <Header
        filters={filters}
        onFilterChange={setFilters}
        savedCount={savedCount}
        totalCount={papers.length}
        hgsocCount={hgsocCount}
        todayCount={todayPapersCount}
        userProfile={profile}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenDigest={() => setIsDigestOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenIngestion={() => setIsIngestionOpen(true)}
        onOpenNcbiModal={() => setIsNcbiModalOpen(true)}
        onFetchTodayPapers={handleFetchTodayPapers}
        onClearFeed={handleClearFeed}
        isFetchingToday={isFetchingToday}
      />

      {/* Primary Metrics Overview (shown on main feed when papers exist) */}
      {activeTab === 'feed' && (
        <MetricsOverview
          papers={papers}
          trends={trends}
          onFilterHgsoc={() => setFilters({ ...filters, subtypes: ['HGSOC'] })}
          onFilterHighPriority={() => setFilters({ ...filters, minFinalScore: 85 })}
          onFilterTrials={() => setFilters({ ...filters, studyTypes: ['Phase III Trial', 'Phase II Trial'] })}
          onOpenCensus={() => setActiveTab('census')}
        />
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* TAB 0: DAILY PAPERS TAB (8-Domain Breakdown + Per-domain Daily Ingestion) */}
        {activeTab === 'dailyPapers' && (
          <DailyPapersTab
            papers={papers}
            userProfile={profile}
            onSelectPaper={setSelectedPaper}
            onToggleSave={handleToggleSave}
            onToggleRead={handleToggleRead}
            onFeedback={handleFeedback}
            onSelectEntity={handleSelectEntity}
            onOpenSocial={handleOpenSocialModal}
            onPapersIngested={handlePapersIngested}
          />
        )}

        {/* TAB: GLOBAL PUBMED CENSUS & TOTAL DISTRIBUTION (Subtypes + 8 Domains) */}
        {activeTab === 'census' && (
          <GlobalPubMedCensusDashboard
            papers={papers}
            userProfile={profile}
            onSelectSubtype={(sub) => {
              setFilters({ ...filters, subtypes: [sub] });
              setActiveTab('feed');
            }}
            onSelectDomain={(dId) => {
              const dom = RESEARCH_DOMAINS.find((d) => d.id === dId);
              if (dom) {
                setFilters({ ...filters, searchQuery: dom.keywords[0] || dom.badge });
              }
              setActiveTab('feed');
            }}
            onSelectPaper={setSelectedPaper}
            onPapersIngested={handlePapersIngested}
            onFilterByTopic={(topic) => {
              setFilters({ ...filters, searchQuery: topic });
              setActiveTab('feed');
            }}
          />
        )}

        {/* TAB 1: PAPERS FEED */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {/* Live HGSOC Topic Fetcher & Sync Bar */}
            <HgsocLiveTopicSyncBar
              papers={papers}
              userProfile={profile}
              filters={filters}
              onFilterChange={setFilters}
              onPapersIngested={handlePapersIngested}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
              {/* Sidebar Filters */}
              <div className="lg:col-span-1 sticky top-36">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={setFilters}
                  totalFilteredCount={filteredPapers.length}
                />
              </div>

              {/* Papers List */}
              <div className="lg:col-span-3 space-y-4">
                {/* Sort and Control bar */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-serif text-white font-bold">
                        Indexed Scientific Literature
                      </span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#c4a484]/15 border border-[#c4a484]/30 text-[#c4a484] font-bold">
                        {filteredPapers.length} of {papers.length} papers
                      </span>
                      {filters.newlyIngestedOnly && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold animate-pulse">
                          ⚡ Showing Newly Ingested Only
                        </span>
                      )}
                    </div>

                    {/* Advanced Sort Order Controls */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 font-sans text-xs">Sort by:</span>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                        className="bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c4a484] font-sans cursor-pointer"
                      >
                        <option value="recentIngestion">⚡ Newly Ingested from NCBI</option>
                        <option value="finalScore">🏆 Radar Composite Score (Final Score)</option>
                        <option value="publicationDate">📅 Publication Date (Newest)</option>
                        <option value="hgsocScore">🎯 Highest HGSOC Priority</option>
                        <option value="importanceScore">💡 Evidence Tier & Importance</option>
                        <option value="noveltyScore">🧬 Scientific Novelty</option>
                        <option value="personalizationScore">👤 Profile Match</option>
                        <option value="citationCount">📊 Citation Count</option>
                      </select>

                      <button
                        onClick={() =>
                          setFilters({
                            ...filters,
                            sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
                          })
                        }
                        className="p-2 rounded-xl bg-[#0a0a0a] border border-white/10 text-slate-300 hover:text-white hover:border-[#c4a484] transition-all cursor-pointer flex items-center gap-1"
                        title={`Sort order: ${filters.sortOrder === 'desc' ? 'Descending (Highest to Lowest)' : 'Ascending (Lowest to Highest)'}`}
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-sans hidden sm:inline">
                          {filters.sortOrder === 'desc' ? 'Desc' : 'Asc'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Filter Interactive Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-400 font-sans mr-1">Quick Filters:</span>

                    {/* Newly Ingested Toggle */}
                    {papers.some((p) => p.isNewlyIngested) && (
                      <button
                        onClick={() =>
                          setFilters({
                            ...filters,
                            newlyIngestedOnly: !filters.newlyIngestedOnly,
                          })
                        }
                        className={`text-xs px-3 py-1 rounded-xl border transition-all cursor-pointer font-sans flex items-center gap-1.5 ${
                          filters.newlyIngestedOnly
                            ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                        }`}
                      >
                        <span>⚡ Newly Ingested ({papers.filter((p) => p.isNewlyIngested).length})</span>
                      </button>
                    )}

                    {/* HGSOC Chip */}
                    <button
                      onClick={() => {
                        const isHgsocActive = filters.subtypes.length === 1 && filters.subtypes[0] === 'HGSOC';
                        setFilters({
                          ...filters,
                          subtypes: isHgsocActive ? [] : ['HGSOC'],
                        });
                      }}
                      className={`text-xs px-3 py-1 rounded-xl border transition-all cursor-pointer font-sans flex items-center gap-1.5 ${
                        filters.subtypes.includes('HGSOC') && filters.subtypes.length === 1
                          ? 'bg-[#c4a484] text-slate-950 font-bold border-[#c4a484]'
                          : 'bg-[#161616] text-slate-300 border-white/10 hover:border-[#c4a484]/40 hover:text-white'
                      }`}
                    >
                      <span>🧬 HGSOC Only</span>
                    </button>

                    {/* High Score 80+ */}
                    <button
                      onClick={() => {
                        setFilters({
                          ...filters,
                          minFinalScore: filters.minFinalScore === 80 ? 0 : 80,
                        });
                      }}
                      className={`text-xs px-3 py-1 rounded-xl border transition-all cursor-pointer font-sans flex items-center gap-1.5 ${
                        filters.minFinalScore >= 80
                          ? 'bg-amber-500/20 text-amber-300 font-bold border-amber-500/50'
                          : 'bg-[#161616] text-slate-300 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <span>🔥 High Priority (Score ≥ 80)</span>
                    </button>

                    {/* AI & ML */}
                    <button
                      onClick={() => {
                        const isAi = filters.searchQuery.toLowerCase().includes('machine learning');
                        setFilters({
                          ...filters,
                          searchQuery: isAi ? '' : 'Machine learning',
                        });
                      }}
                      className={`text-xs px-3 py-1 rounded-xl border transition-all cursor-pointer font-sans flex items-center gap-1.5 ${
                        filters.searchQuery.toLowerCase().includes('machine learning')
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border-cyan-500/50'
                          : 'bg-[#161616] text-slate-300 border-white/10 hover:border-cyan-500/30'
                      }`}
                    >
                      <span>🤖 AI & Machine Learning</span>
                    </button>

                    {/* Multi-omics */}
                    <button
                      onClick={() => {
                        const isOmics = filters.searchQuery.toLowerCase().includes('multi-omics');
                        setFilters({
                          ...filters,
                          searchQuery: isOmics ? '' : 'multi-omics',
                        });
                      }}
                      className={`text-xs px-3 py-1 rounded-xl border transition-all cursor-pointer font-sans flex items-center gap-1.5 ${
                        filters.searchQuery.toLowerCase().includes('multi-omics')
                          ? 'bg-purple-500/20 text-purple-300 font-bold border-purple-500/50'
                          : 'bg-[#161616] text-slate-300 border-white/10 hover:border-purple-500/30'
                      }`}
                    >
                      <span>🧬 Multi-omics</span>
                    </button>

                    {/* Reset All Quick Button if any filter active */}
                    {(filters.searchQuery ||
                      filters.subtypes.length > 0 ||
                      filters.studyTypes.length > 0 ||
                      filters.minFinalScore > 0 ||
                      filters.minHgsocScore > 0 ||
                      filters.newlyIngestedOnly ||
                      filters.dateRange !== 'all') && (
                      <button
                        onClick={() =>
                          setFilters({
                            searchQuery: '',
                            subtypes: [],
                            studyTypes: [],
                            dateRange: 'all',
                            minFinalScore: 0,
                            minHgsocScore: 0,
                            openAccessOnly: false,
                            aiSummarizedOnly: false,
                            savedOnly: false,
                            unreadOnly: false,
                            newlyIngestedOnly: false,
                            selectedEntity: null,
                            sortBy: 'finalScore',
                            sortOrder: 'desc',
                          })
                        }
                        className="text-xs px-2.5 py-1 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/5 transition-all cursor-pointer font-sans"
                      >
                        ✕ Reset All Filters
                      </button>
                    )}
                  </div>
                </div>

                {/* Papers Loop or Empty On-Demand States */}
                {filteredPapers.length === 0 ? (
                  papers.length === 0 ? (
                    /* Initial On-Demand Zero State */
                    <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
                      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#c4a484]/20 via-[#c4a484]/10 to-transparent border border-[#c4a484]/40 flex items-center justify-center mx-auto text-[#c4a484] shadow-[0_0_25px_rgba(196,164,132,0.2)]">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <div className="space-y-2 max-w-xl mx-auto">
                        <h3 className="text-xl font-serif text-white font-bold">
                          Welcome to Ovarian Cancer Research Radar
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                          Your radar is ready to fetch verified literature on demand. Click any high-yield topic button above, enter a custom query, or load landmark cohort papers.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          onClick={handleFetchTodayPapers}
                          disabled={isFetchingToday}
                          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:opacity-95 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer flex items-center gap-2"
                        >
                          <RefreshCw className={`w-4 h-4 ${isFetchingToday ? 'animate-spin' : ''}`} />
                          <span>Fetch Today's PubMed Papers</span>
                        </button>

                        <button
                          onClick={handleLoadLandmarkCohort}
                          className="px-6 py-3 rounded-2xl bg-[#c4a484] text-slate-950 font-bold text-xs hover:opacity-90 shadow-[0_0_20px_rgba(196,164,132,0.3)] transition-all cursor-pointer flex items-center gap-2"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Load Landmark HGSOC Studies</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Filtered Out State with Smart Actions */
                    <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-xl">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#c4a484]">
                        <ArrowUpDown className="w-7 h-7" />
                      </div>

                      <div className="space-y-2 max-w-lg mx-auto">
                        <h3 className="text-lg sm:text-xl text-white font-serif font-bold">
                          No papers match your current active filters
                        </h3>
                        <p className="text-xs text-slate-400 font-sans leading-relaxed">
                          You have {papers.length} papers in your local index, but the active filter criteria narrowed the list to 0.
                        </p>
                      </div>

                      {/* Active Filter Tags */}
                      <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
                        {filters.subtypes.map((st) => (
                          <span
                            key={st}
                            className="text-xs px-3 py-1 rounded-full bg-[#c4a484]/15 border border-[#c4a484]/40 text-[#c4a484] font-mono flex items-center gap-1.5"
                          >
                            <span>Subtype: {st}</span>
                            <button
                              onClick={() => setFilters({ ...filters, subtypes: filters.subtypes.filter((s) => s !== st) })}
                              className="hover:text-white"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                        {filters.searchQuery && (
                          <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-sans flex items-center gap-1.5">
                            <span>Query: "{filters.searchQuery}"</span>
                            <button
                              onClick={() => setFilters({ ...filters, searchQuery: '' })}
                              className="hover:text-white"
                            >
                              ✕
                            </button>
                          </span>
                        )}
                        {filters.studyTypes.map((st) => (
                          <span
                            key={st}
                            className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-sans flex items-center gap-1.5"
                          >
                            <span>Study: {st}</span>
                            <button
                              onClick={() => setFilters({ ...filters, studyTypes: filters.studyTypes.filter((s) => s !== st) })}
                              className="hover:text-white"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                        {filters.minFinalScore > 0 && (
                          <span className="text-xs px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono flex items-center gap-1.5">
                            <span>Min Score: ≥ {filters.minFinalScore}</span>
                            <button
                              onClick={() => setFilters({ ...filters, minFinalScore: 0 })}
                              className="hover:text-white"
                            >
                              ✕
                            </button>
                          </span>
                        )}
                        {filters.dateRange !== 'all' && (
                          <span className="text-xs px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/40 text-purple-300 font-sans flex items-center gap-1.5">
                            <span>Date: {filters.dateRange}</span>
                            <button
                              onClick={() => setFilters({ ...filters, dateRange: 'all' })}
                              className="hover:text-white"
                            >
                              ✕
                            </button>
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        {/* Live Fetch Matching Papers from PubMed */}
                        <button
                          onClick={handleFetchFilteredLive}
                          disabled={isFetchingFiltered}
                          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:opacity-95 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer flex items-center gap-2"
                        >
                          <RefreshCw className={`w-4 h-4 ${isFetchingFiltered ? 'animate-spin' : ''}`} />
                          <span>Fetch Matching Papers Live from PubMed</span>
                        </button>

                        {/* Reset All Filters */}
                        <button
                          onClick={() =>
                            setFilters({
                              searchQuery: '',
                              subtypes: [],
                              studyTypes: [],
                              dateRange: 'all',
                              minFinalScore: 0,
                              minHgsocScore: 0,
                              openAccessOnly: false,
                              aiSummarizedOnly: false,
                              savedOnly: false,
                              unreadOnly: false,
                              newlyIngestedOnly: false,
                              selectedEntity: null,
                              sortBy: 'recentIngestion',
                              sortOrder: 'desc',
                            })
                          }
                          className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-all cursor-pointer border border-white/10"
                        >
                          Reset All Filters ({papers.length} Papers)
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  filteredPapers.map((paper) => (
                    <PaperCard
                      key={paper.id}
                      paper={paper}
                      onSelect={setSelectedPaper}
                      onToggleSave={handleToggleSave}
                      onToggleRead={handleToggleRead}
                      onFeedback={handleFeedback}
                      onSelectEntity={handleSelectEntity}
                      onOpenSocial={handleOpenSocialModal}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: HGSOC RESEARCH HUB */}
        {activeTab === 'hgsocHub' && (
          <HgsocResearchHubTab
            papers={papers}
            userProfile={profile}
            onSelectPaper={setSelectedPaper}
            onToggleSave={handleToggleSave}
            onToggleRead={handleToggleRead}
            onFeedback={handleFeedback}
            onSelectEntity={handleSelectEntity}
            onOpenSocial={handleOpenSocialModal}
            onPapersIngested={handlePapersIngested}
          />
        )}

        {/* TAB: RESEARCH TRENDS & VISUAL CHARTS */}
        {activeTab === 'trends' && (
          <ResearchTrendsTab
            papers={papers}
            onSelectPaper={setSelectedPaper}
            onFilterByTopic={(topic) => {
              setFilters({ ...filters, searchQuery: topic });
              setActiveTab('feed');
            }}
          />
        )}

        {/* TAB 2: DYNAMIC EMERGING ENTITIES RADAR */}
        {activeTab === 'entities' && (
          <EmergingEntitiesRadar
            trends={trends}
            onSelectEntity={handleSelectEntity}
          />
        )}

        {/* TAB 3: RESEARCH EVOLUTION TIMELINE */}
        {activeTab === 'timeline' && (
          <ResearchTimeline
            papers={papers}
            onSelectPaper={setSelectedPaper}
            onFilterByKeyword={(kw) => {
              setFilters({ ...filters, searchQuery: kw });
              setActiveTab('feed');
            }}
          />
        )}

        {/* TAB 4: SUBTYPE LANDSCAPE (With 8-Domain Submatrix & PubMed Retrieval) */}
        {activeTab === 'subtypes' && (
          <SubtypeLandscape
            papers={papers}
            userProfile={profile}
            onSelectSubtype={handleSelectSubtype}
            onPapersIngested={handlePapersIngested}
            onSelectPaper={setSelectedPaper}
            onToggleSave={handleToggleSave}
            onToggleRead={handleToggleRead}
            onFeedback={handleFeedback}
            onOpenSocial={handleOpenSocialModal}
            onFilterByTopic={(topic) => {
              setFilters({ ...filters, searchQuery: topic });
              setActiveTab('feed');
            }}
          />
        )}

        {/* TAB 5: SEMANTIC SEARCH */}
        {activeTab === 'search' && (
          <SemanticSearchTab
            papers={papers}
            onSelectPaper={setSelectedPaper}
            onToggleSave={handleToggleSave}
            onToggleRead={handleToggleRead}
            onFeedback={handleFeedback}
            onSelectEntity={handleSelectEntity}
          />
        )}

        {/* TAB 6: RESEARCH GAPS */}
        {activeTab === 'gaps' && (
          <ResearchGapsTab
            gaps={researchGaps}
            onSelectEntity={handleSelectEntity}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      {selectedPaper && (
        <PaperDetailModal
          paper={selectedPaper}
          allPapers={papers}
          userProfile={profile}
          onClose={() => setSelectedPaper(null)}
          onToggleSave={handleToggleSave}
          onToggleRead={handleToggleRead}
          onUpdatePaper={handleUpdatePaper}
          onSelectSimilarPaper={(p) => setSelectedPaper(p)}
          onOpenSocial={handleOpenSocialModal}
        />
      )}

      {/* Social Post Generator Modal */}
      {socialPaper && (
        <SocialPostGeneratorModal
          paper={socialPaper}
          isOpen={isSocialModalOpen}
          onClose={() => {
            setIsSocialModalOpen(false);
            setSocialPaper(null);
          }}
        />
      )}

      {isDigestOpen && (
        <ResearchDigestModal
          digest={digest}
          onClose={() => setIsDigestOpen(false)}
          onSelectPaper={(p) => setSelectedPaper(p)}
        />
      )}

      {isProfileOpen && (
        <UserProfileModal
          profile={profile}
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          onSaveProfile={handleSaveProfile}
        />
      )}

      {isIngestionOpen && (
        <LiveIngestionModal
          isOpen={isIngestionOpen}
          onClose={() => setIsIngestionOpen(false)}
          existingPapers={papers}
          userProfile={profile}
          onPapersIngested={handlePapersIngested}
        />
      )}

      {/* NCBI Live Direct Integration Modal */}
      <NcbiLiveIntegrationModal
        isOpen={isNcbiModalOpen}
        onClose={() => setIsNcbiModalOpen(false)}
        userProfile={profile}
        onSaveProfile={handleSaveProfile}
        existingPapers={papers}
        onPapersIngested={handlePapersIngested}
      />

      {/* Elegant Dark Footer */}
      <footer className="border-t border-white/5 bg-[#080808] py-6 mt-16 text-slate-500 text-xs" dir="ltr">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#c4a484] font-serif font-bold">
              Ovarian Cancer Research Radar
            </span>
            <span>•</span>
            <span className="font-mono text-[11px]">8-Domain Oncology Intelligence & Biomarker Discovery Engine</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-emerald-400">Connected to Official NCBI E-Utilities</span>
            </div>
            <span>•</span>
            <span>{profile.email}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
