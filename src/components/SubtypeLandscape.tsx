import React, { useState } from 'react';
import { Paper, OvarianSubtype } from '../types/paper';
import { UserProfile } from '../types/profile';
import {
  RESEARCH_DOMAINS,
  ResearchDomainId,
  classifyPaperDomains,
} from '../types/researchDomains';
import { runIngestionPipeline } from '../services/ingestion/pipeline';
import {
  Layers,
  ArrowRight,
  Dna,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Download,
  Filter,
  CheckCircle2,
  Cpu,
  Zap,
  Target,
  Activity,
  FlaskConical,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Bookmark,
  BookOpen,
  Share2,
  Search,
  Globe,
  Sliders,
} from 'lucide-react';

interface SubtypeLandscapeProps {
  papers: Paper[];
  userProfile?: UserProfile;
  onSelectSubtype: (subtype: OvarianSubtype) => void;
  onPapersIngested?: (papers: Paper[]) => void;
  onSelectPaper?: (paper: Paper) => void;
  onToggleSave?: (paperId: string) => void;
  onToggleRead?: (paperId: string) => void;
  onFeedback?: (paperId: string, feedback: 'up' | 'down') => void;
  onOpenSocial?: (paper: Paper) => void;
  onFilterByTopic?: (topic: string) => void;
}

interface SubtypeInfo {
  subtype: OvarianSubtype;
  name: string;
  shortLabel: string;
  prevalence: string;
  cellOfOrigin: string;
  hallmarkDrivers: string[];
  keyTherapies: string[];
  clinicalFeatures: string;
  isPriorityHgsoc?: boolean;
  pubmedTerm: string;
}

