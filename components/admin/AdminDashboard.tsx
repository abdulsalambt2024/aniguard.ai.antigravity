
import React, { useState } from 'react';
import { AdminUser, BioMaterialListing, SystemStats } from '../../types';

interface AdminDashboardProps {
  user: AdminUser;
  onLogout: () => void;
  listings: BioMaterialListing[];
  onDeleteListing: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout, listings, onDeleteListing }) => {
  const [activeView, setActiveView] = useState<'stats' | 'listings' | 'outbreaks'>('stats');
  const [outbreakStatus, setOutbreakStatus] = useState<Record<string, boolean>>({
    'Lumpy Skin': true,
    'FMD': false,
    'Rabies': true
  });

  const stats: SystemStats = {
    totalUsers: 1240,
    totalListings: listings.length,
    activeOutbreaks: Object.values(outbreakStatus).filter(Boolean).length,
    aiScansProcessed: 4520
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Admin Header */}
      <header className="border-b border-slate-900 bg-slate-950/50 backdrop-blur-md sticky top-0 z-[200]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500 text-slate-950 rounded-xl flex items-center justify-center font-black">
              <i className="fa-solid fa-crown"></i>
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-widest">AniGuard Admin</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">AniGuard AI Ecosystem</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-black uppercase">{user.username}</span>
              <span className={`text-[8px] font-black uppercase ${user.isDemo ? 'text-amber-500' : 'text-emerald-500'}`}>
                {user.isDemo ? 'DEMO INSPECTION' : 'AUTHORIZED SESSION'}
              </span>
            </div>
            <button 
              onClick={onLogout}
              className="px-6 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
            >
              Terminate
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-slate-900 pb-px">
          <button 
            onClick={() => setActiveView('stats')}
            className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeView === 'stats' ? 'text-emerald-500' : 'text-slate-500'}`}
          >
            Analytics Hub
            {activeView === 'stats' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div>}
          </button>
          <button 
            onClick={() => setActiveView('listings')}
            className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeView === 'listings' ? 'text-emerald-500' : 'text-slate-500'}`}
          >
            Resource Oversight
            {activeView === 'listings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div>}
          </button>
          <button 
            onClick={() => setActiveView('outbreaks')}
            className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeView === 'outbreaks' ? 'text-emerald-500' : 'text-slate-500'}`}
          >
            Risk Radar
            {activeView === 'outbreaks' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div>}
          </button>
        </div>

        {/* View Content */}
        {activeView === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-500">
            <StatCard icon="fa-users" label="Registered Users" value={stats.totalUsers} color="text-blue-500" />
            <StatCard icon="fa-seedling" label="Active Listings" value={stats.totalListings} color="text-emerald-500" />
            <StatCard icon="fa-biohazard" label="Current Outbreaks" value={stats.activeOutbreaks} color="text-red-500" />
            <StatCard icon="fa-microscope" label="AI Scans Run" value={stats.aiScansProcessed} color="text-purple-500" />
            
            <div className="md:col-span-4 bg-slate-900/50 rounded-[3rem] p-10 border border-slate-900">
              <h3 className="text-xl font-black uppercase tracking-tight mb-6">Platform Growth</h3>
              <div className="h-64 flex items-end gap-2 px-4">
                {[45, 60, 55, 75, 85, 70, 95].map((h, i) => (
                  <div key={i} className="flex-1 bg-emerald-500/20 hover:bg-emerald-500 transition-all rounded-t-xl group relative" style={{ height: `${h}%` }}>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 px-2 py-1 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition">WEEK {i+1}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'listings' && (
          <div className="bg-slate-900/50 rounded-[3rem] border border-slate-900 overflow-hidden animate-in slide-in-from-right-4 duration-500">
            <div className="p-8 border-b border-slate-900 flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tight">Active Listings</h3>
              <div className="px-4 py-2 bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                {listings.length} TOTAL RECORDS
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/50">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Farmer</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Material</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantity</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Region</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {listings.map(l => (
                    <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-8 py-5 text-sm font-bold text-slate-100">{l.farmerName}</td>
                      <td className="px-8 py-5 text-xs font-black uppercase tracking-tight text-emerald-500">{l.materialName}</td>
                      <td className="px-8 py-5 text-sm font-bold">{l.quantity}kg</td>
                      <td className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">{l.region}</td>
                      <td className="px-8 py-5">
                        <button 
                          onClick={() => onDeleteListing(l.id)}
                          className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                          title="Delete Listing"
                        >
                          <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'outbreaks' && (
          <div className="grid md:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-slate-900/50 rounded-[3rem] p-10 border border-slate-900">
              <h3 className="text-xl font-black uppercase tracking-tight mb-8">Disease Alert Control</h3>
              <div className="space-y-6">
                {Object.entries(outbreakStatus).map(([disease, active]) => (
                  <div key={disease} className="flex items-center justify-between p-6 bg-slate-950/50 rounded-[2rem] border border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${active ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`}></div>
                      <span className="text-sm font-black uppercase tracking-widest">{disease}</span>
                    </div>
                    <button 
                      onClick={() => setOutbreakStatus(prev => ({ ...prev, [disease]: !active }))}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-500'}`}
                    >
                      {active ? 'Deactivate Alert' : 'Trigger Alert'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-emerald-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-black uppercase tracking-tight">AniGuard Core Status</h3>
                <p className="text-sm text-emerald-100 font-medium">All administrative services are currently operational.</p>
                <div className="pt-8 grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black uppercase text-emerald-300 block mb-1">Database</span>
                    <span className="text-sm font-black">99.9% UPTIME</span>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black uppercase text-emerald-300 block mb-1">AI Models</span>
                    <span className="text-sm font-black">LATENCY: 420ms</span>
                  </div>
                </div>
              </div>
              <i className="fa-solid fa-server absolute -right-10 -bottom-10 text-white/5 text-[240px] pointer-events-none group-hover:scale-110 transition-transform"></i>
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="p-8 text-center text-slate-800 text-[10px] font-black uppercase tracking-[0.5em]">
        AniGuard AI Ecosystem Management Core
      </footer>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: any) => (
  <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-900 flex flex-col items-center justify-center text-center group hover:border-slate-700 transition-all">
    <div className={`w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center mb-4 text-2xl ${color} shadow-inner`}>
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-black text-slate-100">{value.toLocaleString()}</p>
  </div>
);

export default AdminDashboard;
