import React from 'react';
import { Activity, ShieldCheck, Stethoscope } from 'lucide-react';

interface FeaturedTipCardProps {
  onRunAICheck: () => void;
}

export const FeaturedTipCard: React.FC<FeaturedTipCardProps> = ({ onRunAICheck }) => {
  return (
    <div className="bg-[#0B1520] border border-[#182635] rounded-xl p-5 lg:p-6 text-white shadow-lg flex flex-col justify-between h-full relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#0E2E25] text-emerald-400 border border-[#134E3E]">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Clinical Advisory</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">ICAR-IVRI Protocol</span>
        </div>

        <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-snug">
          Subclinical Mastitis & Respiratory Triage
        </h2>

        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          Daily body temperature and morning milk deviation tracking catches subclinical signs up to 72 hours before acute onset.
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-[#182635] flex items-center justify-between">
        <div className="text-[11px] text-slate-400">
          Status: <span className="text-emerald-400 font-semibold">Active Baseline</span>
        </div>
        <button
          onClick={onRunAICheck}
          className="px-3.5 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold transition shadow-md shadow-emerald-950/40 flex items-center gap-1.5"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Run Health Triage</span>
        </button>
      </div>
    </div>
  );
};
