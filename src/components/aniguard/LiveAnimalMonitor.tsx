import React, { useState } from 'react';
import {
  ChevronRight,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Activity,
  Milk,
  Stethoscope,
  Copy,
  Check,
} from 'lucide-react';
import { Animal } from '../../types/aniguard';
import { toast } from 'sonner';

interface LiveAnimalMonitorProps {
  animals: Animal[];
  onSelectAnimal: (animal: Animal) => void;
  onViewAll: () => void;
  onQuickLog?: (animalId: string) => void;
  onQuickScan?: (animalId: string) => void;
}

export const LiveAnimalMonitor: React.FC<LiveAnimalMonitorProps> = ({
  animals,
  onSelectAnimal,
  onViewAll,
  onQuickLog,
  onQuickScan,
}) => {
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const handleCopyTag = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    toast.success(`RFID Tag ${tag} copied to clipboard!`);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  return (
    <div className="bg-[#0B1520] border border-[#182635] rounded-xl p-5 text-white shadow-lg flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#182635]">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Live Animal Health Monitor</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous individual baseline & anomaly tracking
            </p>
          </div>
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-[#10B981] hover:text-[#34D399] flex items-center gap-0.5 transition"
          >
            <span>View All ({animals.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Animal List */}
        <div className="divide-y divide-[#152332] mt-1">
          {animals.slice(0, 4).map((animal) => {
            const isHealthy = animal.health_status === 'Healthy';
            const isWatch = animal.health_status === 'Watch';
            const isSick = animal.health_status === 'Sick' || animal.health_status === 'Critical';

            const badgeBg = isHealthy
              ? 'bg-[#0E2E25] text-[#10B981] border-[#134E3E]'
              : isWatch
              ? 'bg-[#291F0E] text-[#F59E0B] border-[#4A3816]'
              : 'bg-[#2E1010] text-[#EF4444] border-[#5A1C1C]';

            const barColor = isHealthy
              ? 'bg-[#10B981]'
              : isWatch
              ? 'bg-[#F59E0B]'
              : 'bg-[#EF4444]';

            // Milk anomaly calculation
            const currentYield = animal.baseline_milk_yield;
            const hasYieldDrop = animal.health_status !== 'Healthy';

            return (
              <div
                key={animal.id}
                onClick={() => onSelectAnimal(animal)}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#0E1A26] px-2.5 rounded-xl cursor-pointer transition group border border-transparent hover:border-slate-800"
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <img
                      src={
                        animal.photo_url ||
                        'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=120&q=80'
                      }
                      alt={animal.name}
                      className="w-11 h-11 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0B1520] ${
                        isHealthy ? 'bg-emerald-500' : isWatch ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                    ></span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm text-white group-hover:text-emerald-400 transition truncate">
                        {animal.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyTag(e, animal.tag_id)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-[#101F2F] hover:bg-[#182C40] text-slate-300 font-mono flex items-center gap-1 transition"
                        title="Click to copy RFID Tag"
                      >
                        <span>{animal.tag_id}</span>
                        {copiedTag === animal.tag_id ? (
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-2.5 h-2.5 text-slate-500" />
                        )}
                      </button>
                    </div>

                    <div className="text-xs text-slate-400 truncate mt-0.5 flex items-center gap-2">
                      <span>{animal.breed}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Milk className="w-3 h-3 text-cyan-400" />
                        {currentYield} L/d
                      </span>
                      <span>•</span>
                      <span className="text-slate-500">{animal.lactation_stage}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Score, Mini-Chart & Status */}
                <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#152332]">
                  <div className="text-left sm:text-right">
                    <div className="flex items-center gap-1.5 sm:justify-end">
                      <span className="text-sm font-bold text-white font-mono">
                        {animal.current_health_score}%
                      </span>
                      {hasYieldDrop ? (
                        <TrendingDown className="w-3 h-3 text-amber-400" />
                      ) : (
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      )}
                    </div>
                    {/* Progress Bar */}
                    <div className="w-16 h-1.5 bg-[#142333] rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-300`}
                        style={{ width: `${animal.current_health_score}%` }}
                      ></div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${badgeBg} shadow-sm`}
                  >
                    {animal.health_status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom herd status recap */}
      <div className="pt-3 mt-2 border-t border-[#182635] flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Automated Daily Clinical Triage</span>
        </span>
        <span className="text-emerald-400 font-semibold">100% Monitored</span>
      </div>
    </div>
  );
};
