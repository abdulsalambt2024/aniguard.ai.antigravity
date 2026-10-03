
import React from 'react';
import { UI_STRINGS } from '../constants';
import { UserRole, UserProfile, AppLanguage } from '../types';

interface DashboardProps {
  profile: UserProfile;
  onNavigate: (tab: string) => void;
}

const LivestockDashboard: React.FC<DashboardProps> = ({ profile, onNavigate }) => {
  const strings = UI_STRINGS[profile.language];
  
  const outbreakZones = [
    { district: "Pune", disease: "Lumpy Skin", level: "HIGH", count: 12 },
    { district: "Nashik", disease: "FMD", level: "MEDIUM", count: 5 },
    { district: "Satara", disease: "Rabies", level: "SAFE", count: 0 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Hero Header */}
      <section className="bg-emerald-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl border border-emerald-800">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2">Animal Intelligence Portal</p>
          <h2 className="text-3xl font-black tracking-tight">{strings.welcome}, {profile.name}</h2>
          <p className="text-emerald-100/70 text-sm mt-2 max-w-md font-medium">Protect your livestock, optimize your pets' health, and maximize your farm's profit.</p>
        </div>
        <i className="fa-solid fa-cow absolute -right-8 -bottom-8 text-white/5 text-[180px] pointer-events-none -rotate-12"></i>
      </section>

      {/* Grid Menu */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MenuCard 
          icon="fa-stethoscope" title={strings.health} desc={strings.healthDesc} 
          color="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20" 
          onClick={() => onNavigate('health')} 
        />
        <MenuCard 
          icon="fa-map-location-dot" title="Vet Finder" desc="Nearby Clinics" 
          color="bg-blue-50 text-blue-700 dark:bg-blue-900/20" 
          onClick={() => onNavigate('vets')} 
        />
        <MenuCard 
          icon="fa-clapperboard" title="Video Lab" desc="Tutorial Gen" 
          color="bg-slate-900 text-white" 
          onClick={() => onNavigate('lab')} 
        />
        <MenuCard 
          icon="fa-wallet" title={strings.finance} desc={strings.financeDesc} 
          color="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20" 
          onClick={() => onNavigate('finance')} 
        />
        <MenuCard 
          icon="fa-building-columns" title={strings.schemes} desc={strings.schemesDesc} 
          color="bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-white" 
          onClick={() => onNavigate('schemes')} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outbreak Radar Preview */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 professional-shadow">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">{strings.radar}</h3>
            </div>
            <button onClick={() => onNavigate('radar')} className="text-[10px] font-bold text-emerald-600 uppercase hover:underline">View Map</button>
          </div>
          <div className="space-y-3">
            {outbreakZones.map((zone, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{zone.district}</p>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-100">{zone.disease}</p>
                </div>
                <div className={`px-2 py-1 rounded-lg text-[9px] font-black ${
                  zone.level === 'HIGH' ? 'bg-red-100 text-red-700' : 
                  zone.level === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {zone.level}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Support Glance */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl group">
           <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-200 mb-4">Native Voice Support</h3>
                <p className="text-2xl font-black mb-2">Speak directly to AniGuard AI</p>
                <p className="text-sm text-emerald-50/70 font-medium">Real-time, zero-latency voice interaction in your local dialect.</p>
              </div>
              <button 
                onClick={() => onNavigate('voice')}
                className="mt-8 px-6 py-3 bg-white text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
              >
                Start Live Conversation
              </button>
           </div>
           <i className="fa-solid fa-microphone-lines absolute -right-6 -bottom-6 text-white/5 text-[160px] pointer-events-none group-hover:scale-110 transition-transform"></i>
        </div>
      </div>
    </div>
  );
};

const MenuCard = ({ icon, title, desc, color, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`p-6 rounded-[2rem] text-left border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:scale-[1.02] active:scale-95 flex flex-col justify-between h-44 ${color}`}
  >
    <i className={`fa-solid ${icon} text-3xl opacity-80`}></i>
    <div>
      <h3 className="font-black text-sm uppercase leading-tight">{title}</h3>
      <p className="text-[9px] opacity-70 font-bold uppercase tracking-wider mt-1">{desc}</p>
    </div>
  </button>
);

export default LivestockDashboard;
