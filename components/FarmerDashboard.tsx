
import React from 'react';
import { UserProfile, BioMaterialListing, Conversation } from '../types';
import { UI_STRINGS } from '../constants';

interface FarmerDashboardProps {
  profile: UserProfile;
  onNavigate: (tab: string) => void;
  onPostListing: (listing: Partial<BioMaterialListing>) => void;
  isListingMode?: boolean;
  conversations?: Conversation[];
}

const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ 
  profile, 
  onNavigate, 
  onPostListing, 
  isListingMode,
  conversations = []
}) => {
  const strings = UI_STRINGS[profile.language];
  const [material, setMaterial] = React.useState('');
  const [qty, setQty] = React.useState('');

  const activeRequests = conversations.filter(c => c.farmerName === profile.name);

  if (isListingMode) {
    return (
      <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
        <button onClick={() => onNavigate('home')} className="mb-6 flex items-center gap-2 text-emerald-700 dark:text-emerald-500 font-bold text-xs uppercase tracking-widest">
          <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
        </button>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors duration-300">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">List Bio-Waste</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Contribute to sustainable research and earn insights into your soil and waste value.</p>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Waste Type</label>
              <input 
                type="text" placeholder="e.g. Rice Straw, Dung, Urine"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-slate-100 transition-colors"
                value={material} onChange={e => setMaterial(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Quantity (KG)</label>
              <input 
                type="number" placeholder="Approx kg"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-slate-100 transition-colors"
                value={qty} onChange={e => setQty(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { 
                if(!material || !qty) return;
                onPostListing({materialName: material, quantity: Number(qty)}); 
                setMaterial(''); setQty(''); 
                onNavigate('home'); 
                alert("Listed successfully! Researchers will contact you soon on AniGuard AI."); 
              }}
              className="w-full bg-emerald-700 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-emerald-900/20 hover:bg-emerald-800 transition-all"
            >
              Post to Network
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="bg-emerald-900 dark:bg-emerald-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden professional-shadow transition-colors duration-300">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2">Institutional Dashboard</p>
          <h2 className="text-3xl font-black tracking-tight">{strings.welcome}, {profile.name}</h2>
          <p className="text-emerald-100/60 text-sm mt-2 max-w-md font-medium">Manage your livestock health and collaborate with local scientists on AniGuard AI.</p>
        </div>
        <i className="fa-solid fa-cow absolute -right-8 -bottom-8 text-white/5 text-[150px] pointer-events-none rotate-12"></i>
      </section>

      {/* Modular Tile Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AppTile 
          onClick={() => onNavigate('health')}
          icon="fa-stethoscope"
          color="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
          title={strings.health}
          desc={strings.healthDesc}
        />
        <AppTile 
          onClick={() => onNavigate('finance')}
          icon="fa-wallet"
          color="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
          title={strings.finance}
          desc={strings.financeDesc}
        />
        <AppTile 
          onClick={() => onNavigate('radar')}
          icon="fa-tower-broadcast"
          color="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          title={strings.radar}
          desc={strings.reportOutbreakDesc}
          badge={activeRequests.length > 0 ? activeRequests.length : null}
        />
        <AppTile 
          onClick={() => onNavigate('listing')}
          icon="fa-share-nodes"
          color="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
          title={strings.wasteHub}
          desc={strings.wasteDesc}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Researcher Requests Activity */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 professional-shadow transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-flask-vial text-emerald-600"></i>
              {strings.activeRequests}
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full uppercase tracking-widest">
              {activeRequests.length} Active
            </span>
          </div>
          
          <div className="space-y-3">
            {activeRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                No active requests. List materials to begin.
              </div>
            ) : (
              activeRequests.slice(0, 3).map(req => (
                <div key={req.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-emerald-600 text-xs">
                      <i className="fa-solid fa-user-graduate"></i>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase leading-none">{req.researcherName}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Studying {req.listingName}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onNavigate('messages')}
                    className="px-4 py-2 bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-800 transition shadow-sm"
                  >
                    Reply
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Community Success */}
        <button 
          onClick={() => onNavigate('stories')}
          className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl text-left group"
        >
          <div className="relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-4">Community Impact</h3>
            <p className="text-xl font-black mb-2">Farmer Success Stories</p>
            <p className="text-sm text-indigo-100/60 font-medium max-w-[200px]">Read how AniGuard is helping save cattle across India.</p>
            <div className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all">
              View Stories <i className="fa-solid fa-arrow-right"></i>
            </div>
          </div>
          <i className="fa-solid fa-bullhorn absolute -right-6 -bottom-6 text-white/5 text-[140px] pointer-events-none group-hover:scale-110 transition-transform"></i>
        </button>
      </div>

      {/* Voice Promo - Reused but simplified */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <i className="fa-solid fa-microphone-lines text-xl"></i>
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-tight">Need Help?</h4>
            <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Ask AniGuard AI using your voice</p>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('chat')}
          className="px-6 py-2 bg-white text-emerald-700 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
        >
          Speak Now
        </button>
      </div>
    </div>
  );
};

const AppTile = ({ onClick, icon, color, title, desc, badge }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-start p-6 rounded-[2rem] text-left transition-all hover:scale-[1.02] active:scale-95 professional-shadow border border-slate-100 dark:border-slate-800 h-48 justify-between relative overflow-hidden ${color}`}
  >
    <i className={`fa-solid ${icon} text-3xl`}></i>
    {badge && (
      <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full animate-bounce shadow-lg">
        {badge}
      </div>
    )}
    <div>
      <h3 className="font-black text-sm uppercase tracking-tight leading-tight">{title}</h3>
      <p className="text-[10px] opacity-70 font-bold uppercase tracking-wider mt-1 leading-tight">{desc}</p>
    </div>
  </button>
);

export default FarmerDashboard;
