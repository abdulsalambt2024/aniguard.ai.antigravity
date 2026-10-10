
import React from 'react';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
}

const FeedPlan: React.FC<Props> = ({ profile }) => {
  const maintenancePct = (11.0 / 17.1) * 100;
  const milkPct = (6.1 / 17.1) * 100;

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-400">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Feed plan</h1>
        <p className="text-sm text-gray-500 mt-0.5">For Gauri · IN-GJ-1042</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Milk</p>
          <p className="text-lg font-bold text-gray-900">18.5 L</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Weight</p>
          <p className="text-lg font-bold text-gray-900">440 kg</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Fat</p>
          <p className="text-lg font-bold text-gray-900">4.2%</p>
        </div>
      </div>

      {/* Dry Matter Card */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: '#1a3c2b' }}>
        <p className="text-sm font-medium mb-1" style={{ color: '#a5c9b4' }}>Dry matter needed each day</p>
        <p className="text-5xl font-bold text-white">17.1 kg</p>

        {/* Progress Bar */}
        <div className="mt-4 flex rounded-full overflow-hidden h-2">
          <div style={{ width: `${maintenancePct}%`, backgroundColor: '#4AABCC' }} />
          <div style={{ width: `${milkPct}%`, backgroundColor: '#F5A623' }} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs" style={{ color: '#a5c9b4' }}>Maintenance 11.0 kg</span>
          <span className="text-xs" style={{ color: '#a5c9b4' }}>Milk 6.1 kg</span>
        </div>
      </div>

      {/* Daily Feed Grid */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">Daily feed</h2>
        <div className="grid grid-cols-2 gap-3">
          <FeedCard label="Green fodder" labelColor="#2e7d32" amount="34.2 kg" note="Napier, berseem, maize" />
          <FeedCard label="Dry fodder" labelColor="#b7791f" amount="3.8 kg" note="Wheat or paddy straw" />
          <FeedCard label="Concentrate" labelColor="#1565c0" amount="7.6 kg" note="20% protein pellet" />
          <FeedCard label="Minerals" labelColor="#6b21a8" amount="60 g" note="Chelated mix" />
        </div>
      </div>

      {/* Pregnancy Notice */}
      <div className="rounded-2xl p-4" style={{ backgroundColor: '#fff8ed', border: '1.5px solid #fde68a' }}>
        <p className="text-sm font-bold text-amber-800 mb-1">Month 6 of pregnancy</p>
        <p className="text-sm text-amber-700">Add 0.8 kg concentrate and mineral mix each day.</p>
      </div>

      {/* Feeding Tip */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <p className="text-sm font-bold text-gray-900 mb-1">Feeding tip</p>
        <p className="text-sm text-gray-600 leading-relaxed">Split concentrate into morning and evening meals, mixed with soaked cake. Keep 60–70 L of clean water available.</p>
      </div>

      {/* Save Button */}
      <button
        className="w-full py-4 rounded-2xl text-white text-base font-semibold"
        style={{ backgroundColor: '#1a3c2b' }}
      >
        Save feed plan
      </button>
    </div>
  );
};

const FeedCard = ({ label, labelColor, amount, note }: { label: string; labelColor: string; amount: string; note: string }) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
    <p className="text-xs font-semibold mb-1" style={{ color: labelColor }}>{label}</p>
    <p className="text-xl font-bold text-gray-900">{amount}</p>
    <p className="text-xs text-gray-400 mt-1">{note}</p>
  </div>
);

export default FeedPlan;
