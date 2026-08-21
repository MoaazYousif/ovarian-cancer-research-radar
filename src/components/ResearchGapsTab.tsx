import React from 'react';
import { ResearchGap } from '../types/entities';
import { ShieldAlert, Lightbulb } from 'lucide-react';

interface ResearchGapsTabProps {
  gaps: ResearchGap[];
  onSelectEntity: (type: 'genes' | 'drugs' | 'pathways' | 'biomarkers' | 'technologies', name: string) => void;
}

export const ResearchGapsTab: React.FC<ResearchGapsTabProps> = ({
  gaps,
  onSelectEntity,
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Resistance Mechanism':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'Unvalidated Biomarker':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'Understudied Pathway':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'Subtype Disparity':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      default:
        return 'bg-white/5 text-slate-300 border-white/10';
    }
  };

  return (
    <div className="space-y-8" dir="ltr">
      {/* Banner */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-5 h-5 text-[#c4a484]" />
            <h2 className="text-xl font-serif text-white font-bold">
              Translational Research Gaps & Unmet Clinical Hurdles
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-sans">
            Synthesized and mined from recent literature. Highlights open biological questions, unvalidated predictive biomarkers, and translational challenges requiring dedicated experimental trials.
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 text-center font-sans">
          <span className="text-[11px] text-slate-400 block mb-0.5">Active Gaps Tracked</span>
          <span className="text-xl font-serif font-bold text-[#c4a484]">{gaps.length} Priority Themes</span>
        </div>
      </div>

      {/* Gaps List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gaps.map((gap) => (
          <div
            key={gap.id}
            className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-[#c4a484]/40 transition-all group"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-md border font-sans font-medium ${getCategoryColor(
                    gap.category
                  )}`}
                >
                  {gap.category}
                </span>

                <div className="flex items-center gap-1.5">
                  {gap.affectedSubtypes.map((st) => (
                    <span
                      key={st}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#c4a484] border border-white/5"
                    >
                      {st}
                    </span>
                  ))}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-serif text-white font-bold mb-3 group-hover:text-[#c4a484] transition-colors leading-snug">
                {gap.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed mb-4 font-sans">
                {gap.description}
              </p>

              {/* Current Evidence Summary */}
              <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-3.5 mb-4 text-xs text-slate-300 font-sans">
                <span className="text-xs text-[#c4a484] font-sans font-bold block mb-1">
                  Current Literature & Evidence Landscape:
                </span>
                {gap.evidenceSummary}
              </div>

              {/* Related Entities */}
              <div className="mb-4">
                <span className="text-xs text-slate-400 font-sans font-bold block mb-1.5">
                  Associated Molecular Targets & Compounds:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {gap.relatedEntities.map((ent, i) => (
                    <button
                      key={i}
                      onClick={() => onSelectEntity('genes', ent)}
                      className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-white/5 text-slate-200 hover:bg-[#c4a484]/20 hover:text-[#c4a484] transition-all cursor-pointer"
                    >
                      {ent}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Action */}
            <div className="pt-4 border-t border-white/5 mt-2 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-xl p-3 border border-emerald-500/10">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-emerald-400 font-sans block">
                    Proposed Research Action & Hypothesis:
                  </span>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed font-sans">
                    {gap.recommendedAction}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
