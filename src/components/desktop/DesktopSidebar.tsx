import React from 'react';
import {
  LayoutDashboard,
  Users,
  Activity,
  Bell,
  Syringe,
  BookOpen,
  Wheat,
  Landmark,
  Bot,
  TrendingUp,
  Crown,
  Settings,
  Phone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export type DesktopNavId =
  | 'overview'
  | 'herd'
  | 'ai_scan'
  | 'alerts'
  | 'vaccines'
  | 'disease_guide'
  | 'feed_plan'
  | 'govt_support'
  | 'ask'
  | 'profit'
  | 'subscription'
  | 'settings';

interface DesktopSidebarProps {
  currentNav: DesktopNavId;
  onNavigate: (id: DesktopNavId) => void;
  urgentAlertCount?: number;
  farmerName?: string;
  farmName?: string;
  activePlanTier?: 'free' | 'pro' | 'enterprise';
  onEmergencyCall?: () => void;
  onOpenAdmin?: () => void;
  isAdmin?: boolean;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentNav,
  onNavigate,
  urgentAlertCount = 0,
  farmerName = 'Ramesh',
  farmName = 'GreenPastures Farm',
  activePlanTier = 'pro',
  onEmergencyCall,
  onOpenAdmin,
  isAdmin = false,
}) => {
  const navSections = [
    {
      title: 'CORE INTELLIGENCE',
      items: [
        { id: 'overview' as DesktopNavId, label: 'Overview', icon: LayoutDashboard },
        { id: 'herd' as DesktopNavId, label: 'My Herd', icon: Users },
        {
          id: 'ai_scan' as DesktopNavId,
          label: 'AI Health Scan',
          icon: Activity,
          badge: 'AI LIVE',
          isSpecial: true,
        },
        {
          id: 'alerts' as DesktopNavId,
          label: 'Health Alerts',
          icon: Bell,
          count: urgentAlertCount,
        },
      ],
    },
    {
      title: 'CLINICAL & FEED CARE',
      items: [
        { id: 'vaccines' as DesktopNavId, label: 'Vaccinations', icon: Syringe },
        { id: 'disease_guide' as DesktopNavId, label: 'Disease Guide', icon: BookOpen },
        { id: 'feed_plan' as DesktopNavId, label: 'Feed Management', icon: Wheat },
        { id: 'govt_support' as DesktopNavId, label: 'Government Schemes', icon: Landmark },
      ],
    },
    {
      title: 'FARM STRATEGY & AI',
      items: [
        { id: 'ask' as DesktopNavId, label: 'Ask AniGuard', icon: Bot, isSpecial: true },
        { id: 'profit' as DesktopNavId, label: 'Profit Analytics', icon: TrendingUp },
        {
          id: 'subscription' as DesktopNavId,
          label: 'Subscription',
          icon: Crown,
          badge: 'PRO ₹149',
        },
        { id: 'settings' as DesktopNavId, label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#0C2B1D] text-white flex flex-col justify-between border-r border-[#1B3D2B] h-screen sticky top-0 z-30 select-none shadow-xl">
      {/* Top Brand Banner */}
      <div>
        <div className="p-4 border-b border-[#1A3D2C] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#047857] flex items-center justify-center shadow-lg shadow-emerald-950/60 text-[#0C2B1D] font-black text-lg">
              A
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white font-sans">
                  AniGuard
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                  AI 2.0
                </span>
              </div>
              <p className="text-[10px] text-[#8BE314] font-medium tracking-wide">
                Next-Gen Livestock OS
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-210px)] scrollbar-thin scrollbar-thumb-[#183E2C]">
          {navSections.map((section, sIdx) => (
            <div key={sIdx}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#7A9E88] px-3 mb-1.5">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentNav === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-[#EFA037] text-[#122B1E] font-bold shadow-md shadow-amber-950/30'
                          : 'text-[#C3D9CC] hover:text-white hover:bg-[#133A27]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive
                              ? 'text-[#122B1E]'
                              : item.isSpecial
                              ? 'text-[#8BE314]'
                              : 'text-[#9DB8A6]'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {/* Right Badges */}
                      <div className="flex items-center gap-1.5">
                        {item.count && item.count > 0 ? (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                              isActive
                                ? 'bg-[#122B1E] text-white'
                                : 'bg-[#EF4444] text-white animate-pulse'
                            }`}
                          >
                            {item.count}
                          </span>
                        ) : null}

                        {item.badge && (
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded tracking-tight ${
                              isActive
                                ? 'bg-[#122B1E] text-[#EFA037]'
                                : 'bg-[#10B981]/20 text-[#8BE314] border border-[#10B981]/30'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Admin shortcut if applicable */}
          {isAdmin && onOpenAdmin && (
            <div className="pt-1">
              <button
                onClick={onOpenAdmin}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#231E12] text-[#EFA037] border border-[#4F3C18] text-xs font-bold hover:bg-[#2F2716] transition"
              >
                <ShieldCheck className="w-4 h-4 text-[#EFA037]" />
                <span>Admin Control Panel</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="p-3 border-t border-[#1A3D2C] bg-[#092217] space-y-2.5">
        {/* Emergency Vet Quick Dispatch */}
        {onEmergencyCall && (
          <button
            onClick={onEmergencyCall}
            className="w-full py-2 px-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-red-950/40"
          >
            <Phone className="w-3.5 h-3.5 animate-bounce" />
            <span>24/7 Clinical Emergency</span>
          </button>
        )}

        {/* User farm summary */}
        <div className="flex items-center justify-between px-1">
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">{farmerName}</p>
            <p className="text-[10px] text-[#8AA795] truncate">{farmName}</p>
          </div>
          <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-[#10B981]/20 text-[#8BE314] border border-[#10B981]/40">
            {activePlanTier.toUpperCase()}
          </span>
        </div>
      </div>
    </aside>
  );
};
