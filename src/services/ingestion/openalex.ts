/**
 * OpenAlex Enrichment Service
 * Retrieves citation counts, institutional affiliations, concepts, and OA status.
 */

export interface OpenAlexEnrichment {
  citationCount?: number;
  openAccessUrl?: string;
  concepts?: string[];
  isOa?: boolean;
}

export async function enrichWithOpenAlex(
  doiOrPmid: { doi?: string; pmid?: string }
): Promise<OpenAlexEnrichment | null> {
  try {
    let url = '';
    if (doiOrPmid.doi) {
      url = `https://api.openalex.org/works/https://doi.org/${encodeURIComponent(doiOrPmid.doi)}`;
    } else if (doiOrPmid.pmid) {
      url = `https://api.openalex.org/works/pmid:${encodeURIComponent(doiOrPmid.pmid)}`;
    } else {
      return null;
    }

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data) return null;

    const citationCount = typeof data.cited_by_count === 'number' ? data.cited_by_count : undefined;
    const isOa = Boolean(data.open_access?.is_oa);
    const openAccessUrl = data.open_access?.oa_url || undefined;
    const concepts = (data.concepts || []).slice(0, 8).map((c: { display_name?: string }) => c.display_name).filter(Boolean);

    return {
      citationCount,
      isOa,
      openAccessUrl,
      concepts,
    };
  } catch (error) {
    console.warn('OpenAlex enrichment warning:', error);
    return null;
  }
}
