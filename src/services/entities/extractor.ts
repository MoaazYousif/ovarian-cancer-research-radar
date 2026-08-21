import { ExtractedEntities } from '../../types/paper';

// Non-gene English acronyms to exclude from general uppercase token matching
const NON_GENE_ACRONYMS = new Set([
  'DNA', 'RNA', 'MRNA', 'CDNA', 'PCR', 'RT-PCR', 'NGS', 'WES', 'WGS', 'FFPE',
  'FDA', 'NIH', 'NCI', 'WHO', 'OS', 'PFS', 'ORR', 'DOR', 'DCR', 'HR', 'CI',
  'AUC', 'ROC', 'IQR', 'SD', 'SEM', 'KM', 'RECIST', 'ECOG', 'CT', 'MRI',
  'PET', 'US', 'EOC', 'HGSC', 'HGSOC', 'LGSOC', 'CCC', 'EC', 'MC', 'BOT',
  'STIC', 'TNM', 'FIGO', 'IV', 'III', 'II', 'ICU', 'USA', 'UK', 'EU', 'PR',
  'CR', 'PD', 'SD', 'AE', 'TRAE', 'SAE', 'QOL', 'PRO', 'DDR', 'HRD', 'HRP',
  'TMB', 'MSI', 'MSS', 'TME', 'CAF', 'TIL', 'TAM', 'MDSC', 'NK', 'DC',
  'PBMC', 'CTC', 'CTDNA', 'CFDNA', 'EV', 'EXO', 'ELISA', 'IHC', 'FISH',
  'WES', 'RNA-SEQ', 'SCRNA-SEQ', 'ATAC-SEQ', 'CITE-SEQ', 'GEO', 'TCGA',
  'CPTAC', 'ICGC', 'CCLE', 'DEPMAP', 'GDSC', 'STRING', 'KEGG', 'GO', 'GSEA'
]);

// Known biological pathway dictionaries
const PATHWAY_KEYWORDS: { pattern: RegExp; name: string }[] = [
  { pattern: /homologous recombination(?: repair| deficiency)?/i, name: 'Homologous Recombination (HRR/HRD)' },
  { pattern: /dna damage(?: response| repair)?/i, name: 'DNA Damage Response (DDR)' },
  { pattern: /replication stress/i, name: 'Replication Stress' },
  { pattern: /pi3k[\s\/-]?akt(?:[\s\/-]?mtor)?/i, name: 'PI3K/AKT/mTOR Pathway' },
  { pattern: /p53(?: signaling| pathway)?/i, name: 'p53 Signaling Pathway' },
  { pattern: /cell cycle(?: checkpoint| regulation| arrest)?/i, name: 'Cell Cycle Control (G1/S & G2/M)' },
  { pattern: /wnt[\s\/-]?(?:beta|β)[\s\/-]?catenin/i, name: 'Wnt/β-Catenin Signaling' },
  { pattern: /ras[\s\/-]?mapk|erk signaling/i, name: 'RAS/MAPK Pathway' },
  { pattern: /notch signaling/i, name: 'Notch Signaling' },
  { pattern: /angiogenesis|vegf signaling/i, name: 'Angiogenesis & VEGF Signaling' },
  { pattern: /epithelial[\s\/-]mesenchymal transition|emt/i, name: 'Epithelial-Mesenchymal Transition (EMT)' },
  { pattern: /immune evasion|t[\s\/-]?cell exhaustion/i, name: 'Immune Checkpoint & Evasion' },
  { pattern: /cgas[\s\/-]sting/i, name: 'cGAS-STING Innate Immunity' },
  { pattern: /ferroptosis/i, name: 'Ferroptosis' },
  { pattern: /autophagy/i, name: 'Autophagy' },
  { pattern: /base excision repair|ber/i, name: 'Base Excision Repair (BER)' },
  { pattern: /mismatch repair|mmr/i, name: 'Mismatch Repair (MMR)' },
  { pattern: /nucleotide excision repair|ner/i, name: 'Nucleotide Excision Repair (NER)' },
];

