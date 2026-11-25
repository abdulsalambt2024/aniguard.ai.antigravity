import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface PdfDiseaseGuideViewProps {
  onBack?: () => void;
}

export const PdfDiseaseGuideView: React.FC<PdfDiseaseGuideViewProps> = ({ onBack }) => {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Cow' | 'Buffalo' | 'Goat'>('All');

  const filterTabs: ('All' | 'Cow' | 'Buffalo' | 'Goat')[] = ['All', 'Cow', 'Buffalo', 'Goat'];

  const guideItems = [
    {
      id: 'fmd',
      name: 'Foot-and-mouth disease',
      priority: 'Emergency',
      species: 'Cow, buffalo, goat, sheep',
      speciesList: ['Cow', 'Buffalo', 'Goat'],
      lookFor: 'high fever, blisters on tongue and gums, ropy saliva, lameness',
      milkImpact: 'sharp fall in output; long-term loss in crossbred cows.',
      prevent: 'isolate suspect animals and disinfect strictly.',
      source: 'WOAH, DAHD',
    },
    {
      id: 'ppr',
      name: 'PPR (goat plague)',
      priority: 'Emergency',
      species: 'Goat, sheep',
      speciesList: ['Goat'],
      lookFor: 'fever, eye and nose discharge, mouth sores, foul diarrhoea',
      milkImpact: 'lactation stops quickly; fast dehydration.',
      prevent: 'quarantine new goats for 21 days.',
      source: 'ICAR-IVRI, DAHD',
    },
    {
      id: 'hs',
      name: 'Hemorrhagic septicemia',
      priority: 'Emergency',
      species: 'Cow, buffalo',
      speciesList: ['Cow', 'Buffalo'],
      lookFor: 'sudden fever, swollen throat and brisket, drooling',
      milkImpact: 'milk stops completely, animal collapses.',
      prevent: 'avoid waterlogged pasture in monsoon.',
      source: 'ICAR-IVRI',
    },
    {
      id: 'lsd',
      name: 'Lumpy skin disease',
      priority: 'High',
      species: 'Cow, buffalo',
      speciesList: ['Cow', 'Buffalo'],
      lookFor: 'fever, firm skin lumps, swollen glands, drooling',
      milkImpact: 'up to 50% drop in yield.',
      prevent: 'control flies, quarantine new arrivals.',
      source: 'WOAH',
    },
    {
      id: 'mastitis',
      name: 'Bovine mastitis',
      priority: 'High',
      species: 'Cow, buffalo',
      speciesList: ['Cow', 'Buffalo'],
      lookFor: 'hot swollen udder, clots in milk, fever, low appetite',
      milkImpact: '15–40% drop in yield; clots or flakes.',
      prevent: 'teat dipping after milking, clean dry housing.',
      source: 'ICAR-CIRB',
    },
  ];

  const filtered = guideItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.lookFor.toLowerCase().includes(search.toLowerCase()) ||
      item.species.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilter === 'All') return true;
    return item.speciesList.includes(selectedFilter);
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 pb-28">
      {/* Optional Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#122B1E] hover:opacity-80 transition py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Care hub</span>
        </button>
      )}

      {/* Header */}
      <div className="pt-1">
        <h1 className="text-3xl font-bold text-[#122B1E] tracking-tight">
          Disease guide
        </h1>
        <p className="text-sm text-[#5E6C61] mt-0.5">
          Verified by ICAR and WOAH
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search a disease or symptom"
          className="w-full bg-white border border-[#DFE4DA] rounded-2xl px-4 py-3 text-sm text-[#122B1E] placeholder-[#8A968E] shadow-sm focus:outline-none focus:ring-1 focus:ring-[#122B1E]"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto py-0.5 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = selectedFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setSelectedFilter(tab)}
              className={`px-5 py-2 rounded-full text-xs font-medium transition ${
                isActive
                  ? 'bg-[#122B1E] text-white shadow-sm'
                  : 'bg-white border border-[#DFE4DA] text-[#122B1E] hover:border-[#122B1E]/40'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Disease Cards Responsive Grid (1 col on mobile, 2 col on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {filtered.map((item) => {
          const isEmergency = item.priority === 'Emergency';
          const badgeClass = isEmergency
            ? 'bg-[#FDE8E8] text-[#C0392B]'
            : 'bg-[#FEF3D6] text-[#B45309]';

          return (
            <div
              key={item.id}
              className="bg-white rounded-[22px] p-5 border border-[#E5EAE1] shadow-sm space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-base text-[#122B1E] tracking-tight">{item.name}</h3>
                <span className={`px-3 py-0.5 rounded-full font-medium text-xs ${badgeClass}`}>
                  {item.priority}
                </span>
              </div>

              <p className="text-[#5E6C61] font-medium text-xs">{item.species}</p>

              <div className="space-y-1.5 pt-0.5 text-[#2D3B32] text-xs leading-relaxed">
                <p>
                  <strong className="text-[#122B1E] font-bold">Look for: </strong>
                  {item.lookFor}
                </p>

                <p>
                  <strong className="text-[#185834] font-bold">Milk impact: </strong>
                  {item.milkImpact}
                </p>

                <p>
                  <strong className="text-[#9C6219] font-bold">Prevent: </strong>
                  {item.prevent}
                </p>
              </div>

              <div className="pt-1 text-[11px] text-[#8A968E]">
                Source: {item.source}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
