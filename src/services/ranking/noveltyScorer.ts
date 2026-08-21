export interface NoveltyScoreResult {
  noveltyScore: number; // 0 - 100
  noveltyReason: string;
}

export function computeNoveltyScore(
  title: string,
  abstract: string,
  publicationDate: string
): NoveltyScoreResult {
  const text = `${title} ${abstract}`.toLowerCase();

  // 1. Recency component (0-40 points)
  let recencyPoints = 20;
  try {
    const pubTime = new Date(publicationDate).getTime();
    const nowTime = new Date().getTime();
    const diffDays = Math.max(0, (nowTime - pubTime) / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) recencyPoints = 40;
    else if (diffDays <= 30) recencyPoints = 35;
    else if (diffDays <= 90) recencyPoints = 28;
    else if (diffDays <= 180) recencyPoints = 22;
    else recencyPoints = 15;
  } catch {
    recencyPoints = 20;
  }

  // 2. Methodological & Mechanistic Novelty markers (0-60 points)
  let noveltyMarkers = 25;
  const novelTerms = [
    'first-in-human',
    'novel biomarker',
    'novel mechanism',
    'spatial transcriptomics',
    'single-cell multiomics',
    'long-read sequencing',
    'liquid biopsy',
    'previously uncharacterized',
    'unprecedented',
    'de novo',
    'resistance mechanism',
    'synthetic lethality',
    'antibody-drug conjugate',
    'bispecific antibody',
    'claudin',
    'folr1',
  ];

  let matches = 0;
  novelTerms.forEach((term) => {
    if (text.includes(term)) matches++;
  });

  if (matches >= 4) noveltyMarkers = 55;
  else if (matches >= 2) noveltyMarkers = 45;
  else if (matches === 1) noveltyMarkers = 35;

  const totalNovelty = Math.min(100, Math.max(10, recencyPoints + noveltyMarkers));

  let reason = '';
  if (totalNovelty >= 80) {
    reason = 'High novelty: Recent publication investigating emerging therapeutic modalities or high-resolution spatial/genomic mechanisms.';
  } else if (totalNovelty >= 60) {
    reason = 'Moderate novelty: Recent translational findings with potential mechanistic relevance.';
  } else {
    reason = 'Standard incremental novelty within established literature.';
  }

  return {
    noveltyScore: Math.round(totalNovelty),
    noveltyReason: reason,
  };
}
