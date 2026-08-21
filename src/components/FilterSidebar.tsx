import React from 'react';
import { FilterOptions, OvarianSubtype, StudyType } from '../types/paper';
import { RotateCcw, Filter, X, Check, Layers, FlaskConical, Sparkles } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  totalFilteredCount: number;
}

const HGSOC_QUICK_TOPICS = [
  { label: 'AI & Machine Learning', query: 'Machine learning', sub: 'Deep Learning & Pathology AI' },
  { label: 'Multi-omics & Proteomics', query: 'multi-omics', sub: 'Single-Cell & CPTAC' },
  { label: 'Targeted Therapies & HRD', query: 'precision oncology', sub: 'PARPi & Synthetic Lethality' },
  { label: 'Biomarkers & ctDNA', query: 'biomarker', sub: 'Liquid Biopsies & Reversion' },
  { label: 'Antibody-Drug Conjugates', query: 'ADC', sub: 'Mirvetuximab & Payloads' },
  { label: 'Platinum & PARP Resistance', query: 'platinum resistance', sub: 'Efflux & Restoration' },
  { label: 'Spatial Biology & TME', query: 'spatial transcriptomics', sub: 'CAFs & Immunotherapy' },
];

const ALL_SUBTYPES: { label: string; enName: string; value: OvarianSubtype; isPrimary?: boolean }[] = [
  { label: 'High-Grade Serous (HGSOC)', enName: 'Primary Histotype (~70%)', value: 'HGSOC', isPrimary: true },
  { label: 'Clear Cell Carcinoma (OCCC)', enName: 'ARID1A / PIK3CA', value: 'Clear cell' },
  { label: 'Low-Grade Serous (LGSOC)', enName: 'BRAF / KRAS MAPK', value: 'Low-grade serous' },
  { label: 'Endometrioid Carcinoma', enName: 'PTEN / CTNNB1', value: 'Endometrioid' },
  { label: 'Mucinous Carcinoma', enName: 'KRAS / HER2', value: 'Mucinous' },
  { label: 'Borderline Ovarian Tumors', enName: 'Low Malignant Potential', value: 'Borderline' },
  { label: 'Other Epithelial Types', enName: 'Brenner / Mixed', value: 'Other epithelial' },
  { label: 'Non-Epithelial Ovarian', enName: 'Germ Cell / Sex Cord', value: 'Non-epithelial' },
  { label: 'Mixed Subtypes', enName: 'Heterogeneous Histology', value: 'Mixed' },
  { label: 'Unspecified / Pan-Ovarian', enName: 'Broad Cohort', value: 'Unspecified' },
];

