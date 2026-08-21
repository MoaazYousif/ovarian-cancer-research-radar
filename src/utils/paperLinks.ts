import { Paper } from '../types/paper';

/**
 * Clean and normalize a DOI string (removes prefixes like 'doi:', 'https://doi.org/', etc.)
 */
export function cleanDoiString(doi?: string | null): string {
  if (!doi) return '';
  return String(doi)
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
    .trim();
}

/**
 * Clean and extract a numeric PMID from string
 */
export function cleanPmidString(pmid?: string | null, id?: string | null): string {
  if (pmid) {
    const cleaned = String(pmid).trim().replace(/^pmid_?/i, '');
    if (/^\d+$/.test(cleaned)) return cleaned;
  }
  if (id && id.startsWith('pmid_')) {
    const fromId = id.replace(/^pmid_/, '').trim();
    if (/^\d+$/.test(fromId)) return fromId;
  }
  return '';
}

/**
 * Get verified DOI URL for a paper
 */
export function getVerifiedDoiUrl(paper: Partial<Paper>): string {
  const cleanDoi = cleanDoiString(paper.doi);
  if (cleanDoi) {
    return `https://doi.org/${cleanDoi}`;
  }
  const cleanPmid = cleanPmidString(paper.pmid, paper.id);
  if (cleanPmid) {
    return `https://pubmed.ncbi.nlm.nih.gov/${cleanPmid}/`;
  }
  if (paper.title) {
    return `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(paper.title)}`;
  }
  return 'https://pubmed.ncbi.nlm.nih.gov/';
}

/**
 * Get verified PubMed URL for a paper
 */
export function getVerifiedPubMedUrl(paper: Partial<Paper>): string {
  const cleanPmid = cleanPmidString(paper.pmid, paper.id);
  if (cleanPmid) {
    return `https://pubmed.ncbi.nlm.nih.gov/${cleanPmid}/`;
  }
  if (paper.title) {
    return `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(paper.title)}`;
  }
  return 'https://pubmed.ncbi.nlm.nih.gov/';
}

/**
 * Get verified PubMed Central (PMC) URL for a paper
 */
export function getVerifiedPmcUrl(paper: Partial<Paper>): string {
  if (paper.pmcid) {
    const cleanPmc = String(paper.pmcid).trim().replace(/^PMC/i, '');
    return `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${cleanPmc}/`;
  }
  if (paper.title) {
    return `https://www.ncbi.nlm.nih.gov/pmc/?term=${encodeURIComponent(paper.title)}`;
  }
  return 'https://www.ncbi.nlm.nih.gov/pmc/';
}

/**
 * Get Google Scholar Search URL for a paper
 */
export function getGoogleScholarUrl(paper: Partial<Paper>): string {
  if (paper.title) {
    return `https://scholar.google.com/scholar?q=${encodeURIComponent(paper.title)}`;
  }
  return 'https://scholar.google.com/';
}
