import React, { useState } from 'react';
import { PawPrint, Plus, Search, ChevronRight, Activity, Milk } from 'lucide-react';
import { Animal } from '../../types/aniguard';

interface AnimalsListViewProps {
  animals: Animal[];
  onSelectAnimal: (animal: Animal) => void;
  onAddAnimal: () => void;
}

export const AnimalsListView: React.FC<AnimalsListViewProps> = ({
  animals,
  onSelectAnimal,
  onAddAnimal,
}) => {
  const [search, setSearch] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('All');

  const filtered = animals.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.tag_id.toLowerCase().includes(search.toLowerCase()) ||
      a.breed.toLowerCase().includes(search.toLowerCase());

    const matchSpecies = filterSpecies === 'All' || a.species === filterSpecies;
    return matchSearch && matchSpecies;
  });

  return (
    <div className="bg-[#0B1520] border border-[#182635] rounded-xl p-5 text-white shadow-lg space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#182635]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0E2E25] text-[#10B981] flex items-center justify-center border border-[#134E3E]">
            <PawPrint className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Registered Livestock Herd</h2>
            <p className="text-xs text-slate-400">
              Individual baseline monitoring, milk records, and clinical scores
            </p>
          </div>
        </div>

        <button
          onClick={onAddAnimal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Animal</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, tag ID, or breed..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#08101A] border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={filterSpecies}
          onChange={(e) => setFilterSpecies(e.target.value)}
          className="bg-[#08101A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
        >
          <option value="All">All Species ({animals.length})</option>
          <option value="Cow">Cattle / Cows</option>
          <option value="Buffalo">Buffaloes</option>
          <option value="Goat">Goats</option>
          <option value="Sheep">Sheep</option>
        </select>
      </div>

      {/* Animal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((animal) => {
          const isHealthy = animal.health_status === 'Healthy';
          const isWatch = animal.health_status === 'Watch';

          return (
            <div
              key={animal.id}
              onClick={() => onSelectAnimal(animal)}
              className="p-4 rounded-xl bg-[#08101A] border border-[#182635] hover:border-emerald-500/50 cursor-pointer transition flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={
                    animal.photo_url ||
                    'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={animal.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition truncate">
                      {animal.name}
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#101F2F] text-emerald-400">
                      {animal.tag_id}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {animal.species} • {animal.breed} • {animal.age_years} yrs
                  </p>

                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-300">
                    <span className="flex items-center gap-1 font-mono text-cyan-400">
                      <Milk className="w-3 h-3" />
                      {animal.baseline_milk_yield} L/day baseline
                    </span>
                    {animal.pregnancy_status && (
                      <span className="text-amber-400 font-medium">
                        Month {animal.pregnancy_month} Pregnant
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge & Score */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                    isHealthy
                      ? 'bg-[#0E2E25] text-[#10B981] border-[#134E3E]'
                      : isWatch
                      ? 'bg-[#291F0E] text-[#F59E0B] border-[#4A3816]'
                      : 'bg-[#2E1010] text-[#EF4444] border-[#5A1C1C]'
                  }`}
                >
                  {animal.health_status}
                </span>

                <div className="text-right">
                  <span className="text-base font-bold font-mono text-white">
                    {animal.current_health_score}%
                  </span>
                  <div className="text-[9px] text-slate-400 uppercase">Score</div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
