import React, { useState } from 'react';
import { UserProfile } from '../types/profile';
import { Paper } from '../types/paper';
import { runIngestionPipeline, PipelineExecutionReport } from '../services/ingestion/pipeline';
import {
  Database,
  X,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';

interface NcbiLiveIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  existingPapers: Paper[];
  onPapersIngested: (papers: Paper[]) => void;
}

export const NcbiLiveIntegrationModal: React.FC<NcbiLiveIntegrationModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  existingPapers,
  onPapersIngested,
}) => {
  if (!isOpen) return null;

  const [apiKey, setApiKey] = useState(userProfile.ncbiApiKey || '');
  const [email, setEmail] = useState(userProfile.ncbiEmail || userProfile.email || 'researcher@example.org');
  const [searchQuery, setSearchQuery] = useState(
    '(ovarian cancer[Title/Abstract]) AND (HGSOC OR "high-grade serous" OR "platinum resistance" OR "CCNE1" OR "FOLR1") AND (2025:2026[Date - Publication])'
  );
  const [limit, setLimit] = useState(15);
  const [dateRangeDays, setDateRangeDays] = useState(60);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  // Ingestion State
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [report, setReport] = useState<PipelineExecutionReport | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveCredentials = () => {
    const updated = {
      ...userProfile,
      ncbiApiKey: apiKey.trim(),
      ncbiEmail: email.trim(),
    };
    onSaveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const url = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi');
      url.searchParams.set('db', 'pubmed');
      url.searchParams.set('term', 'ovarian cancer');
      url.searchParams.set('retmode', 'json');
      url.searchParams.set('retmax', '3');
      url.searchParams.set('tool', 'OvarianCancerResearchRadar');
      if (apiKey.trim()) url.searchParams.set('api_key', apiKey.trim());
      if (email.trim()) url.searchParams.set('email', email.trim());

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`NCBI HTTP error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      const count = Number(data?.esearchresult?.count || 0);

      setTestResult({
        success: true,
        message: `Successfully connected to NCBI E-Utilities API! Verified PubMed database access (${count.toLocaleString()} ovarian cancer records indexed).`,
        count,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Connection test failed: ${err?.message || 'Check your internet connection and API credentials.'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunLiveFetch = async () => {
    setIsRunningPipeline(true);
    setReport(null);
    setProgressStatus('Initiating connection to NCBI E-Utilities...');
    setProgressPercent(10);

    try {
      const result = await runIngestionPipeline(
        searchQuery,
        dateRangeDays,
        limit,
        existingPapers,
        {
          ...userProfile,
          ncbiApiKey: apiKey.trim(),
          ncbiEmail: email.trim(),
        },
        (status, percent) => {
          setProgressStatus(status);
          setProgressPercent(percent);
        }
      );

      setReport(result);
      if (result.newPapers.length > 0) {
        onPapersIngested(result.newPapers);
      }
    } catch (err: any) {
      console.error(err);
      setProgressStatus(`Error during ingestion: ${err?.message}`);
    } finally {
      setIsRunningPipeline(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto" dir="ltr">
      <div className="bg-[#0e0e0e] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/5 bg-[#111111] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-serif text-white font-semibold">
                  NCBI / PubMed Live Integration & Settings
                </h2>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  E-Utilities Official API
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Fetch and verify live literature with authentic PMIDs and DOIs directly from PubMed
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: NCBI Account Credentials & API Key */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#c4a484]" />
                <h3 className="text-xs font-serif uppercase tracking-wider text-white font-bold">
                  NCBI / MyNCBI Credentials
                </h3>
              </div>
              <a
                href="https://www.ncbi.nlm.nih.gov/account/settings/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#c4a484] hover:underline flex items-center gap-1 font-mono"
              >
                <span>Get NCBI API Key (Free)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-mono">
                  NCBI API Key (Optional - unlocks 10 req/sec limit):
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="e.g. a1b2c3d4e5f6..."
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#c4a484] font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-mono">
                  Registered NCBI Contact Email:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="researcher@university.edu"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#c4a484] font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 font-mono flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testing Connection...' : 'Test NCBI Connection'}</span>
                </button>

                <button
                  onClick={handleSaveCredentials}
                  className="px-4 py-2 rounded-xl bg-[#c4a484] text-slate-950 font-bold text-xs font-mono hover:opacity-90 transition-all cursor-pointer"
                >
                  {savedSuccess ? 'Credentials Saved!' : 'Save Credentials'}
                </button>
              </div>

              {testResult && (
                <div
                  className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-2 font-mono ${
                    testResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Live PubMed Search & Direct Indexing */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#c4a484]" />
                <h3 className="text-xs font-serif uppercase tracking-wider text-white font-bold">
                  On-Demand Ingestion from PubMed
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                NCBI Entrez Query
              </span>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-mono">
                PubMed Boolean Query String:
              </label>
              <textarea
                rows={2}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#c4a484] font-mono leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-mono">
                  Max Literature Fetch Limit:
                </label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c4a484] font-mono cursor-pointer"
                >
                  <option value={10}>10 Papers</option>
                  <option value={20}>20 Papers</option>
                  <option value={50}>50 Papers</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-mono">
                  Publication Timeframe:
                </label>
                <select
                  value={dateRangeDays}
                  onChange={(e) => setDateRangeDays(Number(e.target.value))}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c4a484] font-mono cursor-pointer"
                >
                  <option value={30}>Last 30 Days</option>
                  <option value={90}>Last 90 Days</option>
                  <option value={180}>Last 6 Months</option>
                  <option value={365}>Past 1 Year (2025-2026)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleRunLiveFetch}
                disabled={isRunningPipeline}
                className="px-6 py-2.5 rounded-xl bg-[#c4a484] text-slate-950 font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer font-sans disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRunningPipeline ? 'animate-spin' : ''}`} />
                <span>{isRunningPipeline ? 'Fetching & Classifying...' : 'Start Live Ingestion'}</span>
              </button>
            </div>

            {/* Pipeline Execution Status */}
            {isRunningPipeline && (
              <div className="bg-[#0a0a0a] border border-[#c4a484]/30 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-[#c4a484]">{progressStatus}</span>
                  <span className="text-white font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#c4a484] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Ingestion Report */}
            {report && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-serif font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ingestion Completed Successfully!</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-center">
                  <div className="bg-white/5 rounded-xl p-2">
                    <span className="text-slate-400 block text-[10px]">Retrieved from PubMed</span>
                    <span className="text-white font-bold">{report.papersRetrieved}</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2">
                    <span className="text-slate-400 block text-[10px]">Ovarian Cancer Relevant</span>
                    <span className="text-emerald-400 font-bold">{report.relevantPapersKept}</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2">
                    <span className="text-slate-400 block text-[10px]">HGSOC Specific</span>
                    <span className="text-[#c4a484] font-bold">{report.hgsocCount}</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2">
                    <span className="text-slate-400 block text-[10px]">Summaries Built</span>
                    <span className="text-sky-400 font-bold">{report.summariesGenerated}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-[#111111] flex justify-between items-center text-xs">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>All literature is fetched live from official NCBI Entrez and Europe PMC portals.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 cursor-pointer transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
