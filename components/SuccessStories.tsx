
import React, { useState, useEffect } from 'react';
import { generateFarmerStories } from '../services/geminiService';
import { UserProfile } from '../types';
import { UI_STRINGS } from '../constants';

interface SuccessStoriesProps {
  profile: UserProfile;
}

interface Story {
  farmer: string;
  location: string;
  crop: string;
  disease: string;
  story: string;
  shortSummary: string;
}

const SuccessStories: React.FC<SuccessStoriesProps> = ({ profile }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const strings = UI_STRINGS[profile.language];

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setLoading(true);
    const data = await generateFarmerStories(profile.region, profile.language);
    setStories(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">{strings.analyzing}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{strings.recipes}</h2>
        <button onClick={loadStories} className="text-[10px] font-black text-emerald-700 dark:text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg">Refresh</button>
      </div>

      <div className="grid gap-4">
        {stories.map((s, i) => (
          <button 
            key={i} 
            onClick={() => setSelectedStory(s)}
            className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 text-left professional-shadow hover:border-emerald-500 dark:hover:border-emerald-500 transition group active:scale-[0.98]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                  <i className="fa-solid fa-user-check"></i>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-none">{s.farmer}</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{s.location}</p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-emerald-700 text-white px-2 py-1 rounded-lg uppercase tracking-widest">{s.crop}</span>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 font-medium leading-relaxed italic mb-4">"{s.shortSummary}"</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.disease}</span>
              <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                {strings.readStory} <i className="fa-solid fa-arrow-right-long group-hover:translate-x-1 transition-transform"></i>
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Story Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500 max-h-[85vh] flex flex-col">
            <div className="p-8 pb-4 relative">
              <button 
                onClick={() => setSelectedStory(null)}
                className="absolute right-6 top-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
              
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 mb-2">
                <i className="fa-solid fa-quote-left"></i>
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Success Narrative</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 leading-tight">{selectedStory.farmer}'s Journey</h2>
              <div className="flex gap-2 mt-4">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase text-slate-500">{selectedStory.location}</span>
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">{selectedStory.crop}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 pt-2 no-scrollbar">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800 mb-6">
                <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-1">Challenge Overcome</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedStory.disease}</p>
              </div>
              <p className="text-sm leading-[1.8] text-slate-600 dark:text-slate-300 font-medium whitespace-pre-wrap">
                {selectedStory.story}
              </p>
            </div>

            <div className="p-8 pt-0 mt-4">
              <button 
                onClick={() => setSelectedStory(null)}
                className="w-full bg-emerald-700 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuccessStories;
