import React, { useState } from 'react';
import { Crown, ShieldCheck, User, LogOut, Phone, Settings, Sparkles } from 'lucide-react';
import { PdfNavTab } from './AniGuardPdfNavBar';

interface PdfHeaderProps {
  farmerName?: string;
  farmName?: string;
  location?: string;
  userEmail?: string | null;
  userRole?: string | null;
  activeTab?: PdfNavTab | 'admin';
  onTabChange?: (tab: PdfNavTab) => void;
  urgentAlertCount?: number;
  onOpenAdmin?: () => void;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
  onEmergencyCall?: () => void;
}

export const PdfHeader: React.FC<PdfHeaderProps> = ({
  farmerName = 'Ramesh',
  farmName = 'GreenPastures Dairy Farm',
  location = 'Anand',
  userEmail,
  userRole = 'user',
  activeTab = 'home',
  onTabChange,
  urgentAlertCount = 2,
  onOpenAdmin,
  onOpenAuth,
  onSignOut,
  onEmergencyCall,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  const navTabs: { id: PdfNavTab; label: string; badge?: number }[] = [
    { id: 'home', label: 'Home' },
    { id: 'herd', label: 'Herd' },
    { id: 'alerts', label: 'Alerts', badge: urgentAlertCount > 0 ? urgentAlertCount : undefined },
    { id: 'care', label: 'Care' },
    { id: 'ask', label: 'Ask' },
  ];

  return (
    <header className="pt-2 pb-2 relative z-40 w-full">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Farm Info & Greeting */}
        <div>
          <p className="text-xs text-[#5E6C61] font-medium tracking-tight">
            {farmName} · {location}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#122B1E] tracking-tight mt-0.5">
            Namaste, {farmerName.split(' ')[0] || 'Ramesh'}
          </h1>
        </div>

        {/* Center: Desktop Navigation Bar (Visible on md and up) */}
        {onTabChange && (
          <nav className="hidden md:flex items-center bg-[#122B1E] text-white rounded-full p-1.5 shadow-md border border-[#1b3b2a]/60">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative py-1.5 px-4 rounded-full text-xs font-semibold transition-all duration-200 text-center flex items-center justify-center gap-1.5 ${
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
        )}

        {/* Right: Quick SOS Call + Profile Avatar Button */}
        <div className="flex items-center gap-3">
          {onEmergencyCall && (
            <button
              onClick={onEmergencyCall}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FDE8E8] hover:bg-[#fbd3d3] text-[#C0392B] text-xs font-bold transition shadow-sm"
              title="Emergency Veterinary Desk"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>SOS Vet</span>
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 rounded-full bg-[#122B1E] text-white flex items-center justify-center font-bold text-base shadow-sm hover:scale-105 transition cursor-pointer"
              title="User & Account Settings"
            >
              {farmerName.charAt(0) || 'R'}
            </button>

            {/* User & Admin Menu Dropdown */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E5EAE1] rounded-2xl shadow-xl p-2 z-50 text-xs">
                <div className="p-2.5 border-b border-[#E5EAE1]">
                  <div className="flex items-center gap-1.5 font-bold text-[#122B1E]">
                    <span>{farmerName}</span>
                    {isAdmin && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FEF3D6] text-[#B45309] font-mono">
                        {userRole?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#5E6C61] truncate mt-0.5">
                    {userEmail || 'Local Farm Session'}
                  </p>
                </div>

                <div className="py-1 space-y-0.5">
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenAdmin?.();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-[#122B1E] hover:bg-[#F4F5EE] font-semibold flex items-center gap-2"
                    >
                      <Crown className="w-4 h-4 text-[#EFA037]" />
                      <span>Admin Control Center</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenAuth?.();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-[#122B1E] hover:bg-[#F4F5EE] font-medium flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#126A42]" />
                    <span>{userEmail ? 'Account Profile' : 'Sign In / Register'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onEmergencyCall?.();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-[#C0392B] hover:bg-[#FDE8E8] font-medium flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-[#C0392B]" />
                    <span>Direct 24/7 Vet Line</span>
                  </button>

                  {userEmail && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onSignOut?.();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-[#5E6C61] hover:bg-gray-100 font-medium flex items-center gap-2 border-t border-[#E5EAE1] mt-1 pt-1.5"
                    >
                      <LogOut className="w-4 h-4 text-gray-500" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
