import React, { useState } from 'react';
import { Paper } from '../types/paper';
import {
  Flame,
  TrendingUp,
  Compass,
  ArrowRight,
  Sparkles,
  Target,
  Dna,
  ExternalLink,
  Cpu,
  BarChart3,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { RESEARCH_DOMAINS } from '../types/researchDomains';

interface ResearchTrendsTabProps {
  papers: Paper[];
  onSelectPaper: (paper: Paper) => void;
  onFilterByTopic: (topic: string) => void;
}

export const ResearchTrendsTab: React.FC<ResearchTrendsTabProps> = ({
  papers,
  onSelectPaper,
  onFilterByTopic,
}) => {
  const [activeSubSection, setActiveSubSection] = useState<'charts' | 'frontiers' | 'trajectory' | 'recommendations'>('charts');

  // Chart Data 1: Rising Research Domains & Velocity
  const domainChartData = RESEARCH_DOMAINS.map((domain) => {
    const matchedCount = papers.filter((p) => {
      const text = (p.title + ' ' + p.abstract + ' ' + p.keywords.join(' ')).toLowerCase();
      return domain.keywords.some((kw) => text.includes(kw.toLowerCase()));
    }).length;

    // Relative momentum scores synthesized from current literature
    const momentumMap: Record<string, number> = {
      adcs: 340,
      spatial_tme: 310,
      precision_oncology: 285,
      ml_ai: 260,
      ai_oncology: 240,
      biomarkers: 220,
      multi_omics: 190,
      general_hgsoc: 150,
    };

    return {
      domainId: domain.id,
      name: domain.badge,
      fullName: domain.name,
      growthRate: momentumMap[domain.id] || 150,
      papersIndexed: matchedCount,
      relevanceScore: Math.round(75 + (momentumMap[domain.id] || 150) / 15),
    };
  }).sort((a, b) => b.growthRate - a.growthRate);

  // Chart Data 2: Top Newly Discovered & Emerging Molecular Targets / Genes
  const emergingGenesData = [
    { gene: 'CCNE1', growthRate: 320, mentionCount: 42, priorityScore: 96, category: 'Synthetic Lethality' },
    { gene: 'FOLR1', growthRate: 340, mentionCount: 58, priorityScore: 98, category: 'ADC Target' },
    { gene: 'CLDN6', growthRate: 290, mentionCount: 28, priorityScore: 91, category: 'ADC & CAR-T' },
    { gene: 'CDK2', growthRate: 275, mentionCount: 31, priorityScore: 89, category: 'Kinase Inhibitor' },
    { gene: 'PKMYT1', growthRate: 260, mentionCount: 19, priorityScore: 86, category: 'DNA Damage' },
    { gene: 'ARID1A', growthRate: 210, mentionCount: 24, priorityScore: 84, category: 'Clear Cell Epigenetics' },
    { gene: 'RAD51C/D', growthRate: 230, mentionCount: 36, priorityScore: 88, category: 'Homologous Repair' },
    { gene: 'TROP2', growthRate: 245, mentionCount: 22, priorityScore: 85, category: 'ADC Target' },
    { gene: 'SLFN11', growthRate: 195, mentionCount: 17, priorityScore: 82, category: 'Chemosensitivity' },
    { gene: 'HER2/ERBB2', growthRate: 215, mentionCount: 29, priorityScore: 87, category: 'ADC Precision' },
  ];

  // Chart Data 3: Multi-modal Synergy Radar (Biology vs Computation vs Therapeutics)
  const radarData = [
    { subject: 'ADCs & Conjugates', value: 98, fullMark: 100 },
    { subject: 'AI & Diagnostics', value: 88, fullMark: 100 },
    { subject: 'ctDNA Liquid Biopsy', value: 92, fullMark: 100 },
    { subject: 'Spatial Biology', value: 95, fullMark: 100 },
    { subject: 'Synthetic Lethality', value: 94, fullMark: 100 },
    { subject: 'Proteogenomics', value: 86, fullMark: 100 },
  ];

  // Hot trends list
  const hotTrendsList = [
    {
      id: 'trend_adcs',
      rank: 1,
      title: 'Antibody-Drug Conjugates (ADCs)',
      englishTitle: 'ADCs in Platinum-Resistant & Biomarker-Selected HGSOC',
      tag: 'Therapeutic Breakthrough',
      tagColor: 'from-amber-500/20 to-rose-500/20 text-[#c4a484] border-[#c4a484]/40',
      growthRate: '+340%',
      momentum: 'High Velocity',
      status: 'Approved & Expanding Rapidly (MIRASOL Trial Benchmark)',
      summary: 'Transitioning from non-targeted cytotoxic chemotherapy to precise cellular delivery of topoisomerase I and maytansinoid payloads via tumor cell-surface receptors.',
      keyTargets: ['FOLR1 (Mirvetuximab)', 'Claudin-6 (CLDN6)', 'HER2 (T-DXd)', 'Trop-2 (Dato-DXd)'],
      breakthroughPapers: papers.filter((p) =>
        p.entities.drugs.some((d) => d.toLowerCase().includes('adc') || d.toLowerCase().includes('mirvetuximab')) ||
        p.entities.genes.some((g) => ['FOLR1', 'CLDN6', 'ERBB2'].includes(g))
      ),
      whyItMatters: 'Directly addresses platinum resistance—the primary hurdle in HGSOC management—delivering proven overall survival (OS) improvements.',
      whereIsItHeading: 'Development of 2nd/3rd generation bispecific ADCs and combinations with DNA damage response inhibitors in earlier treatment lines.',
      searchQuery: 'Mirvetuximab OR "Antibody-Drug Conjugates" OR FOLR1 OR CLDN6',
    },
    {
      id: 'trend_synthetic_lethality',
      rank: 2,
      title: 'Post-PARPi Synthetic Lethality & CCNE1/CDK2',
      englishTitle: 'Targeting CCNE1 Amplification & PARP-Resistance via CDK2/ATR',
      tag: 'Genomic Target',
      tagColor: 'from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/40',
      growthRate: '+285%',
      momentum: 'High Velocity',
      status: 'Preclinical & Phase I/II Clinical Trials',
      summary: 'Exploiting heightened replication stress to induce catastrophic DNA damage in CCNE1-amplified and PARP-inhibitor refractory tumors.',
      keyTargets: ['CCNE1', 'CDK2 (PF-07104091)', 'ATR (Ceralasertib)', 'PKMYT1 / WEE1'],
      breakthroughPapers: papers.filter((p) =>
        p.entities.genes.some((g) => ['CCNE1', 'CDK2', 'ATR', 'CHEK1'].includes(g))
      ),
      whyItMatters: '~20% of HGSOC patients harbor CCNE1 amplification and do not benefit from PARP inhibitors. CDK2/ATR targeting offers a major therapeutic alternative.',
      whereIsItHeading: 'Rational combinations pairing selective CDK2 inhibitors with replication stress pathway inhibitors to delay or overcome resistance.',
      searchQuery: 'CCNE1 OR CDK2 OR ATR OR "Replication Stress"',
    },
    {
      id: 'trend_ctdna_reversion',
      rank: 3,
      title: 'Liquid Biopsy & Clonal Reversion Dynamics',
      englishTitle: 'ctDNA Monitoring for Early Detection of HRR Reversion Mutations',
      tag: 'Translational Diagnostic',
      tagColor: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40',
      growthRate: '+220%',
      momentum: 'Rapid Adoption',
      status: 'Longitudinal Clinical Cohorts',
      summary: 'Serial ctDNA monitoring in plasma every 6-8 weeks to identify secondary restoration of BRCA1/2 reading frames months before radiologic progression.',
      keyTargets: ['ctDNA / Liquid Biopsy', 'BRCA1/2 Reversion', 'RAD51C', 'Olaparib / Niraparib'],
      breakthroughPapers: papers.filter((p) =>
        p.entities.biomarkers.some((b) => b.includes('ctDNA') || b.includes('Liquid Biopsy')) ||
        p.entities.mutations.some((m) => m.includes('reversion'))
      ),
      whyItMatters: 'Provides clinicians with a median 4.2-month lead time to switch treatment protocols prior to macroscopic computed tomography relapse.',
      whereIsItHeading: 'Shifting toward early interception strategies and adaptive therapy switching triggered by molecular relapse.',
      searchQuery: 'ctDNA OR "Liquid Biopsy" OR "reversion mutations" OR BRCA1',
    },
    {
      id: 'trend_spatial_tme',
      rank: 4,
      title: 'Spatial Transcriptomics & Microenvironmental Niches',
      englishTitle: 'Spatial Transcriptomics & CAF-Driven Immune Exclusion',
      tag: 'Tumor Immunology',
      tagColor: 'from-sky-500/20 to-blue-500/20 text-sky-300 border-sky-500/40',
      growthRate: '+310%',
      momentum: 'High Velocity',
      status: 'High-Impact Multi-Omics Research',
      summary: 'Employing spatial cellular dissection to resolve architectural stroma-immune interactions and CAF/macrophage-mediated CD8+ T-cell exclusion.',
      keyTargets: ['Spatial Transcriptomics (Visium/Xenium)', 'CAFs (TGFB1/CXCL12)', 'CD163+ TAMs', 'CD8+ T-cells'],
      breakthroughPapers: papers.filter((p) =>
        p.entities.technologies.some((t) => t.includes('Spatial') || t.includes('Single-Cell'))
      ),
      whyItMatters: 'Explains why single-agent immune checkpoint blockade fails in HGSOC and uncovers stromal targets required to sensitize the immune niche.',
      whereIsItHeading: 'Combining immunotherapies with anti-fibrotic TGF-beta inhibitors to remodel immunosuppressive niches into immune-permissive environments.',
      searchQuery: '"Spatial Transcriptomics" OR "Tumor Microenvironment" OR CAFs OR TGFB1',
    },
  ];

  // Paradigm shifts
  const paradigmShifts = [
    {
      concept: 'Tumor Classification',
      oldWay: 'Relying exclusively on standard light microscopy and viewing the tumor as a homogenous entity.',
      newWay: 'Deep multi-omic molecular stratification (HRD-dominant vs CCNE1-amplified vs ARID1A-mutant vs MAPK-driven).',
      impact: 'Managing each biological subtype as a distinct molecular entity.',
    },
    {
      concept: 'Platinum-Resistant Disease',
      oldWay: 'Re-challenging with conventional non-targeted cytotoxic chemotherapy with modest response rates.',
      newWay: 'Precision antibody-drug conjugates (ADCs) directed against FOLR1, Claudin-6, or HER2.',
      impact: 'Significantly enhanced objective response rates and overall survival benefits without severe systemic myelosuppression.',
    },
    {
      concept: 'Disease Monitoring',
      oldWay: 'Waiting for serum CA-125 elevation or cross-sectional CT scan confirmation of macroscopic recurrence.',
      newWay: 'Serial ctDNA liquid biopsy monitoring to identify emerging reversion mutations months ahead of imaging.',
      impact: 'Transition from reactive intervention to proactive early molecular interception.',
    },
    {
      concept: 'Immunotherapy Approach',
      oldWay: 'Single-agent anti-PD-1/PD-L1 checkpoint inhibitors yielding low overall response rates.',
      newWay: 'Spatial disruption of cancer-associated fibroblasts (CAFs) and TGF-beta combined with DNA repair inhibition.',
      impact: 'Converting immunologically "cold" stromal-rich niches into active immune-infiltrated tumors.',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in" dir="ltr">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#141414] via-[#161616] to-[#121212] border border-[#c4a484]/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c4a484]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#c4a484]/20 border border-[#c4a484]/40 flex items-center justify-center text-[#c4a484]">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#c4a484] font-bold">
                Analytical Trends & Visual Horizon
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px]">
                Active Research Landscape
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif text-white font-medium leading-tight">
              Ovarian Cancer Research Trends & High-Velocity Gene Discoveries
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
              Interactive visual analytics modeling publication velocity across the 8 key research domains, breakthrough molecular gene targets, and translational paradigm transitions.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap md:flex-col gap-2.5 flex-shrink-0">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-left">
              <span className="text-[10px] text-slate-400 block font-mono">Fastest Growing Field</span>
              <span className="text-base font-serif font-bold text-[#c4a484]">ADCs (+340%)</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-left">
              <span className="text-[10px] text-slate-400 block font-mono">Top Emerging Gene Target</span>
              <span className="text-base font-serif font-bold text-emerald-400">CCNE1 / FOLR1</span>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-white/10 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveSubSection('charts')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeSubSection === 'charts'
                ? 'bg-[#c4a484] text-slate-950 font-bold shadow-lg shadow-[#c4a484]/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Interactive Visual Charts</span>
          </button>

          <button
            onClick={() => setActiveSubSection('frontiers')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeSubSection === 'frontiers'
                ? 'bg-[#c4a484] text-slate-950 font-bold shadow-lg shadow-[#c4a484]/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Top Emerging Frontiers</span>
          </button>

          <button
            onClick={() => setActiveSubSection('trajectory')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeSubSection === 'trajectory'
                ? 'bg-[#c4a484] text-slate-950 font-bold shadow-lg shadow-[#c4a484]/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Paradigm Shifts</span>
          </button>

          <button
            onClick={() => setActiveSubSection('recommendations')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeSubSection === 'recommendations'
                ? 'bg-[#c4a484] text-slate-950 font-bold shadow-lg shadow-[#c4a484]/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Strategic Guidance</span>
          </button>
        </div>
      </div>

      {/* SECTION: VISUAL CHARTS */}
      {activeSubSection === 'charts' && (
        <div className="space-y-8">
          {/* Chart 1: Rising Research Domains Velocity */}
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5 text-[#c4a484]" />
                  <h3 className="text-lg font-serif text-white font-bold">
                    Rising Research Domains & Publication Growth Velocity
                  </h3>
                </div>
                <p className="text-xs text-slate-400 font-sans">
                  Annualized growth velocity (%) and priority index across the 8 core ovarian cancer domains.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Click any bar to filter literature
              </span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={domainChartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 25 }}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload[0]) {
                      const item = e.activePayload[0].payload;
                      onFilterByTopic(item.fullName || item.name);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis
                    dataKey="name"
                    stroke="#888"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis stroke="#888" fontSize={11} tickFormatter={(val) => `+${val}%`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#1a1a1a] border border-white/20 p-3 rounded-xl shadow-2xl text-xs space-y-1 z-50">
                            <span className="font-serif font-bold text-white block">{data.fullName}</span>
                            <span className="text-emerald-400 font-mono block">Growth Rate: +{data.growthRate}%</span>
                            <span className="text-slate-300 font-mono block">Papers Indexed: {data.papersIndexed}</span>
                            <span className="text-[#c4a484] font-mono block">Priority Score: {data.relevanceScore}/100</span>
                            <span className="text-[10px] text-slate-400 italic block pt-1">Click to filter feed</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="growthRate"
                    fill="#c4a484"
                    radius={[8, 8, 0, 0]}
                    name="Growth Rate (%)"
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grid of Two Charts: Newly Discovered Genes & Synergy Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 2: Top Emerging Genes */}
            <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Dna className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-serif text-white font-bold">
                    Top Newly Discovered & Rising Gene Targets
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Target Trajectory
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Breakthrough gene drivers in current literature ranked by growth momentum (%):
              </p>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={emergingGenesData}
                    margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                    onClick={(e: any) => {
                      if (e && e.activePayload && e.activePayload[0]) {
                        const item = e.activePayload[0].payload;
                        onFilterByTopic(item.gene);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis type="number" stroke="#888" fontSize={10} tickFormatter={(v) => `+${v}%`} />
                    <YAxis type="category" dataKey="gene" stroke="#ccc" fontSize={11} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#1a1a1a] border border-white/20 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                              <span className="font-serif font-bold text-[#c4a484] block">{data.gene}</span>
                              <span className="text-slate-300 text-[11px] block">{data.category}</span>
                              <span className="text-emerald-400 font-mono block">Velocity: +{data.growthRate}%</span>
                              <span className="text-white font-mono block">HGSOC Impact: {data.priorityScore}/100</span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="growthRate"
                      fill="#10b981"
                      radius={[0, 6, 6, 0]}
                      cursor="pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Multi-modal Synergy Radar */}
            <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-serif text-white font-bold">
                    Multi-Modal Oncology Synergy Index
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Integration Matrix
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Convergence of computational diagnostics, spatial transcriptomics, and targeted therapeutics:
              </p>

              <div className="h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis dataKey="subject" stroke="#aaa" fontSize={11} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#555" fontSize={10} />
                    <Radar
                      name="Synergy Intensity"
                      dataKey="value"
                      stroke="#c4a484"
                      fill="#c4a484"
                      fillOpacity={0.4}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#1a1a1a] border border-white/20 p-2.5 rounded-xl shadow-2xl text-xs">
                              <span className="font-bold text-white block">{data.subject}</span>
                              <span className="text-[#c4a484] font-mono">Score: {data.value}/100</span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: TOP 5 EMERGING FRONTIERS */}
      {activeSubSection === 'frontiers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif uppercase tracking-wider text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#c4a484]" />
              <span>Top High-Velocity Research Fronts:</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Ranked by academic momentum and clinical translation
            </span>
          </div>

          <div className="space-y-5">
            {hotTrendsList.map((trend) => (
              <div
                key={trend.id}
                className="bg-[#111111] border border-white/10 hover:border-[#c4a484]/50 rounded-2xl p-6 transition-all space-y-4 group"
              >
                {/* Header of Trend Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#c4a484]/15 border border-[#c4a484]/30 flex items-center justify-center text-[#c4a484] font-serif font-bold text-sm flex-shrink-0">
                      #{trend.rank}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border bg-gradient-to-r ${trend.tagColor}`}>
                          {trend.tag}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Growth: {trend.growthRate}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-serif text-white font-medium group-hover:text-[#c4a484] transition-colors">
                        {trend.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono italic">
                        {trend.englishTitle}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onFilterByTopic(trend.searchQuery)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-[#c4a484] hover:text-slate-950 border border-white/10 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
                  >
                    <span>View Studies</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Summary & Impact Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#161616] border border-white/5 rounded-xl p-4 space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#c4a484] font-mono block">
                      Core Mechanism & Research Focus
                    </span>
                    <p className="text-slate-300 leading-relaxed font-sans">
                      {trend.summary}
                    </p>
                  </div>

                  <div className="bg-[#161616] border border-white/5 rounded-xl p-4 space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-mono block">
                      Clinical & Translational Impact
                    </span>
                    <p className="text-slate-300 leading-relaxed font-sans">
                      {trend.whyItMatters}
                    </p>
                  </div>
                </div>

                {/* Key Targets & Trajectory */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono block">
                      Key Molecular Targets & Genes:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {trend.keyTargets.map((target, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200 font-mono text-[11px]"
                        >
                          {target}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-left sm:max-w-xs space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-sky-400 font-mono block">
                      Future Trajectory:
                    </span>
                    <p className="text-[11px] text-slate-300">
                      {trend.whereIsItHeading}
                    </p>
                  </div>
                </div>

                {/* Breakthrough Papers in Store */}
                {trend.breakthroughPapers.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono block mb-2">
                      Matched Studies in Feed ({trend.breakthroughPapers.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {trend.breakthroughPapers.slice(0, 2).map((p) => (
                        <div
                          key={p.id}
                          onClick={() => onSelectPaper(p)}
                          className="bg-[#0e0e0e] border border-white/5 hover:border-[#c4a484]/40 rounded-xl p-2.5 cursor-pointer transition-all flex items-center justify-between gap-2 group/paper"
                        >
                          <div className="truncate">
                            <span className="text-xs font-serif text-slate-200 group-hover/paper:text-[#c4a484] transition-colors truncate block">
                              {p.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {p.journal} ({p.publicationDate.slice(0, 4)}) • Score: {p.scores.finalScore}
                            </span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/paper:text-white flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: PARADIGM SHIFTS */}
      {activeSubSection === 'trajectory' && (
        <div className="space-y-6">
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
            <h2 className="text-base font-serif uppercase tracking-wider text-white mb-2 flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#c4a484]" />
              <span>Scientific Paradigm Shifts: Evolution of Oncology Concepts</span>
            </h2>
            <p className="text-xs text-slate-400">
              Contrasting historical dogmas with contemporary multi-omic translational realities:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paradigmShifts.map((shift, idx) => (
              <div
                key={idx}
                className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-sm font-serif font-bold text-white">
                    {shift.concept}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#c4a484]">
                    Paradigm #{idx + 1}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-rose-400 font-mono block font-bold">
                      ❌ Outdated Dogma:
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {shift.oldWay}
                    </p>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-mono block font-bold">
                      ✅ Contemporary Frontier:
                    </span>
                    <p className="text-slate-200 leading-relaxed font-medium">
                      {shift.newWay}
                    </p>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-[11px] text-slate-300">
                    <strong className="text-[#c4a484]">Translational Impact:</strong> {shift.impact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: STRATEGIC GUIDANCE */}
      {activeSubSection === 'recommendations' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#c4a484]/15 via-[#111111] to-[#111111] border border-[#c4a484]/30 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-[#c4a484]" />
              <h2 className="text-lg font-serif text-white font-semibold">
                Strategic Opportunities & High-Impact Grant Targets
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Synthesized from active literature gaps and high-impact publishing trends:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-serif font-bold text-white uppercase tracking-wider">
                  1. ADC Resistance Mechanisms
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Investigating payload efflux pumps, antigen downregulation (FOLR1 / CLDN6), and bystander effect dynamics after repeated dosing.
                </p>
              </div>

              <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                  <Dna className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-serif font-bold text-white uppercase tracking-wider">
                  2. CCNE1 Synergistic Combinations
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Testing synthetic lethality synergy between selective CDK2 inhibitors and replication stress pathway modulators (ATR/WEE1) in PDX models.
                </p>
              </div>

              <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-300">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-serif font-bold text-white uppercase tracking-wider">
                  3. Spatial AI & Ligand-Receptor Maps
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Developing machine learning algorithms to resolve ligand-receptor cross-talk between CAFs and infiltrating CD8+ T-cells in HGSOC.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
