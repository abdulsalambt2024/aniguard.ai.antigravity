
import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, BioMaterialListing, Coordinates } from '../types';
import { calculateDistance, getCurrentLocation } from '../services/locationService';
import { UI_STRINGS } from '../constants';

interface ResearcherDashboardProps {
  profile: UserProfile;
  listings: BioMaterialListing[];
}

const ResearcherDashboard: React.FC<ResearcherDashboardProps> = ({ profile, listings }) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'archives' | 'feedback'>('directory');
  const [search, setSearch] = useState('');
  const strings = UI_STRINGS[profile.language] || UI_STRINGS.en;

  const caseStudies = [
    { id: 1, title: "Rice Husk as Fertilizer", region: "Punjab", impact: "+12% Yield" },
    { id: 2, title: "Lumpy Virus Containment", region: "Maharashtra", impact: "Zero Local Deaths" },
    { id: 3, title: "Dairy Waste to Bio-Gas", region: "Karnataka", impact: "Self-Sustaining Energy" }
  ];

  const filtered = useMemo(() => {
    return listings.filter(l => l.materialName.toLowerCase().includes(search.toLowerCase()));
  }, [listings, search]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-4">
      {/* Hero */}
      <section className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden professional-shadow transition-colors duration-300">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-2">Institutional Console</p>
            <h2 className="text-3xl font-black tracking-tight">Research & Study Hub</h2>
            <p className="text-slate-400 text-sm mt-1 max-w-sm">Accessing verified farm resources and peer-reviewed case studies.</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/5 backdrop-blur-md">
              <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Active Index</span>
              <span className="text-xl font-black text-white">{listings.length} Farms</span>
            </div>
            <div className="bg-emerald-600/20 px-4 py-3 rounded-2xl border border-emerald-500/30 backdrop-blur-md">
              <span className="text-[10px] font-black text-emerald-500 uppercase block mb-1">Resources</span>
              <span className="text-xl font-black text-white">400+ Units</span>
            </div>
          </div>
        </div>
        <i className="fa-solid fa-graduation-cap absolute -right-8 -bottom-8 text-white/5 text-[150px] pointer-events-none -rotate-12"></i>
      </section>

      {/* Segmented Control */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl max-w-lg overflow-x-auto no-scrollbar transition-colors duration-300">
        <button onClick={() => setActiveTab('directory')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'directory' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Material Index</button>
        <button onClick={() => setActiveTab('archives')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'archives' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Study Archives</button>
        <button onClick={() => setActiveTab('feedback')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'feedback' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Collaboration</button>
      </div>

      {activeTab === 'directory' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <input 
            type="text" placeholder="Filter resource index..."
            className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-100 transition-colors"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(l => (
              <div key={l.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-slate-100 uppercase text-xs tracking-tight group-hover:text-emerald-700 transition">{l.materialName}</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{l.region}</p>
                  </div>
                  <p className="text-lg font-black text-slate-900 dark:text-slate-100">{l.quantity}kg</p>
                </div>
                <button className="w-full text-[9px] font-black text-emerald-700 dark:text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-3 py-2 rounded-xl">Contact for Validation</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'archives' && (
        <div className="grid md:grid-cols-3 gap-6 animate-in slide-in-from-right-4 duration-300">
           {caseStudies.map(study => (
             <div key={study.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 professional-shadow hover:scale-105 transition-all">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                   <i className="fa-solid fa-book-open"></i>
                </div>
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-tight">{study.title}</h4>
                <div className="flex justify-between items-center mt-6">
                   <span className="text-[10px] font-bold text-slate-400 uppercase">{study.region}</span>
                   <span className="text-[10px] font-black text-emerald-600 uppercase">{study.impact}</span>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default ResearcherDashboard;
