
import React, { useState } from 'react';
import { analyzeHoldSell } from '../services/geminiService';
import { HoldSellAnalysis, UserProfile } from '../types';
import { UI_STRINGS } from '../constants';

interface Props {
  profile: UserProfile;
}

const DecisionEngine: React.FC<Props> = ({ profile }) => {
  const [animal, setAnimal] = useState('');
  const [price, setPrice] = useState('');
  const [health, setHealth] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HoldSellAnalysis | null>(null);
  
  const strings = UI_STRINGS[profile.language];

  const handleRun = async () => {
    if (!animal || !price) return;
    setLoading(true);
    try {
      const data = await analyzeHoldSell(animal, price, health, "Standard", profile.language);
      setResult(data);
    } catch (e) {
      alert("Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 professional-shadow transition-colors">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center text-xl">
            <i className="fa-solid fa-scale-balanced"></i>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{strings.market}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Market Price + Biological Risk Analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Animal Type & Age</label>
            <input 
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
              placeholder="e.g. Buffalo, 5 years"
              value={animal} onChange={e => setAnimal(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Offer Price (₹)</label>
            <input 
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
              placeholder="e.g. 80,000"
              value={price} onChange={e => setPrice(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Health Status</label>
            <input 
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
              placeholder="e.g. Reduced milk output, no fever"
              value={health} onChange={e => setHealth(e.target.value)}
            />
          </div>
        </div>

        <button 
          onClick={handleRun}
          disabled={loading || !animal || !price}
          className="w-full bg-slate-800 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-slate-900 transition flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
          Calculate Hold/Sell Risk
        </button>
      </div>

      {result && (
        <div className="animate-in slide-in-from-bottom-4 duration-500 grid md:grid-cols-3 gap-6">
          {/* Main Decision */}
          <div className={`md:col-span-2 p-8 rounded-[2rem] text-white flex flex-col justify-between ${result.decision === 'HOLD' ? 'bg-emerald-700' : 'bg-amber-700'}`}>
            <div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Recommendation</span>
              <h3 className="text-4xl font-black mt-4">{result.decision}</h3>
              <p className="text-sm opacity-80 font-medium mt-2">{result.reasoning}</p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/20 flex justify-between">
              <div>
                <p className="text-[9px] font-black uppercase opacity-60">Estimated Now</p>
                <p className="text-xl font-black">{result.estimatedPriceNow}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase opacity-60">Projected Future</p>
                <p className="text-xl font-black">{result.projectedPriceFuture}</p>
              </div>
            </div>
          </div>

          {/* Risk Metrics */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-col gap-6">
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Biological Risk</p>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-red-500" style={{ width: `${result.biologicalRiskScore}%` }}></div>
                </div>
                <p className="text-[10px] font-bold text-red-500 mt-2 text-right">{result.biologicalRiskScore}/100 Risk Score</p>
             </div>
             
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Key Risk Factors</p>
                <ul className="space-y-2">
                   {result.riskFactors.map((f, i) => (
                     <li key={i} className="text-[10px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <i className="fa-solid fa-triangle-exclamation text-amber-500"></i>
                        {f}
                     </li>
                   ))}
                </ul>
             </div>

             <div className="mt-auto p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Feed Impact</p>
                <p className="text-xs font-bold text-slate-800 dark:text-white">{result.feedCostImpact}</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionEngine;
