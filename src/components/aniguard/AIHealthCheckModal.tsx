import React, { useRef, useState } from 'react';
import {
  X,
  Camera,
  CheckCircle2,
  PhoneCall,
  Activity,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Info,
  RefreshCw,
} from 'lucide-react';
import { Animal, DailyRecord, Disease, HealthPrediction, ImageQualityReport } from '../../types/aniguard';
import { PredictiveHealthEngine } from '../../services/predictiveEngine';
import { aniguardService } from '../../services/aniguardService';
import { analyzeImageQuality } from '../../utils/imageQuality';
import { toast } from 'sonner';

interface AIHealthCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  animals: Animal[];
  diseases: Disease[];
  onEscalateVet: (animalId: string, predictionId?: string) => void;
  onAssessmentSaved?: () => void;
}

const OBSERVATION_TYPES = [
  { id: 'skin', label: 'Skin / Coat', hint: 'Capture clear daylight view of nodules, lesions, or coat patches' },
  { id: 'udder', label: 'Udder / Teats', hint: 'Show swelling, redness, or teat blisters without glare' },
  { id: 'eye_nose', label: 'Eyes / Nose / Mouth', hint: 'Frame muzzle/eyes clearly to show discharge or erosions' },
  { id: 'hoof', label: 'Hooves / Limbs', hint: 'Capture interdigital space or swollen joints in good light' },
  { id: 'posture', label: 'Posture / General', hint: 'Full side-profile showing stance and body condition' },
];