const ALL_STUDY_TYPES: { enLabel: string; subLabel: string; value: StudyType; badge: string }[] = [
  {
    enLabel: 'Phase III Clinical Trial',
    subLabel: 'Randomized Pivotal Registrational',
    value: 'Phase III Trial',
    badge: 'Phase 3',
  },
  {
    enLabel: 'Phase II Clinical Trial',
    subLabel: 'Efficacy & Biomarker Correlative',
    value: 'Phase II Trial',
    badge: 'Phase 2',
  },
  {
    enLabel: 'Major Consortium Study',
    subLabel: 'TCGA / CPTAC / ICGC Atlases',
    value: 'Major Consortium (TCGA/CPTAC/ICGC)',
    badge: 'Consortium',
  },
  {
    enLabel: 'Single-Cell & Spatial Omics',
    subLabel: 'scRNA-seq & Spatial Transcriptomics',
    value: 'Single-Cell / Spatial Study',
    badge: 'Single-Cell',
  },
  {
    enLabel: 'Translational & Multi-omics',
    subLabel: 'Mechanistic Biomarker Translation',
    value: 'Translational & Multi-omics',
    badge: 'Multi-omics',
  },
  {
    enLabel: 'Prospective Cohort Study',
    subLabel: 'Longitudinal Clinical Outcome',
    value: 'Prospective Cohort',
    badge: 'Prospective',
  },
  {
    enLabel: 'Retrospective Cohort Study',
    subLabel: 'Real-World Evidence & Registries',
    value: 'Retrospective Cohort',
    badge: 'Retrospective',
  },
  {
    enLabel: 'Experimental Preclinical (PDX/Organoids)',
    subLabel: 'In Vitro / In Vivo Functional Screens',
    value: 'In Vitro / In Vivo Experimental',
    badge: 'Preclinical',
  },
  {
    enLabel: 'Computational & Bioinformatic',
    subLabel: 'Machine Learning & In Silico Models',
    value: 'Computational / Bioinformatic',
    badge: 'Computational',
  },
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  totalFilteredCount,
}) => {
  const toggleSubtype = (st: OvarianSubtype) => {
    const exists = filters.subtypes.includes(st);
    const newSubtypes = exists
      ? filters.subtypes.filter((s) => s !== st)
      : [...filters.subtypes, st];
    onFilterChange({ ...filters, subtypes: newSubtypes });
  };

  const toggleStudyType = (st: StudyType) => {
    const exists = filters.studyTypes.includes(st);
    const newStudyTypes = exists
      ? filters.studyTypes.filter((s) => s !== st)
      : [...filters.studyTypes, st];
    onFilterChange({ ...filters, studyTypes: newStudyTypes });
  };

  const resetAll = () => {
    onFilterChange({
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
  };

  return (
    <aside className="bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col gap-6 max-h-[calc(100vh-140px)] overflow-y-auto" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#c4a484]" />
          <h3 className="text-sm font-serif text-white font-bold">
            Filters & Criteria
          </h3>
        </div>
        <button
          onClick={resetAll}
          className="text-xs text-slate-400 hover:text-[#c4a484] flex items-center gap-1 transition-colors cursor-pointer font-sans"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Selected Entity active tag */}
      {filters.selectedEntity && (
        <div className="bg-[#c4a484]/10 border border-[#c4a484]/30 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-sans">Filtered by Target Entity</p>
            <p className="text-xs font-mono font-bold text-[#c4a484] mt-0.5">
              {filters.selectedEntity.name} ({filters.selectedEntity.type})
            </p>
          </div>
          <button
            onClick={() => onFilterChange({ ...filters, selectedEntity: null })}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Subtypes Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#c4a484]" />
          <label className="text-xs text-slate-200 font-sans font-bold">
            Histological Subtype:
          </label>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-1">
          {ALL_SUBTYPES.map(({ label, enName, value, isPrimary }) => {
            const isSelected = filters.subtypes.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggleSubtype(value)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all cursor-pointer font-sans flex items-center justify-between gap-2 ${
                  isSelected
                    ? isPrimary
                      ? 'bg-[#c4a484] text-slate-950 font-bold border-[#c4a484] shadow-[0_0_12px_rgba(196,164,132,0.3)]'
                      : 'bg-[#c4a484]/20 border-[#c4a484] text-white font-bold'
                    : isPrimary
                    ? 'bg-[#c4a484]/10 border-[#c4a484]/30 text-[#c4a484] hover:bg-[#c4a484]/20'
                    : 'bg-[#161616] border-white/5 text-slate-300 hover:text-white hover:border-white/15'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-medium leading-normal">{label}</span>
                  <span className={`text-[10px] font-mono mt-0.5 ${isSelected && isPrimary ? 'text-slate-900' : 'text-slate-400'}`}>
                    {enName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isPrimary && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${isSelected ? 'bg-black/20 text-slate-950' : 'bg-[#c4a484]/20 text-[#c4a484]'}`}>
                      ★ Priority
                    </span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Topic Filters for HGSOC */}
      <div className="border-t border-white/10 pt-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <label className="text-xs text-white font-sans font-bold">
            High-Yield Research Themes:
          </label>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-1">
          {HGSOC_QUICK_TOPICS.map((topic) => {
            const isMatch = filters.searchQuery.toLowerCase().includes(topic.query.toLowerCase());
            return (
              <button
                key={topic.query}
                onClick={() => {
                  if (isMatch) {
                    onFilterChange({ ...filters, searchQuery: '' });
                  } else {
                    onFilterChange({
                      ...filters,
                      subtypes: ['HGSOC'],
                      searchQuery: topic.query,
                    });
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-xl border transition-all cursor-pointer font-sans flex items-center justify-between gap-2 ${
                  isMatch
                    ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200 font-bold'
                    : 'bg-[#161616] border-white/5 text-slate-300 hover:text-white hover:border-white/15'
                }`}
              >
                <div className="flex flex-col text-left">
                  <span className="text-xs">{topic.label}</span>
                  <span className="text-[10px] font-mono text-slate-400">{topic.sub}</span>
                </div>
                {isMatch && <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Study Type Multi-select */}
      <div className="border-t border-white/10 pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-emerald-400" />
            <label className="text-xs text-white font-sans font-bold">
              Study Methodology & Design:
            </label>
          </div>
          {filters.studyTypes.length > 0 && (
            <span className="text-[10px] font-mono text-[#c4a484] bg-[#c4a484]/10 px-2 py-0.5 rounded-full border border-[#c4a484]/30 font-bold">
              {filters.studyTypes.length} Active
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2.5 pt-1">
          {ALL_STUDY_TYPES.map((st) => {
            const isSelected = filters.studyTypes.includes(st.value);
            return (
              <button
                key={st.value}
                onClick={() => toggleStudyType(st.value)}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer font-sans flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/60 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'bg-[#161616] border-white/5 text-slate-300 hover:text-white hover:bg-[#1c1c1c] hover:border-white/15'
                }`}
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-400 text-black'
                        : 'border-white/20 bg-black/30'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs leading-normal font-medium">{st.enLabel}</span>
                    <span className="text-[10px] font-mono text-slate-400 mt-0.5">{st.subLabel}</span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-lg border whitespace-nowrap flex-shrink-0 ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                      : 'bg-white/5 text-slate-400 border-white/5'
                  }`}
                >
                  {st.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Score Sliders */}
      <div className="flex flex-col gap-4 border-t border-white/10 pt-5">
        <div>
          <div className="flex justify-between items-center text-xs mb-2 font-sans">
            <span className="text-slate-300">Minimum Final Score:</span>
            <span className="font-mono text-[#c4a484] text-xs font-bold">{filters.minFinalScore} / 100</span>
          </div>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={filters.minFinalScore}
            onChange={(e) => onFilterChange({ ...filters, minFinalScore: Number(e.target.value) })}
            className="w-full accent-[#c4a484] bg-white/10 h-2 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs mb-2 font-sans">
            <span className="text-slate-300">Minimum HGSOC Specificity:</span>
            <span className="font-mono text-[#c4a484] text-xs font-bold">{filters.minHgsocScore} / 100</span>
          </div>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={filters.minHgsocScore}
            onChange={(e) => onFilterChange({ ...filters, minHgsocScore: Number(e.target.value) })}
            className="w-full accent-[#c4a484] bg-white/10 h-2 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Quick Toggles */}
      <div className="flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-slate-300">
        <label className="flex items-center gap-3 cursor-pointer select-none bg-[#161616] p-2.5 rounded-xl border border-white/5 hover:border-white/15 transition-all">
          <input
            type="checkbox"
            checked={!!filters.newlyIngestedOnly}
            onChange={(e) => onFilterChange({ ...filters, newlyIngestedOnly: e.target.checked })}
            className="accent-emerald-400 rounded w-4 h-4 cursor-pointer"
          />
          <span className="text-xs font-sans text-emerald-300 font-medium">⚡ Newly Ingested Batch Only</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer select-none bg-[#161616] p-2.5 rounded-xl border border-white/5 hover:border-white/15 transition-all">
          <input
            type="checkbox"
            checked={filters.openAccessOnly}
            onChange={(e) => onFilterChange({ ...filters, openAccessOnly: e.target.checked })}
            className="accent-[#c4a484] rounded w-4 h-4 cursor-pointer"
          />
          <span className="text-xs font-sans">Open Access / PMC Full Text</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer select-none bg-[#161616] p-2.5 rounded-xl border border-white/5 hover:border-white/15 transition-all">
          <input
            type="checkbox"
            checked={filters.aiSummarizedOnly}
            onChange={(e) => onFilterChange({ ...filters, aiSummarizedOnly: e.target.checked })}
            className="accent-[#c4a484] rounded w-4 h-4 cursor-pointer"
          />
          <span className="text-xs font-sans">AI Summarized Only</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer select-none bg-[#161616] p-2.5 rounded-xl border border-white/5 hover:border-white/15 transition-all">
          <input
            type="checkbox"
            checked={filters.savedOnly}
            onChange={(e) => onFilterChange({ ...filters, savedOnly: e.target.checked })}
            className="accent-[#c4a484] rounded w-4 h-4 cursor-pointer"
          />
          <span className="text-xs font-sans">Bookmarked Papers Only</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer select-none bg-[#161616] p-2.5 rounded-xl border border-white/5 hover:border-white/15 transition-all">
          <input
            type="checkbox"
            checked={filters.unreadOnly}
            onChange={(e) => onFilterChange({ ...filters, unreadOnly: e.target.checked })}
            className="accent-[#c4a484] rounded w-4 h-4 cursor-pointer"
          />
          <span className="text-xs font-sans">Unread Papers Only</span>
        </label>
      </div>

      {/* Status footer */}
      <div className="border-t border-white/10 pt-4 flex justify-between items-center text-xs text-slate-300 font-sans">
        <span>Matching Literature:</span>
        <span className="font-mono text-[#c4a484] text-xs font-bold px-2.5 py-1 rounded-lg bg-[#c4a484]/15 border border-[#c4a484]/30">
          {totalFilteredCount} Articles
        </span>
      </div>
    </aside>
  );
};
