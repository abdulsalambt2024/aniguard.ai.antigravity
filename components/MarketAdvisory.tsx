
import React, { useState } from 'react';
import { getMarketAdvisory } from '../services/geminiService';
import { MarketAdvisoryResult, UserProfile } from '../types';
import { UI_STRINGS } from '../constants';

interface MarketAdvisoryProps {
  profile: UserProfile;
}

const MarketAdvisory: React.FC<MarketAdvisoryProps> = ({ profile }) => {
  const [cropName, setCropName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MarketAdvisoryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const strings = UI_STRINGS[profile.language];

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const data = await getMarketAdvisory(cropName, profile.region, profile.language);
      setResult(data);
    } catch (err: any) {
      setError("Failed to fetch market insights. Please try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 professional-shadow overflow-hidden transition-colors">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-2xl flex items-center justify-center text-xl">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{strings.market}</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">AI-Powered Selling Strategies</p>
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="relative">
              <i className="fa-solid fa-wheat-awn absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                placeholder="Enter crop name (e.g. Wheat, Cotton, Mango)..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-amber-500 dark:text-slate-100 transition-colors"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>
            <button 
              type="submit"
              disabled={isAnalyzing || !cropName.trim()}
              className="w-full bg-slate-800 dark:bg-slate-700 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-slate-900 transition flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  {strings.analyzing}
                </>
              ) : (
                'Get Advisory'
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-3">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 professional-shadow transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{result.cropName}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Market Status</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  result.demandStatus.toLowerCase() === 'high' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {result.demandStatus} Demand
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Price Trend</p>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2">
                    <i className={`fa-solid ${result.priceTrend.toLowerCase() === 'rising' ? 'fa-arrow-trend-up text-emerald-500' : 'fa-minus text-amber-500'}`}></i>
                    {result.priceTrend}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Action</p>
                  <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tight">{result.advisory}</p>
                </div>
              </div>

              <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-2">Strategy Reasoning</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{result.reasoning}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 dark:bg-black p-8 rounded-[2rem] text-white professional-shadow h-full flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-4">Risk Factors</h4>
                  <ul className="space-y-3 mb-8">
                    {result.risks.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <i className="fa-solid fa-triangle-exclamation text-amber-500 mt-0.5"></i>
                        <span className="text-xs font-medium text-slate-300">{risk}</span>
                      </li>
                    ))}
                  </ul>

                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-4">Recommendations</h4>
                  <ul className="space-y-3">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <i className="fa-solid fa-check-circle text-emerald-500 mt-0.5"></i>
                        <span className="text-xs font-medium text-slate-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/10 text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center">
                  Consult local Mandi for official daily prices
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-[10px] text-center text-slate-400 uppercase font-bold tracking-widest px-12">
            Disclaimer: This is a preliminary AI analysis. Market conditions fluctuate rapidly. Always verify with local experts.
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketAdvisory;
