import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface PdfFeedPlanViewProps {
  onBack?: () => void;
}

export const PdfFeedPlanView: React.FC<PdfFeedPlanViewProps> = ({ onBack }) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    toast.success('Feed plan saved for Gauri (IN-GJ-1042)!');
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 pb-28">
      {/* Optional Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#122B1E] hover:opacity-80 transition py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Care hub</span>
        </button>
      )}

      {/* Header */}
      <div className="pt-1">
        <h1 className="text-3xl font-bold text-[#122B1E] tracking-tight">
          Feed plan
        </h1>
        <p className="text-sm text-[#5E6C61] mt-0.5">
          For Gauri · IN-GJ-1042
        </p>
      </div>

      {/* Row of 3 Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-[#E5EAE1] shadow-sm">
          <span className="text-xs text-[#5E6C61] font-medium block">Milk</span>
          <span className="text-xl sm:text-2xl font-bold text-[#122B1E] mt-0.5 block">18.5 L</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5EAE1] shadow-sm">
          <span className="text-xs text-[#5E6C61] font-medium block">Weight</span>
          <span className="text-xl sm:text-2xl font-bold text-[#122B1E] mt-0.5 block">440 kg</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5EAE1] shadow-sm">
          <span className="text-xs text-[#5E6C61] font-medium block">Fat</span>
          <span className="text-xl sm:text-2xl font-bold text-[#122B1E] mt-0.5 block">4.2%</span>
        </div>
      </div>

      {/* Responsive Grid for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
        {/* Left Column: Dry Matter + Pregnancy + Tip */}
        <div className="lg:col-span-6 space-y-4">
          {/* Dark Forest Green Card: Dry matter needed each day */}
          <div className="bg-[#122B1E] text-white rounded-[26px] p-5 shadow-sm space-y-3">
            <span className="text-xs text-[#9DB8A6] font-medium block">
              Dry matter needed each day
            </span>

            <div className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-none">
              17.1 kg
            </div>

            {/* Dual Segmented Progress Bar */}
            <div className="w-full bg-[#1b3b2a] h-2 rounded-full overflow-hidden flex">
              <div className="bg-[#2693AB] h-full" style={{ width: '64%' }} />
              <div className="bg-[#EFA037] h-full" style={{ width: '36%' }} />
            </div>

            <div className="flex items-center justify-between text-xs text-[#CBD5E1] pt-0.5">
              <span>Maintenance 11.0 kg</span>
              <span>Milk 6.1 kg</span>
            </div>
          </div>

          {/* Month 6 of Pregnancy Alert */}
          <div className="bg-[#FEF6E9] border border-[#FCE5BE] rounded-2xl p-4 space-y-1">
            <h4 className="text-sm font-bold text-[#7C4610]">
              Month 6 of pregnancy
            </h4>
            <p className="text-xs text-[#8C551A] leading-relaxed">
              Add 0.8 kg concentrate and mineral mix each day.
            </p>
          </div>

          {/* Feeding Tip */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAE1] shadow-sm space-y-1">
            <h4 className="text-sm font-bold text-[#122B1E]">
              Feeding tip
            </h4>
            <p className="text-xs text-[#3D4A41] leading-relaxed">
              Split concentrate into morning and evening meals, mixed with soaked cake. Keep 60–70 L of clean water available.
            </p>
          </div>
        </div>

        {/* Right Column: Daily Feed Grid + Save Button */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[#122B1E]">Daily feed</h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Card 1: Green Fodder */}
              <div className="bg-white rounded-2xl p-4 border border-[#E5EAE1] shadow-sm space-y-1">
                <span className="text-xs text-[#1E7E44] font-bold block">Green fodder</span>
                <div className="text-2xl font-bold text-[#122B1E]">34.2 kg</div>
                <p className="text-xs text-[#5E6C61]">Napier, berseem, maize</p>
              </div>

              {/* Card 2: Dry Fodder */}
              <div className="bg-white rounded-2xl p-4 border border-[#E5EAE1] shadow-sm space-y-1">
                <span className="text-xs text-[#9C6219] font-bold block">Dry fodder</span>
                <div className="text-2xl font-bold text-[#122B1E]">3.8 kg</div>
                <p className="text-xs text-[#5E6C61]">Wheat or paddy straw</p>
              </div>

              {/* Card 3: Concentrate */}
              <div className="bg-white rounded-2xl p-4 border border-[#E5EAE1] shadow-sm space-y-1">
                <span className="text-xs text-[#2693AB] font-bold block">Concentrate</span>
                <div className="text-2xl font-bold text-[#122B1E]">7.6 kg</div>
                <p className="text-xs text-[#5E6C61]">20% protein pellet</p>
              </div>

              {/* Card 4: Minerals */}
              <div className="bg-white rounded-2xl p-4 border border-[#E5EAE1] shadow-sm space-y-1">
                <span className="text-xs text-[#6B3FB5] font-bold block">Minerals</span>
                <div className="text-2xl font-bold text-[#122B1E]">60 g</div>
                <p className="text-xs text-[#5E6C61]">Chelated mix</p>
              </div>
            </div>
          </div>

          {/* Save Feed Plan Button */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={isSaved}
              className="w-full py-4 rounded-2xl bg-[#122B1E] hover:bg-[#1b3b2a] text-white text-base font-semibold shadow-md active:scale-[0.99] transition"
            >
              {isSaved ? 'Feed plan saved ✓' : 'Save feed plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
