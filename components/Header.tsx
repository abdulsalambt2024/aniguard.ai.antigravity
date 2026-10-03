
import React, { useState } from 'react';
import { UserProfile, AppLanguage, UserRole } from '../types';
import { UI_STRINGS } from '../constants';

interface HeaderProps {
  profile: UserProfile | null;
  onReset: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLanguageChange: (lang: AppLanguage) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  profile, 
  onReset, 
  activeTab, 
  setActiveTab, 
  onLanguageChange, 
  darkMode, 
  toggleDarkMode 
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const lang = profile?.language || AppLanguage.ENGLISH;
  const strings = UI_STRINGS[lang];

  const languages = [
    { code: AppLanguage.ENGLISH, label: 'English' },
    { code: AppLanguage.HINDI, label: 'हिन्दी' },
    { code: AppLanguage.MARATHI, label: 'मराठी' },
    { code: AppLanguage.TAMIL, label: 'தமிழ்' },
    { code: AppLanguage.GUJARATI, label: 'ગુજરાતી' },
    { code: AppLanguage.TELUGU, label: 'తెలుగు' },
    { code: AppLanguage.HINGLISH, label: 'Hinglish' },
  ];

  const showBackButton = activeTab !== 'home';
  const isHomePage = activeTab === 'home';

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left Side: Back + Logo */}
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <button 
                type="button"
                onClick={() => setActiveTab('home')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 transition-all shadow-sm active:scale-90"
                aria-label="Back"
                title="Back to Dashboard"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
            )}

            <div 
              className="flex items-center space-x-3 cursor-pointer group" 
              onClick={() => setActiveTab('home')}
            >
              <div className="w-9 h-9 bg-emerald-700 rounded-lg flex items-center justify-center text-white transition-all group-hover:bg-emerald-800">
                <i className="fa-solid fa-shield-dog text-lg"></i>
              </div>
              <div className="flex flex-col hidden sm:flex">
                <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 leading-none">AniGuard AI</h1>
                <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-widest leading-none mt-1">Animal Intelligence</span>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="w-9 h-9 flex items-center justify-center text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
            </button>

            {/* Language Selector - Only visible on Home Page */}
            {profile && isHomePage && (
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300"
                >
                  <i className="fa-solid fa-language text-slate-400"></i>
                  <span className="uppercase">{lang}</span>
                  <i className={`fa-solid fa-chevron-down text-[8px] transition-transform ${showLangMenu ? 'rotate-180' : ''}`}></i>
                </button>
                
                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-1 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in duration-150">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => { onLanguageChange(l.code); setShowLangMenu(false); }}
                        className={`w-full text-left px-4 py-2 text-xs transition ${lang === l.code ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {profile && (
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onReset();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all active:scale-95 shadow-sm"
                title="Log Out"
              >
                <i className="fa-solid fa-right-from-bracket"></i>
                <span className="hidden sm:inline">Log Out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
