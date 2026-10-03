import React, { useState } from 'react';
import { BookOpen, Search, ShieldAlert, CheckCircle2, ExternalLink } from 'lucide-react';
import { Disease } from '../../types/aniguard';

interface DiseaseLibraryViewProps {
  diseases: Disease[];
}

export const DiseaseLibraryView: React.FC<DiseaseLibraryViewProps> = ({ diseases }) => {
  const [search, setSearch] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('All');

  const filtered = diseases.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.key_symptoms.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    const matchSpecies =
      selectedSpecies === 'All' || d.species_affected.includes(selectedSpecies);

    return matchSearch && matchSpecies;
  });

  return (
    <div className="bg-[#0B1520] border border-[#182635] rounded-xl p-5 text-white shadow-lg space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#182635]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0E2E25] text-[#10B981] flex items-center justify-center border border-[#134E3E]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Veterinary Disease Knowledge Base
            </h2>
            <p className="text-xs text-slate-400">
              Tier-1 Clinical Livestock Profiles verified from ICAR-NIVEDI & WOAH
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search diseases or symptoms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#08101A] border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Species Filter */}
          <select
            value={selectedSpecies}
            onChange={(e) => setSelectedSpecies(e.target.value)}
            className="bg-[#08101A] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
          >
            <option value="All">All Species</option>
            <option value="Cow">Cattle / Cow</option>
            <option value="Buffalo">Buffalo</option>
            <option value="Goat">Goat</option>
            <option value="Sheep">Sheep</option>
          </select>
        </div>
      </div>

      {/* Disease Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((dis) => {
          const isEmergency = dis.veterinary_urgency === 'Emergency';
          const isHigh = dis.veterinary_urgency === 'High';

          return (
            <div
              key={dis.id}
              className="p-5 rounded-xl bg-[#08101A] border border-[#182635] flex flex-col justify-between hover:border-emerald-500/40 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-[#0E2E25] px-2 py-0.5 rounded border border-[#134E3E]">
                      {dis.code}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {dis.disease_category}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      isEmergency
                        ? 'bg-[#2E1010] text-[#EF4444] border-[#5A1C1C]'
                        : isHigh
                        ? 'bg-[#291F0E] text-[#F59E0B] border-[#4A3816]'
                        : 'bg-[#101F2F] text-cyan-400 border-[#1C364F]'
                    }`}
                  >
                    {dis.veterinary_urgency}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{dis.name}</h3>
                {dis.scientific_name && (
                  <p className="text-[11px] text-slate-400 italic">{dis.scientific_name}</p>
                )}

                {/* Species Badges */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {dis.species_affected.map((sp) => (
                    <span
                      key={sp}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-[#101F2F] text-slate-300 font-medium"
                    >
                      {sp}
                    </span>
                  ))}
                  {dis.zoonotic_risk && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold">
                      Zoonotic (Human Risk)
                    </span>
                  )}
                </div>

                {/* Key Symptoms */}
                <div className="mt-3">
                  <div className="text-[11px] font-semibold text-slate-300 mb-1">
                    Key Clinical Signs:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dis.key_symptoms.map((sym, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded bg-[#0E1A26] border border-slate-800 text-slate-300"
                      >
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Milk Impact */}
                {dis.milk_impact_description && (
                  <div className="mt-2.5 text-xs text-slate-300">
                    <strong className="text-emerald-400">Milk Impact: </strong>
                    {dis.milk_impact_description}
                  </div>
                )}

                {/* Prevention */}
                {dis.prevention_guidance && (
                  <div className="mt-2 text-xs text-slate-300">
                    <strong className="text-amber-400">Prevention: </strong>
                    {dis.prevention_guidance}
                  </div>
                )}
              </div>

              {/* Source Provenance */}
              <div className="mt-4 pt-3 border-t border-[#182635] flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate pr-2 font-medium">Source: {dis.reference_source}</span>
                {dis.source_url && (
                  <a
                    href={dis.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold flex-shrink-0"
                  >
                    <span>Reference</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
