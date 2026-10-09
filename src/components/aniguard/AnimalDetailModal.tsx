import React from 'react';
import {
  X,
  HeartPulse,
  Milk,
  Thermometer,
  ShieldCheck,
  PhoneCall,
  Calendar,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { Animal, DailyRecord, HealthPrediction } from '../../types/aniguard';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface AnimalDetailModalProps {
  animal: Animal | null;
  records: DailyRecord[];
  prediction?: HealthPrediction;
  isOpen: boolean;
  onClose: () => void;
  onOpenLogModal: (animalId: string) => void;
  onOpenAICheck: (animalId: string) => void;
  onEscalateVet: (animalId: string) => void;
}

export const AnimalDetailModal: React.FC<AnimalDetailModalProps> = ({
  animal,
  records,
  prediction,
  isOpen,
  onClose,
  onOpenLogModal,
  onOpenAICheck,
  onEscalateVet,
}) => {
  if (!isOpen || !animal) return null;

  // Chart data from records (chronological)
  const chartData = [...records]
    .sort((a, b) => new Date(a.record_date).getTime() - new Date(b.record_date).getTime())
    .map((r) => ({
      date: r.record_date.slice(5),
      milk: r.total_milk_liters,
      baseline: animal.baseline_milk_yield,
      temp: r.temperature_celsius || 38.6,
    }));

  const isHealthy = animal.health_status === 'Healthy';
  const isWatch = animal.health_status === 'Watch';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-[#0B1520] border border-[#1A2634] rounded-2xl w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto text-white shadow-2xl p-4 sm:p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-white transition p-1.5 rounded-lg bg-[#0E1A26] border border-slate-800 z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animal Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#182635]">
          <div className="flex items-center gap-4">
            <img
              src={
                animal.photo_url ||
                'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=200&q=80'
              }
              alt={animal.name}
              className="w-16 h-16 rounded-xl object-cover border-2 border-slate-700"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">{animal.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-[#101F2F] text-emerald-400 font-mono font-bold">
                  {animal.tag_id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {animal.species} • {animal.breed} • {animal.age_years} yrs • Weight: {animal.weight_kg || 400} kg
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-300">
                <span className="px-2 py-0.5 rounded bg-[#142333] border border-slate-800">
                  {animal.lactation_stage}
                </span>
                {animal.pregnancy_status && (
                  <span className="px-2 py-0.5 rounded bg-[#2D1C10] text-amber-400 border border-[#482F1A]">
                    Pregnancy Month {animal.pregnancy_month}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Health Score Gauge */}
          <div className="flex items-center gap-3 bg-[#08101A] border border-[#182635] p-3 rounded-xl">
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-white">
                {animal.current_health_score}%
              </span>
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Health Score
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded text-xs font-bold border ${
                isHealthy
                  ? 'bg-[#0E2E25] text-[#10B981] border-[#134E3E]'
                  : isWatch
                  ? 'bg-[#291F0E] text-[#F59E0B] border-[#4A3816]'
                  : 'bg-[#2E1010] text-[#EF4444] border-[#5A1C1C]'
              }`}
            >
              {animal.health_status}
            </span>
          </div>
        </div>

        {/* Explainability Engine: Why did AniGuard Warn Me? */}
        {prediction && (
          <div className="mt-5 p-4 rounded-xl bg-[#0E1A26] border border-[#182635]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Explainable AI Health Assessment</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {prediction.model_version} • Confidence: {prediction.confidence_level}
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed mb-3">
              {prediction.explanation}
            </p>

            {/* Evidence Table */}
            {prediction.evidence_list && prediction.evidence_list.length > 0 && (
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-[11px] text-left">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800">
                      <th className="pb-1 font-semibold">Observed Indicator</th>
                      <th className="pb-1 font-semibold">Baseline</th>
                      <th className="pb-1 font-semibold">Observed</th>
                      <th className="pb-1 font-semibold">Deviation</th>
                      <th className="pb-1 font-semibold">Clinical Importance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {prediction.evidence_list.map((ev, i) => (
                      <tr key={i} className="text-slate-300">
                        <td className="py-1.5 font-sans font-medium text-white">
                          {ev.feature_name}
                        </td>
                        <td className="py-1.5">{ev.baseline_value}</td>
                        <td className="py-1.5">{ev.observed_value}</td>
                        <td
                          className={`py-1.5 font-bold ${
                            ev.change_percentage < 0 ? 'text-red-400' : 'text-emerald-400'
                          }`}
                        >
                          {ev.change_percentage}%
                        </td>
                        <td className="py-1.5 text-slate-400">
                          {Math.round(ev.importance_weight * 100)}% Weight
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 14-day Milk Trend Chart */}
        <div className="mt-5 p-4 rounded-xl bg-[#08101A] border border-[#182635]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Daily Milk Production vs Individual Baseline (L)
              </h4>
              <p className="text-[11px] text-slate-400">
                Baseline: {animal.baseline_milk_yield} L/day
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-0.5 bg-emerald-400"></span> Actual Milk
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-0.5 bg-slate-500 border-dashed"></span> Baseline
              </span>
            </div>
          </div>

          <div className="h-44 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2634" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0E1A26',
                      borderColor: '#182635',
                      fontSize: '11px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="milk"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#10B981' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke="#64748B"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No daily records available. Log daily milk to visualize baseline trends.
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Footer */}
        <div className="flex flex-wrap items-center gap-2.5 mt-5 pt-4 border-t border-[#182635]">
          <button
            onClick={() => onOpenLogModal(animal.id)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold transition shadow-md"
          >
            <Milk className="w-4 h-4" />
            <span>Log Daily Milk & Vitals</span>
          </button>

          <button
            onClick={() => onOpenAICheck(animal.id)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0C1E20] hover:bg-[#122A2D] border border-[#10B981]/50 text-[#10B981] text-xs font-semibold transition"
          >
            <HeartPulse className="w-4 h-4" />
            <span>Run AI Health Check</span>
          </button>

          <button
            onClick={() => onEscalateVet(animal.id)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#2A1010] hover:bg-[#3D1414] border border-[#5A1C1C] text-red-400 text-xs font-semibold transition ml-auto"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Consult Veterinarian</span>
          </button>
        </div>
      </div>
    </div>
  );
};
