import React from 'react';
import { GraduationCap, PlayCircle, BookOpen, Clock, Award } from 'lucide-react';

export const LearningCenterView: React.FC = () => {
  const courses = [
    {
      title: 'California Mastitis Test (CMT) & Early Udder Screening',
      category: 'Diagnostic Skills',
      duration: '8 min read',
      readiness: 'High Priority',
      description:
        'Step-by-step guide to testing individual teat quarters using reagent paddle to detect subclinical mastitis before clots appear.',
    },
    {
      title: 'Protecting Dairy Cattle from Winter Pneumonia & Respiratory Stress',
      category: 'Seasonal Care',
      duration: '6 min read',
      readiness: 'Active Season',
      description:
        'How to maintain proper cross-ventilation in dairy sheds while preventing cold floor drafts that trigger bacterial pasteurellosis.',
    },
    {
      title: 'Optimal Heat Detection & Artificial Insemination (AI) Timing',
      category: 'Reproduction',
      duration: '10 min read',
      readiness: 'Fertility',
      description:
        'Identifying standing heat, clear mucus discharge, and following the morning-evening rule for maximum conception rates.',
    },
    {
      title: 'Quality Colostrum Feeding in Newborn Calves for Lifetime Immunity',
      category: 'Calf Management',
      duration: '5 min read',
      readiness: 'Crucial',
      description:
        'Why calves must receive 10% of their body weight in high-immunoglobulin colostrum within the first 2 hours of life.',
    },
  ];

  return (
    <div className="bg-[#0B1520] border border-[#182635] rounded-xl p-5 text-white shadow-lg space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#182635]">
        <div className="w-10 h-10 rounded-xl bg-[#0E2E25] text-[#10B981] flex items-center justify-center border border-[#134E3E]">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Farmer Learning & Practical Training Center
          </h2>
          <p className="text-xs text-slate-400">
            Veterinary guides, milking hygiene protocols, and herd health management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((c, i) => (
          <div
            key={i}
            className="p-5 rounded-xl bg-[#08101A] border border-[#182635] hover:border-emerald-500/40 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] mb-2">
                <span className="font-semibold text-cyan-400 bg-[#101F2F] px-2 py-0.5 rounded">
                  {c.category}
                </span>
                <span className="text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {c.duration}
                </span>
              </div>

              <h3 className="text-base font-bold text-white leading-snug">{c.title}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{c.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#182635] flex items-center justify-between">
              <span className="text-[10px] font-semibold text-emerald-400">
                {c.readiness}
              </span>
              <button className="flex items-center gap-1 text-xs text-[#10B981] hover:text-[#34D399] font-bold">
                <PlayCircle className="w-4 h-4" />
                <span>Read Veterinary Guide</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