export const AIHealthCheckModal: React.FC<AIHealthCheckModalProps> = ({
  isOpen,
  onClose,
  animals,
  diseases,
  onEscalateVet,
  onAssessmentSaved,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(animals[0]?.id || '');
  const [observationType, setObservationType] = useState<string>('skin');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [qualityReport, setQualityReport] = useState<ImageQualityReport | null>(null);
  const [isCheckingImage, setIsCheckingImage] = useState(false);
  const [photoConsent, setPhotoConsent] = useState(false);

  // Structured physiological inputs
  const [temperatureInput, setTemperatureInput] = useState<string>('');
  const [milkInput, setMilkInput] = useState<string>('');
  const [appetite, setAppetite] = useState<DailyRecord['appetite']>('Normal');
  const [rumination, setRumination] = useState<DailyRecord['rumination_level']>('Normal');

  const [symptomsText, setSymptomsText] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<HealthPrediction | null>(null);

  if (!isOpen) return null;

  const selectedAnimal = animals.find((a) => a.id === selectedAnimalId) || animals[0];
  const activeObsMeta = OBSERVATION_TYPES.find((o) => o.id === observationType) || OBSERVATION_TYPES[0];

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
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCheckingImage(true);
    setQualityReport(null);

    try {
      const preview = URL.createObjectURL(file);
      setImagePreviewUrl(preview);
      const report = await analyzeImageQuality(file);
      setQualityReport(report);

      if (!report.is_usable) {
        toast.warning('Photo failed quality check — please retake in clearer light.');
      } else {
        toast.success('Photo passed quality checks.');
      }
    } catch {
      toast.error('Could not process selected image file.');
    } finally {
      setIsCheckingImage(false);
    }
  };

  const clearImage = () => {
    setImagePreviewUrl(null);
    setQualityReport(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRunDiagnosis = () => {
    if (!selectedAnimal) return;
    if (imagePreviewUrl && !photoConsent) {
      toast.error('Please confirm photo storage consent before submitting the image.');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    setTimeout(() => {
      const allSymptoms = [...selectedChips];
      if (symptomsText.trim()) {
        allSymptoms.push(symptomsText.trim());
      }
      if (imagePreviewUrl && qualityReport?.is_usable) {
        allSymptoms.push(`Visual observation captured (${activeObsMeta.label})`);
      }

      const parsedTemp = temperatureInput ? parseFloat(temperatureInput) : undefined;
      const parsedMilk = milkInput ? parseFloat(milkInput) : undefined;

      const hasStructuredInput =
        allSymptoms.length > 0 ||
        parsedTemp !== undefined ||
        parsedMilk !== undefined ||
        appetite !== 'Normal' ||
        rumination !== 'Normal';

      if (hasStructuredInput) {
        const baselineMilk = selectedAnimal.baseline_milk_yield || 12;
        const effectiveMilk =
          parsedMilk !== undefined
            ? parsedMilk
            : allSymptoms.some((s) => s.toLowerCase().includes('milk'))
            ? Number((baselineMilk * 0.72).toFixed(1))
            : baselineMilk;

        const effectiveTemp =
          parsedTemp !== undefined
            ? parsedTemp
            : allSymptoms.some((s) => s.toLowerCase().includes('fever') || s.toLowerCase().includes('temperature'))
            ? 40.1
            : undefined;

        aniguardService.addDailyRecord({
          animal_id: selectedAnimal.id,
          farm_id: selectedAnimal.farm_id,
          record_date: new Date().toISOString().split('T')[0],
          milk_morning_liters: Number((effectiveMilk * 0.55).toFixed(1)),
          milk_evening_liters: Number((effectiveMilk * 0.45).toFixed(1)),
          temperature_celsius: effectiveTemp,
          appetite:
            appetite !== 'Normal'
              ? appetite
              : allSymptoms.some((s) => s.toLowerCase().includes('appetite'))
              ? 'Reduced'
              : 'Normal',
          water_intake: 'Normal',
          rumination_level: rumination,
          activity_level: allSymptoms.some(
            (s) => s.toLowerCase().includes('walking') || s.toLowerCase().includes('lameness')
          )
            ? 'Lethargic'
            : 'Normal',
          feces_status: 'Normal',
          symptoms: allSymptoms,
          farmer_notes: symptomsText.trim() || undefined,
        });
      }

      const latestRecords = aniguardService.getDailyRecords(selectedAnimal.id);
      const vaccinations = aniguardService.getVaccinations();
      const evaluation = PredictiveHealthEngine.evaluateAnimal(
        selectedAnimal,
        latestRecords,
        vaccinations,
        diseases
      );

      setResult(evaluation.prediction);
      setIsAnalyzing(false);
      onAssessmentSaved?.();
    }, 650);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-[#0B1520] border border-[#1A2634] rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto text-white shadow-2xl p-4 sm:p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-white transition p-1.5 rounded-lg bg-[#0E1A26] border border-slate-800"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-[#182635] pr-10">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0E2E25] text-[#10B981] flex items-center justify-center border border-[#134E3E] shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Early-Warning Health Check
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Multi-signal risk triage from baseline deviations, vitals, and verified photo quality checks
            </p>
          </div>
        </div>

        {!result ? (
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
                    {a.name} ({a.tag_id}) — {a.species} · {a.breed} ({a.health_status})
                  </option>
                ))}
              </select>
            </div>

            {/* Structured Vitals Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Temp (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 38.6"
                  value={temperatureInput}
                  onChange={(e) => setTemperatureInput(e.target.value)}
                  className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Milk Today (L)
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder={`Base ${selectedAnimal?.baseline_milk_yield || 12}L`}
                  value={milkInput}
                  onChange={(e) => setMilkInput(e.target.value)}
                  className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Appetite
                </label>
                <select
                  value={appetite}
                  onChange={(e) => setAppetite(e.target.value as DailyRecord['appetite'])}
                  className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Normal">Normal</option>
                  <option value="Reduced">Reduced</option>
                  <option value="Anorexic">Off Feed</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Rumination
                </label>
                <select
                  value={rumination}
                  onChange={(e) => setRumination(e.target.value as DailyRecord['rumination_level'])}
                  className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
            </div>

            {/* Observation Type + Real Image Capture & Quality Check (PRD Section 9) */}
            <div className="space-y-2.5 bg-[#08101A] border border-[#182635] rounded-xl p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold text-slate-300">
                  Photo Observation & Quality Check (Optional)
                </label>
                <select
                  value={observationType}
                  onChange={(e) => setObservationType(e.target.value)}
                  className="bg-[#0E1A26] border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-emerald-300 font-medium"
                >
                  {OBSERVATION_TYPES.map((obs) => (
                    <option key={obs.id} value={obs.id}>
                      {obs.label}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-[11px] text-slate-400">{activeObsMeta.hint}</p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />

              {!imagePreviewUrl ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-4 text-center bg-[#0B1520] transition cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <div className="w-9 h-9 rounded-full bg-[#102422] text-[#10B981] flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    Capture or Upload Photo for Quality Verification
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Checks resolution, blur, exposure, glare & duplicates (JPG/PNG/WebP up to 10 MB)
                  </span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={imagePreviewUrl}
                      alt="Animal observation preview"
                      className="w-20 h-20 rounded-lg object-cover border border-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      {isCheckingImage ? (
                        <p className="text-xs text-emerald-400">Running image quality checks...</p>
                      ) : qualityReport ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                qualityReport.is_usable
                                  ? 'bg-[#0E2E25] text-[#10B981]'
                                  : 'bg-[#2A1010] text-red-400'
                              }`}
                            >
                              {qualityReport.is_usable ? 'Quality Passed' : 'Retake Recommended'}
                            </span>
                            <button
                              type="button"
                              onClick={clearImage}
                              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" /> Replace
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {qualityReport.checks.map((chk, idx) => (
                              <div
                                key={idx}
                                className="text-[10px] px-2 py-1 rounded bg-[#0E1A26] border border-slate-800 flex items-center justify-between gap-2"
                              >
                                <span className="text-slate-300 font-medium">{chk.name}</span>
                                <span
                                  className={
                                    chk.status === 'pass'
                                      ? 'text-emerald-400'
                                      : chk.status === 'warn'
                                      ? 'text-amber-400'
                                      : 'text-red-400'
                                  }
                                >
                                  {chk.status.toUpperCase()}
                                </span>
                              </div>
                            ))}
                          </div>
                          <p className="text-[11px] text-slate-400">{qualityReport.guidance}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <label className="flex items-start gap-2 text-[11px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={photoConsent}
                      onChange={(e) => setPhotoConsent(e.target.checked)}
                      className="mt-0.5 rounded border-slate-600"
                    />
                    <span>
                      I consent to attach this photo to {selectedAnimal?.name}'s private farm record for observation tracking and optional veterinarian review.
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Symptom Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Observed Signs & Symptoms (Tap to Select)
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
                Additional Observations
              </label>
              <textarea
                value={symptomsText}
                onChange={(e) => setSymptomsText(e.target.value)}
                placeholder="e.g. Reduced cud chewing since morning, swelling noticed on left hind quarter..."
                rows={2}
                className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunDiagnosis}
              disabled={isAnalyzing}
              className="w-full py-3 rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Baseline & Early-Warning Signals...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Run Early-Warning Risk Assessment</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* PRD-Compliant Risk Output Screen */
          <div className="mt-5 space-y-4">
            {/* Risk Header Banner */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                result.risk_level === 'Critical' || result.risk_level === 'High Risk'
                  ? 'bg-[#2A1010] border-[#5A1C1C]'
                  : result.risk_level === 'Early Risk' || result.risk_level === 'Watch'
                  ? 'bg-[#291F0E] border-[#4A3816]'
                  : 'bg-[#0E2E25] border-[#134E3E]'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  EARLY-WARNING RISK ASSESSMENT · {result.model_version}
                </span>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xl font-bold text-white">
                    {result.risk_level}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-black/40 font-mono text-slate-200">
                    Confidence: {result.confidence_level}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-black/40 font-mono text-slate-300">
                    Data Quality: {result.data_quality || 'Moderate'}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-2xl font-black font-mono text-white">
                  {result.risk_score}/100
                </span>
                <p className="text-[10px] text-slate-400">Risk Index (Non-Probabilistic)</p>
              </div>
            </div>

            {/* Missing or Conflicting Data Notice */}
            {((result.missing_data && result.missing_data.length > 0) ||
              (result.conflicting_data && result.conflicting_data.length > 0)) && (
              <div className="bg-[#1C1910] border border-[#4A3D18] rounded-xl p-3.5 text-xs space-y-1.5">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>Data Completeness & Verification Notes</span>
                </div>
                {result.conflicting_data?.map((c, i) => (
                  <p key={`c_${i}`} className="text-[11px] text-amber-200">
                    • Conflict: {c}
                  </p>
                ))}
                {result.missing_data?.map((m, i) => (
                  <p key={`m_${i}`} className="text-[11px] text-slate-300">
                    • Missing: {m}
                  </p>
                ))}
              </div>
            )}

            {/* Pattern-Matched Conditions (Explicitly Non-Diagnostic) */}
            {result.differential_conditions && result.differential_conditions.length > 0 && (
              <div className="bg-[#0E1A26] border border-[#182635] rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  Knowledge-Base Pattern Overlap (Not a Diagnosis)
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
                          Overlapping signs: {diff.matching_symptoms.join(', ')}
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#F59E0B]">
                        {diff.compatibility_score}% Overlap
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence & Explanation */}
            <div className="bg-[#0E1A26] border border-[#182635] rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Contributing Factors & Explanation</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{result.explanation}</p>
              {result.suggested_monitoring_interval && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Suggested monitoring: {result.suggested_monitoring_interval}</span>
                </div>
              )}
            </div>

            {/* Safe Next Actions */}
            <div className="bg-[#0E1A26] border border-[#182635] rounded-xl p-4 space-y-1.5">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Safe Next Actions & Escalation</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{result.recommended_action}</p>
              {result.escalation_guidance && (
                <p className="text-[11px] text-slate-400">{result.escalation_guidance}</p>
              )}
            </div>

            {/* Mandatory PRD Safety Boundary Notice */}
            <div className="p-3 rounded-lg bg-[#141A22] border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Veterinary Safety Boundary:</strong>{' '}
                {result.disclaimer ||
                  'AniGuard provides explainable risk warnings and observations only — not a confirmed veterinary diagnosis or prescription.'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={() => {
                  onEscalateVet(result.animal_id, result.id);
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Escalate to Veterinarian</span>
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
