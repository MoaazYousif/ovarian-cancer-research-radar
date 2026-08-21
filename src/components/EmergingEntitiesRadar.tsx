import React, { useState } from 'react';
import { TrendAnalysisSummary, EmergingEntity } from '../types/entities';
import { Flame, TrendingUp, Filter } from 'lucide-react';

interface EmergingEntitiesRadarProps {
  trends: TrendAnalysisSummary;
  onSelectEntity: (type: 'genes' | 'drugs' | 'pathways' | 'biomarkers' | 'technologies', name: string) => void;
}

export const EmergingEntitiesRadar: React.FC<EmergingEntitiesRadarProps> = ({
  trends,
  onSelectEntity,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'genes' | 'drugs' | 'pathways' | 'biomarkers' | 'technologies'>('all');

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'Emerging Target':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'Accelerating':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'High Attention':
        return 'bg-[#c4a484]/15 text-[#c4a484] border-[#c4a484]/40';
      case 'Breakthrough':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      default:
        return 'bg-white/5 text-slate-300 border-white/10';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'all':
        return 'All Entities';
      case 'genes':
        return 'Genes & Targets';
      case 'drugs':
        return 'Therapeutics & Drugs';
      case 'pathways':
        return 'Biological Pathways';
      case 'biomarkers':
        return 'Biomarkers';
      case 'technologies':
        return 'Tech & Methods';
      default:
        return cat;
    }
  };

  const allEntities: EmergingEntity[] = [
    ...(selectedCategory === 'all' || selectedCategory === 'genes' ? trends.emergingGenes : []),
    ...(selectedCategory === 'all' || selectedCategory === 'drugs' ? trends.emergingDrugs : []),
    ...(selectedCategory === 'all' || selectedCategory === 'pathways' ? trends.emergingPathways : []),
    ...(selectedCategory === 'all' || selectedCategory === 'biomarkers' ? trends.emergingBiomarkers : []),
    ...(selectedCategory === 'all' || selectedCategory === 'technologies' ? trends.emergingTechnologies : []),
  ].sort((a, b) => b.growthRate - a.growthRate);

  return (
    <div className="space-y-8" dir="ltr">
      {/* Top Banner */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-[#c4a484]" />
            <h2 className="text-xl font-serif text-white font-bold">
              Dynamic Biological Entity & Target Radar
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-sans">
            Automatically extracts biological targets, compounds, and pathways from literature dynamically. Tracks publishing velocity, HGSOC specificity ratio, and co-occurrence networks.
          </p>
        </div>

        {/* Quick Category Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-[#0a0a0a] p-1.5 rounded-xl border border-white/5">
          {(['all', 'genes', 'drugs', 'pathways', 'biomarkers', 'technologies'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer font-sans ${
                selectedCategory === cat
                  ? 'bg-[#c4a484] text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Emerging Entity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allEntities.map((entity) => (
          <div
            key={`${entity.type}-${entity.name}`}
            className="bg-[#111111] border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-[#c4a484]/40 hover:bg-[#141414] transition-all group"
          >
            <div>
              {/* Header: Type and Emerging Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-sans">
                  {getCategoryLabel(entity.type)}
                </span>
                {entity.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-sans font-medium ${getBadgeColor(entity.badge)}`}>
                    {entity.badge}
                  </span>
                )}
              </div>

              {/* Entity Name */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-base font-serif text-white font-bold group-hover:text-[#c4a484] transition-colors">
                  {entity.name}
                </h3>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{entity.growthRate}%
                </span>
              </div>

              {/* Metrics: Papers count & HGSOC ratio */}
              <div className="grid grid-cols-2 gap-2 my-3 text-[11px] bg-white/[0.02] border border-white/5 rounded-xl p-2.5 font-sans">
                <div>
                  <span className="text-[10px] text-slate-400 block">Published Studies</span>
                  <span className="text-slate-200 font-bold">{entity.paperCount} papers</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">HGSOC Specificity</span>
                  <span className="text-[#c4a484] font-bold font-mono">{entity.hgsocRatio}%</span>
                </div>
              </div>

              {/* Sparkline mini activity bars */}
              <div className="space-y-1 my-3 font-sans">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Recent Momentum</span>
                  <span className="text-slate-300 font-mono">{entity.recentCount} recent articles</span>
                </div>
                <div className="flex items-end gap-1 h-6 pt-1">
                  <div
                    className="flex-1 bg-white/10 rounded-sm"
                    style={{ height: `${Math.max(20, Math.min(100, (entity.paperCount - entity.recentCount) * 20))}%` }}
                    title="Previous Period"
                  />
                  <div
                    className="flex-1 bg-[#c4a484] rounded-sm shadow-[0_0_6px_rgba(196,164,132,0.4)]"
                    style={{ height: `${Math.max(40, Math.min(100, entity.recentCount * 35))}%` }}
                    title="Current Period"
                  />
                </div>
              </div>

              {/* Co-occurring network entities */}
              {entity.coOccurringWith.length > 0 && (
                <div className="mt-3">
                  <span className="text-[10px] text-slate-400 block mb-1 font-sans font-medium">
                    Co-occurring Molecular Targets:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {entity.coOccurringWith.slice(0, 3).map((co, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 font-sans">
                        {co}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filter by Entity Action Button */}
            <div className="pt-4 border-t border-white/5 mt-4">
              <button
                onClick={() => {
                  const targetType = (entity.type === 'datasets' ? 'technologies' : entity.type) as 'genes' | 'drugs' | 'pathways' | 'biomarkers' | 'technologies';
                  onSelectEntity(targetType, entity.name);
                }}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-[#c4a484]/15 border border-white/10 hover:border-[#c4a484]/50 text-slate-300 hover:text-[#c4a484] text-xs font-sans font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter for {entity.name}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
