import React from 'react';
import {
  ShieldCheck,
  Phone,
  Database,
  Activity,
  HeartPulse,
  ExternalLink,
  Lock,
  Sparkles,
  Server,
  Layers,
} from 'lucide-react';
import { AniGuardTab } from './AniGuardNavBar';

interface AniGuardFooterProps {
  onNavigateTab: (tab: AniGuardTab) => void;
  onEmergencyCall: () => void;
}

export const AniGuardFooter: React.FC<AniGuardFooterProps> = ({
  onNavigateTab,
  onEmergencyCall,
}) => {
  return (
    <footer className="w-full bg-[#050B12] border-t border-[#152332] text-slate-300 mt-12 py-10 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Operational Telemetry Bar */}
        <div className="p-4 rounded-xl bg-[#09131D] border border-[#192A3C] mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-white font-semibold">AI Diagnostic Core v2.4</span>
            </div>

            <span className="text-slate-600 hidden sm:inline">•</span>

            <div className="flex items-center gap-1.5 text-slate-400">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>ICAR-NDRI Telemetry Sync: Active</span>
            </div>

            <span className="text-slate-600 hidden sm:inline">•</span>

            <div className="flex items-center gap-1.5 text-slate-400">
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>PostgreSQL RLS & Super Admin Protection</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onEmergencyCall}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200 text-xs font-bold transition shadow-sm"
            >
              <Phone className="w-3 h-3 fill-current" />
              <span>Emergency Vet: +91 98250 12345</span>
            </button>
          </div>
        </div>

        {/* 4 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-[#152332]">
          {/* Column 1: Brand & Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-emerald-500 bg-[#0E1C28] flex items-center justify-center text-[8px] font-black text-emerald-400 leading-none">
                ANI<br />GUARD
              </div>
              <span className="font-bold text-white text-base tracking-tight">AniGuard</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's first AI-powered veterinary surveillance and farm intelligence platform.
              Empowering rural dairy farmers and veterinary surgeons with predictive diagnostics.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>ICAR-IVRI Standardized Differential Protocols</span>
            </div>
          </div>

          {/* Column 2: Clinical Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Clinical Modules</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigateTab('ai_check')}
                  className="hover:text-emerald-400 transition"
                >
                  AI Symptom Scanner & Scan Hub
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('ration')}
                  className="hover:text-emerald-400 transition"
                >
                  Precision AI Ration Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('profit')}
                  className="hover:text-emerald-400 transition"
                >
                  Dairy Economics & Profit Intelligence
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('vaccinations')}
                  className="hover:text-emerald-400 transition"
                >
                  Preventive Vaccination Calendar
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('disease_library')}
                  className="hover:text-emerald-400 transition"
                >
                  ICAR / WOAH Disease Compendium
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Indian Agriculture & Govt Programs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>National Schemes</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigateTab('schemes')}
                  className="hover:text-cyan-400 transition"
                >
                  Rashtriya Gokul Mission (RGM)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('schemes')}
                  className="hover:text-cyan-400 transition"
                >
                  Pashu Kisan Credit Card (KCC)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('schemes')}
                  className="hover:text-cyan-400 transition"
                >
                  National Livestock Mission (NLM)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('learning')}
                  className="hover:text-cyan-400 transition"
                >
                  Kisan Scientific Dairy Guides
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Official Scientific Authorities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Scientific Sources</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="https://icar.org.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition flex items-center justify-between"
                >
                  <span>ICAR - Indian Council of Agri Research</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
              <li>
                <a
                  href="https://nddb.coop"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition flex items-center justify-between"
                >
                  <span>NDDB - National Dairy Development</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
              <li>
                <a
                  href="https://dahd.nic.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition flex items-center justify-between"
                >
                  <span>DAHD - Animal Husbandry & Dairying</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.woah.org"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition flex items-center justify-between"
                >
                  <span>WOAH - World Organisation for Animal Health</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-[11px] leading-relaxed max-w-2xl text-center sm:text-left">
            <strong>Veterinary Notice:</strong> AniGuard is a clinical decision support tool designed to assist livestock owners and veterinarians. It does not replace hands-on clinical examination by a registered veterinarian.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>© 2026 AniGuard Platform</span>
            <span>•</span>
            <span>Production Build v2.4</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