const SUBTYPE_DETAILS: SubtypeInfo[] = [
  {
    subtype: 'HGSOC',
    name: 'High-Grade Serous Ovarian Carcinoma (HGSOC)',
    shortLabel: 'HGSOC',
    prevalence: '~70-75% of all ovarian epithelial cancers',
    cellOfOrigin: 'Fallopian tube secretory epithelial cells (STIC lesions)',
    hallmarkDrivers: ['TP53 Mutations (>96%)', 'BRCA1/2 Alterations (20-25%)', 'CCNE1 Amplification (~20%)', 'HRD Score High (~50%)', 'MYC Amplification', 'RB1 Loss'],
    keyTherapies: ['Platinum + Paclitaxel Backbone', 'PARP Inhibitors (Olaparib, Niraparib, Rucaparib)', 'ADCs (Mirvetuximab soravtansine)', 'Bevacizumab', 'Emerging CDK2/ATR Synthetic Lethality'],
    clinicalFeatures: 'Characterized by profound chromosomal instability, rapid peritoneal dissemination, high initial platinum sensitivity followed by eventual recurrence in 70-80% of patients.',
    isPriorityHgsoc: true,
    pubmedTerm: 'high-grade serous ovarian cancer',
  },
  {
    subtype: 'Clear cell',
    name: 'Ovarian Clear Cell Carcinoma (OCCC)',
    shortLabel: 'Clear Cell (OCCC)',
    prevalence: '~10% in Western cohorts (up to ~25% in East Asia)',
    cellOfOrigin: 'Endometrial epithelial cells via endometriosis / endometrioma',
    hallmarkDrivers: ['ARID1A Loss (50-60%)', 'PIK3CA Actactivating Mutations (40-50%)', 'PTEN Loss', 'HNF1B Overexpression', 'IL6-STAT3 Pro-inflammatory Pathway'],
    keyTherapies: ['ATR Inhibitors', 'EZH2 Epigenetic Modulators', 'Anti-angiogenic Agents', 'Immune Checkpoint Blockade (PD-L1+)', 'PI3K/mTOR Pathway Inhibitors'],
    clinicalFeatures: 'Strong association with pelvic endometriosis, intrinsic chemoresistance to standard carboplatin/paclitaxel, and elevated risk of paraneoplastic thromboembolic events.',
    pubmedTerm: 'clear cell ovarian cancer',
  },
  {
    subtype: 'Low-grade serous',
    name: 'Low-Grade Serous Ovarian Carcinoma (LGSOC)',
    shortLabel: 'Low-Grade Serous (LGSOC)',
    prevalence: '~5-10% of serous ovarian tumors',
    cellOfOrigin: 'Ovarian surface epithelium or serous cystadenoma / borderline tumor',
    hallmarkDrivers: ['KRAS Mutations (20-35%)', 'BRAF Mutations (5-15%)', 'NRAS Mutations', 'CDKN2A Loss', 'TP53 Wild-Type (Intact)'],
    keyTherapies: ['MEK Inhibitors (Trametinib, Binimetinib)', 'Endocrine Therapy (Letrozole, Tamoxifen, Fulvestrant)', 'CDK4/6 Inhibitors', 'Maximal Cytoreductive Surgery'],
    clinicalFeatures: 'Develops stepwise from serous borderline precursors. Displays indolent, protracted growth kinetics but high recurrence rates and marked resistance to conventional platinum agents.',
    pubmedTerm: 'low-grade serous ovarian cancer',
  },
  {
    subtype: 'Endometrioid',
    name: 'Endometrioid Ovarian Carcinoma (EOC)',
    shortLabel: 'Endometrioid (EOC)',
    prevalence: '~10% of ovarian carcinomas',
    cellOfOrigin: 'Ectopic endometrial tissue associated with endometriosis',
    hallmarkDrivers: ['PTEN Loss (30-40%)', 'ARID1A (30%)', 'CTNNB1 (Beta-catenin, 30-50%)', 'PIK3CA (30-40%)', 'Mismatch Repair Deficiency (dMMR/MSI-H, 15-20%)', 'POLE Mutations'],
    keyTherapies: ['Immune Checkpoint Blockade (Pembrolizumab for dMMR)', 'Hormonal Therapy (Progestins / Aromatase Inhibitors)', 'Carboplatin/Paclitaxel'],
    clinicalFeatures: 'Frequently diagnosed at stage I/II with favorable overall prognosis; the dMMR/MSI-High subset exhibits profound sensitivity to anti-PD-1 checkpoint inhibition.',
    pubmedTerm: 'endometrioid ovarian cancer',
  },
  {
    subtype: 'Mucinous',
    name: 'Mucinous Ovarian Carcinoma (MOC)',
    shortLabel: 'Mucinous (MOC)',
    prevalence: '~2-3% of primary ovarian carcinomas',
    cellOfOrigin: 'Mucinous metaplasia of ovarian surface epithelium / brenner nests',
    hallmarkDrivers: ['KRAS Mutations (50-65%)', 'ERBB2 / HER2 Amplification (20-30%)', 'TP53 Mutations (50%)', 'CDKN2A Loss'],
    keyTherapies: ['HER2-Directed ADCs (Trastuzumab Deruxtecan)', 'GI-type Chemotherapy Regimens (FOLFOX/XELOX)', 'Anti-HER2 Targeted Agents'],
    clinicalFeatures: 'Biologically distinct from serous subtypes; morphologically and genetically resembles gastrointestinal adenocarcinomas and resists gynecologic platinum chemotherapy.',
    pubmedTerm: 'mucinous ovarian cancer',
  },
  {
    subtype: 'Borderline',
    name: 'Borderline / Low Malignant Potential Tumors (LMP)',
    shortLabel: 'Borderline (LMP)',
    prevalence: '~10-15% of epithelial ovarian neoplasms',
    cellOfOrigin: 'Benign cystadenoma epithelium undergoing atypical hyperplasia',
    hallmarkDrivers: ['BRAF V600E Mutation', 'KRAS Codon 12 Mutations', 'Wild-type TP53', 'ER/PR Positivity'],
    keyTherapies: ['Conservative Fertility-Sparing Surgical Resection', 'Active Surveillance Protocol'],
    clinicalFeatures: 'Atypical epithelial proliferation without destructive stromal invasion; exceptional long-term overall survival (>95%) with low risk of malignant transformation.',
    pubmedTerm: 'borderline ovarian tumor OR borderline ovarian cancer',
  },
];

