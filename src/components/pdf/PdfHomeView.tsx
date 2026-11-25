import React from 'react';
import { ShieldAlert, Activity, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Animal, FarmSummary, HealthAlert } from '../../types/aniguard';
import { aniguardService } from '../../services/aniguardService';

interface PdfHomeViewProps {
  summary: FarmSummary;
  animals: Animal[];
  alerts: HealthAlert[];
  farmerName?: string;
  onRunHealthScan: () => void;
  onCallVet: (alert?: HealthAlert) => void;
  onSelectAnimal: (animal: Animal) => void;
  onVoiceLog: () => void;
  onOpenFeedPlan: () => void;
  onOpenSchemes: () => void;
  onOpenProfit: () => void;
  onOpenAlerts: () => void;
}

export const PdfHomeView: React.FC<PdfHomeViewProps> = ({
  summary,
  animals,
  alerts,
  onRunHealthScan,
  onCallVet,
  onSelectAnimal,
  onVoiceLog,
  onOpenFeedPlan,
  onOpenSchemes,
  onOpenProfit,
  onOpenAlerts,
}) => {
  const activeAlerts = alerts.filter((a) => !a.is_resolved);
  const criticalOrHighCount = activeAlerts.filter(
    (a) => a.risk_level === 'Critical' || a.risk_level === 'High' || a.risk_level === 'High Risk'
  ).length;
  const animalsNeedingCare = animals.filter((a) => a.health_status !== 'Healthy');
  const isDemoSeed = aniguardService.isUsingDemoSeed();

  // Dynamic ring arc proportions (total circumference = 100)
  const totalCount = Math.max(1, animals.length);
  const healthyPct = Math.round((summary.healthy_count / totalCount) * 100);
  const watchPct = Math.round((summary.watch_count / totalCount) * 100);
  const riskPct = Math.max(0, 100 - healthyPct - watchPct);

  const milkTarget = Math.max(50, Math.round(summary.estimated_daily_milk_liters * 1.07));
  const milkProgress = Math.min(100, Math.round((summary.estimated_daily_milk_liters / milkTarget) * 100));

  const getBadgeStyle = (level: HealthAlert['risk_level']) => {
    if (level === 'Critical') return 'bg-[#FDE8E8] text-[#B91C1C] border border-[#F5B7B1]';
    if (level === 'High' || level === 'High Risk') return 'bg-[#FDE8E8] text-[#C0392B]';
    if (level === 'Early Risk') return 'bg-[#FFF0DB] text-[#C2410C]';
    return 'bg-[#FEF3D6] text-[#B45309]';
  };

  const getAvatarStyle = (status: Animal['health_status']) => {
    if (status === 'Healthy') return { bg: 'bg-[#DCF8E8] text-[#126A42]', text: 'text-[#5E6C61]' };
    if (status === 'Watch') return { bg: 'bg-[#FEF3D6] text-[#B45309]', text: 'text-[#B45309]' };
    return { bg: 'bg-[#FDE8E8] text-[#C0392B]', text: 'text-[#C0392B] font-semibold' };
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 pb-28">
      {/* Demo Seed Indicator + Clinical Safety Boundary Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-[#EAF5EE] border border-[#CFE6D7] text-[11px] text-[#124B30]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#126A42] shrink-0" />
          <span>
            <strong>Early-Warning Safety:</strong> AniGuard surfaces risk warnings &amp; observations — not a veterinary diagnosis or prescription.
          </span>
        </div>
        {isDemoSeed && (
          <span className="px-2 py-0.5 rounded-full bg-white border border-[#BFE0CA] text-[#126A42] font-semibold text-[10px]">
            Sample Herd Data (Persisted Locally)
          </span>
        )}
      </div>

      {/* Top Grid: Hero Card + Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Dark Hero Card: Herd Health + Care Notice */}
        <div className="lg:col-span-7 bg-[#122B1E] text-white rounded-[26px] p-5 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-center gap-5">
          {/* Dynamic Circular Gauge */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#1B3B2A]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {healthyPct > 0 && (
                <path
                  className="text-[#22C55E]"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  strokeDasharray={`${healthyPct}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              )}
              {watchPct > 0 && (
                <path
                  className="text-[#EFA037]"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  strokeDasharray={`${watchPct}, 100`}
                  strokeDashoffset={`-${healthyPct}`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              )}
              {riskPct > 0 && (
                <path
                  className="text-[#EF4444]"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  strokeDasharray={`${riskPct}, 100`}
                  strokeDashoffset={`-${healthyPct + watchPct}`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-white leading-none">
                {summary.herd_health_index}
              </span>
              <span className="text-[10px] text-[#9DB8A6] mt-0.5 leading-tight">herd health</span>
            </div>
          </div>

          {/* Content Right */}
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg font-bold text-white leading-tight">
                {animalsNeedingCare.length > 0
                  ? `${animalsNeedingCare.length} animal${animalsNeedingCare.length > 1 ? 's' : ''} need attention today`
                  : 'Entire herd is within healthy baselines'}
              </h2>
            </div>

            <div className="text-xs text-[#9DB8A6] space-y-0.5 leading-relaxed">
              {animalsNeedingCare.length > 0 ? (
                animalsNeedingCare.slice(0, 2).map((ani) => (
                  <p key={ani.id}>
                    {ani.name} ({ani.tag_id}) — {ani.health_status} ({ani.current_health_score}% score)
                  </p>
                ))
              ) : (
                <p>{summary.total_registered_animals} animals monitored · {activeAlerts.length} active alerts</p>
              )}
            </div>

            <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                onClick={onRunHealthScan}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#EFA037] text-[#122B1E] text-xs font-bold hover:bg-[#e2932b] transition-all shadow-sm active:scale-95"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Run early-warning scan</span>
              </button>
              {criticalOrHighCount > 0 && (
                <button
                  onClick={onOpenAlerts}
                  className="inline-flex items-center justify-center gap-1 px-3.5 py-2.5 rounded-2xl bg-[#DC2626] text-white text-xs font-bold hover:bg-[#b91c1c] transition"
                >
                  <span>{criticalOrHighCount} High Risk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Row of 2 KPI Cards */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          {/* Card 1: Milk Today */}
          <div className="bg-white rounded-[22px] p-4.5 border border-[#E5EAE1] shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs text-[#5E6C61] font-medium">Milk baseline</span>
              <div className="text-2xl font-bold text-[#122B1E] mt-1">
                {summary.estimated_daily_milk_liters} L
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-[#E5EAE1] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#2693AB] h-full rounded-full" style={{ width: `${milkProgress}%` }} />
              </div>
              <span className="text-[11px] text-[#5E6C61] mt-1.5 block font-medium">
                Target {milkTarget} L · {summary.total_registered_animals} animals
              </span>
            </div>
          </div>

          {/* Card 2: Profit This Week */}
          <button
            onClick={onOpenProfit}
            className="bg-white rounded-[22px] p-4.5 border border-[#E5EAE1] shadow-sm flex flex-col justify-between text-left hover:border-[#122B1E]/30 transition group"
          >
            <div>
              <span className="text-xs text-[#5E6C61] font-medium">Est. weekly profit</span>
              <div className="text-2xl font-bold text-[#122B1E] mt-1">
                ₹{summary.estimated_weekly_net_profit.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-[#E5EAE1] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#185834] h-full rounded-full" style={{ width: '74%' }} />
              </div>
              <span className="text-[11px] text-[#185834] mt-1.5 block font-semibold">
                +{summary.profit_growth_percentage}% vs last week →
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Section: Needs you today (Live Active Alerts) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#122B1E]">
            Needs you today ({activeAlerts.length})
          </h3>
          <button
            onClick={onOpenAlerts}
            className="text-xs font-semibold text-[#126A42] hover:underline flex items-center gap-1"
          >
            <span>View all alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeAlerts.slice(0, 2).map((alert) => (
              <div
                key={alert.id}
                className="bg-white rounded-[22px] p-4.5 border border-[#E5EAE1] shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-0.5 rounded-full font-semibold text-xs ${getBadgeStyle(alert.risk_level)}`}>
                      {alert.risk_level}
                    </span>
                    <span className="text-xs text-[#5E6C61] font-mono font-medium">
                      {alert.tag_id}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#122B1E]">{alert.title}</h4>
                    <p className="text-xs text-[#5E6C61] mt-0.5 line-clamp-2">{alert.description}</p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    alert.alert_type === 'pregnancy_check' ? onOpenFeedPlan() : onCallVet(alert)
                  }
                  className="w-full py-2.5 rounded-2xl bg-[#122B1E] hover:bg-[#1b3b2a] text-white font-semibold text-xs transition shadow-sm active:scale-[0.99]"
                >
                  {alert.action_cta_label || 'Consult Veterinarian'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[22px] p-5 border border-[#E5EAE1] flex items-center gap-3 text-xs text-[#5E6C61]">
            <CheckCircle2 className="w-5 h-5 text-[#126A42] shrink-0" />
            <span>No unresolved health warnings right now. Keep logging daily milk and vitals.</span>
          </div>
        )}
      </div>

      {/* Animal Avatars & Quick Actions Responsive Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 pt-1">
        {/* Live Herd Health Avatars Row */}
        <div className="md:col-span-7 bg-white rounded-[22px] p-4.5 border border-[#E5EAE1] shadow-sm flex items-center justify-around gap-2 overflow-x-auto">
          {animals.slice(0, 5).map((ani) => {
            const style = getAvatarStyle(ani.health_status);
            return (
              <button
                key={ani.id}
                onClick={() => onSelectAnimal(ani)}
                className="flex flex-col items-center group cursor-pointer min-w-[56px]"
              >
                <div
                  className={`w-12 h-12 rounded-full ${style.bg} font-bold flex items-center justify-center text-sm group-hover:scale-105 transition`}
                >
                  {ani.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-[#122B1E] mt-1.5 truncate max-w-[68px]">
                  {ani.name}
                </span>
                <span className={`text-xs ${style.text}`}>{ani.current_health_score}%</span>
              </button>
            );
          })}
        </div>

        {/* Quick Action Pills: Voice log | Feed plan | Schemes */}
        <div className="md:col-span-5 grid grid-cols-3 gap-2.5">
          <button
            onClick={onVoiceLog}
            className="py-3 px-2 rounded-2xl bg-white border border-[#E5EAE1] hover:border-[#122B1E] text-[#122B1E] font-semibold text-xs text-center shadow-sm transition active:scale-95 flex flex-col items-center justify-center gap-1"
          >
            <span>🎙️</span>
            <span>Voice log</span>
          </button>

          <button
            onClick={onOpenFeedPlan}
            className="py-3 px-2 rounded-2xl bg-white border border-[#E5EAE1] hover:border-[#122B1E] text-[#122B1E] font-semibold text-xs text-center shadow-sm transition active:scale-95 flex flex-col items-center justify-center gap-1"
          >
            <span>🌾</span>
            <span>Feed plan</span>
          </button>

          <button
            onClick={onOpenSchemes}
            className="py-3 px-2 rounded-2xl bg-white border border-[#E5EAE1] hover:border-[#122B1E] text-[#122B1E] font-semibold text-xs text-center shadow-sm transition active:scale-95 flex flex-col items-center justify-center gap-1"
          >
            <Sparkles className="w-4 h-4 text-[#126A42]" />
            <span>Schemes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
