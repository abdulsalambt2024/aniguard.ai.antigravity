import React, { useState } from 'react';
import { Calculator, Wheat, Milk, Sparkles, CheckCircle2 } from 'lucide-react';
import { Animal } from '../../types/aniguard';

interface AIRationCalculatorViewProps {
  animals: Animal[];
}

export const AIRationCalculatorView: React.FC<AIRationCalculatorViewProps> = ({ animals }) => {
  const [selectedAnimalId, setSelectedAnimalId] = useState(animals[0]?.id || '');
  const [milkYield, setMilkYield] = useState(18.5);
  const [fatPercent, setFatPercent] = useState(4.2);
  const [weightKg, setWeightKg] = useState(440);

  // ICAR Standard Nutritional Calculation
  // Dry matter requirement: approx 2.5 - 3.0 kg per 100 kg body weight + 0.35 kg DM per kg milk
  const dmBase = (weightKg / 100) * 2.5;
  const dmMilk = milkYield * 0.33;
  const totalDM = Number((dmBase + dmMilk).toFixed(1));

  // Balanced Ration Distribution:
  // 60% Roughage (2/3rd Green Fodder, 1/3rd Dry Fodder) + 40% Concentrate
  const greenFodderKg = Number(((totalDM * 0.4) / 0.2).toFixed(1)); // 20% DM in green fodder
  const dryFodderKg = Number(((totalDM * 0.2) / 0.9).toFixed(1)); // 90% DM in dry straw
  const concentrateKg = Number(((totalDM * 0.4) / 0.9).toFixed(1)); // 90% DM in concentrate
  const mineralMixtureGm = 60;

  return (
    <div className="bg-[#0B1520] border border-[#182635] rounded-xl p-5 text-white shadow-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#182635]">
        <div className="w-10 h-10 rounded-xl bg-[#0E2E25] text-[#10B981] flex items-center justify-center border border-[#134E3E]">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            AI Balanced Feed Ration Calculator
          </h2>
          <p className="text-xs text-slate-400">
            Precision nutritional formulation compliant with ICAR-NDRI dairy cattle feeding standards
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Parameters */}
        <div className="bg-[#08101A] border border-[#182635] rounded-xl p-4 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Livestock Parameters
          </h3>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Select Animal</label>
            <select
              value={selectedAnimalId}
              onChange={(e) => {
                setSelectedAnimalId(e.target.value);
                const a = animals.find((ani) => ani.id === e.target.value);
                if (a) {
                  setMilkYield(a.baseline_milk_yield || 15);
                  setWeightKg(a.weight_kg || 420);
                }
              }}
              className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            >
              {animals.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.tag_id}) — {a.breed}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Daily Milk Yield (Liters)</label>
            <input
              type="number"
              step="0.5"
              value={milkYield}
              onChange={(e) => setMilkYield(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Estimated Body Weight (kg)</label>
            <input
              type="number"
              step="10"
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value) || 300)}
              className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Milk Fat Percentage (%)</label>
            <input
              type="number"
              step="0.1"
              value={fatPercent}
              onChange={(e) => setFatPercent(parseFloat(e.target.value) || 4.0)}
              className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
            />
          </div>
        </div>

        {/* Nutritional Formulation Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-xl bg-[#0E1A26] border border-[#182635] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Total Daily Dry Matter (DM)
              </span>
              <div className="text-2xl font-bold font-mono text-[#10B981] mt-0.5">
                {totalDM} kg / day
              </div>
              <p className="text-[11px] text-slate-400">
                Maintenance: {dmBase.toFixed(1)} kg + Lactation: {dmMilk.toFixed(1)} kg
              </p>
            </div>
            <Sparkles className="w-6 h-6 text-emerald-400 opacity-60" />
          </div>

          {/* Daily Ration Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#08101A] border border-[#182635]">
              <span className="text-[11px] font-semibold text-emerald-400 block mb-1">
                Green Fodder
              </span>
              <div className="text-xl font-bold font-mono text-white">{greenFodderKg} kg</div>
              <p className="text-[10px] text-slate-400 mt-1">Napier / Berseem / Maize</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#08101A] border border-[#182635]">
              <span className="text-[11px] font-semibold text-amber-400 block mb-1">
                Dry Fodder
              </span>
              <div className="text-xl font-bold font-mono text-white">{dryFodderKg} kg</div>
              <p className="text-[10px] text-slate-400 mt-1">Wheat / Paddy straw</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#08101A] border border-[#182635]">
              <span className="text-[11px] font-semibold text-cyan-400 block mb-1">
                Concentrate Feed
              </span>
              <div className="text-xl font-bold font-mono text-white">{concentrateKg} kg</div>
              <p className="text-[10px] text-slate-400 mt-1">20% CP dairy pellet / grains</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#08101A] border border-[#182635]">
              <span className="text-[11px] font-semibold text-purple-400 block mb-1">
                Mineral Mixture
              </span>
              <div className="text-xl font-bold font-mono text-white">{mineralMixtureGm} g</div>
              <p className="text-[10px] text-slate-400 mt-1">Chelated multi-mineral</p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#08101A] border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-emerald-400">Feeding Tip: </strong>
            Split the concentrate feed into 2 equal morning and evening portions mixed with soaked
            mustard/cottonseed cake. Provide minimum 60-70 liters of clean fresh drinking water
            ad-libitum.
          </div>
        </div>
      </div>
    </div>
  );
};
