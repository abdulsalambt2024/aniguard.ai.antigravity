import React, { useState } from 'react';
import {
  Mic,
  HeartPulse,
  Plus,
  Activity,
  Milk,
  CheckCircle2,
  TrendingUp,
  SunMedium,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { FarmSummary } from '../../types/aniguard';

interface HeroSectionProps {
  summary: FarmSummary;
  onVoiceEntry: () => void;
  onAICheck: () => void;
  onAddAnimal: () => void;
  onRefresh?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  summary,
  onVoiceEntry,
  onAICheck,
  onAddAnimal,
  onRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Calculations for micro-visualizations
  const healthPercent = Math.min(100, Math.max(0, summary.herd_health_index));
  const milkTarget = 50; // Daily target in liters
  const milkPercent = Math.min(100, Math.round((summary.estimated_daily_milk_liters / milkTarget) * 100));

  return (
    <div className="bg-[#0B1520] border border-[#182635] rounded-xl p-5 lg:p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Tag & Greeting */}
      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0E2E25] text-[#10B981] border border-[#134E3E]">
              {summary.farm_name}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <SunMedium className="w-3.5 h-3.5 text-amber-400" />
              <span>{summary.location}</span>
              <span className="text-slate-600">•</span>
              <span>{summary.weather}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">Telemetry Live</span>
            <button
              onClick={handleRefreshClick}
              title="Refresh Herd Telemetry"
              className="p-1.5 rounded-lg bg-[#0E1A26] border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome, <span className="text-[#10B981]">{summary.owner_name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Herd Health Index is <strong className="text-emerald-400 font-bold">{summary.herd_health_index}/100</strong> • 0 critical epidemic flags detected today
            </p>
          </div>

          {/* Health Status Ring */}
          <div className="hidden md:flex items-center gap-3 bg-[#08101A] border border-[#182635] p-2.5 rounded-xl self-start sm:self-auto">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#142333]"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray={`${healthPercent}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-white">{healthPercent}%</span>
            </div>
            <div className="text-left pr-2">
              <p className="text-[10px] text-slate-400 font-medium">Herd Status</p>
              <p className="text-xs font-bold text-emerald-400">Optimal</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 mt-4">
          <button
            onClick={onVoiceEntry}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0C1E20] hover:bg-[#122A2D] border border-[#10B981]/50 text-[#10B981] text-xs font-semibold transition shadow-sm hover:shadow-emerald-950/20"
          >
            <Mic className="w-4 h-4 text-[#10B981]" />
            <span>Voice Log</span>
          </button>

          <button
            onClick={onAICheck}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0C1E20] hover:bg-[#122A2D] border border-[#10B981]/50 text-[#10B981] text-xs font-semibold transition shadow-sm hover:shadow-emerald-950/20"
          >
            <HeartPulse className="w-4 h-4 text-[#10B981]" />
            <span>AI Health Scan</span>
          </button>

          <button
            onClick={onAddAnimal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#142333] hover:bg-[#1C2F44] border border-slate-700 text-slate-200 text-xs font-medium transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Animal</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#182635] relative z-10">
        {/* Metric 1: Farm Health Index */}
        <div className="bg-[#08101A] border border-[#182635] rounded-xl p-3.5 flex flex-col justify-between hover:border-emerald-900/60 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-300">
              Herd Health Index
            </span>
            <div className="w-6 h-6 rounded-md bg-[#0C241E] flex items-center justify-center text-[#10B981]">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold text-[#10B981] tracking-tight">
              {summary.herd_health_index}/100
            </div>
            <div className="w-full bg-[#142333] h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-[#10B981] h-full rounded-full transition-all duration-500"
                style={{ width: `${healthPercent}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
              <span>Optimal Condition</span>
              <span className="text-emerald-400 font-semibold">{healthPercent}%</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Est. Daily Milk */}
        <div className="bg-[#08101A] border border-[#182635] rounded-xl p-3.5 flex flex-col justify-between hover:border-cyan-900/60 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-300">
              Est. Daily Milk
            </span>
            <div className="w-6 h-6 rounded-md bg-[#101F2F] flex items-center justify-center text-cyan-400">
              <Milk className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold text-white tracking-tight flex items-baseline gap-1">
              <span>{summary.estimated_daily_milk_liters}</span>
              <span className="text-xs text-slate-400 font-normal">Liters</span>
            </div>
            <div className="w-full bg-[#142333] h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${milkPercent}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
              <span>Target: {milkTarget} L</span>
              <span className="text-cyan-400 font-semibold">{milkPercent}%</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Active Herd */}
        <div className="bg-[#08101A] border border-[#182635] rounded-xl p-3.5 flex flex-col justify-between hover:border-blue-900/60 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-300">
              Active Herd
            </span>
            <div className="w-6 h-6 rounded-md bg-[#0E1E2F] flex items-center justify-center text-blue-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold text-white tracking-tight flex items-baseline gap-1">
              <span>{summary.total_registered_animals}</span>
              <span className="text-xs text-slate-400 font-normal">Registered</span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden mt-1.5 gap-0.5">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${(summary.healthy_count / summary.total_registered_animals) * 100}%` }}
                title="Healthy"
              ></div>
              <div
                className="bg-amber-500 h-full"
                style={{ width: `${(summary.watch_count / summary.total_registered_animals) * 100}%` }}
                title="Watch"
              ></div>
              <div
                className="bg-red-500 h-full"
                style={{ width: `${(summary.sick_count / summary.total_registered_animals) * 100}%` }}
                title="Sick"
              ></div>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
              <span className="text-emerald-400">{summary.healthy_count} Good</span>
              <span className="text-amber-400">{summary.watch_count + summary.sick_count} Watch</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Est. Net Profit */}
        <div className="bg-[#08101A] border border-[#182635] rounded-xl p-3.5 flex flex-col justify-between hover:border-amber-900/60 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-300">
              Est. Net Profit (Wk)
            </span>
            <div className="w-6 h-6 rounded-md bg-[#251D10] flex items-center justify-center text-amber-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold text-[#F59E0B] tracking-tight">
              ₹{summary.estimated_weekly_net_profit.toLocaleString()}
            </div>
            <div className="w-full bg-[#142333] h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: '74%' }}
              ></div>
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center justify-between mt-1">
              <span className="flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                +{summary.profit_growth_percentage}% vs prev
              </span>
              <span className="text-slate-500">₹708/day</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
