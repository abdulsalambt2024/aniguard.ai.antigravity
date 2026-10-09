import React, { useState } from 'react';
import {
  X,
  Upload,
  Camera,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  FileText,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import { Animal, Disease, HealthPrediction } from '../../types/aniguard';
import { PredictiveHealthEngine } from '../../services/predictiveEngine';
import { aniguardService } from '../../services/aniguardService';

interface AIHealthCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  animals: Animal[];
  diseases: Disease[];
  onEscalateVet: (animalId: string, predictionId?: string) => void;
}

export const AIHealthCheckModal: React.FC<AIHealthCheckModalProps> = ({
  isOpen,
  onClose,
  animals,
  diseases,
  onEscalateVet,
}) => {
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(animals[0]?.id || '');
  const [symptomsText, setSymptomsText] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<HealthPrediction | null>(null);

  if (!isOpen) return null;

  const symptomPresets = [
    'Reduced milk production',
    'Loss of appetite',
    'Elevated body temperature / Fever',
    'Swollen or hot udder',
    'Excessive ropy salivation',
    'Difficulty walking / Lameness',
    'Firm skin nodules / bumps',
    'Nasal or ocular discharge',
    'Abnormal watery or clotted milk',
  ];

  const toggleChip = (chip: string) => {
    if (selectedChips.includes(chip)) {
      setSelectedChips(selectedChips.filter((c) => c !== chip));
    } else {
      setSelectedChips([...selectedChips, chip]);
    }
  };

  const handleRunDiagnosis = () => {
    setIsAnalyzing(true);
    setResult(null);

    setTimeout(() => {
      const animal = animals.find((a) => a.id === selectedAnimalId) || animals[0];
      const records = aniguardService.getDailyRecords(animal.id);
      const vaccinations = aniguardService.getVaccinations();

      // Create a temporary mock record reflecting active symptoms entered
      const allSymptoms = [...selectedChips];
      if (symptomsText.trim()) {
        allSymptoms.push(symptomsText.trim());
      }

      const tempRecords = [...records];
      if (allSymptoms.length > 0) {
        tempRecords.push({
          id: 'temp_active',
          animal_id: animal.id,
          record_date: new Date().toISOString().split('T')[0],
          milk_morning_liters: animal.baseline_milk_yield ? animal.baseline_milk_yield * 0.4 : 7,
          milk_evening_liters: animal.baseline_milk_yield ? animal.baseline_milk_yield * 0.35 : 6,
          total_milk_liters: animal.baseline_milk_yield ? animal.baseline_milk_yield * 0.75 : 13,
          temperature_celsius: allSymptoms.some((s) => s.toLowerCase().includes('fever') || s.toLowerCase().includes('temperature'))
            ? 40.2
            : 38.6,
          appetite: allSymptoms.some((s) => s.toLowerCase().includes('appetite')) ? 'Reduced' : 'Normal',
          water_intake: 'Normal',
          rumination_level: allSymptoms.some((s) => s.toLowerCase().includes('appetite')) ? 'Low' : 'Normal',
          activity_level: allSymptoms.some((s) => s.toLowerCase().includes('walking') || s.toLowerCase().includes('lameness'))
            ? 'Lethargic'
            : 'Normal',
          feces_status: 'Normal',
          symptoms: allSymptoms,
        });
      }

      const evaluation = PredictiveHealthEngine.evaluateAnimal(
        animal,
        tempRecords,
        vaccinations,
        diseases
      );

      setResult(evaluation.prediction);
      setIsAnalyzing(false);
      aniguardService.runHerdEvaluation();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0B1520] border border-[#1A2634] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-white shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-[#182635]">
          <div className="w-10 h-10 rounded-xl bg-[#0E2E25] text-[#10B981] flex items-center justify-center border border-[#134E3E]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">AI Health Scan</h2>
            <p className="text-xs text-slate-400">
              Multi-signal early risk screening based on physiological baselines
            </p>
          </div>
        </div>

        {!result ? (
          /* Input Form */
          <div className="mt-5 space-y-5">
            {/* Animal Selector */}
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
                    {a.name} ({a.tag_id}) — {a.breed} ({a.health_status})
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Upload Animal Photo / Video (Eyes, Udder, Skin, Lesions)
              </label>
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-5 text-center bg-[#08101A] transition cursor-pointer flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#102422] text-[#10B981] flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200">
                    Click to capture or upload photo
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supports JPG, PNG up to 10MB
                  </p>
                </div>
              </div>
            </div>

            {/* Symptom Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Common Symptoms (Tap to Select)
              </label>
              <div className="flex flex-wrap gap-2">
                {symptomPresets.map((chip) => {
                  const isSelected = selectedChips.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleChip(chip)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                        isSelected
                          ? 'bg-[#0E2E25] border-[#10B981] text-[#10B981] font-semibold'
                          : 'bg-[#0E1A26] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Symptoms Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Additional Notes or Observations
              </label>
              <textarea
                value={symptomsText}
                onChange={(e) => setSymptomsText(e.target.value)}
                placeholder="e.g. Animal stopped chewing cud yesterday, udder feels hard on left quarter..."
                rows={3}
                className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              ></textarea>
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunDiagnosis}
              disabled={isAnalyzing}
              className="w-full py-3 rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Running AniGuard Multi-Signal Analysis...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Run AI Health Assessment</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Result Screen */
          <div className="mt-5 space-y-5">
            {/* Header Banner */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                result.risk_level === 'Critical' || result.risk_level === 'High Risk'
                  ? 'bg-[#2A1010] border-[#5A1C1C]'
                  : result.risk_level === 'Early Risk' || result.risk_level === 'Watch'
                  ? 'bg-[#291F0E] border-[#4A3816]'
                  : 'bg-[#0E2E25] border-[#134E3E]'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  AI HEALTH ASSESSMENT
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl font-bold text-white">
                    Risk Level: {result.risk_level}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-black/40 font-mono text-slate-300">
                    Confidence: {result.confidence_level}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black font-mono text-white">
                  {result.risk_score}%
                </span>
                <p className="text-[10px] text-slate-400">Risk Score</p>
              </div>
            </div>

            {/* Suspected Conditions */}
            {result.differential_conditions && result.differential_conditions.length > 0 && (
              <div className="bg-[#0E1A26] border border-[#182635] rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  Associated Clinical Conditions
                </h4>
                <div className="space-y-2">
                  {result.differential_conditions.slice(0, 3).map((diff, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[#08101A] border border-[#182635]"
                    >
                      <div>
                        <span className="font-semibold text-xs text-white">
                          {diff.disease_name}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Matching: {diff.matching_symptoms.join(', ')}
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#F59E0B]">
                        {diff.compatibility_score}% Match
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence & Explanation */}
            <div className="bg-[#0E1A26] border border-[#182635] rounded-xl p-4">
              <h4 className="text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Clinical Findings & Evidence</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{result.explanation}</p>
            </div>

            {/* Recommended Action */}
            <div className="bg-[#0E1A26] border border-[#182635] rounded-xl p-4">
              <h4 className="text-xs font-bold text-amber-400 mb-1.5 uppercase tracking-wider">
                Recommended Precautions
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {result.recommended_action}
              </p>
            </div>

            {/* Safety Notice */}
            <div className="p-3 rounded-lg bg-[#141A22] border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Clinical Notice:</strong> AniGuard AI provides predictive triage screening based on baseline deviations. Treatment protocols require evaluation by a registered veterinarian.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                onClick={() => {
                  onEscalateVet(result.animal_id, result.id);
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Contact Veterinarian / Escalate</span>
              </button>

              <button
                onClick={() => setResult(null)}
                className="px-4 py-2.5 rounded-lg bg-[#142333] hover:bg-[#1C2F44] border border-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                New Assessment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
