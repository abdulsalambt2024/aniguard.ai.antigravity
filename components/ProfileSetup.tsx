
import React, { useState } from 'react';
import { UserProfile, UserRole, AppLanguage } from '../types';

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.FARMER);
  const [region, setRegion] = useState('');
  const [language, setLanguage] = useState<AppLanguage>(AppLanguage.ENGLISH);
  const [step, setStep] = useState(1);

  const regions = ["Maharashtra", "Punjab", "Gujarat", "Karnataka", "Tamil Nadu", "Rajasthan", "UP", "MP", "Other"];
  const languages = [
    { code: AppLanguage.ENGLISH, label: 'English' },
    { code: AppLanguage.HINDI, label: 'हिन्दी' },
    { code: AppLanguage.MARATHI, label: 'मરાઠી' },
    { code: AppLanguage.TAMIL, label: 'தமிழ்' },
    { code: AppLanguage.GUJARATI, label: 'ગુજરાતી' },
    { code: AppLanguage.TELUGU, label: 'తెలుగు' },
    { code: AppLanguage.HINGLISH, label: 'Hinglish' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-emerald-950 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 space-y-8 animate-in zoom-in duration-500">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
            <i className="fa-solid fa-shield-dog"></i>
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">AniGuard AI</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional Intelligence</p>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Language Selection</label>
              <div className="grid grid-cols-2 gap-3">
                {languages.map(l => (
                  <button 
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={`p-4 rounded-2xl border-2 text-xs font-bold transition ${language === l.code ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-50 bg-slate-50 text-slate-500'}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(2)} className="w-full bg-slate-800 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">Continue</button>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="space-y-2">
              <input 
                placeholder="Full Name" 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                value={name} onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <RoleBtn active={role === UserRole.FARMER} onClick={() => setRole(UserRole.FARMER)} icon="fa-cow" label="Farmer" />
              <RoleBtn active={role === UserRole.PET_OWNER} onClick={() => setRole(UserRole.PET_OWNER)} icon="fa-dog" label="Pet" />
              <RoleBtn active={role === UserRole.RESEARCHER} onClick={() => setRole(UserRole.RESEARCHER)} icon="fa-microscope" label="Scientist" />
            </div>
            <select 
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
              value={region} onChange={e => setRegion(e.target.value)}
            >
              <option value="">Select State</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="flex gap-2">
               <button onClick={() => setStep(1)} className="p-5 bg-slate-50 text-slate-400 rounded-2xl"><i className="fa-solid fa-arrow-left"></i></button>
               <button 
                 disabled={!name || !region}
                 onClick={() => onComplete({ name, role, region, language })}
                 className="flex-1 bg-emerald-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-50"
               >
                 Launch Platform
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const RoleBtn = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition ${active ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-50 bg-slate-50 text-slate-300'}`}
  >
    <i className={`fa-solid ${icon} text-xl`}></i>
    <span className="text-[9px] font-black uppercase">{label}</span>
  </button>
);

export default ProfileSetup;
