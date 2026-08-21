import { Paper } from '../../types/paper';
import { EntityCategory, EntityTrend, EmergingEntity, TrendAnalysisSummary } from '../../types/entities';

export type { TrendAnalysisSummary };

export function computeEntityTrends(papers: Paper[]): TrendAnalysisSummary {
  const now = new Date().getTime();
  const ONE_DAY = 1000 * 60 * 60 * 24;

  const entityMap = new Map<
    string,
    {
      name: string;
      category: EntityCategory;
      papers: Paper[];
      recentCount: number; // last 7 days
      previousCount: number; // 7-14 days ago
      hgsocCount: number;
      importanceSum: number;
      coOccurringMap: Map<string, { name: string; category: EntityCategory; count: number }>;
      weeklyBuckets: number[];
    }
  >();

  // Process all papers
  (papers || []).forEach((paper) => {
    if (!paper) return;
    const pubTime = new Date(paper.publicationDate || 0).getTime() || 0;
    const daysAgo = Math.max(0, Math.floor((now - pubTime) / ONE_DAY));
    const isRecent = daysAgo <= 7;
    const isPrevious = daysAgo > 7 && daysAgo <= 14;
    const isHgsoc = paper.ovarianSubtype === 'HGSOC';

    const register = (name: string, category: EntityCategory) => {
      if (!name || typeof name !== 'string') return;
      const cleanName = name.trim();
      if (!cleanName || cleanName.length < 2) return;
      const key = `${category}:::${cleanName}`;

      if (!entityMap.has(key)) {
        entityMap.set(key, {
          name: cleanName,
          category,
          papers: [],
          recentCount: 0,
          previousCount: 0,
          hgsocCount: 0,
          importanceSum: 0,
          coOccurringMap: new Map(),
          weeklyBuckets: [0, 0, 0, 0],
        });
      }

      const record = entityMap.get(key)!;
      if (!record.papers.some((p) => p.id === paper.id)) {
        record.papers.push(paper);
        record.importanceSum += paper.scores?.importanceScore ?? 50;
        if (isHgsoc) record.hgsocCount++;
        if (isRecent) record.recentCount++;
        if (isPrevious) record.previousCount++;

        if (daysAgo <= 7) record.weeklyBuckets[3]++;
        else if (daysAgo <= 14) record.weeklyBuckets[2]++;
        else if (daysAgo <= 21) record.weeklyBuckets[1]++;
        else record.weeklyBuckets[0]++;
      }
    };

    const genes = Array.isArray(paper.entities?.genes) ? paper.entities.genes : [];
    const pathways = Array.isArray(paper.entities?.pathways) ? paper.entities.pathways : [];
    const drugs = Array.isArray(paper.entities?.drugs) ? paper.entities.drugs : [];
    const biomarkers = Array.isArray(paper.entities?.biomarkers) ? paper.entities.biomarkers : [];
    const technologies = Array.isArray(paper.entities?.technologies) ? paper.entities.technologies : [];
    const datasets = Array.isArray(paper.entities?.datasets) ? paper.entities.datasets : [];

    genes.forEach((g) => register(g, 'gene'));
    pathways.forEach((p) => register(p, 'pathway'));
    drugs.forEach((d) => register(d, 'drug'));
    biomarkers.forEach((b) => register(b, 'biomarker'));
    technologies.forEach((t) => register(t, 'technology'));
    datasets.forEach((ds) => register(ds, 'dataset'));

    // Pairwise co-occurrences
    const allPaperEntities: { name: string; category: EntityCategory }[] = [
      ...genes.map((g) => ({ name: g, category: 'gene' as EntityCategory })),
      ...pathways.map((p) => ({ name: p, category: 'pathway' as EntityCategory })),
      ...drugs.map((d) => ({ name: d, category: 'drug' as EntityCategory })),
      ...biomarkers.map((b) => ({ name: b, category: 'biomarker' as EntityCategory })),
      ...technologies.map((t) => ({ name: t, category: 'technology' as EntityCategory })),
    ];

    for (let i = 0; i < allPaperEntities.length; i++) {
      for (let j = i + 1; j < allPaperEntities.length; j++) {
        const e1 = allPaperEntities[i];
        const e2 = allPaperEntities[j];
        if (e1.name === e2.name) continue;

        const key1 = `${e1.category}:::${e1.name}`;
        const key2 = `${e2.category}:::${e2.name}`;

        const rec1 = entityMap.get(key1);
        if (rec1) {
          const coKey = `${e2.category}:::${e2.name}`;
          const current = rec1.coOccurringMap.get(coKey) || { name: e2.name, category: e2.category, count: 0 };
          current.count++;
          rec1.coOccurringMap.set(coKey, current);
        }

        const rec2 = entityMap.get(key2);
        if (rec2) {
          const coKey = `${e1.category}:::${e1.name}`;
          const current = rec2.coOccurringMap.get(coKey) || { name: e1.name, category: e1.category, count: 0 };
          current.count++;
          rec2.coOccurringMap.set(coKey, current);
        }
      }
    }
  });

  const allTrends: EntityTrend[] = [];

  entityMap.forEach((val, key) => {
    const total = val.papers.length;
    if (total === 0) return;

    let growthRate = 0;
    if (val.previousCount > 0) {
      growthRate = Math.round(((val.recentCount - val.previousCount) / val.previousCount) * 100);
    } else if (val.recentCount > 0) {
      growthRate = val.recentCount * 100;
    }

    const hgsocRatio = Math.round((val.hgsocCount / total) * 100);
    const avgImportance = Math.round(val.importanceSum / total);

    let badge: string | undefined = undefined;
    if (growthRate >= 100 && total >= 2) badge = 'Accelerating';
    else if (growthRate >= 40) badge = 'Emerging Target';
    else if (avgImportance >= 90) badge = 'Breakthrough';
    else if (val.recentCount >= 2) badge = 'High Attention';

    const sortedPapers = [...val.papers]
      .sort((a, b) => b.scores.finalScore - a.scores.finalScore)
      .slice(0, 4)
      .map((p) => ({
        id: p.id,
        title: p.title,
        journal: p.journal,
        publicationDate: p.publicationDate,
        finalScore: p.scores.finalScore,
        ovarianSubtype: p.ovarianSubtype,
      }));

    const topCoOccurring = Array.from(val.coOccurringMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((c) => ({
        name: c.name,
        category: c.category,
        coCount: c.count,
      }));

    allTrends.push({
      id: key,
      name: val.name,
      category: val.category,
      totalPapers: total,
      recentPapersCount: val.recentCount,
      previousPapersCount: val.previousCount,
      growthRatePercent: growthRate,
      hgsocSpecificityRatio: hgsocRatio,
      averageImportanceScore: avgImportance,
      isEmerging: growthRate >= 30 || val.recentCount >= 2 || total >= 3,
      emergingBadge: badge,
      topAssociatedPapers: sortedPapers,
      coOccurringEntities: topCoOccurring,
      temporalTrend: [
        { period: '4w ago', count: val.weeklyBuckets[0] },
        { period: '3w ago', count: val.weeklyBuckets[1] },
        { period: '2w ago', count: val.weeklyBuckets[2] },
        { period: 'This week', count: val.weeklyBuckets[3] },
      ],
    });
  });

  // Map to EmergingEntity structure
  const toEmergingEntity = (trend: EntityTrend, type: EmergingEntity['type']): EmergingEntity => ({
    name: trend.name,
    type,
    growthRate: trend.growthRatePercent,
    paperCount: trend.totalPapers,
    recentCount: trend.recentPapersCount,
    hgsocRatio: trend.hgsocSpecificityRatio,
    badge: trend.emergingBadge,
    coOccurringWith: trend.coOccurringEntities.map((c) => c.name),
  });

  const sortAndMap = (category: EntityCategory, type: EmergingEntity['type']): EmergingEntity[] =>
    allTrends
      .filter((t) => t.category === category)
      .sort((a, b) => {
        const scoreA = a.totalPapers * 2 + a.recentPapersCount * 5 + a.growthRatePercent * 0.05;
        const scoreB = b.totalPapers * 2 + b.recentPapersCount * 5 + b.growthRatePercent * 0.05;
        return scoreB - scoreA;
      })
      .map((t) => toEmergingEntity(t, type));

  return {
    emergingGenes: sortAndMap('gene', 'genes'),
    emergingPathways: sortAndMap('pathway', 'pathways'),
    emergingDrugs: sortAndMap('drug', 'drugs'),
    emergingBiomarkers: sortAndMap('biomarker', 'biomarkers'),
    emergingTechnologies: sortAndMap('technology', 'technologies'),
    emergingDatasets: sortAndMap('dataset', 'datasets'),
    allTrends,
  };
}