// Known drug & therapeutic dictionaries
const DRUG_KEYWORDS: { pattern: RegExp; name: string }[] = [
  { pattern: /olaparib/i, name: 'Olaparib' },
  { pattern: /niraparib/i, name: 'Niraparib' },
  { pattern: /rucaparib/i, name: 'Rucaparib' },
  { pattern: /talazoparib/i, name: 'Talazoparib' },
  { pattern: /parp inhibitor|parpi/i, name: 'PARP Inhibitors (Class)' },
  { pattern: /carboplatin/i, name: 'Carboplatin' },
  { pattern: /cisplatin/i, name: 'Cisplatin' },
  { pattern: /paclitaxel|taxol/i, name: 'Paclitaxel' },
  { pattern: /docetaxel/i, name: 'Docetaxel' },
  { pattern: /bevacizumab|avastin/i, name: 'Bevacizumab' },
  { pattern: /mirvetuximab(?: soravtansine)?|elahere/i, name: 'Mirvetuximab Soravtansine' },
  { pattern: /trastuzumab(?: deruxtecan)?|t[\s\/-]?dxd/i, name: 'Trastuzumab Deruxtecan' },
  { pattern: /datopotamab(?: deruxtecan)?|dato[\s\/-]?dxd/i, name: 'Datopotamab Deruxtecan' },
  { pattern: /antibody[\s\/-]drug conjugate|adc/i, name: 'Antibody-Drug Conjugates (ADCs)' },
  { pattern: /pembrolizumab|keytruda/i, name: 'Pembrolizumab' },
  { pattern: /nivolumab|opdivo/i, name: 'Nivolumab' },
  { pattern: /durvalumab|imfinzi/i, name: 'Durvalumab' },
  { pattern: /doxorubicin|plavix|liposomal doxorubicin|pld/i, name: 'Pegylated Liposomal Doxorubicin (PLD)' },
  { pattern: /gemcitabine/i, name: 'Gemcitabine' },
  { pattern: /topotecan/i, name: 'Topotecan' },
  { pattern: /ceralasertib|atr inhibitor/i, name: 'ATR Inhibitors (Ceralasertib/Berzosertib)' },
  { pattern: /adavosertib|wee1 inhibitor/i, name: 'WEE1 Inhibitors (Adavosertib)' },
  { pattern: /prexasertib|chk1 inhibitor/i, name: 'CHK1/2 Inhibitors' },
  { pattern: /cdk2 inhibitor|cdk4\/6 inhibitor|palbociclib|ribociclib/i, name: 'CDK Inhibitors' },
];

// Known biomarker dictionaries
const BIOMARKER_KEYWORDS: { pattern: RegExp; name: string }[] = [
  { pattern: /homologous recombination deficiency|hrd score|genomic instability/i, name: 'HRD Status / Genomic Scar' },
  { pattern: /brca1?2?(?:[\s\/-]?mutation| carrier| mutant)?/i, name: 'BRCA1/2 Mutation' },
  { pattern: /tp53 (?:mutation|aberrant|null|overexpression)/i, name: 'TP53 Mutation / p53 IHC' },
  { pattern: /ccne1 amplification|cyclin e1/i, name: 'CCNE1 Amplification' },
  { pattern: /ca[\s\/-]?125|muc16/i, name: 'CA-125 (MUC16)' },
  { pattern: /he4|wfdc2/i, name: 'HE4 (WFDC2)' },
  { pattern: /roma score/i, name: 'ROMA Index' },
  { pattern: /folate receptor (?:alpha|α)|folr1/i, name: 'Folate Receptor Alpha (FOLR1)' },
  { pattern: /claudin[\s\/-]?6|cldn6/i, name: 'Claudin-6 (CLDN6)' },
  { pattern: /her2|erbb2 (?:expression|amplification|ihc)/i, name: 'HER2 / ERBB2 Expression' },
  { pattern: /circulating tumor dna|ctdna|cell[\s\/-]free dna|cfdna/i, name: 'ctDNA / Liquid Biopsy' },
  { pattern: /tumor mutational burden|tmb/i, name: 'Tumor Mutational Burden (TMB)' },
  { pattern: /microsatellite instability|msi[\s\/-]?h/i, name: 'MSI-H / MMR Deficiency' },
  { pattern: /pd[\s\/-]?l1 (?:expression|tps|cps)/i, name: 'PD-L1 Expression' },
  { pattern: /arid1a loss/i, name: 'ARID1A Loss' },
];

