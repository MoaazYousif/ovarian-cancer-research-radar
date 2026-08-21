import React, { useState } from 'react';
import { Paper } from '../types/paper';
import { UserProfile } from '../types/profile';
import { runIngestionPipeline, PipelineExecutionReport } from '../services/ingestion/pipeline';
import { RefreshCw, X, CheckCircle2, Play, Terminal } from 'lucide-react';

interface LiveIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPapers: Paper[];
  userProfile: UserProfile;
  onPapersIngested: (newPapers: Paper[]) => void;
}

export const LiveIngestionModal: React.FC<LiveIngestionModalProps> = ({
  isOpen,
  onClose,
  existingPapers,
  userProfile,
  onPapersIngested,
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState(
    '("ovarian cancer"[Title/Abstract] OR "HGSOC"[Title/Abstract] OR "high-grade serous"[Title/Abstract])'
  );
  const [days, setDays] = useState(30);
  const [limit, setLimit] = useState(15);
  const [isRunning, setIsRunning] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<PipelineExecutionReport | null>(null);

  const handleStartIngestion = async () => {
    setIsRunning(true);
    setReport(null);
    setProgress(5);
    setStatusText('Connecting to NCBI PubMed E-Utilities API...');

    try {
      const result = await runIngestionPipeline(
        query,
        days,
        limit,
        existingPapers,
        userProfile,
        (status, prog) => {
          setStatusText(status);
          setProgress(prog);
        }
      );

      setReport(result);
      if (result.newPapers.length > 0) {
        onPapersIngested(result.newPapers);
      }
    } catch (err: any) {
      setStatusText(`Error during ingestion: ${err?.message || 'Network connection failed'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto" dir="ltr">
      <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 bg-[#111111] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c4a484]/15 border border-[#c4a484]/30 flex items-center justify-center">
              <RefreshCw className={`w-5 h-5 text-[#c4a484] ${isRunning ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h2 className="text-base font-serif text-white font-bold">
                Live NCBI PubMed Ingestion Pipeline
              </h2>
              <p className="text-xs text-[#c4a484] font-sans">
                Multi-stage bio-NLP processing, subtype classification, and entity extraction
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Query Settings Form */}
          <div className="space-y-4 font-sans">
            <div>
              <label className="text-xs text-slate-300 font-bold block mb-2">
                PubMed Boolean Search Query:
              </label>
              <textarea
                dir="ltr"
                rows={2}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isRunning}
                className="w-full bg-[#111111] border border-white/10 rounded-xl p-3 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-[#c4a484]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-2">
                  Publication Recency Window:
                </label>
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  disabled={isRunning}
                  className="w-full bg-[#111111] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#c4a484] font-sans"
                >
                  <option value={7}>Last 7 Days</option>
                  <option value={30}>Last 30 Days</option>
                  <option value={90}>Last 90 Days</option>
                  <option value={365}>Past 1 Year</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-2">
                  Maximum Articles to Fetch:
                </label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  disabled={isRunning}
                  className="w-full bg-[#111111] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#c4a484] font-sans"
                >
                  <option value={10}>10 Articles</option>
                  <option value={20}>20 Articles</option>
                  <option value={40}>40 Articles</option>
                </select>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {isRunning && (
            <div className="space-y-2 bg-[#141414] border border-white/5 rounded-xl p-4 font-sans">
              <div className="flex justify-between text-xs">
                <span className="text-[#c4a484] font-medium">{statusText}</span>
                <span className="text-white font-mono">{progress}%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#c4a484] to-[#d6ba9c] h-full transition-all duration-300 shadow-[0_0_10px_rgba(196,164,132,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Execution Report Output */}
          {report && (
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 space-y-4 font-sans">
              <div className="flex items-center gap-2 text-[#c4a484]">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-serif font-bold text-white">
                  Ingestion & Processing Complete
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-[#0a0a0a] p-2.5 rounded-lg border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 block">Total Retrieved</span>
                  <span className="text-white font-bold font-mono text-base">{report.papersRetrieved}</span>
                </div>
                <div className="bg-[#0a0a0a] p-2.5 rounded-lg border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 block">Duplicates Filtered</span>
                  <span className="text-amber-400 font-bold font-mono text-base">{report.duplicatesRemoved}</span>
                </div>
                <div className="bg-[#0a0a0a] p-2.5 rounded-lg border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 block">Relevant Kept</span>
                  <span className="text-emerald-400 font-bold font-mono text-base">{report.relevantPapersKept}</span>
                </div>
                <div className="bg-[#0a0a0a] p-2.5 rounded-lg border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 block">HGSOC Specific</span>
                  <span className="text-[#c4a484] font-bold font-mono text-base">{report.hgsocCount}</span>
                </div>
              </div>

              {/* Execution Terminal Logs */}
              <div>
                <span className="text-xs text-slate-400 font-sans block mb-1.5 flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5" />
                  Pipeline Activity Log:
                </span>
                <div dir="ltr" className="bg-[#0a0a0a] border border-white/5 rounded-xl p-3 text-[11px] font-mono text-slate-400 max-h-36 overflow-y-auto space-y-1">
                  {report.logs.map((log, i) => (
                    <div key={i} className="text-slate-300">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-[#111111] flex justify-between items-center font-sans">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handleStartIngestion}
            disabled={isRunning}
            className="px-6 py-2.5 rounded-xl bg-[#c4a484] text-slate-950 font-bold text-xs hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer font-sans"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isRunning ? 'Running Pipeline...' : 'Start Live Ingestion'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
