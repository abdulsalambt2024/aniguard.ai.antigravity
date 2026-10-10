
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
}

const diseases = [
  {
    name: 'Foot-and-mouth disease',
    animals: 'Cow, buffalo, goat, sheep',
    severity: 'Emergency',
    lookFor: 'high fever, blisters on tongue and gums, ropy saliva, lameness',
    milkImpact: 'sharp fall in output; long-term loss in crossbred cows.',
    prevent: 'isolate suspect animals and disinfect strictly.',
    source: 'WOAH, DAHD',
    tags: ['Cow', 'Buffalo', 'Goat'],
  },
  {
    name: 'PPR (goat plague)',
    animals: 'Goat, sheep',
    severity: 'Emergency',
    lookFor: 'fever, eye and nose discharge, mouth sores, foul diarrhoea',
    milkImpact: 'lactation stops quickly; fast dehydration.',
    prevent: 'quarantine new goats for 21 days.',
    source: 'ICAR-IVRI, DAHD',
    tags: ['Goat'],
  },
  {
    name: 'Hemorrhagic septicemia',
    animals: 'Cow, buffalo',
    severity: 'Emergency',
    lookFor: 'sudden fever, swollen throat and brisket, drooling',
    milkImpact: 'milk stops completely, animal collapses.',
    prevent: 'avoid waterlogged pasture in monsoon.',
    source: 'ICAR-IVRI',
    tags: ['Cow', 'Buffalo'],
  },
  {
    name: 'Lumpy skin disease',
    animals: 'Cow, buffalo',
    severity: 'High',
    lookFor: 'fever, firm skin lumps, swollen glands, drooling',
    milkImpact: 'up to 50% drop in yield.',
    prevent: 'control flies, quarantine new arrivals.',
    source: 'WOAH',
    tags: ['Cow', 'Buffalo'],
  },
  {
    name: 'Bovine mastitis',
    animals: 'Cow, buffalo',
    severity: 'High',
    lookFor: 'hot swollen udder, clots in milk, fever, low appetite',
    milkImpact: '15–40% drop in yield; clots or flakes.',
    prevent: 'teat dipping after milking, clean dry housing.',
    source: 'ICAR-CIRB',
    tags: ['Cow', 'Buffalo'],
  },
];

const filters = ['All', 'Cow', 'Buffalo', 'Goat'];

const DiseaseGuide: React.FC<Props> = ({ profile }) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = diseases.filter(d => {
    const matchFilter = activeFilter === 'All' || d.tags.includes(activeFilter);
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.animals.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-400">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Disease guide</h1>
        <p className="text-sm text-gray-500 mt-0.5">Verified by ICAR and WOAH</p>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search a disease or symptom"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:ring-2 focus:ring-green-700"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 flex-wrap">
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

      {/* Disease Cards */}
      <div className="space-y-4">
        {filtered.map((d, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-base font-bold text-gray-900">{d.name}</h3>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ml-2"
                style={d.severity === 'Emergency'
                  ? { backgroundColor: '#fde8e8', color: '#c0392b' }
                  : { backgroundColor: '#fef3cd', color: '#b7791f' }
                }
              >
                {d.severity}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-3">{d.animals}</p>

            <p className="text-sm text-gray-700 mb-1">
              <span className="font-semibold">Look for:</span> {d.lookFor}
            </p>
            <p className="text-sm mb-1" style={{ color: '#2e7d32' }}>
              <span className="font-semibold">Milk impact:</span> {d.milkImpact}
            </p>
            <p className="text-sm text-orange-700 mb-2">
              <span className="font-semibold">Prevent:</span> {d.prevent}
            </p>
            <p className="text-xs text-gray-400">Source: {d.source}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiseaseGuide;
