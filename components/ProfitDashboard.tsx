
import React from 'react';
import { UserProfile } from '../types';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';

interface Props {
  profile: UserProfile;
}

const weeklyData = [
  { week: 'Wk 35', milk: 11800, feed: 5800, profit: 3400 },
  { week: 'Wk 36', milk: 12100, feed: 6000, profit: 3700 },
  { week: 'Wk 37', milk: 12800, feed: 5900, profit: 4100 },
  { week: 'Wk 38', milk: 13000, feed: 6200, profit: 4500 },
  { week: 'Wk 39', milk: 13104, feed: 6400, profit: 4960 },
];

const ProfitDashboard: React.FC<Props> = ({ profile }) => {
  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-400">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profit</h1>
        <p className="text-sm text-gray-500 mt-0.5">This week, week 39</p>
      </div>

      {/* Net Profit Card */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: '#1a3c2b' }}>
        <p className="text-sm font-medium" style={{ color: '#a5c9b4' }}>Net profit</p>
        <p className="text-5xl font-bold text-white mt-1">₹4,960</p>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: '#2e6b47', color: '#7fd4a3' }}>+12% vs last week</span>
          <span className="text-sm" style={{ color: '#a5c9b4' }}>37.8% margin</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-white rounded-2xl p-4 space-y-4 shadow-sm border border-gray-100">
        <BreakdownRow dot="#4AABCC" label="Milk sales · 327.6 L at ₹40" value="₹13,104" />
        <BreakdownRow dot="#F5A623" label="Feed and silage" value="₹6,400" />
        <BreakdownRow dot="#E05252" label="Health and vaccines" value="₹1,744" />
      </div>

      {/* Last 5 Weeks Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-base font-bold text-gray-900 mb-4">Last 5 weeks</h2>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={weeklyData} barCategoryGap="20%" barGap={3}>
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
            />
            <Bar dataKey="milk" fill="#4AABCC" radius={[3, 3, 0, 0]} />
            <Bar dataKey="feed" fill="#F5A623" radius={[3, 3, 0, 0]} />
            <Bar dataKey="profit" fill="#1a6e3c" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2">
          <Legend color="#4AABCC" label="Milk" />
          <Legend color="#F5A623" label="Feed" />
          <Legend color="#1a6e3c" label="Profit" />
        </div>
      </div>
    </div>
  );
};

const BreakdownRow = ({ dot, label, value }: { dot: string; label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
      <span className="text-sm text-gray-700">{label}</span>
    </div>
    <span className="text-sm font-semibold text-gray-900">{value}</span>
  </div>
);

const Legend = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-1.5">
    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
    <span className="text-xs text-gray-500">{label}</span>
  </div>
);

export default ProfitDashboard;
