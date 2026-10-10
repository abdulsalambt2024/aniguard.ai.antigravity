
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
}

const animals = [
  {
    initial: 'M', name: 'Moti', tag: 'IN-GJ-3090', breed: 'Goat · Sirohi · 2 yrs',
    milk: '2.1 L/day', health: 5, status: 'Critical',
    color: '#fdecea', textColor: '#c62828',
    badgeBg: '#fdecea', badgeText: '#c62828',
  },
  {
    initial: 'L', name: 'Lakshmi', tag: 'IN-GJ-1088', breed: 'Cow · Gir · 3 yrs',
    milk: '11.2 L/day', health: 51, status: 'Sick',
    color: '#fff3e0', textColor: '#e65100',
    badgeBg: '#fff3e0', badgeText: '#e65100',
    badge2: null,
  },
  {
    initial: 'G', name: 'Gauri', tag: 'IN-GJ-1042', breed: 'Cow · Holstein cross · 4 yrs',
    milk: '18.5 L/day', health: 90, status: 'Healthy',
    color: '#e8f5e9', textColor: '#2e7d32',
    badgeBg: '#e8f5e9', badgeText: '#2e7d32',
    extraBadge: 'Month 6',
  },
  {
    initial: 'S', name: 'Shera', tag: 'IN-GJ-2011', breed: 'Buffalo · Murrah · 5 yrs',
    milk: '15 L/day', health: 90, status: 'Healthy',
    color: '#e8f5e9', textColor: '#2e7d32',
    badgeBg: '#e8f5e9', badgeText: '#2e7d32',
  },
];

const filters = ['All', 'Cows', 'Buffalo', 'Goats'];

const HerdPage: React.FC<Props> = ({ profile }) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = animals.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.tag.toLowerCase().includes(search.toLowerCase()) || a.breed.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Cows' && a.breed.startsWith('Cow')) ||
      (activeFilter === 'Buffalo' && a.breed.startsWith('Buffalo')) ||
      (activeFilter === 'Goats' && a.breed.startsWith('Goat'));
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-400">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your herd</h1>
        <p className="text-sm text-gray-500 mt-0.5">4 animals · 46.8 L today</p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, tag or breed"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:ring-2"
        style={{ '--tw-ring-color': '#1a3c2b' } as any}
      />

      {/* Filter Pills */}
      <div className="flex gap-2">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={activeFilter === f
              ? { backgroundColor: '#1a3c2b', color: 'white' }
              : { backgroundColor: 'white', color: '#374151', border: '1.5px solid #d1d5db' }
            }
          >
            {f}
          </button>
        ))}
      </div>

      {/* Animal Cards */}
      <div className="space-y-3">
        {filtered.map((a, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            {/* Avatar */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
              style={{ backgroundColor: a.color, color: a.textColor }}
            >
              {a.initial}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-gray-900">{a.name}</span>
                <span className="text-xs text-gray-400">{a.tag}</span>
                {'extraBadge' in a && a.extraBadge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fff3e0', color: '#e65100' }}>
                    {a.extraBadge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{a.breed}</p>
              <p className="text-xs text-gray-500">{a.milk}</p>
            </div>

            {/* Health */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-base font-bold" style={{ color: a.textColor }}>{a.health}%</span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: a.badgeBg, color: a.badgeText }}
              >
                {a.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Animal */}
      <button
        className="w-full py-4 rounded-2xl text-white text-base font-semibold"
        style={{ backgroundColor: '#1a3c2b' }}
      >
        Add animal
      </button>
    </div>
  );
};

export default HerdPage;
