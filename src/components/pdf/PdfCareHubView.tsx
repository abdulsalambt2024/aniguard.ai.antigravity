import React, { useState, useEffect } from 'react';
import { PdfVaccinesView } from './PdfVaccinesView';
import { PdfDiseaseGuideView } from './PdfDiseaseGuideView';
import { PdfGovtSupportView } from './PdfGovtSupportView';
import { PdfFeedPlanView } from './PdfFeedPlanView';
import { PdfPlansView } from './PdfPlansView';
import { Sparkles, Shield, Wheat, Building2, Stethoscope, ChevronRight } from 'lucide-react';

export type CareSubTab =
  | 'vaccines'
  | 'feed_plan'
  | 'disease_guide'
  | 'govt_support'
  | 'plans';

interface PdfCareHubViewProps {
  initialSubTab?: CareSubTab | null;
  currentUserEmail?: string;
  currentUserName?: string;
  onBookVet: (animalName: string) => void;
  onAddVaccinationRecord: () => void;
  onUpgradeSuccess?: () => void;
}

export const PdfCareHubView: React.FC<PdfCareHubViewProps> = ({
  initialSubTab = null,
  currentUserEmail,
  currentUserName,
  onBookVet,
  onAddVaccinationRecord,
  onUpgradeSuccess,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<CareSubTab | null>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // If a subtab is active, render that full screen matching the design mockups
  if (activeSubTab === 'disease_guide') {
    return <PdfDiseaseGuideView onBack={() => setActiveSubTab(null)} />;
  }

  if (activeSubTab === 'feed_plan') {
    return <PdfFeedPlanView onBack={() => setActiveSubTab(null)} />;
  }

  if (activeSubTab === 'govt_support') {
    return <PdfGovtSupportView onBack={() => setActiveSubTab(null)} />;
  }

  if (activeSubTab === 'plans') {
    return (
      <PdfPlansView
        currentUserEmail={currentUserEmail}
        currentUserName={currentUserName}
        onUpgradeSuccess={onUpgradeSuccess}
        onBack={() => setActiveSubTab(null)}
      />
    );
  }

  if (activeSubTab === 'vaccines') {
    return (
      <PdfVaccinesView
        onBookVet={onBookVet}
        onAddRecord={onAddVaccinationRecord}
        onBack={() => setActiveSubTab(null)}
      />
    );
  }

  // Care Hub Directory Screen
  const hubItems = [
    {
      id: 'disease_guide' as CareSubTab,
      title: 'Disease guide',
      desc: 'Verified by ICAR and WOAH with symptom triage',
      icon: Shield,
      badge: 'ICAR & WOAH',
      badgeColor: 'bg-[#DCF8E8] text-[#126A42]',
    },
    {
      id: 'feed_plan' as CareSubTab,
      title: 'Feed plan',
      desc: 'Dry matter, green fodder & concentrate ration balance',
      icon: Wheat,
      badge: 'NutriCalc',
      badgeColor: 'bg-[#FEF6E9] text-[#7C4610]',
    },
    {
      id: 'govt_support' as CareSubTab,
      title: 'Government support',
      desc: '50% subsidy, 3% interest relief & KCC schemes',
      icon: Building2,
      badge: 'Subsidies',
      badgeColor: 'bg-[#DCF8E8] text-[#126A42]',
    },
    {
      id: 'plans' as CareSubTab,
      title: 'Plans & pricing',
      desc: 'AniGuard Pro, video vet consultations & herd audits',
      icon: Sparkles,
      badge: 'Most popular',
      badgeColor: 'bg-[#FEF3D6] text-[#B45309]',
    },
    {
      id: 'vaccines' as CareSubTab,
      title: 'Vaccine calendar',
      desc: 'Booster schedules, PPR, FMD & deworming alerts',
      icon: Stethoscope,
      badge: '1 Overdue',
      badgeColor: 'bg-[#FDE8E8] text-[#C0392B]',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 pb-28">
      {/* Header */}
      <div className="pt-1">
        <h1 className="text-3xl font-bold text-[#122B1E] tracking-tight">
          Care
        </h1>
        <p className="text-sm text-[#5E6C61] mt-0.5">
          Tools to keep your herd healthy
        </p>
      </div>

      {/* Directory Responsive Grid (1 col mobile, 2 col tablet, 3 col desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
        {hubItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveSubTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full text-left bg-white rounded-[22px] p-5 border border-[#E5EAE1] shadow-sm hover:border-[#122B1E]/40 hover:shadow-md transition active:scale-[0.99] flex items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F4F5EE] border border-[#E5EAE1] flex items-center justify-center shrink-0 text-[#122B1E] group-hover:bg-[#122B1E] group-hover:text-white transition-colors">
                  <IconComponent className="w-6 h-6" strokeWidth={2} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-[#122B1E] tracking-tight">
                      {item.title}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#5E6C61] mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#8A968E] shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
