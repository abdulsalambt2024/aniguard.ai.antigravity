
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  onNavigate?: (tab: string) => void;
}

const animals = [
  { initial: 'G', name: 'Gauri', health: 90, color: '#e8f5e9', textColor: '#2e7d32' },
  { initial: 'L', name: 'Lakshmi', health: 51, color: '#fff3e0', textColor: '#e65100' },
  { initial: 'S', name: 'Shera', health: 90, color: '#e8f5e9', textColor: '#2e7d32' },
  { initial: 'M', name: 'Moti', health: 5, color: '#fdecea', textColor: '#c62828' },
];

const HomeDashboard: React.FC<Props> = ({ profile, onNavigate }) => {
  const milkPct = (46.8 / 50) * 100;

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-400">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500">GreenPastures Dairy Farm · Anand</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-0.5">Namaste, Ramesh</h1>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
          style={{ backgroundColor: '#1a3c2b' }}
        >
          R
        </div>
      </div>

      {/* Herd Health Card */}
      <div className="rounded-2xl p-5 flex items-center gap-4" style={{ backgroundColor: '#1a3c2b' }}>
        {/* Donut */}
        <div className="relative flex-shrink-0 w-20 h-20">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="30" fill="none" stroke="#2e6b47" strokeWidth="8" />
            <circle
              cx="40" cy="40" r="30" fill="none"
              stroke="#F5A623" strokeWidth="8"
              strokeDasharray={`${(59 / 100) * 188.5} 188.5`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-white leading-none">59</span>
            <span className="text-[9px] text-gray-400 leading-none mt-0.5">herd health</span>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-base font-bold text-white">2 animals need care today</p>
          <p className="text-xs mt-1" style={{ color: '#a5c9b4' }}>Moti is overdue for a vaccine. Lakshmi is sick.</p>
          <button
            className="mt-3 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: '#F5A623', color: '#1a3c2b' }}
          >
            Run health scan
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Milk */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400">Milk today</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">46.8 L</p>
          <div className="mt-2 h-1.5 rounded-full bg-gray-100">
            <div className="h-full rounded-full" style={{ width: `${milkPct}%`, backgroundColor: '#4AABCC' }} />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Target 50 L</p>
        </div>
        {/* Profit */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400">Profit this week</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹4,960</p>
          <div className="mt-2 h-1.5 rounded-full bg-gray-100">
            <div className="h-full rounded-full" style={{ width: '88%', backgroundColor: '#2e7d32' }} />
          </div>
          <p className="text-[10px] mt-1" style={{ color: '#2e7d32' }}>+12% vs last week</p>
        </div>
      </div>

      {/* Needs You Today */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">Needs you today</h2>
        <div className="space-y-3">
          {/* Urgent */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#fde8e8', color: '#c0392b' }}>Urgent</span>
              <span className="text-xs text-gray-400">IN-GJ-3090</span>
            </div>
            <p className="text-sm font-bold text-gray-900 mt-2">Moti: PPR vaccine overdue</p>
            <p className="text-xs text-gray-500 mt-0.5">Book a vet to give the booster.</p>
            <button
              className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: '#1a3c2b' }}
            >
              Call vet
            </button>
          </div>

          {/* Watch */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#fff3e0', color: '#e65100' }}>Watch</span>
              <span className="text-xs text-gray-400">IN-GJ-1042</span>
            </div>
            <p className="text-sm font-bold text-gray-900 mt-2">Gauri: month 6 of pregnancy</p>
            <p className="text-xs text-gray-500 mt-0.5">Add 0.8 kg concentrate feed per day.</p>
          </div>
        </div>
      </div>

      {/* Animal Row */}
      <div className="flex justify-between">
        {animals.map((a, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold"
              style={{ backgroundColor: a.color, color: a.textColor }}
            >
              {a.initial}
            </div>
            <span className="text-xs text-gray-700 font-medium">{a.name}</span>
            <span className="text-xs font-bold" style={{ color: a.textColor }}>{a.health}%</span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        {['Voice log', 'Feed plan', 'Schemes'].map(label => (
          <button
            key={label}
            className="py-3 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50 transition shadow-sm"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeDashboard;
