import React from 'react';
import {
  HeartPulse,
  Bot,
  Calculator,
  TrendingUp,
  Syringe,
  Landmark,
  BookPlus,
  GraduationCap,
  Layers,
  CreditCard,
} from 'lucide-react';
import { AniGuardTab } from './AniGuardNavBar';

interface QuickGridProps {
  onNavigate: (tab: AniGuardTab) => void;
}

export const QuickGrid: React.FC<QuickGridProps> = ({ onNavigate }) => {
  const actions = [
    { id: 'ai_check', label: 'AI Health Scan', sub: 'Clinical Triage', icon: HeartPulse, color: 'text-emerald-400' },
    { id: 'farm_ai', label: 'Clinical Chat', sub: '24/7 AI Advisor', icon: Bot, color: 'text-cyan-400' },
    { id: 'ration', label: 'Ration Planner', sub: 'Feed Optimization', icon: Calculator, color: 'text-blue-400' },
    { id: 'profit', label: 'Herd Economics', sub: 'Profit Analysis', icon: TrendingUp, color: 'text-amber-400' },
    { id: 'vaccinations', label: 'Vaccinations', sub: 'Preventive Schedule', icon: Syringe, color: 'text-pink-400' },
    { id: 'pricing', label: 'Pro Plans', sub: 'Razorpay Billing', icon: CreditCard, color: 'text-[#D4AF37]' },
    { id: 'schemes', label: 'Govt Schemes', sub: 'Subsidies & Loans', icon: Landmark, color: 'text-emerald-400' },
    { id: 'disease_library', label: 'Disease Guide', sub: 'ICAR / WOAH Compendium', icon: BookPlus, color: 'text-indigo-400' },
  ];

  return (
    <div className="bg-[#0B1520] border border-[#182635] rounded-xl p-5 text-white shadow-lg flex flex-col justify-between h-full">
      {/* Header matching adjacent cards */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#182635] mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#0E2E25] flex items-center justify-center text-emerald-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Clinical Operations
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-[#142333] px-2 py-0.5 rounded">
            8 Modules
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => onNavigate(act.id as AniGuardTab)}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#0E1A26] border border-[#182635] hover:border-emerald-500/80 hover:bg-[#122233] transition-all group text-center shadow-sm active:scale-95 min-h-[72px]"
              >
                <div className="w-8 h-8 rounded-lg bg-[#08101A] border border-slate-800 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-inner shrink-0">
                  <Icon className={`w-4.5 h-4.5 ${act.color}`} />
                </div>
                <span className="text-xs font-bold text-slate-100 group-hover:text-white leading-tight">
                  {act.label}
                </span>
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-300 mt-0.5 truncate max-w-full font-medium">
                  {act.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-[#182635] flex items-center justify-between text-[11px] text-slate-400">
        <span>Clinical Modules</span>
        <span className="text-emerald-400 font-semibold font-mono">Ready</span>
      </div>
    </div>
  );
};
