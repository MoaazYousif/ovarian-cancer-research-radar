import React, { useState } from 'react';
import { Paper } from '../types/paper';
import { UserProfile } from '../types/profile';
import { findSimilarPapers } from '../services/embeddings/semanticEngine';
import { generateStructuredAiSummary } from '../services/ai/geminiSummarizer';
import {
  X,
  Sparkles,
  Bookmark,
  CheckCircle,
  ExternalLink,
  Copy,
  Check,
  Dna,
  ShieldCheck,
  Layers,
  FileText,
  Activity,
  Share2,
  FlaskConical,
  Microscope,
  Target,
  AlertTriangle,
  HelpCircle,
  Compass,
} from 'lucide-react';

interface PaperDetailModalProps {
  paper: Paper | null;
  allPapers: Paper[];
  userProfile: UserProfile;
  onClose: () => void;
  onToggleSave: (paperId: string) => void;
  onToggleRead: (paperId: string) => void;
  onUpdatePaper: (paper: Paper) => void;
  onSelectSimilarPaper: (paper: Paper) => void;
  onOpenSocial?: (paper: Paper) => void;
}

export const PaperDetailModal: React.FC<PaperDetailModalProps> = ({
  paper,
  allPapers,
  userProfile,
  onClose,
  onToggleSave,
  onToggleRead,
  onUpdatePaper,
  onSelectSimilarPaper,
  onOpenSocial,
}) => {
  if (!paper) return null;

  const [activeTab, setActiveTab] = useState<'summary' | 'scores' | 'abstract' | 'similar' | 'notes'>('summary');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [userNotes, setUserNotes] = useState(paper.userNotes || '');
  const [copiedCitation, setCopiedCitation] = useState<string | null>(null);

  const similarPapers = findSimilarPapers(paper, allPapers, 4);

  const handleGenerateSummary = async () => {
    setIsGeneratingAi(true);
    try {
      const summary = await generateStructuredAiSummary(paper, userProfile);
      const updated = {
        ...paper,
        aiSummary: summary,
        isAiSummarized: true,
      };
      onUpdatePaper(updated);
    } catch (err) {
      console.error('Failed to generate summary:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSaveNotes = () => {
    const updated = {
      ...paper,
      userNotes,
    };
    onUpdatePaper(updated);
  };

  const copyCitation = (format: 'bibtex' | 'apa' | 'ama') => {
    let text = '';
    const firstAuthor = paper.authors[0]?.name || 'Anonymous';
    const year = paper.publicationDate.slice(0, 4);

    if (format === 'apa') {
      text = `${firstAuthor} et al. (${year}). ${paper.title}. ${paper.journal}. ${paper.doi ? `https://doi.org/${paper.doi}` : ''}`;
    } else if (format === 'ama') {
      text = `${firstAuthor}, et al. ${paper.title}. ${paper.journal}. ${year}; ${paper.doi ? `doi:${paper.doi}` : ''}`;
    } else {
      text = `@article{ovarian_radar_${paper.pmid || paper.id},\n  title={${paper.title}},\n  author={${firstAuthor}},\n  journal={${paper.journal}},\n  year={${year}},\n  doi={${paper.doi || ''}}\n}`;
    }

    navigator.clipboard.writeText(text);
    setCopiedCitation(format);
    setTimeout(() => setCopiedCitation(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto" dir="ltr">
      <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-start justify-between bg-[#111111] gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded bg-[#c4a484]/15 border border-[#c4a484]/40 text-[#c4a484] font-bold">
                {paper.ovarianSubtype}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-sans">
                {paper.studyType}
              </span>
              {paper.openAccess && (
                <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-sans">
                  Open Access
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-serif text-white font-medium leading-snug">
              {paper.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              {paper.authors.map((a) => a.name).slice(0, 4).join(', ')}
              {paper.authors.length > 4 && ` et al. (${paper.authors.length})`} • <span className="italic text-slate-300">{paper.journal}</span> • <span className="font-mono">{paper.publicationDate}</span>
            </p>

            {/* Direct NCBI / PubMed / PMC / DOI Verification Bar */}
            <div className="flex flex-wrap items-center gap-2 mt-3 p-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-xs font-sans">
              <span className="text-slate-400 font-bold">Direct Links:</span>

              {/* Direct Search on PubMed */}
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(paper.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#c4a484] text-slate-950 font-bold hover:opacity-90 transition-all text-xs"
                title="Search paper title in official PubMed database"
              >
                <span>PubMed Live</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {/* Direct Search on NCBI PMC */}
              <a
                href={`https://www.ncbi.nlm.nih.gov/pmc/?term=${encodeURIComponent(paper.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all text-xs"
                title="Search NCBI PMC Full-Text Archive"
              >
                <span>NCBI PMC</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {/* Direct PMID Link */}
              {paper.pmid && (
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-mono text-xs hover:bg-white/10 transition-all"
                  title={`Open official record PMID ${paper.pmid}`}
                >
                  <span>PMID: {paper.pmid}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}

              {/* Direct DOI Link */}
              {paper.doi && (
                <a
                  href={`https://doi.org/${paper.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-mono text-xs hover:bg-white/10 transition-all"
                  title={`Open official publisher DOI ${paper.doi}`}
                >
                  <span>DOI: {paper.doi}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}

              {/* Google Scholar Search */}
              <a
                href={`https://scholar.google.com/scholar?q=${encodeURIComponent(paper.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 text-xs transition-all"
                title="Search Google Scholar"
              >
                <span>Google Scholar</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Social Post Creator Button */}
            {onOpenSocial && (
              <button
                onClick={() => onOpenSocial(paper)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-[#c4a484]/15 border border-white/10 hover:border-[#c4a484]/50 text-slate-200 hover:text-[#c4a484] text-xs font-sans transition-all cursor-pointer"
                title="Generate LinkedIn & Social Post"
              >
                <Share2 className="w-3.5 h-3.5 text-[#c4a484]" />
                <span>Post Generator</span>
              </button>
            )}

            {/* Final Score Pill */}
            <div className="text-center px-3 py-1.5 rounded-xl bg-white/5 border border-[#c4a484]/40">
              <p className="text-[10px] text-slate-400 font-sans">Radar Score</p>
              <p className="text-xl font-serif font-bold text-[#c4a484]">{paper.scores.finalScore}</p>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 border-b border-white/5 bg-[#0a0a0a] text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-3 border-b-2 font-medium transition-all cursor-pointer flex items-center gap-1.5 font-sans ${
              activeTab === 'summary'
                ? 'border-[#c4a484] text-[#c4a484]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Structured AI Brief
          </button>
          <button
            onClick={() => setActiveTab('scores')}
            className={`py-3 px-3 border-b-2 font-medium transition-all cursor-pointer flex items-center gap-1.5 font-sans ${
              activeTab === 'scores'
                ? 'border-[#c4a484] text-[#c4a484]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Scores & Evidence Breakdown
          </button>
          <button
            onClick={() => setActiveTab('abstract')}
            className={`py-3 px-3 border-b-2 font-medium transition-all cursor-pointer flex items-center gap-1.5 font-sans ${
              activeTab === 'abstract'
                ? 'border-[#c4a484] text-[#c4a484]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Original Abstract
          </button>
          <button
            onClick={() => setActiveTab('similar')}
            className={`py-3 px-3 border-b-2 font-medium transition-all cursor-pointer flex items-center gap-1.5 font-sans ${
              activeTab === 'similar'
                ? 'border-[#c4a484] text-[#c4a484]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Similar Papers ({similarPapers.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-3 border-b-2 font-medium transition-all cursor-pointer flex items-center gap-1.5 font-sans ${
              activeTab === 'notes'
                ? 'border-[#c4a484] text-[#c4a484]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Notes & Citations
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: STRUCTURED AI BRIEF */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {!paper.isAiSummarized ? (
                <div className="bg-[#141414] border border-white/5 rounded-2xl p-8 text-center space-y-4">
                  <Sparkles className="w-8 h-8 text-[#c4a484] mx-auto animate-pulse" />
                  <div>
                    <h3 className="text-base font-serif text-white font-bold">
                      Generate Structured AI Research Brief
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 font-sans">
                      Extracts the executive TL;DR, study design, quantitative findings, clinical & biological significance, and HGSOC translational impact.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingAi}
                    className="px-6 py-2.5 rounded-xl bg-[#c4a484] text-slate-950 font-bold text-xs hover:opacity-90 transition-all cursor-pointer font-sans"
                  >
                    {isGeneratingAi ? 'Analyzing & Summarizing...' : 'Generate 12-Point AI Brief'}
                  </button>
                </div>
              ) : (
                paper.aiSummary && (
                  <div className="space-y-6">
                    {/* Social Post Call to Action Bar */}
                    {onOpenSocial && (
                      <div className="bg-gradient-to-r from-blue-500/10 via-sky-500/5 to-transparent border border-blue-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <Share2 className="w-4 h-4 text-sky-400" />
                          <div>
                            <span className="text-xs font-serif text-white font-bold block">
                              Ready to Share on LinkedIn or X?
                            </span>
                            <span className="text-[11px] text-slate-400 font-sans">
                              Transform this breakthrough into publication-ready scientific social posts
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onOpenSocial(paper)}
                          className="px-4 py-1.5 rounded-xl bg-[#c4a484] text-slate-950 font-bold text-xs hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 font-sans"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Generate Social Posts</span>
                        </button>
                      </div>
                    )}

                    {/* Evidence Level Badge */}
                    <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-slate-300 font-medium font-sans">Evidence Level:</span>
                        <span className="text-emerald-400 font-mono text-[11px]">{paper.aiSummary.evidenceLevel}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Analyzed on {new Date(paper.aiSummary.generatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* TL;DR Highlight */}
                    <div className="bg-gradient-to-r from-[#c4a484]/15 via-white/5 to-transparent border border-[#c4a484]/30 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-[#c4a484]" />
                        <h4 className="text-xs font-bold text-[#c4a484] uppercase tracking-wider font-sans">
                          Executive TL;DR
                        </h4>
                      </div>
                      <p className="text-sm font-serif text-white leading-loose text-justify">
                        {paper.aiSummary.tldr}
                      </p>
                    </div>

                    {/* Section: Research Question & Hypothesis */}
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                        <HelpCircle className="w-4 h-4 text-sky-400" />
                        <h4 className="text-xs font-bold text-white font-sans">
                          Research Question & Central Hypothesis
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans pt-1">
                        {paper.aiSummary.researchQuestion}
                      </p>
                    </div>

                    {/* Section: Study Design & Methodology */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Study Design Card */}
                      <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                            <Layers className="w-4 h-4 text-[#c4a484]" />
                            <h4 className="text-xs font-bold text-[#c4a484] font-sans">
                              Study Design & Patient Cohort
                            </h4>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                            {paper.aiSummary.studyDesign}
                          </p>
                        </div>
                        {paper.sampleSize && (
                          <div className="pt-2">
                            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                              Cohort Size: <strong>{paper.sampleSize}</strong> patients / models
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Methodology & Experimental Tools Card */}
                      <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                            <FlaskConical className="w-4 h-4 text-emerald-400" />
                            <h4 className="text-xs font-bold text-emerald-400 font-sans">
                              Methodology & Analytic Pipeline
                            </h4>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                            {paper.aiSummary.methodsSummary || 'Advanced molecular and clinical analysis integrating genomic sequencing, histopathology, and therapeutic response modeling.'}
                          </p>
                        </div>
                        <div className="pt-2">
                          <span className="text-[11px] font-sans px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                            Study Classification: {paper.studyType}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Main Empirical Discoveries */}
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                        <Target className="w-4 h-4 text-[#c4a484]" />
                        <h4 className="text-xs font-bold text-white font-sans">
                          Key Empirical Findings & Statistical Evidence
                        </h4>
                      </div>
                      <div className="space-y-3 pt-1">
                        {paper.aiSummary.mainFindings.map((finding, idx) => (
                          <div
                            key={idx}
                            className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl p-4 flex items-start gap-3 transition-colors"
                          >
                            <span className="w-6 h-6 rounded-full bg-[#c4a484]/20 border border-[#c4a484]/40 text-[#c4a484] text-xs font-bold flex items-center justify-center font-mono flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans flex-1">
                              {finding}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Clinical vs Biological Significance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="bg-[#141414] border border-emerald-500/20 rounded-2xl p-6 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/10">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-bold text-emerald-400 font-sans">
                            Clinical & Translational Impact
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans pt-1">
                          {paper.aiSummary.clinicalSignificance}
                        </p>
                      </div>

                      <div className="bg-[#141414] border border-sky-500/20 rounded-2xl p-6 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-sky-500/10">
                          <Microscope className="w-4 h-4 text-sky-400" />
                          <h4 className="text-xs font-bold text-sky-400 font-sans">
                            Biological & Molecular Mechanism
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans pt-1">
                          {paper.aiSummary.biologicalSignificance}
                        </p>
                      </div>
                    </div>

                    {/* Subtype Rationale & HGSOC Applicability */}
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                        <Dna className="w-4 h-4 text-[#c4a484]" />
                        <h4 className="text-xs font-bold text-white font-sans">
                          Histotype Specificity & HGSOC Relevance
                        </h4>
                      </div>
                      <div className="space-y-3 pt-1 text-xs sm:text-sm">
                        <div className="bg-white/[0.02] rounded-xl p-3.5 border border-white/5">
                          <span className="text-[11px] font-bold text-[#c4a484] block mb-1">Targeted Subtype:</span>
                          <p className="text-slate-200 leading-relaxed">{paper.aiSummary.ovarianSubtypeRationale}</p>
                        </div>
                        <div className="bg-white/[0.02] rounded-xl p-3.5 border border-white/5">
                          <span className="text-[11px] font-bold text-[#c4a484] block mb-1">Direct HGSOC Applicability:</span>
                          <p className="text-slate-200 leading-relaxed">{paper.aiSummary.hgsocRelevance}</p>
                        </div>
                      </div>
                    </div>

                    {/* Limitations */}
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 space-y-2">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Methodological Limitations & Open Questions</span>
                      </div>
                      <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed font-sans pt-1">
                        {paper.aiSummary.limitations}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* TAB 2: SCORES & EVIDENCE BREAKDOWN */}
          {activeTab === 'scores' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* 1. Relevance */}
                <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-300 font-bold font-sans">Ovarian Cancer Relevance</span>
                    <span className="font-mono text-sm text-white font-bold">{paper.scores.relevanceScore}/100</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {paper.scores.scoreBreakdownRationale.relevanceReason}
                  </p>
                </div>

                {/* 2. HGSOC Specificity */}
                <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-[#c4a484] font-bold font-sans">HGSOC Specificity</span>
                    <span className="font-mono text-sm text-[#c4a484] font-bold">{paper.scores.hgsocScore}/100</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {paper.scores.scoreBreakdownRationale.hgsocReason}
                  </p>
                </div>

                {/* 3. Scientific Importance */}
                <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-300 font-bold font-sans">Scientific Evidence Tier</span>
                    <span className="font-mono text-sm text-white font-bold">{paper.scores.importanceScore}/100</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {paper.scores.scoreBreakdownRationale.importanceReason}
                  </p>
                </div>

                {/* 4. Personalization Fit */}
                <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-300 font-bold font-sans">Profile Match</span>
                    <span className="font-mono text-sm text-white font-bold">{paper.scores.personalizationScore}/100</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {paper.scores.scoreBreakdownRationale.personalizationReason}
                  </p>
                </div>

                {/* 5. Novelty */}
                <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-300 font-bold font-sans">Recency & Novelty</span>
                    <span className="font-mono text-sm text-white font-bold">{paper.scores.noveltyScore}/100</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {paper.scores.scoreBreakdownRationale.noveltyReason}
                  </p>
                </div>

                {/* Weighted Total */}
                <div className="bg-gradient-to-br from-[#c4a484]/20 to-transparent border border-[#c4a484]/40 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-[#c4a484] font-bold font-sans">Composite Weighted Radar Score</span>
                    <p className="text-3xl font-serif font-bold text-white mt-1">{paper.scores.finalScore} / 100</p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-2">
                    Weights: Relevance 25%, HGSOC 20%, Importance 25%, Personalization 20%, Novelty 10%
                  </p>
                </div>
              </div>

              {/* Discovered Biological Entities Matrix */}
              <div className="bg-[#141414] border border-white/5 rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-serif text-white font-bold">
                  Biomarker & Therapeutic Entities Extracted
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1.5 font-bold">Genes & Proteins</span>
                    <div className="flex flex-wrap gap-1">
                      {paper.entities.genes.length > 0 ? (
                        paper.entities.genes.map((g) => (
                          <span key={g} className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono">
                            {g}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 italic">None detected</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block mb-1.5 font-bold">Drugs & Therapies</span>
                    <div className="flex flex-wrap gap-1">
                      {paper.entities.drugs.length > 0 ? (
                        paper.entities.drugs.map((d) => (
                          <span key={d} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                            {d}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 italic">None detected</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block mb-1.5 font-bold">Pathways</span>
                    <div className="flex flex-wrap gap-1">
                      {paper.entities.pathways.length > 0 ? (
                        paper.entities.pathways.map((p) => (
                          <span key={p} className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300">
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 italic">None detected</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ORIGINAL ABSTRACT */}
          {activeTab === 'abstract' && (
            <div className="space-y-4">
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-6">
                <p className="text-xs text-slate-400 mb-3 font-mono font-bold">
                  Full Published Abstract:
                </p>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                  {paper.abstract}
                </p>
              </div>

              {/* MeSH Headings & Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {paper.keywords.length > 0 && (
                  <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block mb-2 font-sans font-bold">Author Keywords</span>
                    <div className="flex flex-wrap gap-1.5">
                      {paper.keywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[11px] font-sans">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {paper.meshTerms.length > 0 && (
                  <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block mb-2 font-mono font-bold">NCBI MeSH Terms</span>
                    <div className="flex flex-wrap gap-1.5">
                      {paper.meshTerms.map((mesh, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[11px] font-sans">
                          {mesh}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SIMILAR PAPERS */}
          {activeTab === 'similar' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 font-sans">
                Similar literature computed via semantic embeddings and shared molecular entities:
              </p>

              <div className="space-y-3">
                {similarPapers.map(({ paper: simPaper, similarityPercent, sharedElements }) => (
                  <div
                    key={simPaper.id}
                    onClick={() => onSelectSimilarPaper(simPaper)}
                    className="bg-[#141414] border border-white/5 rounded-xl p-4 hover:border-[#c4a484]/40 transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#c4a484]">
                          {simPaper.ovarianSubtype}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{simPaper.publicationDate}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-serif text-white group-hover:text-[#c4a484] transition-colors line-clamp-2">
                        {simPaper.title}
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-2 text-[10px] text-slate-400 font-sans">
                        {sharedElements.map((elem, i) => (
                          <span key={i} className="text-slate-300 bg-white/5 px-2 py-0.5 rounded">
                            {elem}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {similarityPercent}% Match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: RESEARCHER NOTES & CITATIONS */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Notes Editor */}
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 space-y-3">
                <label className="text-xs text-slate-300 font-bold font-sans block">
                  Personal Research Notes
                </label>
                <textarea
                  rows={5}
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Record your thoughts, experimental ideas, or clinical implications..."
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#c4a484] font-sans"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-2 rounded-lg bg-[#c4a484] text-slate-950 font-bold text-xs hover:opacity-90 transition-all cursor-pointer font-sans"
                  >
                    Save Notes
                  </button>
                </div>
              </div>

              {/* Citation Exporter */}
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 space-y-3">
                <label className="text-xs text-slate-300 font-bold font-sans block">
                  Export Citation
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => copyCitation('bibtex')}
                    className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200 hover:bg-white/10 flex items-center gap-1.5 cursor-pointer font-mono"
                  >
                    {copiedCitation === 'bibtex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>BibTeX</span>
                  </button>
                  <button
                    onClick={() => copyCitation('apa')}
                    className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200 hover:bg-white/10 flex items-center gap-1.5 cursor-pointer font-mono"
                  >
                    {copiedCitation === 'apa' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>APA</span>
                  </button>
                  <button
                    onClick={() => copyCitation('ama')}
                    className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200 hover:bg-white/10 flex items-center gap-1.5 cursor-pointer font-mono"
                  >
                    {copiedCitation === 'ama' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>AMA</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-[#111111] flex flex-wrap items-center justify-between gap-3 font-sans">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleSave(paper.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                paper.isSaved
                  ? 'bg-[#c4a484]/15 border-[#c4a484] text-[#c4a484]'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{paper.isSaved ? 'Saved in Bookmarks' : 'Save to Favorites'}</span>
            </button>

            <button
              onClick={() => onToggleRead(paper.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                paper.isRead
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{paper.isRead ? 'Marked as Read' : 'Mark as Read'}</span>
            </button>

            {onOpenSocial && (
              <button
                onClick={() => onOpenSocial(paper)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#c4a484]/10 border border-[#c4a484]/30 text-[#c4a484] hover:bg-[#c4a484]/20 text-xs font-sans transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Generate Social Post</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {(paper.fullTextUrl || paper.doi || paper.pmid) && (
              <a
                href={paper.fullTextUrl || (paper.doi ? `https://doi.org/${paper.doi}` : `https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#c4a484] text-slate-950 font-bold text-xs hover:opacity-90 transition-all cursor-pointer font-sans"
              >
                <span>Open in PubMed / Publisher</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
