import React, { useState } from 'react';
import { Animal } from '../../types/aniguard';

interface PdfHerdViewProps {
  animals: Animal[];
  onSelectAnimal: (animal: Animal) => void;
  onAddAnimal: () => void;
}

export const PdfHerdView: React.FC<PdfHerdViewProps> = ({
  animals,
  onSelectAnimal,
  onAddAnimal,
}) => {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Cows' | 'Buffalo' | 'Goats'>('All');

  const filterTabs: ('All' | 'Cows' | 'Buffalo' | 'Goats')[] = ['All', 'Cows', 'Buffalo', 'Goats'];

  // Herd items matching the exact screenshot
  const herdData = [
    {
      id: 'ani_4',
      name: 'Moti',
      tag: 'IN-GJ-3090',
      breed: 'Goat · Sirohi · 2 yrs',
      milk: '2.1 L/day',
      health: 5,
      status: 'Critical',
      species: 'Goats',
      avatar: 'M',
      avatarBg: 'bg-[#FDE8E8] text-[#C0392B]',
      badgeBg: 'bg-[#FDE8E8] text-[#C0392B]',
    },
    {
      id: 'ani_2',
      name: 'Lakshmi',
      tag: 'IN-GJ-1088',
      breed: 'Cow · Gir · 3 yrs',
      milk: '11.2 L/day',
      health: 51,
      status: 'Sick',
      species: 'Cows',
      avatar: 'L',
      avatarBg: 'bg-[#FEF3D6] text-[#B45309]',
      badgeBg: 'bg-[#FEF3D6] text-[#B45309]',
    },
    {
      id: 'ani_1',
      name: 'Gauri',
      tag: 'IN-GJ-1042',
      breed: 'Cow · Holstein cross · 4 yrs',
      milk: '18.5 L/day',
      extraTag: 'Month 6',
      health: 90,
      status: 'Healthy',
      species: 'Cows',
      avatar: 'G',
      avatarBg: 'bg-[#DCF8E8] text-[#126A42]',
      badgeBg: 'bg-[#DCF8E8] text-[#126A42]',
    },
    {
      id: 'ani_3',
      name: 'Shera',
      tag: 'IN-GJ-2011',
      breed: 'Buffalo · Murrah · 5 yrs',
      milk: '15 L/day',
      health: 90,
      status: 'Healthy',
      species: 'Buffalo',
      avatar: 'S',
      avatarBg: 'bg-[#DCF8E8] text-[#126A42]',
      badgeBg: 'bg-[#DCF8E8] text-[#126A42]',
    },
  ];

  const filtered = herdData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.tag.toLowerCase().includes(search.toLowerCase()) ||
      item.breed.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilter === 'All') return true;
    return item.species === selectedFilter;
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-28">
      {/* Header */}
      <div className="pt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#122B1E] tracking-tight">
            Your herd
          </h1>
          <p className="text-sm text-[#5E6C61] mt-0.5">
            4 animals · 46.8 L today
          </p>
        </div>

        {/* Desktop Quick Action */}
        <div className="hidden sm:block">
          <button
            onClick={onAddAnimal}
            className="px-5 py-2.5 rounded-2xl bg-[#122B1E] hover:bg-[#1b3b2a] text-white font-semibold text-xs shadow-sm transition"
          >
            + Add animal
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, tag or breed"
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

      {/* Responsive Animal Cards: 1 col on mobile, 2 col on tablet/desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              const matched = animals.find((a) => a.id === item.id) || animals[0];
              if (matched) onSelectAnimal(matched);
            }}
            className="bg-white rounded-[22px] p-4.5 border border-[#E5EAE1] shadow-sm flex items-center justify-between gap-3 cursor-pointer hover:border-[#122B1E]/40 hover:shadow-md transition active:scale-[0.99]"
          >
            {/* Left: Avatar & Info */}
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shrink-0 ${item.avatarBg}`}
              >
                {item.avatar}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-[#122B1E] leading-tight">
                    {item.name}
                  </h3>
                  <span className="text-xs text-[#8A968E] font-medium font-mono">
                    {item.tag}
                  </span>
                </div>

                <p className="text-xs text-[#5E6C61]">
                  {item.breed}
                </p>

                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-xs font-semibold text-[#122B1E]">
                    {item.milk}
                  </span>
                  {item.extraTag && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FEF6E9] text-[#7C4610] text-[11px] font-semibold">
                      {item.extraTag}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Health Score & Status Badge */}
            <div className="text-right flex flex-col items-end shrink-0">
              <span className="text-2xl font-bold text-[#122B1E] leading-tight">
                {item.health}%
              </span>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-medium mt-1 ${item.badgeBg}`}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Animal Full-Width Button (Mobile Friendly) */}
      <div className="pt-2 sm:hidden">
        <button
          onClick={onAddAnimal}
          className="w-full py-4 rounded-2xl bg-[#122B1E] hover:bg-[#1b3b2a] text-white text-base font-semibold shadow-md active:scale-[0.99] transition"
        >
          Add animal
        </button>
      </div>
    </div>
  );
};
