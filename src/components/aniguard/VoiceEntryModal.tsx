import React, { useState } from 'react';
import { X, Mic, MicOff, Check, Sparkles } from 'lucide-react';
import { Animal } from '../../types/aniguard';
import { aniguardService } from '../../services/aniguardService';

interface VoiceEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  animals: Animal[];
  onSaved: () => void;
}

export const VoiceEntryModal: React.FC<VoiceEntryModalProps> = ({
  isOpen,
  onClose,
  animals,
  onSaved,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [extractedData, setExtractedData] = useState<{
    animalId: string;
    animalName: string;
    morningMilk: number;
    eveningMilk: number;
    temperature: number;
    appetite: 'Normal' | 'Reduced' | 'Anorexic';
    symptoms: string[];
  } | null>(null);

  if (!isOpen) return null;

  const demoPhrases = [
    'Gauri cow ka doodh aaj subah 10 litre aur shaam ko 8.5 litre hai, khana theek kha rahi hai',
    'Lakshmi ka doodh aaj 11 litre hai aur subah se thoda kam kha rahi hai',
    'Moti goat ko bukhar hai aur doodh sirf 2 litre nikla hai',
  ];

  const handleSimulateSpeech = (phrase: string) => {
    setIsListening(true);
    setTranscript('');
    setExtractedData(null);

    setTimeout(() => {
      setTranscript(phrase);
      setIsListening(false);

      // Extract details
      const lower = phrase.toLowerCase();
      let matchedAnimal = animals[0];
      if (lower.includes('lakshmi')) matchedAnimal = animals.find((a) => a.name.toLowerCase().includes('lakshmi')) || animals[0];
      if (lower.includes('moti')) matchedAnimal = animals.find((a) => a.name.toLowerCase().includes('moti')) || animals[0];
      if (lower.includes('shera')) matchedAnimal = animals.find((a) => a.name.toLowerCase().includes('shera')) || animals[0];

      const hasFever = lower.includes('bukhar') || lower.includes('fever');
      const isReducedAppetite = lower.includes('kam') || lower.includes('reduced');

      setExtractedData({
        animalId: matchedAnimal.id,
        animalName: matchedAnimal.name,
        morningMilk: matchedAnimal.species === 'Goat' ? 1.1 : 9.5,
        eveningMilk: matchedAnimal.species === 'Goat' ? 1.0 : 8.5,
        temperature: hasFever ? 40.1 : 38.6,
        appetite: isReducedAppetite ? 'Reduced' : 'Normal',
        symptoms: hasFever ? ['Fever', 'Off feed'] : [],
      });
    }, 1000);
  };

  const handleConfirmSave = () => {
    if (!extractedData) return;

    aniguardService.addDailyRecord({
      animal_id: extractedData.animalId,
      record_date: new Date().toISOString().split('T')[0],
      milk_morning_liters: extractedData.morningMilk,
      milk_evening_liters: extractedData.eveningMilk,
      temperature_celsius: extractedData.temperature,
      appetite: extractedData.appetite,
      water_intake: 'Normal',
      rumination_level: extractedData.appetite === 'Reduced' ? 'Low' : 'Normal',
      activity_level: 'Normal',
      feces_status: 'Normal',
      symptoms: extractedData.symptoms,
      farmer_notes: `Voice Entry: "${transcript}"`,
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
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Voice-First Daily Entry
            </h2>
            <p className="text-xs text-slate-400">
              Speak in Hindi, Hinglish, or English to log livestock records
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {/* Mic Simulation Area */}
          <div className="flex flex-col items-center justify-center py-6 bg-[#08101A] border border-slate-800 rounded-xl">
            <button
              onClick={() => handleSimulateSpeech(demoPhrases[0])}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-900/50'
                  : 'bg-[#10B981] hover:bg-[#059669] text-black shadow-lg shadow-emerald-950/40'
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
            <span className="text-xs font-semibold text-slate-300 mt-3">
              {isListening ? 'Listening to voice...' : 'Tap to Speak or select sample phrase below'}
            </span>
          </div>

          {/* Sample Voice Prompts */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              Sample Voice Phrases (Tap to Test AI Extraction):
            </label>
            <div className="space-y-1.5">
              {demoPhrases.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSimulateSpeech(phrase)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-[#0E1A26] border border-slate-800 hover:border-emerald-500/50 text-xs text-slate-300 hover:text-white transition flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">"{phrase}"</span>
                </button>
              ))}
            </div>
          </div>

          {/* Extracted Card */}
          {transcript && (
            <div className="p-3.5 rounded-xl bg-[#0E1A26] border border-[#182635]">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Voice Transcript
              </div>
              <p className="text-xs text-slate-200 italic mb-3">"{transcript}"</p>

              {extractedData && (
                <div className="p-3 rounded-lg bg-[#08101A] border border-emerald-900/40 space-y-1.5">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>AI Extracted Record for: {extractedData.animalName}</span>
                  </div>
                  <div className="text-xs text-slate-300 grid grid-cols-2 gap-2 mt-2 font-mono">
                    <div>Morning Milk: {extractedData.morningMilk} L</div>
                    <div>Evening Milk: {extractedData.eveningMilk} L</div>
                    <div>Body Temp: {extractedData.temperature} °C</div>
                    <div>Appetite: {extractedData.appetite}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {extractedData && (
            <button
              onClick={handleConfirmSave}
              className="w-full py-3 rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Save Daily Record</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
