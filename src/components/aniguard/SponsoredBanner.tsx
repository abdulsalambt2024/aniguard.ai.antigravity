import React from 'react';
import { ExternalLink } from 'lucide-react';

export const SponsoredBanner: React.FC = () => {
  return (
    <div className="w-full rounded-xl bg-[#09121B] border border-[#182635] p-4 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Background imagery subtle overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:16px_16px]"></div>

      {/* Left Tag & Sponsor Info */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-white text-xs border border-white/20">
          AMUL
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              Sponsored Ad
            </span>
            <span className="text-xs font-semibold text-emerald-400">
              Amul Dairy Federation
            </span>
          </div>
          <h4 className="text-sm font-bold text-white mt-0.5">
            Amul Cattle Feed – 20% Extra Protein Booster for High-Yield Lactation
          </h4>
        </div>
      </div>

      {/* Right Link */}
      <a
        href="https://www.amul.com"
        target="_blank"
        rel="noopener noreferrer"
        className="relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E1A26] border border-slate-700 hover:border-emerald-500 text-xs font-medium text-slate-200 hover:text-white transition flex-shrink-0"
      >
        <span>Learn More</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};
