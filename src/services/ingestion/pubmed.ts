import { Author } from '../../types/paper';

export interface RawPubMedArticle {
  pmid: string;
  doi?: string;
  pmcid?: string;
  title: string;
  abstract: string;
  journal: string;
  publicationDate: string;
  authors: Author[];
  affiliations: string[];
  meshTerms: string[];
  keywords: string[];
}

/**
 * Fetch PubMed articles via official NCBI E-utilities API (ESearch + EFetch)
 */
export async function searchPubMedArticles(
  query: string = 'ovarian cancer[Title/Abstract] OR HGSOC[Title/Abstract] OR "high-grade serous"[Title/Abstract]',
  retmax: number = 20,
  dateRangeDays: number = 30,
  apiKey?: string,
  email?: string
): Promise<RawPubMedArticle[]> {
  try {
    // 1. ESearch: Retrieve PMIDs
    const esearchUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi');
    esearchUrl.searchParams.set('db', 'pubmed');
    esearchUrl.searchParams.set('term', query);
    esearchUrl.searchParams.set('retmode', 'json');
    esearchUrl.searchParams.set('retmax', String(retmax));
    if (dateRangeDays > 0) {
      esearchUrl.searchParams.set('reldate', String(dateRangeDays));
      esearchUrl.searchParams.set('datetype', 'edat');
    }
    esearchUrl.searchParams.set('sort', 'pub_date');
    esearchUrl.searchParams.set('tool', 'OvarianCancerResearchRadar');
    if (apiKey) esearchUrl.searchParams.set('api_key', apiKey.trim());
    if (email) esearchUrl.searchParams.set('email', email.trim());

    const searchRes = await fetch(esearchUrl.toString());
    if (!searchRes.ok) {
      throw new Error(`NCBI ESearch failed: ${searchRes.statusText}`);
    }

    const searchData = await searchRes.json();
    const idList: string[] = searchData?.esearchresult?.idlist || [];

    if (idList.length === 0) {
      return [];
    }

    // 2. EFetch: Retrieve XML/Summary metadata for PMIDs
    const efetchUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi');
    efetchUrl.searchParams.set('db', 'pubmed');
    efetchUrl.searchParams.set('id', idList.join(','));
    efetchUrl.searchParams.set('retmode', 'xml');
    efetchUrl.searchParams.set('tool', 'OvarianCancerResearchRadar');
    if (apiKey) efetchUrl.searchParams.set('api_key', apiKey.trim());
    if (email) efetchUrl.searchParams.set('email', email.trim());

    const fetchRes = await fetch(efetchUrl.toString());
    if (!fetchRes.ok) {
      throw new Error(`NCBI EFetch failed: ${fetchRes.statusText}`);
    }

    const xmlText = await fetchRes.text();
    return parsePubMedXml(xmlText);
  } catch (error) {
    console.warn('NCBI E-utilities fetch error:', error);
    return [];
  }
}

/**
 * Parse PubMed XML string into structured RawPubMedArticle records
 */
