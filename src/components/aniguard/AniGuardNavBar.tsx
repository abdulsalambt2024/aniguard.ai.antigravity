import React, { useRef } from 'react';
import {
  LayoutDashboard,
  PawPrint,
  AlertTriangle,
  HeartPulse,
  Bot,
  Calculator,
  TrendingUp,
  Syringe,
  Landmark,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Crown,
  CreditCard,
} from 'lucide-react';

export type AniGuardTab =
  | 'home'
  | 'animals'
  | 'alerts'
  | 'ai_check'
  | 'farm_ai'
  | 'ration'
  | 'profit'
  | 'vaccinations'
  | 'schemes'
  | 'disease_library'
  | 'learning'
  | 'pricing'
  | 'admin';

interface AniGuardNavBarProps {
  activeTab: AniGuardTab;
  onTabChange: (tab: AniGuardTab) => void;
  urgentAlertCount?: number;
  showAdminTab?: boolean;
}

export const AniGuardNavBar: React.FC<AniGuardNavBarProps> = ({
  activeTab,
  onTabChange,
  urgentAlertCount = 2,
  showAdminTab = true,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'animals', label: 'Herd Roster', icon: PawPrint },
    {
      id: 'alerts',
      label: 'Health Alerts',
      icon: AlertTriangle,
      badge: urgentAlertCount > 0 ? urgentAlertCount : undefined,
    },
    { id: 'ai_check', label: 'AI Health Scan', icon: HeartPulse },
    { id: 'farm_ai', label: 'Clinical Chat', icon: Bot },
    { id: 'ration', label: 'Ration Planner', icon: Calculator },
    { id: 'profit', label: 'Herd Economics', icon: TrendingUp },
    { id: 'vaccinations', label: 'Vaccinations', icon: Syringe },
    { id: 'disease_library', label: 'Disease Library', icon: BookOpen },
    { id: 'schemes', label: 'Govt Schemes', icon: Landmark },
    { id: 'pricing', label: 'Pro Plans', icon: CreditCard },
  ];

  if (showAdminTab) {
    tabs.push({ id: 'admin', label: 'Administration', icon: ShieldCheck as any });
  }

  return (
    <nav className="relative w-full bg-[#08101A] border-b border-[#1A2634] px-4 lg:px-8 py-2.5">
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-1.5 overflow-x-auto scrollbar-none scroll-smooth min-w-max"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isAdmin = tab.id === 'admin';

          let activeClass = 'bg-[#059669] text-white shadow-sm font-semibold shadow-emerald-950/40';
          if (isAdmin) {
            activeClass = 'bg-[#291F0E] text-[#D4AF37] border border-[#D4AF37]/50 font-bold shadow-sm';
          }

          let inactiveClass = 'text-slate-400 hover:text-slate-200 hover:bg-[#0E1A26]';
          if (isAdmin) {
            inactiveClass = 'text-[#D4AF37]/80 hover:text-[#D4AF37] hover:bg-[#1A1408] border border-[#D4AF37]/20';
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as AniGuardTab)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive ? activeClass : inactiveClass
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive
                    ? isAdmin
                      ? 'text-[#D4AF37]'
                      : 'text-white'
                    : isAdmin
                    ? 'text-[#D4AF37]'
                    : 'text-slate-400'
                }`}
              />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
