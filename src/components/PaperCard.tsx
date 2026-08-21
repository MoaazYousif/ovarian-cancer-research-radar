import React from 'react';
import { Paper } from '../types/paper';
import {
  Bookmark,
  CheckCircle,
  ExternalLink,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Dna,
  Share2,
} from 'lucide-react';

interface PaperCardProps {
  paper: Paper;
  onSelect: (paper: Paper) => void;
  onToggleSave: (paperId: string) => void;
  onToggleRead: (paperId: string) => void;
  onFeedback: (paperId: string, feedback: 'up' | 'down') => void;
  onSelectEntity: (type: 'genes' | 'drugs' | 'pathways' | 'biomarkers' | 'technologies', name: string) => void;
  onOpenSocial?: (paper: Paper) => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  onSelect,
  onToggleSave,
  onToggleRead,
  onFeedback,
  onSelectEntity,
  onOpenSocial,
}) => {
  const isHgsoc = paper.ovarianSubtype === 'HGSOC';

  const getSubtypeBadgeStyle = (subtype: string) => {
    switch (subtype) {
      case 'HGSOC':
        return 'bg-[#c4a484]/15 border-[#c4a484]/50 text-[#c4a484] font-bold';
      case 'Clear cell':
        return 'bg-sky-500/10 border-sky-500/30 text-sky-400';
      case 'Low-grade serous':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'Endometrioid':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      case 'Mucinous':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      default:
        return 'bg-white/5 border-white/10 text-slate-300';
    }
  };

  return (
    <article
      className={`bg-[#111111] border rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between group ${
        paper.isRead ? 'opacity-75 border-white/5' : 'border-white/5 hover:border-[#c4a484]/40 hover:bg-[#141414]'
      }`}
      dir="ltr"
    >
      <div>
        {/* Top Header Row: Subtype, Study Type, Scores */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Subtype Badge */}
            <span
              className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md border font-mono ${getSubtypeBadgeStyle(
                paper.ovarianSubtype
              )}`}
            >
              {paper.ovarianSubtype}
              {isHgsoc && ' ★'}
            </span>

            {/* Newly Ingested Live Badge */}
            {paper.isNewlyIngested && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold font-sans flex items-center gap-1 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Newly Ingested from NCBI
              </span>
            )}

            {/* Study Design / Type */}
            <span className="text-[10px] px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 font-sans">
              {paper.studyType}
            </span>

            {/* Open Access Flag */}
            {paper.openAccess && (
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">
                Open Access
              </span>
            )}
          </div>

          {/* Scores Pill Group */}
          <div className="flex items-center gap-3">
            {/* Breakdown Mini-indicators */}
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span title="Ovarian Relevance Score">Rel: <strong className="text-slate-200">{paper.scores.relevanceScore}</strong></span>
              <span>•</span>
              <span title="HGSOC Specificity Score">HGSOC: <strong className={isHgsoc ? 'text-[#c4a484]' : 'text-slate-300'}>{paper.scores.hgsocScore}</strong></span>
              <span>•</span>
              <span title="Scientific Importance & Trial Level">Imp: <strong className="text-slate-200">{paper.scores.importanceScore}</strong></span>
            </div>

            {/* Final Intelligence Score Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-[#c4a484]/40">
              <span className="text-[10px] text-slate-400 font-sans">Score</span>
              <span className="text-sm font-serif font-bold text-[#c4a484]">{paper.scores.finalScore}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2
          onClick={() => onSelect(paper)}
          className="text-base sm:text-lg font-serif text-white group-hover:text-[#c4a484] transition-colors leading-snug mb-2 cursor-pointer font-medium"
        >
          {paper.title}
        </h2>

        {/* Authors, Journal, Date */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mb-3 font-sans">
          <span className="font-medium text-slate-300">
            {paper.authors.length > 0
              ? `${paper.authors[0].name}${paper.authors.length > 1 ? ` et al. (${paper.authors.length})` : ''}`
              : 'Authors Unspecified'}
          </span>
          <span>•</span>
          <span className="italic text-slate-300">{paper.journal}</span>
          <span>•</span>
          <span className="font-mono text-[11px] text-slate-400">{paper.publicationDate}</span>
          {paper.citationCount > 0 && (
            <>
              <span>•</span>
              <span className="font-mono text-[11px] text-slate-400">{paper.citationCount} Citations</span>
            </>
          )}
        </div>

        {/* Direct Database & Verification Links Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-3 bg-[#0a0a0a] border border-white/5 rounded-xl p-2 text-[11px] font-sans">
          <span className="text-slate-400 font-medium">Verify:</span>
          
          {/* Direct Search in PubMed */}
          <a
            href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(paper.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#c4a484]/15 hover:bg-[#c4a484]/30 border border-[#c4a484]/30 text-[#c4a484] font-medium transition-all"
            title="Search PubMed directly"
          >
            <span>PubMed Live</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Direct PMID Link */}
          {paper.pmid && (
            <a
              href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-mono text-[10px] transition-all"
              title={`Open official record PMID ${paper.pmid}`}
            >
              <span>PMID: {paper.pmid}</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>
          )}

          {/* Direct DOI Link */}
          {paper.doi && (
            <a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-mono text-[10px] transition-all"
              title={`Open DOI: ${paper.doi}`}
            >
              <span>DOI</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>
          )}

          {/* Google Scholar Search */}
          <a
            href={`https://scholar.google.com/scholar?q=${encodeURIComponent(paper.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 text-[10px] transition-all"
            title="Search Google Scholar"
          >
            <span>Google Scholar</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

        {/* Abstract Snippet */}
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4 font-sans">
          {paper.abstract}
        </p>

        {/* Dynamic Discovered Entities Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {/* Genes */}
          {paper.entities.genes.slice(0, 4).map((gene) => (
            <button
              key={gene}
              onClick={() => onSelectEntity('genes', gene)}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 transition-all flex items-center gap-1 cursor-pointer"
              title={`Filter by gene: ${gene}`}
            >
              <Dna className="w-2.5 h-2.5" />
              <span>{gene}</span>
            </button>
          ))}

          {/* Drugs / Therapies */}
          {paper.entities.drugs.slice(0, 3).map((drug) => (
            <button
              key={drug}
              onClick={() => onSelectEntity('drugs', drug)}
              className="text-[10px] font-sans px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 transition-all cursor-pointer"
              title={`Filter by therapy: ${drug}`}
            >
              {drug}
            </button>
          ))}

          {/* Pathways */}
          {paper.entities.pathways.slice(0, 2).map((pathway) => (
            <button
              key={pathway}
              onClick={() => onSelectEntity('pathways', pathway)}
              className="text-[10px] font-sans px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition-all cursor-pointer"
              title={`Filter by pathway: ${pathway}`}
            >
              {pathway}
            </button>
          ))}

          {/* Biomarkers */}
          {paper.entities.biomarkers.slice(0, 2).map((biomarker) => (
            <button
              key={biomarker}
              onClick={() => onSelectEntity('biomarkers', biomarker)}
              className="text-[10px] font-sans px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
              title={`Filter by biomarker: ${biomarker}`}
            >
              {biomarker}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-2">
        {/* Left Action: View AI Summary / Brief & Social Post Generator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelect(paper)}
            className="flex items-center gap-1.5 text-xs text-[#c4a484] hover:text-white font-medium transition-colors cursor-pointer group/btn"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#c4a484]" />
            <span>{paper.isAiSummarized ? 'View AI Brief & Evidence' : 'Analyze & Summarize'}</span>
          </button>

          {onOpenSocial && (
            <button
              onClick={() => onOpenSocial(paper)}
              className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#c4a484] font-sans transition-colors cursor-pointer"
              title="Generate LinkedIn & Social Post"
            >
              <Share2 className="w-3 h-3 text-[#c4a484]" />
              <span>Post Generator</span>
            </button>
          )}
        </div>

        {/* Right Action Icons: Bookmark, Read, Feedback, Link */}
        <div className="flex items-center gap-1">
          {/* Social Post Trigger Mobile */}
          {onOpenSocial && (
            <button
              onClick={() => onOpenSocial(paper)}
              className="sm:hidden p-1.5 rounded text-slate-400 hover:text-[#c4a484] hover:bg-white/10 transition-all cursor-pointer"
              title="Generate LinkedIn & Social Post"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Feedback thumbs up */}
          <button
            onClick={() => onFeedback(paper.id, 'up')}
            className={`p-1.5 rounded hover:bg-white/10 transition-all cursor-pointer ${
              paper.feedback === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Relevant to my research"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>

          {/* Feedback thumbs down */}
          <button
            onClick={() => onFeedback(paper.id, 'down')}
            className={`p-1.5 rounded hover:bg-white/10 transition-all cursor-pointer ${
              paper.feedback === 'down' ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Not relevant"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>

          {/* Mark Read */}
          <button
            onClick={() => onToggleRead(paper.id)}
            className={`p-1.5 rounded hover:bg-white/10 transition-all cursor-pointer ${
              paper.isRead ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={paper.isRead ? 'Mark as Unread' : 'Mark as Read'}
          >
            <CheckCircle className="w-3.5 h-3.5" />
          </button>

          {/* Bookmark */}
          <button
            onClick={() => onToggleSave(paper.id)}
            className={`p-1.5 rounded hover:bg-white/10 transition-all cursor-pointer ${
              paper.isSaved ? 'text-[#c4a484] bg-[#c4a484]/15' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={paper.isSaved ? 'Remove from Saved' : 'Save to Favorites'}
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>

          {/* External Publisher / PubMed Link */}
          {(paper.fullTextUrl || paper.doi || paper.pmid) && (
            <a
              href={paper.fullTextUrl || (paper.doi ? `https://doi.org/${paper.doi}` : `https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Open Article in PubMed / DOI"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
};
