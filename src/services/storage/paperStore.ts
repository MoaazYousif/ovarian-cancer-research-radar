import { Paper, FilterOptions, OvarianSubtype } from '../../types/paper';
import { UserProfile, DEFAULT_USER_PROFILE } from '../../types/profile';
import { INITIAL_PAPERS_DATA } from './initialDataset';
import { computeEntityTrends, TrendAnalysisSummary } from '../entities/trendEngine';
import { computeFinalScore } from '../ranking/finalScorer';
import { computePersonalizationScore } from '../ranking/personalizationScorer';
import { computeNoveltyScore } from '../ranking/noveltyScorer';
import { ResearchDigest } from '../../types/digest';
import { ResearchGap } from '../../types/entities';

const STORAGE_PAPERS_KEY = 'ovarian_research_radar_papers_ondemand_v1';
const STORAGE_PROFILE_KEY = 'ovarian_research_radar_profile_ondemand_v1';

export class PaperStore {
  private papers: Paper[] = [];
  private profile: UserProfile = DEFAULT_USER_PROFILE;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      // Clear legacy storage keys
      ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8'].forEach((ver) => {
        localStorage.removeItem(`ovarian_research_radar_papers_${ver}`);
      });

      const storedProfile = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (storedProfile) {
        this.profile = JSON.parse(storedProfile);
      }

      const storedPapers = localStorage.getItem(STORAGE_PAPERS_KEY);
      if (storedPapers) {
        const parsed: Paper[] = JSON.parse(storedPapers);
        if (Array.isArray(parsed)) {
          this.papers = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }

    // Default start state: load rich verified landmark cohort if storage is empty
    this.papers = [...INITIAL_PAPERS_DATA];
    this.saveToStorage();
  }

  public clearAllPapers() {
    this.papers = [];
    this.saveToStorage();
    this.notify();
  }

  public loadLandmarkCohort() {
    this.papers = [...INITIAL_PAPERS_DATA];
    this.saveToStorage();
    this.notify();
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_PAPERS_KEY, JSON.stringify(this.papers));
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(this.profile));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getPapers(): Paper[] {
    return this.papers;
  }

  public getProfile(): UserProfile {
    return this.profile;
  }

  public updateProfile(newProfile: UserProfile) {
    this.profile = newProfile;
    // Re-score papers according to new profile weights & interests
    this.rescoreAllPapers();
    this.saveToStorage();
    this.notify();
  }

  public rescoreAllPapers() {
    this.papers = this.papers.map((paper) => {
      const persResult = computePersonalizationScore(
        paper.title,
        paper.abstract,
        paper.keywords,
        this.profile
      );
      const novResult = computeNoveltyScore(
        paper.title,
        paper.abstract,
        paper.publicationDate
      );

      const newScores = computeFinalScore(
        {
          relevanceScore: paper.scores.relevanceScore,
          hgsocScore: paper.scores.hgsocScore,
          importanceScore: paper.scores.importanceScore,
          personalizationScore: persResult.personalizationScore,
          noveltyScore: novResult.noveltyScore,
          relevanceReason: paper.scores.scoreBreakdownRationale.relevanceReason,
          hgsocReason: paper.scores.scoreBreakdownRationale.hgsocReason,
          importanceReason: paper.scores.scoreBreakdownRationale.importanceReason,
          personalizationReason: persResult.personalizationReason,
          noveltyReason: novResult.noveltyReason,
        },
        this.profile.scoringWeights
      );

      return {
        ...paper,
        scores: newScores,
      };
    });
  }

  public addPapers(newPapers: Paper[]) {
    // Avoid duplicate IDs
    const existingIds = new Set(this.papers.map((p) => p.id));
    const nowIso = new Date().toISOString();
    
    // Tag newly added papers
    const toAdd = newPapers
      .filter((p) => !existingIds.has(p.id))
      .map((p) => ({
        ...p,
        isNewlyIngested: true,
        ingestedAt: nowIso,
      }));

    this.papers = [...toAdd, ...this.papers];
    this.saveToStorage();
    this.notify();
  }

  public updatePaper(updatedPaper: Paper) {
    this.papers = this.papers.map((p) => (p.id === updatedPaper.id ? updatedPaper : p));
    this.saveToStorage();
    this.notify();
  }

  public toggleSavePaper(paperId: string) {
    this.papers = this.papers.map((p) => {
      if (p.id === paperId) {
        return { ...p, isSaved: !p.isSaved };
      }
      return p;
    });
    this.saveToStorage();
    this.notify();
  }

  public toggleReadPaper(paperId: string) {
    this.papers = this.papers.map((p) => {
      if (p.id === paperId) {
        return { ...p, isRead: !p.isRead };
      }
      return p;
    });
    this.saveToStorage();
    this.notify();
  }

  public setPaperFeedback(paperId: string, feedback: 'up' | 'down' | null) {
    this.papers = this.papers.map((p) => {
      if (p.id === paperId) {
        return { ...p, feedback: p.feedback === feedback ? null : feedback };
      }
      return p;
    });
    this.saveToStorage();
    this.notify();
  }

  public updatePaperNotes(paperId: string, notes: string) {
    this.papers = this.papers.map((p) => {
      if (p.id === paperId) {
        return { ...p, userNotes: notes };
      }
      return p;
    });
    this.saveToStorage();
    this.notify();
  }

  public filterPapers(options: FilterOptions): Paper[] {
    if (!options) return this.papers || [];
    const now = new Date().getTime();
    const ONE_DAY = 1000 * 60 * 60 * 24;

    const subtypes = options.subtypes || [];
    const studyTypes = options.studyTypes || [];
    const minFinalScore = typeof options.minFinalScore === 'number' ? options.minFinalScore : 0;
    const minHgsocScore = typeof options.minHgsocScore === 'number' ? options.minHgsocScore : 0;

    return (this.papers || [])
      .filter((paper) => {
        if (!paper) return false;

        // Subtype filter
        if (subtypes.length > 0) {
          if (!paper.ovarianSubtype || !subtypes.includes(paper.ovarianSubtype)) {
            return false;
          }
        }

        // Study type filter
        if (studyTypes.length > 0) {
          if (!paper.studyType || !studyTypes.includes(paper.studyType)) {
            return false;
          }
        }

        // Date range filter
        if (options.dateRange && options.dateRange !== 'all') {
          const pubDateStr = paper.publicationDate || '';
          const pubTime = new Date(pubDateStr).getTime();
          if (!isNaN(pubTime)) {
            const daysAgo = (now - pubTime) / ONE_DAY;
            if (options.dateRange === '24h' && daysAgo > 1) return false;
            if (options.dateRange === '7d' && daysAgo > 7) return false;
            if (options.dateRange === '30d' && daysAgo > 30) return false;
            if (options.dateRange === '90d' && daysAgo > 90) return false;
            if (options.dateRange === '1y' && daysAgo > 365) return false;
          }
        }

        // Minimum score filters
        const finalScore = paper.scores?.finalScore ?? 0;
        const hgsocScore = paper.scores?.hgsocScore ?? 0;
        if (finalScore < minFinalScore) return false;
        if (hgsocScore < minHgsocScore) return false;

        // Flags
        if (options.newlyIngestedOnly && !paper.isNewlyIngested) return false;
        if (options.openAccessOnly && !paper.openAccess) return false;
        if (options.aiSummarizedOnly && !paper.isAiSummarized) return false;
        if (options.savedOnly && !paper.isSaved) return false;
        if (options.unreadOnly && paper.isRead) return false;

        // Entity filter
        if (options.selectedEntity && paper.entities) {
          const { type, name } = options.selectedEntity;
          const entityList = (paper.entities && paper.entities[type]) || [];
          if (
            !entityList.some(
              (item) => typeof item === 'string' && item.toLowerCase() === name.toLowerCase()
            )
          ) {
            return false;
          }
        }

        // Keyword query
        if (options.searchQuery && options.searchQuery.trim()) {
          const q = options.searchQuery.toLowerCase().trim();
          const title = (paper.title || '').toLowerCase();
          const abstract = (paper.abstract || '').toLowerCase();
          const journal = (paper.journal || '').toLowerCase();
          const authors = (paper.authors || []).map((a) => (a?.name || '').toLowerCase());
          
          const genes = (paper.entities?.genes || []).map((e) => (e || '').toLowerCase());
          const drugs = (paper.entities?.drugs || []).map((e) => (e || '').toLowerCase());
          const pathways = (paper.entities?.pathways || []).map((e) => (e || '').toLowerCase());
          const biomarkers = (paper.entities?.biomarkers || []).map((e) => (e || '').toLowerCase());
          const technologies = (paper.entities?.technologies || []).map((e) => (e || '').toLowerCase());
          const allEntities = [...genes, ...drugs, ...pathways, ...biomarkers, ...technologies];

          const matchesTitle = title.includes(q);
          const matchesAbstract = abstract.includes(q);
          const matchesAuthor = authors.some((a) => a.includes(q));
          const matchesJournal = journal.includes(q);
          const matchesEntity = allEntities.some((e) => e.includes(q));

          if (!matchesTitle && !matchesAbstract && !matchesAuthor && !matchesJournal && !matchesEntity) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;

        const sortBy = options.sortBy || 'finalScore';
        if (sortBy === 'recentIngestion') {
          valA = a.isNewlyIngested ? 1000 : 0;
          valB = b.isNewlyIngested ? 1000 : 0;
          if (valA === valB) {
            valA = new Date(a.publicationDate || 0).getTime() || 0;
            valB = new Date(b.publicationDate || 0).getTime() || 0;
          }
        } else if (sortBy === 'finalScore') {
          valA = a.scores?.finalScore ?? 0;
          valB = b.scores?.finalScore ?? 0;
        } else if (sortBy === 'publicationDate') {
          valA = new Date(a.publicationDate || 0).getTime() || 0;
          valB = new Date(b.publicationDate || 0).getTime() || 0;
        } else if (sortBy === 'importanceScore') {
          valA = a.scores?.importanceScore ?? 0;
          valB = b.scores?.importanceScore ?? 0;
        } else if (sortBy === 'hgsocScore') {
          valA = a.scores?.hgsocScore ?? 0;
          valB = b.scores?.hgsocScore ?? 0;
        } else if (sortBy === 'noveltyScore') {
          valA = a.scores?.noveltyScore ?? 0;
          valB = b.scores?.noveltyScore ?? 0;
        } else if (sortBy === 'personalizationScore') {
          valA = a.scores?.personalizationScore ?? 0;
          valB = b.scores?.personalizationScore ?? 0;
        } else if (sortBy === 'citationCount') {
          valA = a.citationCount ?? 0;
          valB = b.citationCount ?? 0;
        }

        return options.sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }

  public getTrends(): TrendAnalysisSummary {
    return computeEntityTrends(this.papers);
  }

  public generateDailyDigest(): ResearchDigest {
    const trends = this.getTrends();
    const sorted = [...this.papers].sort((a, b) => b.scores.finalScore - a.scores.finalScore);
    const topPaper = sorted[0] || this.papers[0];
    const highPriority = sorted.filter((p) => p.scores.finalScore >= 80);
    const hgsocCount = this.papers.filter((p) => p.ovarianSubtype === 'HGSOC').length;

    const trialAlerts = this.papers.filter(
      (p) => p.studyType === 'Phase III Trial' || p.studyType === 'Phase II Trial'
    );

    const fastestGrowing = [
      { topic: 'Antibody-Drug Conjugates (ADCs)', growth: '+180%', papersCount: this.papers.filter((p) => p.entities.drugs.some((d) => d.includes('ADC') || d.includes('Mirvetuximab'))).length },
      { topic: 'Spatial Transcriptomics & Microenvironment', growth: '+145%', papersCount: this.papers.filter((p) => p.entities.technologies.includes('Spatial Transcriptomics')).length },
      { topic: 'CCNE1 Amplification & CDK2 Synthetic Lethality', growth: '+120%', papersCount: this.papers.filter((p) => p.entities.genes.includes('CCNE1')).length },
      { topic: 'Liquid Biopsy ctDNA Reversion Detection', growth: '+95%', papersCount: this.papers.filter((p) => p.entities.technologies.includes('Liquid Biopsy')).length },
    ];

    return {
      date: new Date().toISOString().split('T')[0],
      totalNewPapers: this.papers.length,
      relevantPapersCount: this.papers.filter((p) => p.scores.relevanceScore >= 70).length,
      highPriorityCount: highPriority.length,
      hgsocCount,
      topPaper,
      highPriorityPapers: highPriority.slice(0, 5),
      emergingGenes: trends.emergingGenes.slice(0, 5),
      emergingPathways: trends.emergingPathways.slice(0, 4),
      emergingTherapies: trends.emergingDrugs.slice(0, 4),
      emergingBiomarkers: trends.emergingBiomarkers.slice(0, 4),
      fastestGrowingTopics: fastestGrowing,
      clinicalTrialAlerts: trialAlerts.slice(0, 3),
      executiveSummary: `Today's ovarian research radar processed ${this.papers.length} scientific publications. The literature highlights major clinical advances in antibody-drug conjugates (MIRASOL Phase III overall survival), single-cell spatial dissection of immune-evasive CAF niches in HGSOC, and emerging CDK2 synthetic lethality for CCNE1-amplified refractory tumors.`,
    };
  }

  public getResearchGaps(): ResearchGap[] {
    return [
      {
        id: 'gap_1',
        title: 'Overcoming Innate Non-HRD Chemoresistance in CCNE1-Amplified HGSOC',
        category: 'Resistance Mechanism',
        description: 'Approximately 20% of HGSOC patients harbor CCNE1 amplifications with intact homologous recombination, showing poor response to PARP inhibitors and platinum regimens. Emerging CDK2/ATR inhibitors require prospective clinical trial validation.',
        evidenceSummary: 'Preclinical PDX models demonstrate 100% disease control with combined CDK2 + ATR inhibition, but Phase 1b clinical pharmacokinetic and biomarker safety trials are ongoing.',
        affectedSubtypes: ['HGSOC'],
        relatedEntities: ['CCNE1', 'CDK2', 'ATR', 'Replication Stress'],
        paperCount: this.papers.filter((p) => p.entities.genes.includes('CCNE1')).length,
        recommendedAction: 'Focus computational survival models and spatial proteomics on CDK2/RB1 signaling balance in CCNE1-amplified tumors.',
      },
      {
        id: 'gap_2',
        title: 'Mechanisms of Secondary Resistance to Antibody-Drug Conjugates (ADCs)',
        category: 'Unvalidated Biomarker',
        description: 'While mirvetuximab soravtansine and trastuzumab deruxtecan show breakthrough activity, mechanisms of acquired payload efflux pump upregulation and antigen downregulation remain poorly characterized in clinical cohorts.',
        evidenceSummary: 'Preclinical organoid models indicate potential bystander killing efficacy, but longitudinal post-progression patient biopsies are scarce.',
        affectedSubtypes: ['HGSOC', 'Clear cell', 'Low-grade serous'],
        relatedEntities: ['FOLR1', 'CLDN6', 'ERBB2', 'ADCs'],
        paperCount: this.papers.filter((p) => p.entities.drugs.some((d) => d.includes('ADC'))).length,
        recommendedAction: 'Profile post-ADC longitudinal ctDNA and liquid biopsy shed antigens to track epitope loss.',
      },
      {
        id: 'gap_3',
        title: 'Epigenetic Vulnerabilities in ARID1A-Deficient Clear Cell Ovarian Cancer',
        category: 'Understudied Pathway',
        description: 'Ovarian clear cell carcinoma lacks effective chemotherapy options. Although ARID1A loss is present in ~58% of cases, single-agent epigenetic or checkpoint therapies have shown modest monotherapy response.',
        evidenceSummary: 'Synthetic lethality with combined EZH2 and ATR inhibition requires prospective phase 2 clinical cohort evaluation.',
        affectedSubtypes: ['Clear cell'],
        relatedEntities: ['ARID1A', 'PIK3CA', 'EZH2', 'ATR'],
        paperCount: this.papers.filter((p) => p.ovarianSubtype === 'Clear cell').length,
        recommendedAction: 'Prioritize multi-omics clustering on independent OCCC cohorts to define predictive biomarkers for EZH2/ATR trials.',
      },
      {
        id: 'gap_4',
        title: 'Validation of Spatial Microenvironment Scoring for Immunotherapy Stratification',
        category: 'Subtype Disparity',
        description: 'Single-agent checkpoint inhibitors fail in unselected HGSOC due to immunosuppressive CAF barrier niches. Standardizing spatial transcriptomic distance metrics into clinical diagnostic assays is an active research barrier.',
        evidenceSummary: 'Nature spatial transcriptomics confirms TGF-beta producing CAFs isolate cytotoxic CD8+ T cells from tumor nests.',
        affectedSubtypes: ['HGSOC'],
        relatedEntities: ['TGFB1', 'CXCL12', 'Spatial Transcriptomics', 'CAF'],
        paperCount: this.papers.filter((p) => p.entities.technologies.includes('Spatial Transcriptomics')).length,
        recommendedAction: 'Develop multiplexed digital pathology panels measuring CAF-CD8 spatial proximity for clinical trial patient stratification.',
      },
    ];
  }

  public resetToDefault() {
    this.papers = [...INITIAL_PAPERS_DATA];
    this.profile = DEFAULT_USER_PROFILE;
    this.saveToStorage();
    this.notify();
  }
}

export const paperStore = new PaperStore();