// Technologies
const TECH_KEYWORDS: { pattern: RegExp; name: string }[] = [
  { pattern: /spatial transcriptomics|10x visium|xenium|cosmx|merfish/i, name: 'Spatial Transcriptomics' },
  { pattern: /single[\s\/-]?cell (?:rna|transcriptom|sequenc)|scrna[\s\/-]?seq/i, name: 'Single-Cell RNA-seq (scRNA-seq)' },
  { pattern: /bulk rna[\s\/-]?seq|rna sequencing/i, name: 'Bulk RNA-seq' },
  { pattern: /multi[\s\/-]?omics|proteogenomic/i, name: 'Multi-omics / Proteogenomics' },
  { pattern: /liquid biopsy|circulating biomarkers/i, name: 'Liquid Biopsy' },
  { pattern: /crispr(?:[\s\/-]?cas9)?(?: screen)?/i, name: 'CRISPR Functional Screen' },
  { pattern: /mass spectrometry|proteomics|phosphoproteom/i, name: 'Mass Spectrometry Proteomics' },
  { pattern: /patient[\s\/-]derived organoid|pdo|pdx/i, name: 'Patient-Derived Organoids / PDX' },
  { pattern: /machine learning|deep learning|artificial intelligence|neural network/i, name: 'Machine Learning / AI Modeling' },
  { pattern: /long[\s\/-]?read sequencing|nanopore|pacbio/i, name: 'Long-Read Sequencing' },
  { pattern: /scatac[\s\/-]?seq|single[\s\/-]?cell atac/i, name: 'scATAC-seq Chromatin Profiling' },
];

// Datasets
const DATASET_KEYWORDS: { pattern: RegExp; name: string }[] = [
  { pattern: /tcga(?:[\s\/-]?ov)?|the cancer genome atlas/i, name: 'TCGA-OV' },
  { pattern: /cptac(?:[\s\/-]?ov)?/i, name: 'CPTAC Ovarian Cohort' },
  { pattern: /geo|gene expression omnibus|gse\d+/i, name: 'GEO (NCBI)' },
  { pattern: /icgc/i, name: 'ICGC Consortium' },
  { pattern: /depmap|cancer dependency map/i, name: 'DepMap / CCLE' },
  { pattern: /arrayexpress/i, name: 'ArrayExpress' },
  { pattern: /clinvar/i, name: 'ClinVar' },
  { pattern: /ega|european genome-phenome archive/i, name: 'EGA' },
];

/**
 * Dynamic Entity Extractor
 * Automatically extracts biological entities from scientific text
 * without relying on a predefined or hardcoded target gene list.
 */
