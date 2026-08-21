import React from 'react';
import { Paper } from '../types/paper';
import { Clock, Dna, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface ResearchTimelineProps {
  papers: Paper[];
  onSelectPaper: (paper: Paper) => void;
  onFilterByKeyword: (keyword: string) => void;
}

interface TimelineMilestone {
  year: string;
  era: string;
  theme: string;
  description: string;
  keyDrivers: string[];
  keyTherapies: string[];
  badgeStatus: 'Established' | 'Evolving' | 'Active Paradigm' | 'Current Frontier';
}

const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    year: '2024',
    era: 'Genomic Stratification Era',
    theme: 'BRCA1/2 Mutations & Homologous Recombination Deficiency (HRD)',
    description: 'Universal somatic/germline BRCA testing and genomic instability scar scoring. Institutionalized first-line PARP inhibitor maintenance across High-Grade Serous Ovarian Carcinomas.',
    keyDrivers: ['BRCA1', 'BRCA2', 'RAD51C', 'RAD51D', 'HRD Score >42'],
    keyTherapies: ['Olaparib', 'Niraparib', 'Rucaparib', 'Bevacizumab + PARPi'],
    badgeStatus: 'Established',
  },
  {
    year: '2025',
    era: 'Adaptive Resistance Era',
    theme: 'PARPi Resistance Mechanisms & Epigenetic Rewiring',
    description: 'Elucidation of secondary reversion mutations restoring open reading frames, replication fork stabilization (53BP1/RIF1/REV7 loss), upregulation of drug efflux pumps, and ctDNA monitoring.',
    keyDrivers: ['Secondary Reversions', '53BP1 Loss', 'REV7', 'ABCB1 / MDR1', 'ctDNA Tracking'],
    keyTherapies: ['ATR Inhibitors', 'WEE1 Inhibitors / Adavosertib', 'CHK1 Inhibitors', 'EZH2 Inhibitors'],
    badgeStatus: 'Evolving',
  },
  {
    year: '2026',
    era: 'Targeted Payloads Era',
    theme: 'Antibody-Drug Conjugates (ADCs) & Spatial Microenvironment',
    description: 'Regulatory approvals and rapid clinical adoption of ADCs delivering topoisomerase I and maytansinoid payloads. High-resolution spatial transcriptomics resolving cancer-associated fibroblast (CAF) barriers.',
    keyDrivers: ['FOLR1 (Folate Receptor Alpha)', 'Claudin-6 (CLDN6)', 'HER2 / ERBB2', 'Trop-2', 'Spatial CAFs'],
    keyTherapies: ['Mirvetuximab soravtansine', 'Trastuzumab deruxtecan (T-DXd)', 'CLDN6-ADCs', 'Toripalimab combinations'],
    badgeStatus: 'Active Paradigm',
  },
  {
    year: 'Present',
    era: 'Multi-Omics Precision Era',
    theme: 'CCNE1 Synthetic Lethality, Single-Cell Dynamics & Advanced ctDNA',
    description: 'Targeting non-HRD HGSOC (~20% CCNE1 amplification) via selective CDK2, PKMYT1, and ATR synthetic lethality. Serial ctDNA methylation analysis for microscopic minimal residual disease (MRD).',
    keyDrivers: ['CCNE1 Amplification', 'CDK2 Dependency', 'PKMYT1 (Lunresertib)', 'ctDNA MRD', 'Spatial Single-Cell'],
    keyTherapies: ['Selective CDK2 Inhibitors', 'Lunresertib + Camonsertib', 'Personalized Neoantigen Vaccines', 'Bispecific T-cell Engagers (BiTEs)'],
    badgeStatus: 'Current Frontier',
  },
];

// Timeline Area Chart Data: Paradigm Volume Trajectory
const TIMELINE_CHART_DATA = [
  { era: '2024 (HRD Stratification)', hrdVolume: 92, adcVolume: 18, syntheticVolume: 12, spatialVolume: 15 },
  { era: '2025 (PARPi Resistance)', hrdVolume: 80, adcVolume: 45, syntheticVolume: 38, spatialVolume: 42 },
  { era: '2026 (Targeted Payloads)', hrdVolume: 65, adcVolume: 95, syntheticVolume: 74, spatialVolume: 88 },
  { era: 'Present (Multi-Omics)', hrdVolume: 55, adcVolume: 98, syntheticVolume: 96, spatialVolume: 95 },
];

