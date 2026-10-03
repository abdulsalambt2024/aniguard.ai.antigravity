
import React, { useState } from 'react';
import { getProfitReport } from '../services/geminiService';
import { ProfitReport, UserProfile } from '../types';
import { UI_STRINGS } from '../constants';

interface Props {
  profile: UserProfile;
}

const ProfitAnalyzer: React.FC<Props> = ({ profile }) => {
  const [income, setIncome] = useState('');
  const [feed, setFeed] = useState('');
  const [vet, setVet] = useState('');
  const [labor, setLabor] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ProfitReport | null>(null);
  
  const strings = UI_STRINGS[profile.language];

  const handleCalculate = async () => {
    if (!income) return;
    setLoading(true);
    try {
      const data = await getProfitReport(
        Number(income), 
        Number(feed) || 0, 
        Number(vet) || 0, 
        Number(labor) || 0, 
        profile.language
      );
      setReport(data);
    } catch (e) {
      alert("Calculation failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 professional-shadow transition-colors">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-xl shadow-inner">
            <i className="fa-solid fa-wallet"></i>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{strings.finance}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional Profit & Loss Analyzer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Sales/Income (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input 
                type="number"
                className="w-full pl-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-bold"
                placeholder="0.00"
                value={income} onChange={e => setIncome(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Feed Costs (₹)</label>
            <input 
              type="number"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              placeholder="0.00"
              value={feed} onChange={e => setFeed(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medicine & Vet Costs (₹)</label>
            <input 
              type="number"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              placeholder="0.00"
              value={vet} onChange={e => setVet(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Labor & Other (₹)</label>
            <input 
              type="number"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              placeholder="0.00"
              value={labor} onChange={e => setLabor(e.target.value)}
            />
          </div>
        </div>

        <button 
          onClick={handleCalculate}
          disabled={loading || !income}
          className="w-full bg-indigo-700 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-900/20 hover:bg-indigo-800 transition flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-chart-pie"></i>}
          Analyze Profitability
        </button>
      </div>

      {report && (
        <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Net Profit Card */}
            <div className="md:col-span-2 bg-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-indigo-800">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Net Estimated Profit</p>
                <h3 className="text-5xl font-black mt-2 tracking-tight">{report.netProfit}</h3>
                
                <div className="mt-8 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Expense Distribution</p>
                  <div className="h-3 w-full bg-indigo-950 rounded-full flex overflow-hidden border border-white/5">
                    <div className="h-full bg-emerald-500" style={{ width: '40%' }} title="Feed"></div>
                    <div className="h-full bg-amber-500" style={{ width: '25%' }} title="Vet"></div>
                    <div className="h-full bg-red-500" style={{ width: '20%' }} title="Labor"></div>
                    <div className="h-full bg-slate-500" style={{ width: '15%' }} title="Other"></div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <ExpenseLegend color="bg-emerald-500" label="Feed" value={report.expenseBreakdown.feed} />
                    <ExpenseLegend color="bg-amber-500" label="Vet" value={report.expenseBreakdown.vet} />
                    <ExpenseLegend color="bg-red-500" label="Labor" value={report.expenseBreakdown.labor} />
                  </div>
                </div>
              </div>
              <i className="fa-solid fa-indian-rupee-sign absolute -right-4 -bottom-4 text-white/5 text-[140px] pointer-events-none rotate-12"></i>
            </div>

            {/* Efficiency Score */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64" cy="64" r="58"
                    stroke="currentColor" strokeWidth="8"
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-800"
                  />
                  <circle
                    cx="64" cy="64" r="58"
                    stroke="currentColor" strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 - (364.4 * report.efficiencyScore) / 100}
                    className="text-indigo-600"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-800 dark:text-white">{report.efficiencyScore}%</span>
                  <span className="text-[8px] font-black uppercase text-slate-400">Efficiency</span>
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6">Financial Health Rating</p>
              <div className="mt-2 text-indigo-600 font-black text-xs uppercase tracking-tight">
                {report.efficiencyScore > 80 ? 'Optimal' : report.efficiencyScore > 50 ? 'Stable' : 'Risk Warning'}
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <i className="fa-solid fa-lightbulb text-amber-500"></i>
              AI Profit Optimization Plan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-indigo-300 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-600 text-xs font-black shrink-0 shadow-sm">
                    {i + 1}
                  </div>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ExpenseLegend = ({ color, label, value }: any) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${color}`}></div>
    <span className="text-[9px] font-black uppercase text-indigo-200/60">{label}:</span>
    <span className="text-[10px] font-bold text-white">{value}</span>
  </div>
);

export default ProfitAnalyzer;
