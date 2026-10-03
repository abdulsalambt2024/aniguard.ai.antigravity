import React from 'react';
import { TrendingUp, DollarSign, Milk, Wheat, Activity, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const ProfitIntelligenceView: React.FC = () => {
  const weeklyData = [
    { week: 'Wk 35', revenue: 11800, feedCost: 5900, vetCost: 1800, profit: 4100 },
    { week: 'Wk 36', revenue: 12200, feedCost: 6100, vetCost: 1900, profit: 4200 },
    { week: 'Wk 37', revenue: 12500, feedCost: 6200, vetCost: 1950, profit: 4350 },
    { week: 'Wk 38', revenue: 12800, feedCost: 6300, vetCost: 2070, profit: 4430 },
    { week: 'Wk 39', revenue: 13104, feedCost: 6400, vetCost: 1744, profit: 4960 },
  ];

  return (
    <div className="bg-[#0B1520] border border-[#182635] rounded-xl p-5 text-white shadow-lg space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#182635]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h2 className="text-xl font-bold tracking-tight text-white">Profit Intelligence</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time dairy economics, feed input costs, and yield margins
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-[#0C1E20] border border-[#10B981]/40 text-[#10B981] font-mono font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            +12% Net Growth This Week
          </span>
        </div>
      </div>

      {/* KPI 4 Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weekly Revenue */}
        <div className="bg-[#08101A] border border-[#182635] rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Weekly Milk Revenue</span>
            <Milk className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">₹13,104</div>
          <p className="text-[11px] text-slate-400 mt-1">327.6 L produced @ ₹40.0/L</p>
        </div>

        {/* Feed Cost */}
        <div className="bg-[#08101A] border border-[#182635] rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Feed & Silage Cost</span>
            <Wheat className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">₹6,400</div>
          <p className="text-[11px] text-slate-400 mt-1">Roughage + Concentrate ration</p>
        </div>

        {/* Healthcare & Vet */}
        <div className="bg-[#08101A] border border-[#182635] rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Healthcare & Vaccines</span>
            <Activity className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">₹1,744</div>
          <p className="text-[11px] text-slate-400 mt-1">Booster + mineral mixture</p>
        </div>

        {/* Net Profit */}
        <div className="bg-[#08101A] border border-emerald-900/40 rounded-xl p-4 bg-gradient-to-br from-[#08101A] to-[#0C241E]">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold">Est. Net Profit (Wk)</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono text-[#10B981]">₹4,960</div>
          <p className="text-[11px] text-emerald-400/80 mt-1">37.8% Net Margin</p>
        </div>
      </div>

      {/* 5-Week Financial Trajectory Chart */}
      <div className="bg-[#08101A] border border-[#182635] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            5-Week Financial Breakdown (₹)
          </h3>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500"></span> Milk Revenue
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> Feed Costs
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Net Profit
            </span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2634" />
              <XAxis dataKey="week" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0E1A26',
                  borderColor: '#182635',
                  fontSize: '11px',
                }}
              />
              <Bar dataKey="revenue" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="feedCost" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