export const ResearchTimeline: React.FC<ResearchTimelineProps> = ({
  onFilterByKeyword,
}) => {
  const getBadgeStyle = (status: TimelineMilestone['badgeStatus']) => {
    switch (status) {
      case 'Current Frontier':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]';
      case 'Active Paradigm':
        return 'bg-[#c4a484]/15 text-[#c4a484] border-[#c4a484]/40';
      case 'Evolving':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'Established':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-8" dir="ltr">
      {/* Top Banner */}
      <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-[#c4a484]" />
            <h2 className="text-xl sm:text-2xl font-serif text-white font-bold">
              Translational Research Evolution & Paradigm Trajectory
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-sans">
            Trace how biological paradigms in ovarian cancer have shifted from initial HRD testing to targeted ADCs, spatial microenvironment dissection, and CCNE1 synthetic lethality.
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 text-center font-sans">
          <span className="text-[11px] text-slate-400 block mb-0.5">Active Horizons</span>
          <span className="text-lg font-serif font-bold text-[#c4a484]">4 Evolutionary Eras</span>
        </div>
      </div>

      {/* Visual Chart: Paradigm Volume Evolution */}
      <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#c4a484]" />
            <h3 className="text-base font-serif text-white font-bold">
              Translational Paradigm Shift & Discovery Trajectory (2024 - Present)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Relative Research Density</span>
        </div>
        <p className="text-xs text-slate-400">
          Visualizing the transition from standard genomic maintenance to targeted ADCs, spatial biology, and synthetic lethality:
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TIMELINE_CHART_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAdc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorSynthetic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c4a484" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#c4a484" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorSpatial" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="era" stroke="#888" fontSize={11} />
              <YAxis stroke="#888" fontSize={11} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#1a1a1a] border border-white/20 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                        <span className="font-bold text-white block">{label}</span>
                        <span className="text-rose-400 font-mono block">ADCs Intensity: {payload[0]?.value}</span>
                        <span className="text-[#c4a484] font-mono block">Synthetic Lethality: {payload[1]?.value}</span>
                        <span className="text-teal-400 font-mono block">Spatial Microenvironment: {payload[2]?.value}</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="adcVolume" stroke="#f43f5e" fillOpacity={1} fill="url(#colorAdc)" name="ADCs & Payloads" />
              <Area type="monotone" dataKey="syntheticVolume" stroke="#c4a484" fillOpacity={1} fill="url(#colorSynthetic)" name="Synthetic Lethality" />
              <Area type="monotone" dataKey="spatialVolume" stroke="#14b8a6" fillOpacity={1} fill="url(#colorSpatial)" name="Spatial TME" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline Node Flow */}
      <div className="relative border-l-2 border-white/10 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-10">
        {TIMELINE_MILESTONES.map((milestone) => (
          <div key={milestone.year} className="relative group">
            {/* Timeline Dot Indicator */}
            <div
              className={`absolute -left-[31px] sm:-left-[47px] top-1.5 w-6 h-6 rounded-full border-2 bg-[#0e0e0e] flex items-center justify-center transition-all ${
                milestone.badgeStatus === 'Current Frontier'
                  ? 'border-[#c4a484] shadow-[0_0_15px_rgba(196,164,132,0.6)]'
                  : 'border-white/20 group-hover:border-[#c4a484]'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  milestone.badgeStatus === 'Current Frontier' ? 'bg-[#c4a484] animate-ping' : 'bg-slate-400'
                }`}
              />
            </div>

            {/* Milestone Card */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-[#c4a484]/40 transition-all space-y-4 font-sans">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-serif font-bold text-white tracking-tight">
                    {milestone.year}
                  </span>
                  <span className="text-xs font-sans text-slate-400 font-bold">
                    {milestone.era}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-sans px-2.5 py-1 rounded-md border font-medium ${getBadgeStyle(
                    milestone.badgeStatus
                  )}`}
                >
                  {milestone.badgeStatus}
                </span>
              </div>

              {/* Theme Title */}
              <h3 className="text-base font-serif text-[#c4a484] font-bold">
                {milestone.theme}
              </h3>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {milestone.description}
              </p>

              {/* Biomarkers & Drivers */}
              <div>
                <span className="text-xs text-[#c4a484] font-bold font-sans block mb-1.5 flex items-center gap-1">
                  <Dna className="w-3.5 h-3.5 text-[#c4a484]" />
                  Biological Biomarkers & Molecular Drivers:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {milestone.keyDrivers.map((driver, i) => (
                    <button
                      key={i}
                      onClick={() => onFilterByKeyword(driver)}
                      className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-white/5 hover:bg-[#c4a484]/15 hover:text-[#c4a484] text-slate-300 border border-white/5 transition-all cursor-pointer"
                    >
                      {driver}
                    </button>
                  ))}
                </div>
              </div>

              {/* Therapeutics */}
              <div>
                <span className="text-xs text-emerald-400 font-bold font-sans block mb-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Key Therapeutic Classes & Regimens:
                </span>
                <div className="flex flex-wrap gap-1.5 font-sans">
                  {milestone.keyTherapies.map((tx, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    >
                      {tx}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
