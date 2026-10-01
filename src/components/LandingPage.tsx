import React from 'react';
import { Sparkles, Brain, Database, LineChart, ShieldAlert, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onLaunch: () => void;
}

export function LandingPage({ onLaunch }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300 font-sans selection:bg-[#c4a484]/30 selection:text-white relative overflow-hidden flex flex-col" dir="ltr">

      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#c4a484]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Navigation */}
      <header className="border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c4a484] to-[#a08262] flex items-center justify-center text-slate-950">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-serif font-bold text-white text-lg tracking-wide hidden sm:block">
              Ovarian Cancer Research Radar
            </span>
            <span className="font-serif font-bold text-white text-lg tracking-wide sm:hidden">
              OCRR
            </span>
          </div>
          <button
            onClick={onLaunch}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-all border border-white/10 flex items-center gap-2"
          >
            Enter Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-8 animate-pulse">
          <Database className="w-3.5 h-3.5" />
          <span>Live integration with NCBI PubMed</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold text-white tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
          Literature Intelligence for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c4a484] to-amber-300">
            Ovarian Cancer & HGSOC
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          A personalized research-intelligence platform that continuously monitors, classifies, ranks, and summarizes newly published scientific literature, built for researchers and clinicians.
        </p>

        <button
          onClick={onLaunch}
          className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-[#c4a484] to-[#d6b799] text-slate-950 font-bold text-lg hover:opacity-95 shadow-[0_0_40px_rgba(196,164,132,0.3)] transition-all flex items-center gap-3 transform hover:scale-105"
        >
          Launch Research Radar
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-24 text-left">
          <FeatureCard
            icon={<Brain className="w-6 h-6 text-cyan-400" />}
            title="AI-Powered Classification"
            description="Automatically determines relevance and classifies papers by molecular subtype with AI-generated summaries."
          />
          <FeatureCard
            icon={<LineChart className="w-6 h-6 text-purple-400" />}
            title="Emerging Entities Radar"
            description="Detects genes, drugs, and biomarkers trending in recent literature with momentum tracking."
          />
          <FeatureCard
            icon={<Database className="w-6 h-6 text-amber-400" />}
            title="Multi-dimensional Ranking"
            description="Scores every paper on relevance, clinical importance, novelty, and personalization."
          />
        </div>
      </main>

      {/* Disclaimer Footer */}
      <footer className="border-t border-white/5 bg-[#080808] py-8 text-center px-4 z-10 relative">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-rose-400/80 bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-sm font-bold tracking-wide">RESEARCH USE ONLY</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
            This platform is a research tool built for literature monitoring and exploration.
            It is <strong className="text-slate-400">not a medical device</strong> and should not be used for clinical decision-making, diagnosis, or treatment.
            Always consult primary sources and qualified medical professionals.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl hover:border-white/15 transition-colors">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-white font-bold text-lg mb-2 font-serif">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