export function parsePubMedXml(xmlText: string): RawPubMedArticle[] {
  const articles: RawPubMedArticle[] = [];

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const pubmedArticles = xmlDoc.getElementsByTagName('PubmedArticle');

    for (let i = 0; i < pubmedArticles.length; i++) {
      const articleNode = pubmedArticles[i];

      // PMID
      const pmidNode = articleNode.getElementsByTagName('PMID')[0];
      const pmid = pmidNode ? pmidNode.textContent?.trim() || '' : '';
      if (!pmid) continue;

      // Title
      const titleNode = articleNode.getElementsByTagName('ArticleTitle')[0];
      const title = titleNode ? titleNode.textContent?.trim() || '' : 'Untitled';

      // Abstract (concatenate all AbstractText nodes)
      const abstractNodes = articleNode.getElementsByTagName('AbstractText');
      const abstractParts: string[] = [];
      for (let j = 0; j < abstractNodes.length; j++) {
        const label = abstractNodes[j].getAttribute('Label');
        const text = abstractNodes[j].textContent?.trim() || '';
        if (label && text) {
          abstractParts.push(`${label}: ${text}`);
        } else if (text) {
          abstractParts.push(text);
        }
      }
      const abstract = abstractParts.join(' ') || 'Abstract not available in public record.';

      // Journal
      const journalTitleNode = articleNode.getElementsByTagName('Title')[0] || articleNode.getElementsByTagName('MedlineTA')[0];
      const journal = journalTitleNode ? journalTitleNode.textContent?.trim() || 'Scientific Journal' : 'Scientific Journal';

      // Publication Date
      let publicationDate = new Date().toISOString().split('T')[0];
      const pubDateNode = articleNode.getElementsByTagName('PubDate')[0];
      if (pubDateNode) {
        const year = pubDateNode.getElementsByTagName('Year')[0]?.textContent?.trim();
        const month = pubDateNode.getElementsByTagName('Month')[0]?.textContent?.trim() || '01';
        const day = pubDateNode.getElementsByTagName('Day')[0]?.textContent?.trim() || '01';
        if (year) {
          const monthNum = parseMonth(month);
          const dayFormatted = day.padStart(2, '0');
          publicationDate = `${year}-${monthNum}-${dayFormatted}`;
        }
      }

      // Authors & Affiliations
      const authors: Author[] = [];
      const affiliations: string[] = [];
      const authorNodes = articleNode.getElementsByTagName('Author');
      for (let a = 0; a < authorNodes.length; a++) {
        const lastName = authorNodes[a].getElementsByTagName('LastName')[0]?.textContent?.trim() || '';
        const foreName = authorNodes[a].getElementsByTagName('ForeName')[0]?.textContent?.trim() || '';
        const affNode = authorNodes[a].getElementsByTagName('Affiliation')[0];
        const affText = affNode ? affNode.textContent?.trim() : undefined;

        if (lastName) {
          authors.push({
            name: `${foreName} ${lastName}`.trim(),
            affiliation: affText,
            isFirstAuthor: a === 0,
            isCorrespondingAuthor: a === authorNodes.length - 1,
          });
        }
        if (affText && !affiliations.includes(affText)) {
          affiliations.push(affText);
        }
      }

      // DOI & PMCID
      let doi: string | undefined = undefined;
      let pmcid: string | undefined = undefined;
      const articleIdNodes = articleNode.getElementsByTagName('ArticleId');
      for (let id = 0; id < articleIdNodes.length; id++) {
        const idType = articleIdNodes[id].getAttribute('IdType');
        if (idType === 'doi') {
          doi = articleIdNodes[id].textContent?.trim();
        } else if (idType === 'pmc') {
          pmcid = articleIdNodes[id].textContent?.trim();
        }
      }

      // MeSH Headings
      const meshTerms: string[] = [];
      const meshNodes = articleNode.getElementsByTagName('DescriptorName');
      for (let m = 0; m < meshNodes.length; m++) {
        const term = meshNodes[m].textContent?.trim();
        if (term && !meshTerms.includes(term)) {
          meshTerms.push(term);
        }
      }

      // Keywords
      const keywords: string[] = [];
      const keywordNodes = articleNode.getElementsByTagName('Keyword');
      for (let k = 0; k < keywordNodes.length; k++) {
        const kw = keywordNodes[k].textContent?.trim();
        if (kw && !keywords.includes(kw)) {
          keywords.push(kw);
        }
      }

      articles.push({
        pmid,
        doi,
        pmcid,
        title,
        abstract,
        journal,
        publicationDate,
        authors,
        affiliations,
        meshTerms,
        keywords,
      });
    }
  } catch (err) {
    console.error('Error parsing PubMed XML:', err);
  }

  return articles;
}

function parseMonth(monthStr: string): string {
  const months: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
    '1': '01', '2': '02', '3': '03', '4': '04', '5': '05', '6': '06',
    '7': '07', '8': '08', '9': '09', '10': '10', '11': '11', '12': '12'
  };
  return months[monthStr.slice(0, 3)] || '01';
}

/**
 * Retrieves the total count of matching articles in the worldwide PubMed database
 * using NCBI E-Utilities ESearch (rettype=count).
 */
export async function getPubMedArticleCount(
  query: string,
  apiKey?: string,
  email?: string
): Promise<number> {
  try {
    const esearchUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi');
    esearchUrl.searchParams.set('db', 'pubmed');
    esearchUrl.searchParams.set('term', query);
    esearchUrl.searchParams.set('rettype', 'count');
    esearchUrl.searchParams.set('retmode', 'json');
    esearchUrl.searchParams.set('tool', 'OvarianCancerResearchRadar');
    if (apiKey) esearchUrl.searchParams.set('api_key', apiKey.trim());
    if (email) esearchUrl.searchParams.set('email', email.trim());

    const res = await fetch(esearchUrl.toString());
    if (!res.ok) throw new Error(`NCBI count fetch failed: ${res.statusText}`);
    const data = await res.json();
    const countStr = data?.esearchresult?.count;
    return countStr ? parseInt(countStr, 10) : 0;
  } catch (err) {
    console.warn(`Error fetching PubMed count for "${query}":`, err);
    return 0;
  }
}

/**
 * Fetch PubMed counts for multiple queries with polite rate-limiting (sequential with delay)
 * to guarantee 100% accurate results without NCBI 429 rate-limit errors.
 */
export async function getBulkPubMedCounts(
  queries: Record<string, string>,
  apiKey?: string,
  email?: string
): Promise<Record<string, number>> {
  const results: Record<string, number> = {};
  const entries = Object.entries(queries);

  for (let i = 0; i < entries.length; i++) {
    const [key, query] = entries[i];
    try {
      if (i > 0) {
        // Sleep 250ms between requests to respect NCBI rate limit (3 req/sec unauthenticated)
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      const count = await getPubMedArticleCount(query, apiKey, email);
      results[key] = count;
    } catch (err) {
      console.warn(`Error in bulk PubMed count for key "${key}":`, err);
      results[key] = 0;
    }
  }

  return results;
}

