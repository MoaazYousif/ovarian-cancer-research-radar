import React, { useState } from 'react';
import { Paper } from '../types/paper';
import { performHybridSearch, SearchResult } from '../services/embeddings/semanticEngine';
import { Search, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { PaperCard } from './PaperCard';

interface SemanticSearchTabProps {
  papers: Paper[];
  onSelectPaper: (paper: Paper) => void;
  onToggleSave: (paperId: string) => void;
  onToggleRead: (paperId: string) => void;
  onFeedback: (paperId: string, feedback: 'up' | 'down') => void;
  onSelectEntity: (type: 'genes' | 'drugs' | 'pathways' | 'biomarkers' | 'technologies', name: string) => void;
}

const EXAMPLE_QUERIES = [
  'Spatial transcriptomics and CAF microenvironment in HGSOC',
  'CCNE1 amplification and synthetic lethality with CDK2 and ATR',
  'ADCs targeting FOLR1 and Claudin-6 in platinum-resistant disease',
  'ctDNA liquid biopsy detection of secondary BRCA1 reversion mutations',
  'ARID1A synthetic lethality and EZH2 inhibition in clear cell ovarian cancer',
  'Mismatch repair deficiency dMMR and anti-PD-1 response in endometrioid tumors',
];

export const SemanticSearchTab: React.FC<SemanticSearchTabProps> = ({
  papers,
  onSelectPaper,
  onToggleSave,
  onToggleRead,
  onFeedback,
  onSelectEntity,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    const res = performHybridSearch(searchQuery, papers, 10);
    setResults(res);
    setHasSearched(true);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  return (
    <div className="space-y-8" dir="ltr">
      {/* Search Header Banner */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-[#c4a484]" />
            <h2 className="text-xl font-serif text-white font-bold">
              Hybrid Dense Vector & Semantic Search Engine
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-sans">
            Combines high-dimensional dense vector embeddings with exact lexical keyword matching and biological target ontologies.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="space-y-2 font-sans">
          <div className="relative font-sans">
            <Search className="w-5 h-5 text-[#c4a484] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask a scientific question or hypothesis (e.g. How does CCNE1 amplification overcome PARP inhibitor sensitivity?)..."
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl pl-12 pr-64 py-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#c4a484] focus:ring-1 focus:ring-[#c4a484]/40"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query || 'ovarian cancer high grade serous')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-slate-200 hover:text-white text-xs font-sans flex items-center gap-1.5 transition-all cursor-pointer"
                title="Search this query on NCBI PubMed directly"
              >
                <span>PubMed</span>
                <ExternalLink className="w-3 h-3 text-[#c4a484]" />
              </a>

              <button
                onClick={() => handleSearch(query)}
                className="px-5 py-2 rounded-xl bg-[#c4a484] text-slate-950 font-bold text-xs hover:opacity-90 transition-all cursor-pointer font-sans"
              >
                Semantic Search
              </button>
            </div>
          </div>
        </div>

        {/* Suggested Query Chips */}
        <div>
          <span className="text-xs text-slate-400 font-sans font-bold block mb-2">
            Suggested Hypotheses & Clinical Queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((eq, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(eq);
                  handleSearch(eq);
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-slate-300 hover:text-white hover:border-[#c4a484]/40 hover:bg-white/10 transition-all cursor-pointer text-left flex items-center gap-1.5 font-sans"
              >
                <span>{eq}</span>
                <ArrowRight className="w-3 h-3 text-[#c4a484] opacity-50" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results Display */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1 font-sans">
            <h3 className="text-sm font-serif font-bold text-white">
              Semantic Match Results ({results.length})
            </h3>
            <span className="text-xs text-slate-400 font-sans">
              Ranked by hybrid cosine vector & lexical similarity
            </span>
          </div>

          {results.length === 0 ? (
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-12 text-center text-slate-400 font-sans">
              No papers found matching "{query}". Try broader biological targets, pathways, or mechanism terms.
            </div>
          ) : (
            <div className="space-y-4">
              {results.map(({ paper, similarityScore, vectorScore, keywordScore, matchedKeywords }) => (
                <div key={paper.id} className="relative">
                  {/* Similarity Badge Overlay */}
                  <div className="mb-1 flex items-center justify-between text-[11px] px-3 py-1 bg-white/[0.02] border border-white/5 rounded-t-xl text-slate-400 font-sans">
                    <span className="text-[#c4a484] font-bold">
                      Hybrid Match Score: {Math.round(similarityScore * 100)}%
                    </span>
                    <span className="font-mono">
                      Vector: {Math.round(vectorScore * 100)}% • Lexical: {Math.round(keywordScore * 100)}%
                    </span>
                    {matchedKeywords.length > 0 && (
                      <span className="hidden sm:inline text-emerald-400">
                        Matched Tokens: {matchedKeywords.slice(0, 4).join(', ')}
                      </span>
                    )}
                  </div>

                  <PaperCard
                    paper={paper}
                    onSelect={onSelectPaper}
                    onToggleSave={onToggleSave}
                    onToggleRead={onToggleRead}
                    onFeedback={onFeedback}
                    onSelectEntity={onSelectEntity}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
