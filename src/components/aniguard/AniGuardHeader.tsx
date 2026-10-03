import React, { useState } from 'react';
import { Phone, Star, ShieldCheck, ChevronDown, LogOut, User as UserIcon, Crown } from 'lucide-react';

interface AniGuardHeaderProps {
  onEmergencyCall: () => void;
  onAuthClick: () => void;
  farmerName?: string;
  userEmail?: string | null;
  userRole?: string | null;
  onSignOut?: () => void;
}

export const AniGuardHeader: React.FC<AniGuardHeaderProps> = ({
  onEmergencyCall,
  onAuthClick,
  farmerName = 'Ramesh Kumar',
  userEmail,
  userRole,
  onSignOut,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getRoleBadge = () => {
    if (userRole === 'super_admin') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#291F0E] text-[#D4AF37] border border-[#D4AF37]/50">
          <Crown className="w-2.5 h-2.5" />
          Super Admin
        </span>
      );
    }
    if (userRole === 'admin') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
          Admin
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
        Farmer
      </span>
    );
  };

  return (
    <header className="w-full bg-[#08101A] border-b border-[#1A2634] text-white px-4 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        {/* Cow emblem circle logo */}
        <div className="w-10 h-10 rounded-full border-2 border-[#10B981] bg-[#0E1C28] flex items-center justify-center p-1 shadow-sm">
          <div className="text-[9px] font-black tracking-tighter text-[#10B981] leading-none text-center">
            ANI<br />GUARD
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-white">AniGuard</span>
            {userRole && getRoleBadge()}
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block font-normal">
            AI-Powered Livestock Healthcare & Farm Intelligence
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Emergency Vet Call button */}
        <button
          onClick={onEmergencyCall}
          className="w-9 h-9 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white flex items-center justify-center transition shadow-md shadow-red-950/40"
          title="24/7 Emergency Veterinary Hotline"
        >
          <Phone className="w-4 h-4 fill-current" />
        </button>

        {/* Premium Lite Badge */}
        <button
          type="button"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1E3A34] bg-[#0C1E20] hover:bg-[#122A2D] text-[#34D399] text-xs font-semibold transition"
        >
          <Star className="w-3.5 h-3.5 fill-[#34D399]" />
          <span>Premium Lite</span>
        </button>

        {/* Auth / Account Button */}
        <button
          onClick={onAuthClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
            userEmail
              ? 'border-emerald-800 bg-[#0E2E25] text-emerald-300 hover:bg-[#134E3E]'
              : 'border-slate-700 bg-[#0E1A26] hover:bg-[#152434] text-slate-200'
          }`}
        >
          <ShieldCheck className={`w-3.5 h-3.5 ${userEmail ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span>{userEmail ? 'Live Auth' : 'Sign In'}</span>
        </button>

        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-800 cursor-pointer focus:outline-none"
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                alt="Farmer Profile"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500"
              />
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-[#08101A] rounded-full ${
                  userEmail ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
              ></span>
            </div>
            <span className="hidden md:inline text-xs font-semibold text-slate-200 max-w-[140px] truncate text-left">
              {farmerName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Menu Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0B1520] border border-[#1A2634] rounded-xl shadow-2xl p-2 z-50">
              <div className="p-2 border-b border-slate-800">
                <p className="text-[11px] font-bold text-white truncate">{farmerName}</p>
                <p className="text-[10px] text-slate-400 truncate">{userEmail || 'Guest / Unauthenticated'}</p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onAuthClick();
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-300 hover:text-white hover:bg-[#101F2F] flex items-center gap-2"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{userEmail ? 'Manage Account' : 'Sign In / Register'}</span>
                </button>

                {userEmail && onSignOut && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onSignOut();
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs text-red-400 hover:text-red-300 hover:bg-red-950/60 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
