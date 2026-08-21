import React, { useState } from 'react';
import { UserProfile, ScoringWeights } from '../types/profile';
import { Settings, X, Sliders, Database, ExternalLink } from 'lucide-react';
import { OvarianSubtype } from '../types/paper';

interface UserProfileModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSaveProfile,
}) => {
  if (!isOpen) return null;

  const [currentProfile, setCurrentProfile] = useState<UserProfile>({ ...profile });
  const [newInterest, setNewInterest] = useState('');
  const [newMethod, setNewMethod] = useState('');

  const handleWeightChange = (key: keyof ScoringWeights, val: number) => {
    setCurrentProfile({
      ...currentProfile,
      scoringWeights: {
        ...currentProfile.scoringWeights,
        [key]: val / 100,
      },
    });
  };

  const addInterest = () => {
    if (!newInterest.trim()) return;
    if (!currentProfile.researchInterests.includes(newInterest.trim())) {
      setCurrentProfile({
        ...currentProfile,
        researchInterests: [...currentProfile.researchInterests, newInterest.trim()],
      });
    }
    setNewInterest('');
  };

  const removeInterest = (item: string) => {
    setCurrentProfile({
      ...currentProfile,
      researchInterests: currentProfile.researchInterests.filter((i) => i !== item),
    });
  };

  const addMethod = () => {
    if (!newMethod.trim()) return;
    if (!currentProfile.methodsAndTechnologies.includes(newMethod.trim())) {
      setCurrentProfile({
        ...currentProfile,
        methodsAndTechnologies: [...currentProfile.methodsAndTechnologies, newMethod.trim()],
      });
    }
    setNewMethod('');
  };

  const removeMethod = (item: string) => {
    setCurrentProfile({
      ...currentProfile,
      methodsAndTechnologies: currentProfile.methodsAndTechnologies.filter((m) => m !== item),
    });
  };

  const handleSave = () => {
    onSaveProfile(currentProfile);
    onClose();
  };

  const w = currentProfile.scoringWeights;
  const totalPercent = Math.round((w.relevance + w.hgsoc + w.importance + w.personalization + w.novelty) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto" dir="ltr">
      <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 bg-[#111111] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c4a484]/15 border border-[#c4a484]/30 flex items-center justify-center">
              <Settings className="w-5 h-5 text-[#c4a484]" />
            </div>
            <div>
              <h2 className="text-base font-serif text-white font-bold">
                Research Profile & Scoring Weights
              </h2>
              <p className="text-xs text-[#c4a484] font-mono">
                {currentProfile.email}
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

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 0: NCBI Account & API Key Integration */}
          <div className="bg-[#141414] border border-emerald-500/20 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-serif text-white font-bold">
                  NCBI / PubMed Account Link
                </h3>
              </div>
              <a
                href="https://www.ncbi.nlm.nih.gov/account/settings/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-mono"
              >
                <span>Get NCBI API Key (Free)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-sans">
                  NCBI API Key (Optional - unlocks 10 req/sec limit):
                </label>
                <input
                  type="password"
                  value={currentProfile.ncbiApiKey || ''}
                  onChange={(e) => setCurrentProfile({ ...currentProfile, ncbiApiKey: e.target.value })}
                  placeholder="Your NCBI API key..."
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#c4a484] font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-sans">
                  NCBI Contact Email:
                </label>
                <input
                  type="email"
                  value={currentProfile.ncbiEmail || currentProfile.email || ''}
                  onChange={(e) => setCurrentProfile({ ...currentProfile, ncbiEmail: e.target.value })}
                  placeholder="researcher@example.org"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#c4a484] font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
              Enables live querying against PubMed E-Utilities with authentic DOIs and PMIDs.
            </p>
          </div>

          {/* Section 1: Primary Subtype Focus */}
          <div>
            <label className="text-xs text-slate-300 font-sans block mb-2 font-semibold">
              Primary Ovarian Cancer Histological Subtype:
            </label>
            <select
              value={currentProfile.primarySubtype}
              onChange={(e) =>
                setCurrentProfile({ ...currentProfile, primarySubtype: e.target.value as OvarianSubtype })
              }
              className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c4a484] font-sans cursor-pointer"
            >
              <option value="HGSOC">High-Grade Serous Ovarian Carcinoma (HGSOC) [Recommended]</option>
              <option value="Clear cell">Ovarian Clear Cell Carcinoma (OCCC)</option>
              <option value="Low-grade serous">Low-Grade Serous Ovarian Carcinoma (LGSOC)</option>
              <option value="Endometrioid">Endometrioid Ovarian Carcinoma (EOC)</option>
              <option value="Mucinous">Mucinous Ovarian Carcinoma (MOC)</option>
            </select>
          </div>

          {/* Section 2: 5-Factor Scoring Weights */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#c4a484] font-sans flex items-center gap-1.5 font-bold">
                <Sliders className="w-3.5 h-3.5" />
                5-Factor Scoring Weights ({totalPercent}% Total)
              </span>
              <span className="text-[10px] font-mono text-slate-400">Auto-normalized</span>
            </div>

            {/* Slider 1: Ovarian Relevance */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-sans">
                <span className="text-slate-300">Ovarian Disease Relevance Weight:</span>
                <span className="font-mono text-[#c4a484] font-bold">{Math.round(w.relevance * 100)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={Math.round(w.relevance * 100)}
                onChange={(e) => handleWeightChange('relevance', Number(e.target.value))}
                className="w-full accent-[#c4a484] bg-white/10 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 2: HGSOC Priority */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-sans">
                <span className="text-slate-300">HGSOC Specificity & Priority Weight:</span>
                <span className="font-mono text-[#c4a484] font-bold">{Math.round(w.hgsoc * 100)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={Math.round(w.hgsoc * 100)}
                onChange={(e) => handleWeightChange('hgsoc', Number(e.target.value))}
                className="w-full accent-[#c4a484] bg-white/10 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 3: Scientific Importance */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-sans">
                <span className="text-slate-300">Scientific Importance & Evidence Tier Weight:</span>
                <span className="font-mono text-[#c4a484] font-bold">{Math.round(w.importance * 100)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={Math.round(w.importance * 100)}
                onChange={(e) => handleWeightChange('importance', Number(e.target.value))}
                className="w-full accent-[#c4a484] bg-white/10 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 4: Personalization */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-sans">
                <span className="text-slate-300">Personal Research Fit Weight:</span>
                <span className="font-mono text-[#c4a484] font-bold">{Math.round(w.personalization * 100)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={Math.round(w.personalization * 100)}
                onChange={(e) => handleWeightChange('personalization', Number(e.target.value))}
                className="w-full accent-[#c4a484] bg-white/10 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 5: Novelty */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-sans">
                <span className="text-slate-300">Novelty & Publication Recency Weight:</span>
                <span className="font-mono text-[#c4a484] font-bold">{Math.round(w.novelty * 100)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={Math.round(w.novelty * 100)}
                onChange={(e) => handleWeightChange('novelty', Number(e.target.value))}
                className="w-full accent-[#c4a484] bg-white/10 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Section 3: Core Research Interests */}
          <div>
            <label className="text-xs text-slate-300 font-sans block mb-2 font-semibold">
              Biological Targets & Research Keywords:
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add target (e.g. CCNE1, Spatial Biology, ADCs, FOLR1, ctDNA)..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addInterest()}
                className="flex-1 bg-[#111111] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#c4a484] font-sans"
              />
              <button
                onClick={addInterest}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-sans cursor-pointer"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pl-1">
              {currentProfile.researchInterests.map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200 flex items-center gap-1.5 font-sans"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => removeInterest(item)}
                    className="text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Section 4: Experimental Methods */}
          <div>
            <label className="text-xs text-slate-300 font-sans block mb-2 font-semibold">
              Methodologies & Experimental Technologies:
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add methodology (e.g. 10x Visium, Mass Spectrometry, scRNA-seq, Organoids)..."
                value={newMethod}
                onChange={(e) => setNewMethod(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addMethod()}
                className="flex-1 bg-[#111111] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#c4a484] font-sans"
              />
              <button
                onClick={addMethod}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-sans cursor-pointer"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentProfile.methodsAndTechnologies.map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200 flex items-center gap-1.5 font-sans"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => removeMethod(item)}
                    className="text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-[#111111] flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer font-sans"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-[#c4a484] text-slate-950 font-bold text-xs hover:opacity-90 transition-all cursor-pointer font-sans"
          >
            Save Profile & Rescore
          </button>
        </div>
      </div>
    </div>
  );
};
