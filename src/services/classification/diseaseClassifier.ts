/**
 * Disease Classifier
 * Determines whether a scientific paper is directly about ovarian cancer,
 * related to ovarian cancer, mentioning it incidentally, or non-relevant.
 */

export interface DiseaseClassificationResult {
  isOvarianCancer: boolean;
  relevanceCategory: 'Direct Ovarian Cancer' | 'Related Ovarian Malignancy' | 'Incidental Mention' | 'Non-relevant';
  confidence: number; // 0 - 100
  evidenceReason: string;
}

export function classifyOvarianCancerDisease(
  title: string,
  abstract: string,
  meshTerms: string[] = [],
  keywords: string[] = []
): DiseaseClassificationResult {
  const text = `${title} ${abstract} ${keywords.join(' ')} ${meshTerms.join(' ')}`.toLowerCase();
  const titleLower = title.toLowerCase();

  // Primary direct ovarian terms
  const directOvarianTerms = [
    'ovarian cancer',
    'ovarian carcinoma',
    'ovarian neoplasm',
    'ovarian malignancy',
    'ovarian tumor',
    'ovarian tumors',
    'hgsoc',
    'hgsc',
    'high-grade serous ovarian',
    'high-grade serous carcinoma',
    'low-grade serous ovarian',
    'clear cell ovarian',
    'endometrioid ovarian',
    'mucinous ovarian',
    'fallopian tube cancer',
    'primary peritoneal cancer',
    'tubo-ovarian',
  ];

  // Incidental multi-cancer context markers (e.g. pan-cancer screens where ovarian is 1 of 30)
  const panCancerTerms = [
    'pan-cancer',
    'pancancer',
    'across 33 cancer types',
    'multiple cancer types',
    'solid tumors',
    'various cancers',
  ];

  const titleHasDirectTerm = directOvarianTerms.some((term) => titleLower.includes(term));
  const textOccurrences = directOvarianTerms.reduce((acc, term) => {
    const matches = text.match(new RegExp(`\\b${term}\\b`, 'g'));
    return acc + (matches ? matches.length : 0);
  }, 0);

  const isPanCancer = panCancerTerms.some((term) => text.includes(term));

  if (titleHasDirectTerm || textOccurrences >= 3) {
    return {
      isOvarianCancer: true,
      relevanceCategory: 'Direct Ovarian Cancer',
      confidence: titleHasDirectTerm ? 98 : 90,
      evidenceReason: titleHasDirectTerm
        ? 'Direct ovarian cancer focus confirmed in article title and core study subject.'
        : `Strong ovarian cancer specificity confirmed with ${textOccurrences} distinct contextual mentions.`,
    };
  }

  if (textOccurrences >= 1) {
    if (isPanCancer) {
      return {
        isOvarianCancer: true,
        relevanceCategory: 'Related Ovarian Malignancy',
        confidence: 65,
        evidenceReason: 'Pan-cancer or multi-tumor study including ovarian carcinoma cohort.',
      };
    }
    return {
      isOvarianCancer: true,
      relevanceCategory: 'Related Ovarian Malignancy',
      confidence: 75,
      evidenceReason: 'Ovarian cancer investigated as part of broader gynecologic or gynecologic-oncology study.',
    };
  }

  // Check MeSH terms specifically
  const meshHasOvarian = meshTerms.some((m) => m.toLowerCase().includes('ovarian') || m.toLowerCase().includes('ovary'));
  if (meshHasOvarian) {
    return {
      isOvarianCancer: true,
      relevanceCategory: 'Related Ovarian Malignancy',
      confidence: 70,
      evidenceReason: 'Indexed with official MeSH term indicating ovarian neoplasm relevance.',
    };
  }

  return {
    isOvarianCancer: false,
    relevanceCategory: 'Non-relevant',
    confidence: 15,
    evidenceReason: 'No direct or substantial ovarian cancer terminology identified.',
  };
}
