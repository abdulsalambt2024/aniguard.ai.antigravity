import React, { useState } from 'react';
import { X, Plus, PawPrint } from 'lucide-react';
import { aniguardService } from '../../services/aniguardService';

interface AddAnimalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnimalAdded: () => void;
}

export const AddAnimalModal: React.FC<AddAnimalModalProps> = ({
  isOpen,
  onClose,
  onAnimalAdded,
}) => {
  const [tagId, setTagId] = useState('IN-GJ-' + Math.floor(1000 + Math.random() * 9000));
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<'Cow' | 'Buffalo' | 'Goat' | 'Sheep'>('Cow');
  const [breed, setBreed] = useState('Gir Indigenous');
  const [ageYears, setAgeYears] = useState(3.5);
  const [baselineMilk, setBaselineMilk] = useState(12.0);
  const [isPregnant, setIsPregnant] = useState(false);
  const [pregnancyMonth, setPregnancyMonth] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    aniguardService.addAnimal({
      tag_id: tagId,
      name,
      species,
      breed,
      age_years: Number(ageYears),
      gender: 'Female',
      baseline_milk_yield: Number(baselineMilk),
      pregnancy_status: isPregnant,
      pregnancy_month: isPregnant ? Number(pregnancyMonth) : 0,
      lactation_stage: 'Mid Lactation',
      farm_name: 'GreenPastures Dairy Farm',
      photo_url:
        species === 'Buffalo'
          ? 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=400&q=80'
          : species === 'Goat'
          ? 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=400&q=80'
          : 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=400&q=80',
    });

    onAnimalAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0B1520] border border-[#1A2634] rounded-2xl w-full max-w-md text-white shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-[#182635]">
          <div className="w-10 h-10 rounded-xl bg-[#0E2E25] text-[#10B981] flex items-center justify-center border border-[#134E3E]">
            <PawPrint className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Add Livestock Animal</h2>
            <p className="text-xs text-slate-400">Register new animal into AniGuard AI monitoring</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tag ID</label>
              <input
                type="text"
                value={tagId}
                onChange={(e) => setTagId(e.target.value)}
                required
                className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Animal Name</label>
              <input
                type="text"
                placeholder="e.g. Kaveri"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Species</label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as any)}
                className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="Cow">Cow (Cattle)</option>
                <option value="Buffalo">Buffalo</option>
                <option value="Goat">Goat</option>
                <option value="Sheep">Sheep</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Breed</label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                required
                className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Age (Years)</label>
              <input
                type="number"
                step="0.5"
                value={ageYears}
                onChange={(e) => setAgeYears(parseFloat(e.target.value) || 1)}
                className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Baseline Milk Yield (L/day)
              </label>
              <input
                type="number"
                step="0.5"
                value={baselineMilk}
                onChange={(e) => setBaselineMilk(parseFloat(e.target.value) || 5)}
                className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#08101A] border border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPregnant}
                onChange={(e) => setIsPregnant(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0"
              />
              <span className="text-xs font-semibold text-slate-200">
                Animal is Currently Pregnant
              </span>
            </label>

            {isPregnant && (
              <div className="mt-2.5">
                <label className="block text-[11px] text-slate-400 mb-1">
                  Pregnancy Month (1 - 9)
                </label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={pregnancyMonth}
                  onChange={(e) => setPregnancyMonth(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Register Animal into Herd</span>
          </button>
        </form>
      </div>
    </div>
  );
};
