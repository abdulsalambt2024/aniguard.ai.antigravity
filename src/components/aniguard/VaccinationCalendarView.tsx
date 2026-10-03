import React, { useState } from 'react';
import { Syringe, Plus, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Vaccination, Animal } from '../../types/aniguard';
import { aniguardService } from '../../services/aniguardService';

interface VaccinationCalendarViewProps {
  vaccinations: Vaccination[];
  animals: Animal[];
  onRefresh: () => void;
}

export const VaccinationCalendarView: React.FC<VaccinationCalendarViewProps> = ({
  vaccinations,
  animals,
  onRefresh,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState(animals[0]?.id || '');
  const [vaccineName, setVaccineName] = useState('FMD Trivalent Oil Adjuvant');
  const [diseaseTarget, setDiseaseTarget] = useState('Foot-and-Mouth Disease (FMD)');
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [dosage, setDosage] = useState(2.0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const animal = animals.find((a) => a.id === selectedAnimalId);

    aniguardService.addVaccination({
      animal_id: selectedAnimalId,
      tag_id: animal?.tag_id,
      animal_name: animal ? `${animal.name} (${animal.breed})` : 'Registered Animal',
      vaccine_name: vaccineName,
      disease_target: diseaseTarget,
      scheduled_date: scheduledDate,
      status: 'Upcoming',
      dosage_ml: Number(dosage),
    });

    onRefresh();
    setShowAddModal(false);
  };

  return (
    <div className="bg-[#0B1520] border border-[#182635] rounded-xl p-5 text-white shadow-lg space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#182635]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0E2E25] text-[#10B981] flex items-center justify-center border border-[#134E3E]">
            <Syringe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Vaccination & Deworming Calendar
            </h2>
            <p className="text-xs text-slate-400">
              National livestock immunization schedules & booster tracking
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vaccination Record</span>
        </button>
      </div>

      {/* Vaccinations Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="text-slate-400 border-b border-[#182635]">
              <th className="pb-2.5 font-semibold">Animal</th>
              <th className="pb-2.5 font-semibold">Vaccine Target</th>
              <th className="pb-2.5 font-semibold">Scheduled Date</th>
              <th className="pb-2.5 font-semibold">Dosage</th>
              <th className="pb-2.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#152332]">
            {vaccinations.map((vac) => {
              const isOverdue = vac.status === 'Overdue';
              const isCompleted = vac.status === 'Completed';

              return (
                <tr key={vac.id} className="hover:bg-[#0E1A26] transition">
                  <td className="py-3 font-semibold text-white">
                    <div>{vac.animal_name || 'Animal'}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{vac.tag_id}</div>
                  </td>
                  <td className="py-3">
                    <div className="text-white font-medium">{vac.vaccine_name}</div>
                    <div className="text-[11px] text-slate-400">{vac.disease_target}</div>
                  </td>
                  <td className="py-3 font-mono text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{vac.scheduled_date}</span>
                    </div>
                  </td>
                  <td className="py-3 font-mono text-slate-300">{vac.dosage_ml || 2.0} ml</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                        isOverdue
                          ? 'bg-[#2E1010] text-[#EF4444] border-[#5A1C1C]'
                          : isCompleted
                          ? 'bg-[#0E2E25] text-[#10B981] border-[#134E3E]'
                          : 'bg-[#101F2F] text-cyan-400 border-[#1C364F]'
                      }`}
                    >
                      {isOverdue && <AlertTriangle className="w-3 h-3" />}
                      {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                      <span>{vac.status}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B1520] border border-[#1A2634] rounded-2xl w-full max-w-md p-6 text-white shadow-2xl relative">
            <h3 className="text-base font-bold mb-4">Add Vaccination Schedule</h3>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Select Animal</label>
                <select
                  value={selectedAnimalId}
                  onChange={(e) => setSelectedAnimalId(e.target.value)}
                  className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {animals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.tag_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Vaccine Name</label>
                <input
                  type="text"
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  required
                  className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Target Disease</label>
                <input
                  type="text"
                  value={diseaseTarget}
                  onChange={(e) => setDiseaseTarget(e.target.value)}
                  required
                  className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                    className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Dosage (ml)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={dosage}
                    onChange={(e) => setDosage(parseFloat(e.target.value) || 2)}
                    className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-xs font-bold text-white shadow-md"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
