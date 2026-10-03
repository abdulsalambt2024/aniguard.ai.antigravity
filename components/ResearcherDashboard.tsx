
import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, BioMaterialListing, Coordinates } from '../types';
import { calculateDistance, getCurrentLocation } from '../services/locationService';
import { UI_STRINGS } from '../constants';

interface ResearcherDashboardProps {
  profile: UserProfile;
  listings: BioMaterialListing[];
}

const ResearcherDashboard: React.FC<ResearcherDashboardProps> = ({ profile, listings }) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'guidelines' | 'feedback'>('directory');
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [search, setSearch] = useState('');
  const [rating, setRating] = useState(0);
  const [suggestion, setSuggestion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const strings = UI_STRINGS[profile.language];

  useEffect(() => { handleDetectLocation(); }, []);

  const handleDetectLocation = async () => {
    try {
      const coords = await getCurrentLocation();
      setUserCoords(coords);
    } catch (e) {}
  };

  const filtered = useMemo(() => {
    return listings.filter(l => l.materialName.toLowerCase().includes(search.toLowerCase()));
  }, [listings, search]);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to a backend
    console.log({ rating, suggestion });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setSuggestion('');
    }, 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-4">
      {/* Hero */}
      <section className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden professional-shadow transition-colors duration-300">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Research Portal</p>
            <h2 className="text-3xl font-black tracking-tight">Institutional Hub</h2>
            <p className="text-slate-400 text-sm mt-1 max-w-sm">Cross-referencing verified farm resources for academic validation.</p>
          </div>
          <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/5 backdrop-blur-md">
            <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Index count</span>
            <span className="text-2xl font-black text-white">{listings.length} Farms</span>
          </div>
        </div>
      </section>

      {/* Segmented Control */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl max-w-md overflow-x-auto no-scrollbar transition-colors duration-300">
        <button 
          onClick={() => setActiveTab('directory')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'directory' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
          {strings.research}
        </button>
        <button 
          onClick={() => setActiveTab('guidelines')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'guidelines' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
          {strings.guidelines}
        </button>
        <button 
          onClick={() => setActiveTab('feedback')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'feedback' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
          {strings.feedback}
        </button>
      </div>

      {activeTab === 'directory' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" placeholder="Search material type..."
              className="flex-1 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-sm outline-none focus:ring-2 focus:ring-slate-900/10 dark:text-slate-100 transition-colors"
              value={search} onChange={e => setSearch(e.target.value)}
            />
            <button onClick={handleDetectLocation} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              <i className="fa-solid fa-location-crosshairs"></i>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(l => (
              <div key={l.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-slate-100 uppercase text-xs tracking-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-500 transition">{l.materialName}</h4>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">{l.region}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900 dark:text-slate-100">{l.quantity}kg</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{l.farmerName}</span>
                  <button className="text-[10px] font-black text-emerald-700 dark:text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-lg">Express Interest</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'guidelines' && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-6 transition-colors duration-300 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-4 text-slate-900 dark:text-slate-100 mb-4">
            <i className="fa-solid fa-shield-halved text-2xl"></i>
            <h3 className="text-xl font-black uppercase tracking-tight">Institutional Guidelines</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
            Strict adherence to the institutional safety protocols is mandatory for all field visits. Researchers must verify farmer identity before conducting pilot studies.
          </p>
          <div className="grid gap-3">
             <GuidelineItem icon="fa-lock" title="Data Privacy" desc="Farmer contact info is end-to-end encrypted." />
             <GuidelineItem icon="fa-vial" title="Sample Handling" desc="Follow bio-safety level 1 protocols." />
             <GuidelineItem icon="fa-gavel" title="Compliance" desc="Adhere to local agriculture council norms." />
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-6 max-w-2xl mx-auto transition-colors duration-300 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-4 text-slate-900 dark:text-slate-100 mb-4">
            <i className="fa-solid fa-comments text-2xl text-emerald-600 dark:text-emerald-500"></i>
            <h3 className="text-xl font-black uppercase tracking-tight">{strings.feedback}</h3>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800 text-center animate-in zoom-in duration-300">
              <i className="fa-solid fa-circle-check text-4xl text-emerald-600 dark:text-emerald-500 mb-4"></i>
              <p className="text-emerald-900 dark:text-emerald-100 font-bold">{strings.thankYou}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitFeedback} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{strings.rateExperience}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`w-12 h-12 rounded-xl text-xl transition-all ${rating >= star ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-500 dark:text-amber-400 shadow-sm scale-110' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600'}`}
                    >
                      <i className={`fa-solid fa-star`}></i>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{strings.suggestions}</label>
                <textarea
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 text-sm h-32 outline-none resize-none dark:text-slate-100 transition-colors"
                  placeholder="Tell us how we can improve..."
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={rating === 0}
                className="w-full bg-emerald-700 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-emerald-900/20 disabled:opacity-50 transition-all hover:bg-emerald-800"
              >
                {strings.submit}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

const GuidelineItem = ({ icon, title, desc }: any) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors">
    <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 shadow-sm">
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <div>
      <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">{title}</p>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{desc}</p>
    </div>
  </div>
);

export default ResearcherDashboard;
