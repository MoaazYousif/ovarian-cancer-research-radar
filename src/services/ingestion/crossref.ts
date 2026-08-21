/**
 * Crossref Verification Service
 * Validates DOIs and fetches publication metadata.
 */

export interface CrossrefMetadata {
  doi: string;
  publisher?: string;
  isReferencedByCount?: number;
  publishedPrint?: string;
  publishedOnline?: string;
}

export async function verifyCrossrefDoi(doi: string): Promise<CrossrefMetadata | null> {
  try {
    const cleanDoi = doi.trim();
    if (!cleanDoi) return null;

    const url = `https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'OvarianCancerResearchRadar/1.0 (mailto:radar@ovariancancer.bio)',
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    const item = data?.message;
    if (!item) return null;

    return {
      doi: item.DOI || cleanDoi,
      publisher: item.publisher,
      isReferencedByCount: item['is-referenced-by-count'],
      publishedPrint: item['published-print']?.['date-parts']?.[0]?.join('-'),
      publishedOnline: item['published-online']?.['date-parts']?.[0]?.join('-'),
    };
  } catch (error) {
    console.warn('Crossref lookup error:', error);
    return null;
  }
}
