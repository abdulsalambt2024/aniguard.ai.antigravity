import React from 'react';

interface FeaturedTipCardProps {
  onRunAICheck: () => void;
}

export const FeaturedTipCard: React.FC<FeaturedTipCardProps> = ({ onRunAICheck }) => {
  return (
    <div className="bg-[#0B1520] border border-[#182635] rounded-xl p-5 lg:p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
      <div className="relative z-10 max-w-[62%] sm:max-w-[65%]">
        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#142A24] text-[#10B981] border border-[#1A4237] mb-2.5">
          FEATURED TIP & CAMPAIGN
        </span>

        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
          Protect Your Herd from Winter Pneumonia
        </h2>

        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          Log daily body temp and appetite to catch symptoms 3 days earlier before secondary infection develops.
        </p>

        <button
          onClick={onRunAICheck}
          className="mt-4 px-4 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold transition shadow-md shadow-emerald-950/40"
        >
          Run AI Health Check
        </button>
      </div>

      {/* Cow Image on Right */}
      <div className="absolute right-0 top-0 bottom-0 w-[42%] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1520] via-transparent to-transparent z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80"
          alt="Dairy Cow"
          className="w-full h-full object-cover object-center"
        />
      </div>
    </div>
  );
};
