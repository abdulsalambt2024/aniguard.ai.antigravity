import React from 'react';

export type PdfNavTab = 'home' | 'herd' | 'alerts' | 'care' | 'ask';

interface AniGuardPdfNavBarProps {
  activeTab: PdfNavTab;
  onTabChange: (tab: PdfNavTab) => void;
  urgentAlertCount?: number;
}

export const AniGuardPdfNavBar: React.FC<AniGuardPdfNavBarProps> = ({
  activeTab,
  onTabChange,
  urgentAlertCount = 2,
}) => {
  const tabs: { id: PdfNavTab; label: string; badge?: number }[] = [
    { id: 'home', label: 'Home' },
    { id: 'herd', label: 'Herd' },
    { id: 'alerts', label: 'Alerts', badge: urgentAlertCount > 0 ? urgentAlertCount : undefined },
    { id: 'care', label: 'Care' },
    { id: 'ask', label: 'Ask' },
  ];

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none md:hidden">
      <nav className="pointer-events-auto bg-[#122B1E] text-white rounded-full p-1.5 shadow-2xl flex items-center max-w-sm w-full justify-between border border-[#1b3b2a]/60">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex-1 py-2 px-3 rounded-full text-xs font-medium transition-all duration-200 text-center flex items-center justify-center gap-1 ${
                isActive
                  ? 'bg-[#EFA037] text-[#122B1E] font-bold shadow-sm'
                  : 'text-[#9DB8A6] hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
