import React from 'react';
import { Landmark, ExternalLink, ShieldCheck, Award } from 'lucide-react';
import { GovtScheme } from '../../types/aniguard';

interface GovtSchemesViewProps {
  schemes: GovtScheme[];
}

export const GovtSchemesView: React.FC<GovtSchemesViewProps> = ({ schemes }) => {
  return (
    <div className="bg-[#0B1520] border border-[#182635] rounded-xl p-5 text-white shadow-lg space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#182635]">
        <div className="w-10 h-10 rounded-xl bg-[#0E2E25] text-[#10B981] flex items-center justify-center border border-[#134E3E]">
          <Landmark className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Indian Government Livestock Schemes & Subsidies
          </h2>
          <p className="text-xs text-slate-400">
            Official DAHD, ICAR & NABARD financial support and breed development initiatives
          </p>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schemes.map((scheme) => (
          <div
            key={scheme.id}
            className="p-5 rounded-xl bg-[#08101A] border border-[#182635] flex flex-col justify-between hover:border-emerald-500/50 transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#101F2F] text-cyan-400 border border-[#1C364F]">
                  {scheme.category}
                </span>
                {scheme.subsidy_percentage && (
                  <span className="text-xs font-bold text-emerald-400 bg-[#0E2E25] px-2 py-0.5 rounded border border-[#134E3E]">
                    {scheme.subsidy_percentage}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white leading-snug">
                {scheme.scheme_name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Nodal Agency: {scheme.nodal_agency}
              </p>

              <div className="mt-3 text-xs text-slate-300 leading-relaxed">
                <strong className="text-slate-200">Target Benefits: </strong>
                {scheme.target_benefit}
              </div>

              {scheme.eligibility_criteria && (
                <div className="mt-2 text-[11px] text-slate-400">
                  <strong className="text-slate-300">Eligibility: </strong>
                  {scheme.eligibility_criteria}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#182635] flex items-center justify-between">
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Govt Scheme
              </span>

              {scheme.application_portal_url && (
                <a
                  href={scheme.application_portal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
