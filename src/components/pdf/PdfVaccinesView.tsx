import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PdfVaccinesViewProps {
  onBookVet: (animalName: string) => void;
  onAddRecord: () => void;
  onBack?: () => void;
}

export const PdfVaccinesView: React.FC<PdfVaccinesViewProps> = ({
  onBookVet,
  onAddRecord,
  onBack,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-28">
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
          Vaccines
        </h1>
        <p className="text-sm text-[#5E6C61] mt-0.5">
          Booster and deworming calendar
        </p>
      </div>

      {/* Responsive Grid for Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
        {/* Overdue Column */}
        <div className="space-y-3">
          <div>
            <span className="px-3 py-1 rounded-full bg-[#FDE8E8] text-[#C0392B] font-semibold text-xs">
              Overdue
            </span>
          </div>

          {/* Overdue Card */}
          <div className="bg-white rounded-[22px] p-4.5 border border-[#E5EAE1] shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FDE8E8] flex flex-col items-center justify-center text-center shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C0392B] leading-none">
                OCT
              </span>
              <span className="text-2xl font-bold text-[#C0392B] leading-none mt-1">
                04
              </span>
            </div>

            <div className="space-y-0.5">
              <h3 className="font-bold text-base text-[#122B1E] leading-tight">
                PPR Sungri 96
              </h3>
              <p className="text-xs text-[#5E6C61]">
                Peste des petits ruminants
              </p>
              <p className="text-xs text-[#122B1E] font-medium pt-0.5">
                Moti · 1 ml
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onBookVet('Moti')}
            className="w-full py-3.5 rounded-2xl bg-[#122B1E] hover:bg-[#1b3b2a] text-white font-semibold text-sm transition shadow-sm active:scale-[0.99]"
          >
            Book vet for Moti
          </button>
        </div>

        {/* Coming Up Column */}
        <div className="space-y-3">
          <div>
            <span className="px-3 py-1 rounded-full bg-[#E0F2FE] text-[#0284C7] font-semibold text-xs">
              Coming up
            </span>
          </div>

          {/* Coming Up Card 1 */}
          <div className="bg-white rounded-[22px] p-4.5 border border-[#E5EAE1] shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E0F2FE] flex flex-col items-center justify-center text-center shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7] leading-none">
                OCT
              </span>
              <span className="text-2xl font-bold text-[#0284C7] leading-none mt-1">
                27
              </span>
            </div>

            <div className="space-y-0.5">
              <h3 className="font-bold text-base text-[#122B1E] leading-tight">
                FMD trivalent
              </h3>
              <p className="text-xs text-[#5E6C61]">
                Foot-and-mouth disease
              </p>
              <p className="text-xs text-[#122B1E] font-medium pt-0.5">
                Gauri · 2 ml
              </p>
            </div>
          </div>

          {/* Coming Up Card 2 */}
          <div className="bg-white rounded-[22px] p-4.5 border border-[#E5EAE1] shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E0F2FE] flex flex-col items-center justify-center text-center shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7] leading-none">
                NOV
              </span>
              <span className="text-2xl font-bold text-[#0284C7] leading-none mt-1">
                03
              </span>
            </div>

            <div className="space-y-0.5">
              <h3 className="font-bold text-base text-[#122B1E] leading-tight">
                HS oil adjuvant
              </h3>
              <p className="text-xs text-[#5E6C61]">
                Hemorrhagic septicemia
              </p>
              <p className="text-xs text-[#122B1E] font-medium pt-0.5">
                Shera · 3 ml
              </p>
            </div>
          </div>

          {/* Add Record Button */}
          <button
            onClick={onAddRecord}
            className="w-full py-3.5 rounded-2xl border border-[#D0D6CB] hover:bg-black/5 bg-white text-[#122B1E] font-semibold text-sm transition shadow-sm active:scale-[0.99]"
          >
            Add vaccination record
          </button>
        </div>
      </div>
    </div>
  );
};
