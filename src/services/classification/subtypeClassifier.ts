import { OvarianSubtype } from '../../types/paper';

export interface SubtypeClassificationResult {
  subtype: OvarianSubtype;
  confidence: number; // 0 - 100
  evidenceRationale: string;
  isHGSOC: boolean;
}

export function classifyOvarianSubtype(
  title: string,
  abstract: string,
  keywords: string[] = []
): SubtypeClassificationResult {
  const fullText = `${title} ${abstract} ${keywords.join(' ')}`.toLowerCase();
  const titleLower = title.toLowerCase();

  // Pattern checks for HGSOC / High-Grade Serous
  const hgsocPatterns = [
    'high-grade serous',
    'high grade serous',
    'hgsoc',
    'hgsc',
    'high-grade serous carcinoma',
    'high-grade serous ovarian cancer',
    'high-grade serous ovarian carcinoma',
    'serous tubal intraepithelial carcinoma',
    'stic',
    'tp53-mutant serous',
    'serous ovarian carcinoma',
  ];

  // Low-grade serous
  const lgsocPatterns = [
    'low-grade serous',
    'low grade serous',
    'lgsoc',
    'lgsc',
    'kras mutant low-grade',
    'braf-mutated low-grade',
  ];

  // Clear cell
  const clearCellPatterns = [
    'clear cell ovarian',
    'ovarian clear cell',
    'occc',
    'ccc',
    'clear cell carcinoma of the ovary',
    'arid1a-mutant clear cell',
  ];

  // Endometrioid
  const endometrioidPatterns = [
    'endometrioid ovarian',
    'ovarian endometrioid',
    'endometrioid carcinoma of the ovary',
    'arising from endometriosis',
  ];

  // Mucinous
  const mucinousPatterns = [
    'mucinous ovarian',
    'ovarian mucinous',
    'mucinous carcinoma of the ovary',
    'mucinous cystadenocarcinoma',
  ];

  // Borderline
  const borderlinePatterns = [
    'borderline ovarian',
    'borderline tumor',
    'atypical proliferative ovarian',
    'bot',
  ];

  // Non-epithelial
  const nonEpithelialPatterns = [
    'granulosa cell tumor',
    'sertoli-leydig',
    'dysgerminoma',
    'yolk sac tumor',
    'immature teratoma',
    'sex cord-stromal',
    'malignant germ cell',
  ];

  // Check in Title first (highest specificity)
  if (hgsocPatterns.some((p) => titleLower.includes(p))) {
    return {
      subtype: 'HGSOC',
      confidence: 96,
      evidenceRationale: 'High-Grade Serous Carcinoma explicitly designated in paper title.',
      isHGSOC: true,
    };
  }

  if (clearCellPatterns.some((p) => titleLower.includes(p))) {
    return {
      subtype: 'Clear cell',
      confidence: 95,
      evidenceRationale: 'Clear Cell Ovarian Carcinoma explicitly identified in study title.',
      isHGSOC: false,
    };
  }

  if (lgsocPatterns.some((p) => titleLower.includes(p))) {
    return {
      subtype: 'Low-grade serous',
      confidence: 94,
      evidenceRationale: 'Low-Grade Serous Ovarian Carcinoma explicitly identified in title.',
      isHGSOC: false,
    };
  }

  if (endometrioidPatterns.some((p) => titleLower.includes(p))) {
    return {
      subtype: 'Endometrioid',
      confidence: 94,
      evidenceRationale: 'Endometrioid Ovarian Carcinoma identified in study title.',
      isHGSOC: false,
    };
  }

  if (mucinousPatterns.some((p) => titleLower.includes(p))) {
    return {
      subtype: 'Mucinous',
      confidence: 94,
      evidenceRationale: 'Mucinous Ovarian Carcinoma explicitly defined in study title.',
      isHGSOC: false,
    };
  }

  if (borderlinePatterns.some((p) => titleLower.includes(p))) {
    return {
      subtype: 'Borderline',
      confidence: 92,
      evidenceRationale: 'Borderline Ovarian Tumor identified in study title.',
      isHGSOC: false,
    };
  }

  if (nonEpithelialPatterns.some((p) => titleLower.includes(p))) {
    return {
      subtype: 'Non-epithelial',
      confidence: 93,
      evidenceRationale: 'Non-epithelial ovarian histology (germ cell or sex-cord stromal) identified.',
      isHGSOC: false,
    };
  }

  // Check in abstract text
  const hasHgsoc = hgsocPatterns.some((p) => fullText.includes(p));
  const hasClearCell = clearCellPatterns.some((p) => fullText.includes(p));
  const hasLgsoc = lgsocPatterns.some((p) => fullText.includes(p));
  const hasEndometrioid = endometrioidPatterns.some((p) => fullText.includes(p));
  const hasMucinous = mucinousPatterns.some((p) => fullText.includes(p));
  const hasBorderline = borderlinePatterns.some((p) => fullText.includes(p));
  const hasNonEpithelial = nonEpithelialPatterns.some((p) => fullText.includes(p));

  const detectedSubtypesCount = [
    hasHgsoc,
    hasClearCell,
    hasLgsoc,
    hasEndometrioid,
    hasMucinous,
    hasBorderline,
    hasNonEpithelial,
  ].filter(Boolean).length;

  if (detectedSubtypesCount > 1) {
    if (hasHgsoc) {
      return {
        subtype: 'HGSOC',
        confidence: 82,
        evidenceRationale: 'Multi-subtype comparative ovarian cohort with primary HGSOC component.',
        isHGSOC: true,
      };
    }
    return {
      subtype: 'Mixed',
      confidence: 80,
      evidenceRationale: 'Multiple histological subtypes analyzed across comparative cohort.',
      isHGSOC: false,
    };
  }

  if (hasHgsoc) {
    return {
      subtype: 'HGSOC',
      confidence: 88,
      evidenceRationale: 'High-Grade Serous subtype confirmed in abstract study design.',
      isHGSOC: true,
    };
  }

  if (hasClearCell) {
    return {
      subtype: 'Clear cell',
      confidence: 88,
      evidenceRationale: 'Ovarian clear cell subtype confirmed in abstract methodology.',
      isHGSOC: false,
    };
  }

  if (hasLgsoc) {
    return {
      subtype: 'Low-grade serous',
      confidence: 86,
      evidenceRationale: 'Low-grade serous subtype identified in study cohort description.',
      isHGSOC: false,
    };
  }

  if (hasEndometrioid) {
    return {
      subtype: 'Endometrioid',
      confidence: 86,
      evidenceRationale: 'Endometrioid histology confirmed in patient cohort.',
      isHGSOC: false,
    };
  }

  if (hasMucinous) {
    return {
      subtype: 'Mucinous',
      confidence: 86,
      evidenceRationale: 'Mucinous histology confirmed in cohort specification.',
      isHGSOC: false,
    };
  }

  if (hasBorderline) {
    return {
      subtype: 'Borderline',
      confidence: 85,
      evidenceRationale: 'Borderline ovarian tumor cohort characterized.',
      isHGSOC: false,
    };
  }

  if (hasNonEpithelial) {
    return {
      subtype: 'Non-epithelial',
      confidence: 85,
      evidenceRationale: 'Non-epithelial ovarian tumor cohort evaluated.',
      isHGSOC: false,
    };
  }

  // Epithelial mention without specific subtype
  if (fullText.includes('epithelial ovarian') || fullText.includes('eoc')) {
    return {
      subtype: 'Other epithelial',
      confidence: 72,
      evidenceRationale: 'General Epithelial Ovarian Cancer (EOC) cohort without individual histological subtyping.',
      isHGSOC: false,
    };
  }

  return {
    subtype: 'Unspecified',
    confidence: 50,
    evidenceRationale: 'General ovarian cancer study without specified histological subtype.',
    isHGSOC: false,
  };
}