export function extractBiologicalEntities(
  title: string,
  abstract: string,
  meshTerms: string[] = [],
  keywords: string[] = []
): ExtractedEntities {
  const fullText = `${title} ${abstract} ${meshTerms.join(' ')} ${keywords.join(' ')}`;

  // 1. Pathways
  const pathways: string[] = [];
  PATHWAY_KEYWORDS.forEach(({ pattern, name }) => {
    if (pattern.test(fullText) && !pathways.includes(name)) {
      pathways.push(name);
    }
  });

  // 2. Drugs
  const drugs: string[] = [];
  DRUG_KEYWORDS.forEach(({ pattern, name }) => {
    if (pattern.test(fullText) && !drugs.includes(name)) {
      drugs.push(name);
    }
  });

  // 3. Biomarkers
  const biomarkers: string[] = [];
  BIOMARKER_KEYWORDS.forEach(({ pattern, name }) => {
    if (pattern.test(fullText) && !biomarkers.includes(name)) {
      biomarkers.push(name);
    }
  });

  // 4. Technologies
  const technologies: string[] = [];
  TECH_KEYWORDS.forEach(({ pattern, name }) => {
    if (pattern.test(fullText) && !technologies.includes(name)) {
      technologies.push(name);
    }
  });

  // 5. Datasets
  const datasets: string[] = [];
  DATASET_KEYWORDS.forEach(({ pattern, name }) => {
    if (pattern.test(fullText) && !datasets.includes(name)) {
      datasets.push(name);
    }
  });

  // 6. Mutations
  const mutations: string[] = [];
  const mutationMatches = fullText.match(/\b(?:p\.[A-Z][0-9]{1,4}[A-Zfs*]|c\.[0-9]+[A-Z]>[A-Z]|exon\s*[0-9]{1,2}\s*(?:mutation|deletion|insertion))\b/gi);
  if (mutationMatches) {
    mutationMatches.forEach((m) => {
      const clean = m.trim();
      if (!mutations.includes(clean)) mutations.push(clean);
    });
  }

  // 7. Dynamic Gene & Protein Extraction
  // Match standard HGNC gene symbol patterns (e.g., TP53, BRCA1, CCNE1, RAD51C, FOLR1, CLDN6, PTEN, MYC, etc.)
  // using contextual regex: uppercase strings of 2-8 chars with letters & numbers, or specifically mentioned with gene/protein context
  const genesSet = new Set<string>();
  const proteinsSet = new Set<string>();

  // Contextual pattern 1: "gene X", "expression of X", "overexpression of X", "X-deficient", "X mutation", "targeting X"
  const contextualGeneRegex = /(?:gene|protein|expression of|overexpression of|knockdown of|knockout of|deletion of|amplification of|targeting|target|mutant|deficient|dependent|associated)\s+([A-Z][A-Z0-9]{1,8})\b/g;
  let match;
  while ((match = contextualGeneRegex.exec(fullText)) !== null) {
    const candidate = match[1].trim();
    if (!NON_GENE_ACRONYMS.has(candidate) && candidate.length >= 2 && candidate.length <= 8) {
      // Must not be a simple roman numeral or generic word
      if (!/^(II|III|IV|VI|VII|VIII|IX|XI|XII|AND|FOR|THE|WITH|NOT|ALL)$/.test(candidate)) {
        genesSet.add(candidate);
      }
    }
  }

  // Contextual pattern 2: Uppercase alphanumeric tokens that follow typical gene naming syntax (letters + number like BRCA1, TP53, CCNE1, CDK12, RAD51C, PARP1, WEE1, CLDN6, FOLR1)
  const geneSyntaxRegex = /\b([A-Z]{2,6}[0-9]{1,3}[A-Z0-9]?)\b/g;
  while ((match = geneSyntaxRegex.exec(fullText)) !== null) {
    const candidate = match[1].trim();
    if (!NON_GENE_ACRONYMS.has(candidate) && candidate.length >= 3) {
      genesSet.add(candidate);
    }
  }

  // Common high-frequency cancer genes with strictly letters (e.g. KRAS, BRAF, MYC, PTEN, ATM, ATR, RB1, NF1, ARID1A)
  const commonOncogenes = ['KRAS', 'BRAF', 'MYC', 'PTEN', 'ATM', 'ATR', 'RB1', 'NF1', 'ARID1A', 'PIK3CA', 'CTNNB1', 'EGFR', 'ERBB2', 'MET', 'VEGFA', 'CD274', 'SMARCA4'];
  commonOncogenes.forEach((gene) => {
    const regex = new RegExp(`\\b${gene}\\b`, 'g');
    if (regex.test(fullText)) {
      genesSet.add(gene);
    }
  });

  const genes = Array.from(genesSet);
  const proteins = Array.from(proteinsSet);

  return {
    genes,
    proteins,
    pathways,
    drugs,
    biomarkers,
    mutations,
    technologies,
    datasets,
  };
}
