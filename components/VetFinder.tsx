
import React, { useState, useEffect } from 'react';
import { findNearbyVets } from '../services/geminiService';
import { VetClinic, UserProfile } from '../types';
import { UI_STRINGS } from '../constants';

interface Props {
  profile: UserProfile;
}

const VetFinder: React.FC<Props> = ({ profile }) => {
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState<VetClinic[]>([]);
  const [description, setDescription] = useState('');
  const strings = UI_STRINGS[profile.language];

  useEffect(() => {
    if (profile.coords) {
      handleSearch();
    }
  }, [profile.coords]);

  const handleSearch = async () => {
    if (!profile.coords) return;
    setLoading(true);
    try {
      const result = await findNearbyVets(profile.coords.lat, profile.coords.lng, profile.language);
      setClinics(result.clinics);
      setDescription(result.text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-800/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
            <i className="fa-solid fa-map-location-dot text-xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Nearby Help Finder</h2>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">AI-Powered Vet Directory</p>
          </div>
        </div>
        
        {!profile.coords && (
          <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800 flex items-center gap-4 text-amber-700 dark:text-amber-400 text-xs font-bold">
            <i className="fa-solid fa-location-arrow animate-pulse"></i>
            Enable location access to find nearby government hospitals and private clinics.
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Scanning Local Area...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">{description}</p>
            <div className="grid gap-4">
              {clinics.map((clinic, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center group hover:border-emerald-500 transition-all">
                  <div className="flex-1">
                    <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase text-xs tracking-tight">{clinic.name}</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{clinic.address || 'Address provided on Map'}</p>
                  </div>
                  <a 
                    href={clinic.uri} target="_blank" rel="noreferrer"
                    className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VetFinder;
