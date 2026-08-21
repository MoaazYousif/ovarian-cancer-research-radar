import { Paper } from '../../types/paper';

export function normalizeTextForDeduplication(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9]/g, '') // remove all punctuation and whitespace
    .trim();
}

export function generatePaperFingerprint(paper: {
  title: string;
  firstAuthor?: string;
  publicationYear?: string | number;
  doi?: string;
  pmid?: string;
  pmcid?: string;
}): string {
  if (paper.doi) {
    return `doi:${paper.doi.toLowerCase().trim()}`;
  }
  if (paper.pmid) {
    return `pmid:${paper.pmid.trim()}`;
  }
  if (paper.pmcid) {
    return `pmc:${paper.pmcid.trim()}`;
  }

  const normTitle = normalizeTextForDeduplication(paper.title).slice(0, 50);
  const normAuthor = normalizeTextForDeduplication(paper.firstAuthor || '');
  const year = paper.publicationYear || '';
  return `hash:${normTitle}_${normAuthor}_${year}`;
}

export interface DeduplicationResult<T> {
  unique: T[];
  duplicatesCount: number;
}

/**
 * Deduplicate an array of incoming papers against an existing database
 */
export function deduplicatePapers<T extends Partial<Paper>>(
  incomingPapers: T[],
  existingPapers: Paper[] = []
): DeduplicationResult<T> {
  const seenFingerprints = new Set<string>();

  // Index existing papers
  existingPapers.forEach((p) => {
    if (p.doi) seenFingerprints.add(`doi:${p.doi.toLowerCase().trim()}`);
    if (p.pmid) seenFingerprints.add(`pmid:${p.pmid.trim()}`);
    if (p.pmcid) seenFingerprints.add(`pmc:${p.pmcid.trim()}`);
    const firstAuthor = p.authors?.[0]?.name;
    const year = p.publicationDate ? p.publicationDate.slice(0, 4) : '';
    seenFingerprints.add(`hash:${normalizeTextForDeduplication(p.title).slice(0, 50)}_${normalizeTextForDeduplication(firstAuthor || '')}_${year}`);
  });

  const unique: T[] = [];
  let duplicatesCount = 0;

  incomingPapers.forEach((paper) => {
    if (!paper.title) return;

    const firstAuthor = paper.authors?.[0]?.name;
    const year = paper.publicationDate ? paper.publicationDate.slice(0, 4) : '';

    const fpDoi = paper.doi ? `doi:${paper.doi.toLowerCase().trim()}` : null;
    const fpPmid = paper.pmid ? `pmid:${paper.pmid.trim()}` : null;
    const fpPmc = paper.pmcid ? `pmc:${paper.pmcid.trim()}` : null;
    const fpHash = `hash:${normalizeTextForDeduplication(paper.title).slice(0, 50)}_${normalizeTextForDeduplication(firstAuthor || '')}_${year}`;

    const isDuplicate =
      (fpDoi && seenFingerprints.has(fpDoi)) ||
      (fpPmid && seenFingerprints.has(fpPmid)) ||
      (fpPmc && seenFingerprints.has(fpPmc)) ||
      seenFingerprints.has(fpHash);

    if (isDuplicate) {
      duplicatesCount++;
    } else {
      if (fpDoi) seenFingerprints.add(fpDoi);
      if (fpPmid) seenFingerprints.add(fpPmid);
      if (fpPmc) seenFingerprints.add(fpPmc);
      seenFingerprints.add(fpHash);
      unique.push(paper);
    }
  });

  return { unique, duplicatesCount };
}
