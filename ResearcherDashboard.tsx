
import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, BioMaterialListing, Coordinates, Conversation } from './types';
import { calculateDistance, getCurrentLocation } from './services/locationService';
import { UI_STRINGS } from './constants';

interface ResearcherDashboardProps {
  profile: UserProfile;
  listings: BioMaterialListing[];
  conversations: Conversation[];
  onStartChat: (listing: BioMaterialListing, researcherName: string) => void;
  onNavigate: (tab: string) => void;
}

const ResearcherDashboard: React.FC<ResearcherDashboardProps> = ({ 
  profile, 
  listings, 
  conversations, 
  onStartChat,
  onNavigate 
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'guidelines' | 'feedback'>('directory');
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [maxDistance, setMaxDistance] = useState<number>(1000); 
  const [minQty, setMinQty] = useState<number>(0);
  
  // Interest States
  const [expressingInterestId, setExpressingInterestId] = useState<string | null>(null);
  const [researchPurpose, setResearchPurpose] = useState('Validation Study');
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);

  // Feedback States
  const [rating, setRating] = useState(0);
  const [suggestion, setSuggestion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const strings = UI_STRINGS[profile.language];

  useEffect(() => {
    handleDetectLocation();
  }, []);

  const handleDetectLocation = async () => {
    setIsLocating(true);
    try {
      const coords = await getCurrentLocation();
      setUserCoords(coords);
    } catch (e) {
      console.warn("Location access denied or unavailable.");
    } finally {
      setIsLocating(false);
    }
  };

  const filteredListings = useMemo(() => {
    return listings
      .map(l => ({
        ...l,
        distance: userCoords ? calculateDistance(userCoords, l.coords) : undefined
      }))
      .filter(l => {
        const matchesSearch = l.materialName.toLowerCase().includes(search.toLowerCase()) || 
                             l.farmerName.toLowerCase().includes(search.toLowerCase());
        const matchesQty = l.quantity >= minQty;
        const matchesDist = !userCoords || (l.distance !== undefined && l.distance <= maxDistance);
        
        return matchesSearch && matchesQty && matchesDist;
      })
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [listings, userCoords, search, maxDistance, minQty]);

  const handleConfirmInterest = () => {
    if (!expressingInterestId) return;
    setIsSubmittingInterest(true);
    
    // Simulate API delay
    setTimeout(() => {
      const listing = listings.find(l => l.id === expressingInterestId);
      if (listing) {
        // This initiates the chat and navigates via App.tsx logic
        onStartChat(listing, profile.name);
      }
      setIsSubmittingInterest(false);
      setExpressingInterestId(null);
      setResearchPurpose('Validation Study');
    }, 1200);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setSuggestion('');
    }, 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Banner */}
      <section className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl transition-colors duration-300">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-2">Research Console</p>
            <h2 className="text-3xl font-black tracking-tight">Institutional Discovery</h2>
            <p className="text-slate-400 text-sm mt-1 max-w-sm">Accessing verified farm resources for sustainable pilot programs.</p>
          </div>
          <div className="flex gap-3">
             <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/5 backdrop-blur-md">
                <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Status</span>
                <span className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Verified
                </span>
             </div>
             <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/5 backdrop-blur-md">
                <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Index Count</span>
                <span className="text-xl font-black">{filteredListings.length} Materials</span>
             </div>
          </div>
        </div>
        <i className="fa-solid fa-microscope absolute -right-8 -bottom-8 text-white/5 text-[150px] pointer-events-none"></i>
      </section>

      {/* Tab Selection */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl max-w-lg mx-auto md:mx-0 overflow-x-auto no-scrollbar transition-colors">
        <TabButton active={activeTab === 'directory'} onClick={() => setActiveTab('directory')} icon="fa-list" label={strings.research} />
        <TabButton active={activeTab === 'guidelines'} onClick={() => setActiveTab('guidelines')} icon="fa-shield-halved" label={strings.guidelines} />
        <TabButton active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')} icon="fa-comments" label={strings.feedback} />
      </div>

      {activeTab === 'directory' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          {/* Filtering Workspace */}
          <div className="grid md:grid-cols-3 gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Resource Search</label>
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="text" 
                  placeholder="Material or Farmer Name..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-100 transition-colors"
                  value={search} onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between ml-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Max Distance</label>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">{maxDistance} KM</span>
              </div>
              <input 
                type="range" min="10" max="1000" step="10"
                className="w-full accent-emerald-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                value={maxDistance} onChange={e => setMaxDistance(Number(e.target.value))}
              />
              <div className="flex justify-between px-1 text-[8px] font-bold text-slate-400 uppercase">
                <span>10km</span>
                <span>1000km</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Min Quantity (KG)</label>
              <div className="flex gap-2">
                <input 
                  type="number" placeholder="Any"
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none dark:text-slate-100 transition-colors"
                  value={minQty || ''} onChange={e => setMinQty(Number(e.target.value))}
                />
                <button 
                  onClick={handleDetectLocation} 
                  disabled={isLocating}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-600 transition-all ${isLocating ? 'animate-pulse' : ''}`}
                  title="Update My Location"
                >
                  <i className={`fa-solid ${isLocating ? 'fa-spinner fa-spin' : 'fa-location-crosshairs'}`}></i>
                </button>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {filteredListings.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map(l => {
                const chatId = `${l.id}_${profile.name}`;
                const isContacted = conversations.some(c => c.id === chatId);
                return (
                  <div key={l.id} className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border ${isContacted ? 'border-emerald-200 dark:border-emerald-900/50' : 'border-slate-100 dark:border-slate-800'} shadow-sm hover:border-emerald-500 dark:hover:border-emerald-500 transition-all group flex flex-col justify-between h-56 relative overflow-hidden`}>
                    {isContacted && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-bl-lg uppercase tracking-widest z-10">
                        Chat Active
                      </div>
                    )}
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-black text-slate-800 dark:text-slate-100 uppercase text-xs tracking-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-500 transition">{l.materialName}</h4>
                        <p className="text-xl font-black text-slate-900 dark:text-slate-100 leading-none">{l.quantity}kg</p>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{l.region}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-50 dark:border-slate-800 mt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 text-[10px]">
                            <i className="fa-solid fa-user"></i>
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{l.farmerName}</span>
                        </div>
                        {l.distance !== undefined && (
                          <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
                            {l.distance.toFixed(1)} KM AWAY
                          </span>
                        )}
                      </div>
                      
                      {isContacted ? (
                        <button 
                          onClick={() => onStartChat(l, profile.name)}
                          className="w-full text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition shadow-lg bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <i className="fa-solid fa-comments"></i>
                          Chat with Farmer
                        </button>
                      ) : (
                        <button 
                          onClick={() => setExpressingInterestId(l.id)}
                          className="w-full text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition shadow-sm bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900 dark:hover:bg-slate-600 active:scale-95"
                        >
                          Express Interest
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 transition-colors">
              <i className="fa-solid fa-box-open text-5xl text-slate-200 dark:text-slate-800 mb-6"></i>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">No Resources Found</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">Try widening your search radius or reducing the minimum quantity.</p>
              <button 
                onClick={() => { setSearch(''); setMaxDistance(1000); setMinQty(0); }}
                className="mt-6 text-xs font-black text-emerald-700 dark:text-emerald-500 uppercase tracking-widest hover:underline"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'guidelines' && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-6 transition-colors duration-300 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-4 text-slate-900 dark:text-slate-100 mb-4">
            <i className="fa-solid fa-shield-halved text-2xl text-emerald-600"></i>
            <h3 className="text-xl font-black uppercase tracking-tight">Institutional Protocols</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
            As part of KrishiSathi's ethical research framework, all institutional researchers must adhere to these standard operating procedures.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
             <GuidelineItem icon="fa-lock" title="Data Ethics" desc="Farmer contact data must never leave your institutional server." />
             <GuidelineItem icon="fa-vial" title="Bio-Safety" desc="Only non-hazardous organic materials can be indexed for pilot studies." />
             <GuidelineItem icon="fa-handshake" title="Fair Use" desc="Farmers must be acknowledged in research publications." />
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-6 max-w-2xl mx-auto transition-colors duration-300 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-4 text-slate-900 dark:text-slate-100 mb-4">
            <i className="fa-solid fa-comments text-2xl text-emerald-600 dark:text-emerald-500"></i>
            <h3 className="text-xl font-black uppercase tracking-tight">Platform Feedback</h3>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-2xl border border-emerald-100 dark:border-emerald-800 text-center animate-in zoom-in duration-300">
              <i className="fa-solid fa-circle-check text-5xl text-emerald-600 dark:text-emerald-500 mb-4"></i>
              <p className="text-emerald-900 dark:text-emerald-100 font-black uppercase tracking-widest">{strings.thankYou}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitFeedback} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{strings.rateExperience}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star} type="button" onClick={() => setRating(star)}
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
                  placeholder="How can we make resource discovery more efficient?"
                  value={suggestion} onChange={(e) => setSuggestion(e.target.value)}
                ></textarea>
              </div>

              <button
                type="submit" disabled={rating === 0}
                className="w-full bg-emerald-700 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-emerald-900/20 disabled:opacity-50 transition-all hover:bg-emerald-800"
              >
                Submit Feedback
              </button>
            </form>
          )}
        </div>
      )}

      {/* Interest Confirmation Modal */}
      {expressingInterestId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-500 mb-4">
              <i className="fa-solid fa-vial-circle-check text-2xl"></i>
              <h3 className="text-xl font-black uppercase tracking-tight">Express Interest</h3>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Expressing interest will notify the farmer of your institutional request. Please specify the research application for this bio-material.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Research Purpose</label>
                <select 
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-slate-100 outline-none transition-colors"
                  value={researchPurpose}
                  onChange={(e) => setResearchPurpose(e.target.value)}
                >
                  <option value="Validation Study">Validation Study</option>
                  <option value="Chemical Analysis">Chemical Analysis</option>
                  <option value="Composting Pilot">Composting Pilot</option>
                  <option value="Organic Certification">Organic Certification</option>
                  <option value="Student Project">Student Project</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setExpressingInterestId(null)}
                disabled={isSubmittingInterest}
                className="flex-1 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmInterest}
                disabled={isSubmittingInterest}
                className="flex-[2] px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-emerald-700 text-white hover:bg-emerald-800 shadow-lg shadow-emerald-900/20 transition flex items-center justify-center gap-2"
              >
                {isSubmittingInterest ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Processing
                  </>
                ) : (
                  'Confirm Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 py-3 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
  >
    <i className={`fa-solid ${icon}`}></i>
    {label}
  </button>
);

const GuidelineItem = ({ icon, title, desc }: any) => (
  <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors">
    <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 shadow-sm">
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <div>
      <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest leading-none mb-1">{title}</p>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default ResearcherDashboard;
