import React, { useState } from 'react';
import { X, Milk, Thermometer, Check } from 'lucide-react';
import { Animal, DailyRecord } from '../../types/aniguard';
import { aniguardService } from '../../services/aniguardService';

interface DailyLoggingModalProps {
  isOpen: boolean;
  onClose: () => void;
  animals: Animal[];
  onSaved: () => void;
  defaultAnimalId?: string;
}

export const DailyLoggingModal: React.FC<DailyLoggingModalProps> = ({
  isOpen,
  onClose,
  animals,
  onSaved,
  defaultAnimalId,
}) => {
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(
    defaultAnimalId || animals[0]?.id || ''
  );
  const [morningMilk, setMorningMilk] = useState<number>(8.0);
  const [eveningMilk, setEveningMilk] = useState<number>(7.0);
  const [temperature, setTemperature] = useState<number>(38.6);
  const [appetite, setAppetite] = useState<DailyRecord['appetite']>('Normal');
  const [rumination, setRumination] = useState<DailyRecord['rumination_level']>('Normal');
  const [activity, setActivity] = useState<DailyRecord['activity_level']>('Normal');
  const [feces, setFeces] = useState<DailyRecord['feces_status']>('Normal');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const totalMilk = Number((Number(morningMilk || 0) + Number(eveningMilk || 0)).toFixed(2));

  const handleSave = () => {
    aniguardService.addDailyRecord({
      animal_id: selectedAnimalId,
      record_date: new Date().toISOString().split('T')[0],
      milk_morning_liters: Number(morningMilk),
      milk_evening_liters: Number(eveningMilk),
      temperature_celsius: Number(temperature),
      appetite,
      water_intake: 'Normal',
      rumination_level: rumination,
      activity_level: activity,
      feces_status: feces,
      symptoms: appetite !== 'Normal' ? [`Appetite ${appetite}`] : [],
      farmer_notes: notes,
    });

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0B1520] border border-[#1A2634] rounded-2xl w-full max-w-lg text-white shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-[#182635]">
          <div className="w-10 h-10 rounded-xl bg-[#0E2E25] text-[#10B981] flex items-center justify-center border border-[#134E3E]">
            <Milk className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Daily Health & Milk Log
            </h2>
            <p className="text-xs text-slate-400">
              Quick daily record for livestock baseline tracking
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {/* Animal Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Animal
            </label>
            <select
              value={selectedAnimalId}
              onChange={(e) => setSelectedAnimalId(e.target.value)}
              className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {animals.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.tag_id}) — {a.breed}
                </option>
              ))}
            </select>
          </div>

          {/* Milk Yield Row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Morning Milk (L)
              </label>
              <input
                type="number"
                step="0.1"
                value={morningMilk}
                onChange={(e) => setMorningMilk(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Evening Milk (L)
              </label>
              <input
                type="number"
                step="0.1"
                value={eveningMilk}
                onChange={(e) => setEveningMilk(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-emerald-400 mb-1">
                Total Today (L)
              </label>
              <div className="w-full bg-[#0C1E20] border border-[#10B981]/40 rounded-lg px-3 py-2 text-sm font-bold text-[#10B981] font-mono">
                {totalMilk} L
              </div>
            </div>
          </div>

          {/* Temperature */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-red-400" />
                <span>Body Temperature (°C)</span>
              </label>
              <span className="text-[10px] text-slate-400">Normal: 38.3 - 39.2°C</span>
            </div>
            <input
              type="number"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value) || 38.6)}
              className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
            />
          </div>

          {/* Vitals Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Appetite
              </label>
              <select
                value={appetite}
                onChange={(e) => setAppetite(e.target.value as any)}
                className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                <option value="Normal">Normal (Good feeding)</option>
                <option value="Reduced">Reduced (Partial feed left)</option>
                <option value="Anorexic">Anorexic (Off feed entirely)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Rumination (Chewing Cud)
              </label>
              <select
                value={rumination}
                onChange={(e) => setRumination(e.target.value as any)}
                className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                <option value="Normal">Normal</option>
                <option value="Low">Low / Slow</option>
                <option value="Absent">Absent / Stopped</option>
              </select>
            </div>
          </div>

          {/* Activity & Feces */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Activity
              </label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value as any)}
                className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                <option value="Normal">Normal Alert</option>
                <option value="Lethargic">Lethargic / Dull</option>
                <option value="Restless">Restless / Kicking</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Feces Status
              </label>
              <select
                value={feces}
                onChange={(e) => setFeces(e.target.value as any)}
                className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                <option value="Normal">Normal Consistency</option>
                <option value="Loose">Loose / Watery</option>
                <option value="Diarrhea">Severe Diarrhea</option>
                <option value="Bloody">Bloody / Mucoid</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Farmer Observations (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Mild coughing in morning, completed all silage"
              className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full mt-2 py-3 rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Save & Recalculate Health Baseline</span>
          </button>
        </div>
      </div>
    </div>
  );
};
