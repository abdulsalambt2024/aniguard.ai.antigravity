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

  const handleTabClick = (tabId: AniGuardTab, e?: React.MouseEvent<HTMLButtonElement>) => {
    onTabChange(tabId);
    if (e?.currentTarget) {
      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const activeTabObj = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <nav className="relative w-full bg-[#08101A] border-b border-[#1A2634] px-3 sm:px-6 lg:px-8 py-2">
      {/* Mobile Selector Dropdown (visible on small screens for fast module switching) */}
      <div className="md:hidden flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#152332]">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold truncate">
          <span className="text-slate-400">Module:</span>
          <span className="text-[#10B981] font-bold flex items-center gap-1.5 truncate">
            {React.createElement(activeTabObj.icon, { className: 'w-3.5 h-3.5 shrink-0 text-emerald-400' })}
            {activeTabObj.label}
          </span>
        </div>

        <select
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value as AniGuardTab)}
          className="bg-[#0E1A26] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label} {tab.badge ? `(${tab.badge} alerts)` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Horizontal Tabs Scroll Container with Touch Support */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-1.5 overflow-x-auto scrollbar-none scroll-smooth py-0.5 max-w-full"
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
              onClick={(e) => handleTabClick(tab.id as AniGuardTab, e)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 active:scale-95 ${
                isActive ? activeClass : inactiveClass
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 shrink-0 ${
                  isActive
                    ? isAdmin
                      ? 'text-[#D4AF37]'
                      : 'text-white'
                    : isAdmin
                    ? 'text-[#D4AF37]'
                    : 'text-slate-400'
                }`}
              />
              <span className="whitespace-nowrap">{tab.label}</span>
              {tab.badge && (
                <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse shrink-0">
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
