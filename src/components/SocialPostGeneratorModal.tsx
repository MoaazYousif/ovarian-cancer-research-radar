import React, { useState, useEffect } from 'react';
import { Paper } from '../types/paper';
import { generateSocialPosts, SocialPostsResult } from '../services/ai/postGenerator';
import { Share2, X, Copy, Check, Sparkles, RefreshCw, BookOpen } from 'lucide-react';

interface SocialPostGeneratorModalProps {
  paper: Paper | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SocialPostGeneratorModal: React.FC<SocialPostGeneratorModalProps> = ({
  paper,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !paper) return null;

  const [activeTab, setActiveTab] = useState<'facebook' | 'linkedin'>('facebook');
  const [posts, setPosts] = useState<SocialPostsResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [facebookText, setFacebookText] = useState('');
  const [linkedinText, setLinkedinText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [paper.id]);

  const loadPosts = async () => {
    setIsGenerating(true);
    try {
      const result = await generateSocialPosts(paper);
      setPosts(result);
      setFacebookText(result.facebookPost);
      setLinkedinText(result.linkedinPost);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentText = activeTab === 'facebook' ? facebookText : linkedinText;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto" dir="ltr">
      <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/5 bg-[#111111] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c4a484]/20 via-white/5 to-transparent border border-[#c4a484]/30 flex items-center justify-center text-[#c4a484]">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-serif uppercase tracking-[0.15em] text-white font-semibold">
                  AI Social Post Generator
                </h2>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#c4a484]/15 text-[#c4a484] border border-[#c4a484]/30">
                  Customized Facebook & LinkedIn Formats
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-lg font-serif">
                {paper.title}
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

        {/* Platform Selector Tabs */}
        <div className="px-6 pt-4 bg-[#111111] border-b border-white/5 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('facebook')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-mono font-semibold flex items-center gap-2 border-t border-x transition-all cursor-pointer ${
                activeTab === 'facebook'
                  ? 'bg-[#0e0e0e] text-[#c4a484] border-white/10 border-b-[#0e0e0e]'
                  : 'bg-white/[0.02] text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Facebook Template</span>
            </button>

            <button
              onClick={() => setActiveTab('linkedin')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-mono font-semibold flex items-center gap-2 border-t border-x transition-all cursor-pointer ${
                activeTab === 'linkedin'
                  ? 'bg-[#0e0e0e] text-[#c4a484] border-white/10 border-b-[#0e0e0e]'
                  : 'bg-white/[0.02] text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>LinkedIn Professional Template</span>
            </button>
          </div>

          <button
            onClick={loadPosts}
            disabled={isGenerating}
            className="text-xs font-mono text-slate-400 hover:text-[#c4a484] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating...' : 'Regenerate'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isGenerating ? (
            <div className="py-16 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-[#c4a484] animate-pulse mx-auto" />
              <p className="text-sm font-serif text-white">Drafting scientific social post...</p>
              <p className="text-xs text-slate-400 font-mono">
                Extracting key findings, clinical translational insight, and limitations
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Guidance Banner */}
              <div className="bg-[#141414] border border-white/5 rounded-xl p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#c4a484]" />
                  <span className="text-slate-300">
                    {activeTab === 'facebook'
                      ? 'Engaging narrative format with clear translational context and discussion call-to-action.'
                      : 'Professional LinkedIn briefing geared towards oncologists, researchers, and biotech professionals.'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {currentText.length} characters
                </span>
              </div>

              {/* Editable Text Area */}
              <div className="relative">
                <textarea
                  rows={14}
                  value={activeTab === 'facebook' ? facebookText : linkedinText}
                  onChange={(e) => {
                    if (activeTab === 'facebook') setFacebookText(e.target.value);
                    else setLinkedinText(e.target.value);
                  }}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 text-sm text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-[#c4a484] focus:ring-1 focus:ring-[#c4a484]/30 resize-none font-normal"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-[#111111] flex justify-between items-center text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleCopy(currentText)}
              className="px-6 py-2.5 rounded-xl bg-[#c4a484] text-slate-950 font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer font-sans"
            >
              {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Post'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