export const SubtypeLandscape: React.FC<SubtypeLandscapeProps> = ({
  papers,
  userProfile,
  onSelectSubtype,
  onPapersIngested,
  onSelectPaper,
  onToggleSave,
  onToggleRead,
  onFeedback,
  onOpenSocial,
  onFilterByTopic,
}) => {
  const [selectedSubtype, setSelectedSubtype] = useState<OvarianSubtype>('HGSOC');
  const [activeDomainFilter, setActiveDomainFilter] = useState<ResearchDomainId | 'all'>('all');
  const [expandedDomain, setExpandedDomain] = useState<ResearchDomainId | null>(null);
  const [viewMode, setViewMode] = useState<'matrix' | 'comparative' | 'deepdive'>('matrix');

  // Ingestion States
  const [isFetchingSubtype, setIsFetchingSubtype] = useState(false);
  const [isFetchingDomainSubtype, setIsFetchingDomainSubtype] = useState<string | null>(null);
  const [isFetchingAllSubtypes, setIsFetchingAllSubtypes] = useState(false);
  const [fetchLimit, setFetchLimit] = useState<number>(30);
  const [fetchDays, setFetchDays] = useState<number>(180);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Active Subtype Details
  const activeSubtypeInfo = SUBTYPE_DETAILS.find((s) => s.subtype === selectedSubtype) || SUBTYPE_DETAILS[0];

  // Filter papers for active subtype
  const subtypePapers = papers.filter((p) => p.ovarianSubtype === selectedSubtype);

  // Calculate papers count per domain for the selected subtype
  const domainPapersMap: Record<ResearchDomainId, Paper[]> = {
    general_hgsoc: [],
    ml_ai: [],
    ai_oncology: [],
    multi_omics: [],
    precision_oncology: [],
    biomarkers: [],
    adcs: [],
    spatial_tme: [],
  };

  subtypePapers.forEach((paper) => {
    const matchedDomains = classifyPaperDomains(paper);
    matchedDomains.forEach((d) => {
      if (domainPapersMap[d]) {
        domainPapersMap[d].push(paper);
      }
    });
  });

  // Global Multi-Subtype Fetch from PubMed and PMC
  const handleFetchAllSubtypes = async () => {
    if (!onPapersIngested) return;
    setIsFetchingAllSubtypes(true);
    setProgressPercent(10);
    setStatusMessage('Querying NCBI PubMed & Europe PMC for comprehensive ovarian cancer literature across all subtypes & 8 domains...');

    try {
      const comprehensiveQuery = '(("ovarian cancer"[Title/Abstract] OR "ovarian carcinoma"[Title/Abstract] OR "HGSOC"[Title/Abstract] OR "clear cell ovarian"[Title/Abstract] OR "low-grade serous"[Title/Abstract] OR "endometrioid ovarian"[Title/Abstract] OR "mucinous ovarian"[Title/Abstract]) AND (hasabstract[text]))';

      const report = await runIngestionPipeline(
        comprehensiveQuery,
        fetchDays,
        fetchLimit * 2,
        papers,
        userProfile || ({} as any),
        (msg, prog) => {
          setStatusMessage(msg);
          setProgressPercent(prog);
        }
      );

      if (report.newPapers.length > 0) {
        onPapersIngested(report.newPapers);
        setStatusMessage(`🎉 Successfully ingested & categorized ${report.newPapers.length} papers from PubMed & PMC across all ovarian subtypes!`);
      } else {
        setStatusMessage('✅ All ovarian cancer literature from PubMed & PMC is currently up to date in the radar.');
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error during comprehensive fetch: ${err.message || 'Network error'}`);
    } finally {
      setIsFetchingAllSubtypes(false);
      setProgressPercent(100);
      setTimeout(() => {
        setStatusMessage(null);
        setProgressPercent(0);
      }, 7000);
    }
  };

  // Dedicated Fetch for the active Subtype
  const handleFetchSpecificSubtype = async (subtypeInfo: SubtypeInfo) => {
    if (!onPapersIngested) return;
    setIsFetchingSubtype(true);
    setProgressPercent(10);
    setStatusMessage(`Connecting to PubMed & PMC to retrieve literature specifically for ${subtypeInfo.name}...`);

    try {
      const query = `(${subtypeInfo.pubmedTerm}) AND ("ovarian cancer" OR "ovarian carcinoma" OR "ovary") AND (hasabstract[text])`;
      const report = await runIngestionPipeline(
        query,
        fetchDays,
        fetchLimit,
        papers,
        userProfile || ({} as any),
        (msg, prog) => {
          setStatusMessage(msg);
          setProgressPercent(prog);
        }
      );

      if (report.newPapers.length > 0) {
        onPapersIngested(report.newPapers);
        setStatusMessage(`✨ Ingested ${report.newPapers.length} new PubMed & PMC studies for ${subtypeInfo.shortLabel}!`);
      } else {
        setStatusMessage(`✅ Up to date with PubMed & PMC for ${subtypeInfo.shortLabel}.`);
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Failed to fetch for ${subtypeInfo.shortLabel}: ${err.message || 'Network error'}`);
    } finally {
      setIsFetchingSubtype(false);
      setProgressPercent(100);
      setTimeout(() => {
        setStatusMessage(null);
        setProgressPercent(0);
      }, 7000);
    }
  };

  // Dedicated Fetch for a specific Subtype + Domain combination
  const handleFetchSubtypeDomain = async (domain: typeof RESEARCH_DOMAINS[0]) => {
    if (!onPapersIngested) return;
    const key = `${selectedSubtype}_${domain.id}`;
    setIsFetchingDomainSubtype(key);
    setProgressPercent(10);
    setStatusMessage(`Querying PubMed & PMC for ${activeSubtypeInfo.shortLabel} + [${domain.badge}] literature...`);

    try {
      const domainQueryKeywords = domain.keywords.slice(0, 4).map((kw) => `"${kw}"`).join(' OR ');
      const combinedQuery = `(${activeSubtypeInfo.pubmedTerm}) AND (${domainQueryKeywords}) AND (hasabstract[text])`;

      const report = await runIngestionPipeline(
        combinedQuery,
        fetchDays,
        20,
        papers,
        userProfile || ({} as any),
        (msg, prog) => {
          setStatusMessage(msg);
          setProgressPercent(prog);
        }
      );

      if (report.newPapers.length > 0) {
        onPapersIngested(report.newPapers);
        setStatusMessage(`🎯 Ingested ${report.newPapers.length} papers for ${activeSubtypeInfo.shortLabel} in ${domain.name}!`);
        setExpandedDomain(domain.id);
      } else {
        setStatusMessage(`✅ Up to date for ${activeSubtypeInfo.shortLabel} + ${domain.badge}.`);
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Fetch error: ${err.message || 'Error'}`);
    } finally {
      setIsFetchingDomainSubtype(null);
      setProgressPercent(100);
      setTimeout(() => {
        setStatusMessage(null);
        setProgressPercent(0);
      }, 7000);
    }
  };

  const getDomainIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'Cpu': return <Cpu className="w-4 h-4" />;
      case 'Zap': return <Zap className="w-4 h-4" />;
      case 'Dna': return <Dna className="w-4 h-4" />;
      case 'Target': return <Target className="w-4 h-4" />;
      case 'Activity': return <Activity className="w-4 h-4" />;
      case 'FlaskConical': return <FlaskConical className="w-4 h-4" />;
      case 'Layers': return <Layers className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn" dir="ltr">
      {/* 1. TOP HEADER & GLOBAL MULTI-SUBTYPE INGESTION CONTROL */}
      <div className="bg-gradient-to-r from-[#141414] via-[#161616] to-[#121212] border border-[#c4a484]/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c4a484]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#c4a484]/20 border border-[#c4a484]/40 flex items-center justify-center text-[#c4a484]">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#c4a484] font-bold">
                  Histopathological Subtypes & 8-Domain Matrix
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold">
                  PubMed & PMC Synchronized
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif text-white font-medium leading-tight">
                Ovarian Cancer Subtype Taxonomy & 8-Domain Breakdown
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                Explore ovarian cancer by specific histological subtype (HGSOC, Clear Cell, Low-Grade Serous, Endometrioid, Mucinous, Borderline) and drill down into the 8 specialized research domains with real-time PubMed and PubMed Central ingestion.
              </p>
            </div>

            {/* Quick Metrics Summary */}
            <div className="flex flex-wrap lg:flex-col gap-2.5 flex-shrink-0">
              <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl px-4 py-2.5 text-left">
                <span className="text-[10px] text-slate-400 block font-mono">Total Indexed Literature</span>
                <span className="text-base font-serif font-bold text-white">{papers.length} Papers</span>
              </div>
              <div className="bg-[#0a0a0a] border border-[#c4a484]/30 rounded-2xl px-4 py-2.5 text-left">
                <span className="text-[10px] text-[#c4a484] block font-mono font-bold">Active Subtype ({selectedSubtype})</span>
                <span className="text-base font-serif font-bold text-[#c4a484]">{subtypePapers.length} Papers</span>
              </div>
            </div>
          </div>

          {/* Controls: Ingestion Parameters & Fetch All Button */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-sans">
              <span className="text-slate-400 text-[11px] font-mono flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-[#c4a484]" />
                Ingestion Config:
              </span>

              {/* Retrieval Limit Selector */}
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5">
                <span className="text-[10px] text-slate-400">Fetch Count:</span>
                <select
                  value={fetchLimit}
                  onChange={(e) => setFetchLimit(Number(e.target.value))}
                  className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
                >
                  <option value={20} className="bg-[#141414]">20 papers/query</option>
                  <option value={35} className="bg-[#141414]">35 papers/query</option>
                  <option value={50} className="bg-[#141414]">50 papers/query</option>
                  <option value={100} className="bg-[#141414]">100 papers/query</option>
                </select>
              </div>

              {/* Timeframe Selector */}
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5">
                <span className="text-[10px] text-slate-400">Time Range:</span>
                <select
                  value={fetchDays}
                  onChange={(e) => setFetchDays(Number(e.target.value))}
                  className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
                >
                  <option value={30} className="bg-[#141414]">Last 30 days</option>
                  <option value={90} className="bg-[#141414]">Last 3 months</option>
                  <option value={180} className="bg-[#141414]">Last 6 months</option>
                  <option value={365} className="bg-[#141414]">Last 1 year</option>
                  <option value={730} className="bg-[#141414]">Last 2 years</option>
                  <option value={0} className="bg-[#141414]">All Time (Comprehensive)</option>
                </select>
              </div>
            </div>

            {/* Global Fetch All Subtypes Button */}
            {onPapersIngested && (
              <button
                onClick={handleFetchAllSubtypes}
                disabled={isFetchingAllSubtypes || isFetchingSubtype}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c4a484] via-[#d6ba9c] to-[#c4a484] text-slate-950 font-bold text-xs hover:opacity-95 shadow-[0_0_20px_rgba(196,164,132,0.3)] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Download className={`w-4 h-4 ${isFetchingAllSubtypes ? 'animate-spin' : ''}`} />
                <span>{isFetchingAllSubtypes ? 'Ingesting All Subtypes...' : 'Fetch All Subtypes (PubMed & PMC)'}</span>
              </button>
            )}
          </div>

          {/* Progress Bar & Live Status */}
          {statusMessage && (
            <div className="space-y-2 p-3.5 rounded-2xl bg-[#0e0e0e] border border-emerald-500/30">
              <div className="flex items-center justify-between text-xs font-sans text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-pulse" />
                  <span>{statusMessage}</span>
                </div>
                {progressPercent > 0 && (
                  <span className="font-mono text-[10px] text-emerald-400">{progressPercent}%</span>
                )}
              </div>
              {progressPercent > 0 && (
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. SUBTYPE SELECTOR TABS & VIEW TOGGLE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-serif text-white font-bold flex items-center gap-2">
              <span>Select Ovarian Cancer Histological Subtype</span>
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Choose a subtype to inspect its 8-domain breakdown and trigger targeted literature retrieval.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-[#111111] p-1 rounded-xl border border-white/10 text-xs font-sans">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-[#c4a484] text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              8-Domain Matrix
            </button>
            <button
              onClick={() => setViewMode('deepdive')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'deepdive'
                  ? 'bg-[#c4a484] text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Domain Deep-Dive
            </button>
            <button
              onClick={() => setViewMode('comparative')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'comparative'
                  ? 'bg-[#c4a484] text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Comparative Overview
            </button>
          </div>
        </div>

        {/* Subtype Selection Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {SUBTYPE_DETAILS.map((sub) => {
            const count = papers.filter((p) => p.ovarianSubtype === sub.subtype).length;
            const isSelected = selectedSubtype === sub.subtype;

            return (
              <button
                key={sub.subtype}
                onClick={() => {
                  setSelectedSubtype(sub.subtype);
                  setActiveDomainFilter('all');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 relative overflow-hidden ${
                  isSelected
                    ? sub.isPriorityHgsoc
                      ? 'bg-gradient-to-br from-[#c4a484]/20 via-[#1a1a1a] to-[#141414] border-[#c4a484] shadow-[0_0_20px_rgba(196,164,132,0.25)]'
                      : 'bg-white/10 border-white/40 shadow-lg text-white'
                    : 'bg-[#111111] border-white/5 hover:border-white/20 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-[#c4a484] text-slate-950'
                        : 'bg-white/5 text-slate-400'
                    }`}>
                      {sub.subtype}
                    </span>
                    {sub.isPriorityHgsoc && (
                      <span className="text-[9px] text-[#c4a484] font-mono font-bold">★ Core</span>
                    )}
                  </div>
                  <span className={`text-xs font-serif font-bold block truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {sub.shortLabel}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-white/5">
                  <span className="text-slate-400">{sub.prevalence.split(' ')[0]}</span>
                  <span className={`font-bold ${count > 0 ? (isSelected ? 'text-[#c4a484]' : 'text-emerald-400') : 'text-slate-500'}`}>
                    {count} {count === 1 ? 'paper' : 'papers'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SELECTED SUBTYPE PROFILE CARD & ACTIONS */}
      <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#c4a484]/15 border border-[#c4a484]/40 text-[#c4a484]">
                Subtype: {activeSubtypeInfo.subtype}
              </span>
              <span className="text-xs text-slate-400 font-sans">
                Prevalence: <strong className="text-white">{activeSubtypeInfo.prevalence}</strong>
              </span>
              <span className="text-xs text-slate-400 font-sans">
                Cell of Origin: <strong className="text-slate-200">{activeSubtypeInfo.cellOfOrigin}</strong>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif text-white font-bold">
              {activeSubtypeInfo.name}
            </h3>
          </div>

          {/* Subtype Actions: Fetch from PubMed/PMC + Filter in Feed */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onPapersIngested && (
              <button
                onClick={() => handleFetchSpecificSubtype(activeSubtypeInfo)}
                disabled={isFetchingSubtype || isFetchingAllSubtypes}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-[#c4a484]/20 border border-white/10 hover:border-[#c4a484]/40 text-slate-200 hover:text-[#c4a484] text-xs font-sans font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#c4a484] ${isFetchingSubtype ? 'animate-spin' : ''}`} />
                <span>{isFetchingSubtype ? 'Fetching from PubMed...' : `Fetch ${activeSubtypeInfo.shortLabel} Papers`}</span>
              </button>
            )}

            <button
              onClick={() => onSelectSubtype(selectedSubtype)}
              className="px-4 py-2 rounded-xl bg-[#c4a484] hover:opacity-90 text-slate-950 font-bold text-xs font-sans flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>View in Feed ({subtypePapers.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <a
              href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(
                `${activeSubtypeInfo.pubmedTerm} AND (ovarian cancer OR ovarian carcinoma)`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
              title="Search directly in official NCBI PubMed"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Biological Hallmarks & Therapies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
          <div className="bg-[#161616] border border-white/5 rounded-2xl p-4 space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-[#c4a484] font-mono font-bold flex items-center gap-1.5">
              <Dna className="w-3.5 h-3.5 text-[#c4a484]" />
              Hallmark Drivers & Genes:
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {activeSubtypeInfo.hallmarkDrivers.map((driver, i) => (
                <button
                  key={i}
                  onClick={() => onFilterByTopic && onFilterByTopic(driver.split(' ')[0])}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#c4a484]/15 hover:text-[#c4a484] border border-white/5 text-slate-200 font-mono text-[11px] transition-all cursor-pointer"
                >
                  {driver}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#161616] border border-white/5 rounded-2xl p-4 space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-mono font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Standard & Emerging Therapies:
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {activeSubtypeInfo.keyTherapies.map((tx, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px]"
                >
                  {tx}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#161616] border border-white/5 rounded-2xl p-4 space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-mono font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Pathology & Clinical Course:
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {activeSubtypeInfo.clinicalFeatures}
            </p>
          </div>
        </div>
      </div>

      {/* 4. THE 8 RESEARCH DOMAINS SUB-MATRIX (INSIDE THE SELECTED SUBTYPE) */}
      {viewMode === 'matrix' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif text-white font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#c4a484]" />
                <span>8 Research Domains Breakdown for {activeSubtypeInfo.shortLabel}</span>
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Each domain models a dedicated branch of ovarian cancer oncology. Click any domain to expand papers or trigger targeted PubMed/PMC ingestion.
              </p>
            </div>

            <span className="text-xs font-mono text-slate-400">
              Total in this subtype: <strong className="text-white">{subtypePapers.length} papers</strong>
            </span>
          </div>

          {/* Grid of 8 Domains */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {RESEARCH_DOMAINS.map((domain) => {
              const matchedPapers = domainPapersMap[domain.id] || [];
              const count = matchedPapers.length;
              const isFetchingThisDomain = isFetchingDomainSubtype === `${selectedSubtype}_${domain.id}`;
              const isExpanded = expandedDomain === domain.id;

              return (
                <div
                  key={domain.id}
                  className={`bg-[#111111] border rounded-2xl p-5 flex flex-col justify-between transition-all space-y-4 shadow-lg ${
                    isExpanded
                      ? 'border-[#c4a484] bg-gradient-to-b from-white/5 to-[#111111]'
                      : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Domain Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl ${domain.bgColor} ${domain.color} border ${domain.borderColor} flex items-center justify-center`}>
                          {getDomainIcon(domain.iconName)}
                        </div>
                        <div>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${domain.bgColor} ${domain.color} border ${domain.borderColor}`}>
                            {domain.badge}
                          </span>
                        </div>
                      </div>

                      <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                        count > 0
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold'
                          : 'bg-white/5 text-slate-500 border-white/5'
                      }`}>
                        {count} {count === 1 ? 'study' : 'studies'}
                      </span>
                    </div>

                    <h4 className="text-sm font-serif text-white font-bold leading-tight">
                      {domain.name}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed font-sans">
                      {domain.description}
                    </p>

                    {/* Keywords preview */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {domain.keywords.slice(0, 3).map((kw, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions: Expand Papers + Fetch from PubMed/PMC */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 text-xs font-sans">
                    {onPapersIngested && (
                      <button
                        onClick={() => handleFetchSubtypeDomain(domain)}
                        disabled={isFetchingThisDomain || isFetchingAllSubtypes}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-all text-[11px] cursor-pointer disabled:opacity-50"
                        title={`Fetch PubMed & PMC studies for ${activeSubtypeInfo.shortLabel} + ${domain.badge}`}
                      >
                        <RefreshCw className={`w-3 h-3 ${isFetchingThisDomain ? 'animate-spin text-[#c4a484]' : ''}`} />
                        <span>{isFetchingThisDomain ? 'Syncing...' : 'Fetch'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedDomain(isExpanded ? null : domain.id)}
                      disabled={count === 0}
                      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 text-[11px] transition-all cursor-pointer ${
                        count > 0
                          ? isExpanded
                            ? 'bg-[#c4a484] text-slate-950'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                          : 'bg-white/5 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <span>{isExpanded ? 'Collapse' : `View (${count})`}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* EXPANDED PAPERS SECTION FOR THE ACTIVE DOMAIN */}
          {expandedDomain && (
            <div className="bg-[#111111] border border-[#c4a484]/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#c4a484]/20 border border-[#c4a484]/40 flex items-center justify-center text-[#c4a484]">
                    {getDomainIcon(RESEARCH_DOMAINS.find((d) => d.id === expandedDomain)?.iconName || '')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-[#c4a484] font-bold">
                        {activeSubtypeInfo.shortLabel} Subtype
                      </span>
                      <span>•</span>
                      <span className="text-xs font-mono text-emerald-400">
                        {RESEARCH_DOMAINS.find((d) => d.id === expandedDomain)?.name}
                      </span>
                    </div>
                    <h3 className="text-lg font-serif text-white font-bold">
                      Indexed Literature ({domainPapersMap[expandedDomain].length} Papers)
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedDomain(null)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-sans transition-all cursor-pointer self-start sm:self-center"
                >
                  ✕ Close Domain View
                </button>
              </div>

              {/* Papers List */}
              <div className="space-y-4">
                {domainPapersMap[expandedDomain].map((paper) => (
                  <div
                    key={paper.id}
                    className="bg-[#161616] border border-white/5 hover:border-[#c4a484]/40 rounded-2xl p-5 transition-all space-y-3 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#c4a484]/15 text-[#c4a484] font-bold">
                            {paper.ovarianSubtype}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            Score: {paper.scores.finalScore}/100
                          </span>
                          {paper.studyType && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              {paper.studyType}
                            </span>
                          )}
                          {paper.pmcid && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                              PMC Full Text
                            </span>
                          )}
                        </div>

                        <h4
                          onClick={() => onSelectPaper && onSelectPaper(paper)}
                          className="text-sm sm:text-base font-serif text-white group-hover:text-[#c4a484] transition-colors cursor-pointer font-medium leading-snug"
                        >
                          {paper.title}
                        </h4>

                        <p className="text-xs text-slate-400 font-sans">
                          {(paper.authors || []).slice(0, 3).map((a) => a.name || '').filter(Boolean).join(', ')}
                          {(paper.authors?.length ?? 0) > 3 && ' et al.'} • <span className="italic">{paper.journal || ''}</span> ({(paper.publicationDate || '').slice(0, 4)})
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {onToggleSave && (
                          <button
                            onClick={() => onToggleSave(paper.id)}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              paper.isSaved
                                ? 'bg-[#c4a484]/20 border-[#c4a484] text-[#c4a484]'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                            }`}
                            title="Bookmark Paper"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onSelectPaper && (
                          <button
                            onClick={() => onSelectPaper(paper)}
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#c4a484] hover:text-slate-950 text-slate-300 text-xs font-sans font-bold border border-white/10 transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>Details</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Abstract snippet */}
                    <p className="text-xs text-slate-300 font-sans line-clamp-2 leading-relaxed">
                      {paper.abstract}
                    </p>

                    {/* Extracted Entities */}
                    {(paper.entities.genes.length > 0 || paper.entities.drugs.length > 0 || paper.entities.biomarkers.length > 0) && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {paper.entities.genes.map((g, idx) => (
                          <span
                            key={idx}
                            onClick={() => onFilterByTopic && onFilterByTopic(g)}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 hover:bg-[#c4a484]/20 text-[#c4a484] border border-white/5 transition-all cursor-pointer"
                          >
                            🧬 {g}
                          </span>
                        ))}
                        {paper.entities.drugs.map((d, idx) => (
                          <span
                            key={idx}
                            onClick={() => onFilterByTopic && onFilterByTopic(d)}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 transition-all cursor-pointer"
                          >
                            💊 {d}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. DEEP DIVE VIEW */}
      {viewMode === 'deepdive' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Sparkles className="w-5 h-5 text-[#c4a484]" />
            <h3 className="text-base font-serif text-white font-bold">
              Domain Deep-Dive Explorer: {activeSubtypeInfo.name}
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Domain Tabs Sidebar */}
            <div className="lg:col-span-1 space-y-2">
              {RESEARCH_DOMAINS.map((domain) => {
                const count = (domainPapersMap[domain.id] || []).length;
                const isActive = activeDomainFilter === domain.id;

                return (
                  <button
                    key={domain.id}
                    onClick={() => setActiveDomainFilter(domain.id)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isActive
                        ? 'bg-[#c4a484] text-slate-950 font-bold border-[#c4a484] shadow-lg'
                        : 'bg-[#111111] border-white/5 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center flex-shrink-0">
                        {getDomainIcon(domain.iconName)}
                      </div>
                      <span className="text-xs truncate">{domain.badge}</span>
                    </div>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-black/20 text-slate-950 font-bold' : 'bg-white/5 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}

              <button
                onClick={() => setActiveDomainFilter('all')}
                className={`w-full p-3 rounded-2xl border text-center transition-all cursor-pointer text-xs font-sans ${
                  activeDomainFilter === 'all'
                    ? 'bg-white/20 text-white font-bold border-white/30'
                    : 'bg-white/5 text-slate-400 hover:text-white border-white/5'
                }`}
              >
                Show All Domains ({subtypePapers.length})
              </button>
            </div>

            {/* Deep Dive Content */}
            <div className="lg:col-span-3 space-y-4">
              {(activeDomainFilter === 'all'
                ? subtypePapers
                : domainPapersMap[activeDomainFilter as ResearchDomainId] || []
              ).map((paper) => (
                <div
                  key={paper.id}
                  className="bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-[#c4a484]/40 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h4
                        onClick={() => onSelectPaper && onSelectPaper(paper)}
                        className="text-sm font-serif text-white hover:text-[#c4a484] transition-colors cursor-pointer font-medium"
                      >
                        {paper.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-sans">
                        {paper.journal} • {paper.publicationDate.slice(0, 4)} • Score: <strong className="text-emerald-400">{paper.scores.finalScore}</strong>
                      </p>
                    </div>

                    {onSelectPaper && (
                      <button
                        onClick={() => onSelectPaper(paper)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#c4a484] hover:text-slate-950 text-slate-300 text-xs font-sans transition-all cursor-pointer flex-shrink-0"
                      >
                        View
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-sans line-clamp-2 leading-relaxed">
                    {paper.abstract}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. COMPARATIVE OVERVIEW ACROSS ALL 6 SUBTYPES */}
      {viewMode === 'comparative' && (
        <div className="space-y-6">
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 overflow-x-auto shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-[#c4a484]" />
              <h3 className="text-base font-serif text-white font-bold">
                Cross-Subtype Comparative Matrix (All 6 Ovarian Carcinomas)
              </h3>
            </div>

            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-mono text-[11px]">
                  <th className="pb-3 pr-4">Histological Subtype</th>
                  <th className="pb-3 px-4">Prevalence</th>
                  <th className="pb-3 px-4">Cell of Origin</th>
                  <th className="pb-3 px-4">Key Genomic Alterations</th>
                  <th className="pb-3 px-4">Targeted Therapies</th>
                  <th className="pb-3 pl-4">Indexed Papers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {SUBTYPE_DETAILS.map((sub) => {
                  const count = papers.filter((p) => p.ovarianSubtype === sub.subtype).length;

                  return (
                    <tr
                      key={sub.subtype}
                      onClick={() => {
                        setSelectedSubtype(sub.subtype);
                        setViewMode('matrix');
                      }}
                      className="hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                            sub.isPriorityHgsoc ? 'bg-[#c4a484] text-slate-950' : 'bg-white/10 text-white'
                          }`}>
                            {sub.subtype}
                          </span>
                          <span className="font-serif font-bold text-white block">{sub.shortLabel}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-300">{sub.prevalence}</td>
                      <td className="py-4 px-4 text-slate-400">{sub.cellOfOrigin}</td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {sub.hallmarkDrivers.slice(0, 3).map((d, i) => (
                            <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#c4a484]">
                              {d.split(' ')[0]}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {sub.keyTherapies.slice(0, 2).map((t, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 pl-4 font-mono font-bold text-emerald-400">
                        {count} papers
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
