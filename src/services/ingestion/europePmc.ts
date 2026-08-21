import { Author } from '../../types/paper';
import { RawPubMedArticle } from './pubmed';

/**
 * Europe PMC Service
 * Enriches PubMed articles with open access status, PMC IDs, full-text URLs,
 * and supplementary MeSH keywords, plus direct search in Europe PMC / PMC.
 */

export interface EuropePmcEnrichment {
  pmcid?: string;
  isOpenAccess: boolean;
  fullTextUrl?: string;
  pdfUrl?: string;
  citedByCount?: number;
  meshHeadings?: string[];
}

export async function enrichWithEuropePmc(
  doiOrPmid: { doi?: string; pmid?: string }
): Promise<EuropePmcEnrichment | null> {
  try {
    let query = '';
    if (doiOrPmid.doi) {
      query = `DOI:"${doiOrPmid.doi}"`;
    } else if (doiOrPmid.pmid) {
      query = `EXT_ID:"${doiOrPmid.pmid}"`;
    } else {
      return null;
    }

    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&resultType=core`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const result = data?.resultList?.result?.[0];
    if (!result) return null;

    const isOpenAccess = result.isOpenAccess === 'Y';
    const pmcid = result.pmcid;
    const citedByCount = result.citedByCount ? parseInt(result.citedByCount, 10) : undefined;

    let fullTextUrl: string | undefined = undefined;
    let pdfUrl: string | undefined = undefined;

    if (pmcid) {
      fullTextUrl = `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/`;
      pdfUrl = `https://europepmc.org/backend/ptpmcrender.fcgi?accid=${pmcid}&blobtype=pdf`;
    } else if (result.doi) {
      fullTextUrl = `https://doi.org/${result.doi}`;
    }

    const meshHeadings = result.meshHeadingList?.meshHeading?.map((m: { descriptorName?: string }) => m.descriptorName).filter(Boolean) || [];

    return {
      pmcid,
      isOpenAccess,
      fullTextUrl,
      pdfUrl,
      citedByCount,
      meshHeadings,
    };
  } catch (error) {
    console.warn('Europe PMC enrichment error:', error);
    return null;
  }
}

/**
 * Direct search on Europe PMC (PubMed Central / PubMed repository)
 */
export async function searchEuropePmcArticles(
  query: string,
  pageSize: number = 25
): Promise<RawPubMedArticle[]> {
  try {
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&resultType=core&pageSize=${pageSize}&sort_date=y`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    const results = data?.resultList?.result || [];

    return results.map((item: any): RawPubMedArticle => {
      const authors: Author[] = (item.authorList?.author || []).map((a: any) => ({
        fullName: a.fullName || `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Anonymous',
        firstName: a.firstName,
        lastName: a.lastName,
        affiliation: a.authorAffiliationDetailsList?.authorAffiliation?.[0]?.affiliation,
      }));

      const meshTerms = item.meshHeadingList?.meshHeading?.map((m: any) => m.descriptorName).filter(Boolean) || [];
      const keywords = item.keywordList?.keyword || [];

      return {
        pmid: item.pmid || item.id || '',
        doi: item.doi,
        pmcid: item.pmcid,
        title: item.title?.replace(/<[^>]*>?/gm, '') || 'Untitled',
        abstract: item.abstractText?.replace(/<[^>]*>?/gm, '') || '',
        journal: item.journalTitle || item.journalInfo?.journal?.title || 'Scientific Journal',
        publicationDate: item.firstPublicationDate || item.pubYear || new Date().toISOString().slice(0, 10),
        authors,
        affiliations: item.authorAffiliationDetailsList?.authorAffiliation?.map((aff: any) => aff.affiliation).filter(Boolean) || [],
        meshTerms,
        keywords,
      };
    }).filter((item: RawPubMedArticle) => item.title && item.title !== 'Untitled');
  } catch (error) {
    console.warn('Europe PMC direct search error:', error);
    return [];
  }
}

