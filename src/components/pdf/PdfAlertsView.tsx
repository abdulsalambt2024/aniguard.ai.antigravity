import React, { useState } from 'react';
import { Bell, CheckCircle2, PhoneCall, ShieldAlert, Check, Clock } from 'lucide-react';
import { HealthAlert } from '../../types/aniguard';
import { aniguardService } from '../../services/aniguardService';
import { toast } from 'sonner';

interface PdfAlertsViewProps {
  alerts: HealthAlert[];
  onScheduleVet: (alert: HealthAlert) => void;
  onResolveAlert: (id: string) => void;
  onRefresh?: () => void;
}

type AlertFilter = 'active' | 'urgent' | 'resolved';

export const PdfAlertsView: React.FC<PdfAlertsViewProps> = ({
  alerts,
  onScheduleVet,
  onResolveAlert,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<AlertFilter>('active');
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [pushAlertsEnabled, setPushAlertsEnabled] = useState(true);

  const activeAlerts = alerts.filter((a) => !a.is_resolved);
  const urgentAlerts = activeAlerts.filter(
    (a) => a.risk_level === 'Critical' || a.risk_level === 'High' || a.risk_level === 'High Risk'
  );
  const resolvedAlerts = alerts.filter((a) => a.is_resolved);

  const displayedAlerts =
    filter === 'active' ? activeAlerts : filter === 'urgent' ? urgentAlerts : resolvedAlerts;

  const handleAcknowledge = (alert: HealthAlert) => {
    aniguardService.acknowledgeAlert(alert.id);
    toast.info(`Alert acknowledged for ${alert.animal_name}`);
    onRefresh?.();
  };

  const handleMarkDone = (alert: HealthAlert) => {
    onResolveAlert(alert.id);
    toast.success(`Alert marked resolved for ${alert.animal_name}`);
    onRefresh?.();
  };

  const getBadgeStyle = (level: HealthAlert['risk_level']) => {
    if (level === 'Critical') return 'bg-[#FDE8E8] text-[#B91C1C] border border-[#F5B7B1]';
    if (level === 'High' || level === 'High Risk') return 'bg-[#FDE8E8] text-[#C0392B]';
    if (level === 'Early Risk') return 'bg-[#FFF0DB] text-[#C2410C]';
    return 'bg-[#FEF3D6] text-[#B45309]';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-28">
      {/* Header */}
      <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#122B1E] tracking-tight">
            Health alerts
          </h1>
          <p className="text-sm text-[#5E6C61] mt-0.5">
            {activeAlerts.length} active · {urgentAlerts.length} high-priority · {resolvedAlerts.length} resolved
          </p>
        </div>

        <button
          onClick={() => setPrefsOpen((p) => !p)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-[#E5EAE1] text-xs font-semibold text-[#122B1E] hover:bg-[#EAF5EE] transition"
        >
          <Bell className="w-3.5 h-3.5 text-[#126A42]" />
          <span>Alert Preferences</span>
        </button>
      </div>

      {/* Preferences Drawer */}
      {prefsOpen && (
        <div className="bg-white rounded-[20px] p-4 border border-[#E5EAE1] shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pushAlertsEnabled}
              onChange={(e) => {
                setPushAlertsEnabled(e.target.checked);
                toast.success('In-app early-warning notifications updated');
              }}
            />
            <span className="font-medium text-[#122B1E]">Real-time early-warning push alerts</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={smsAlertsEnabled}
              onChange={(e) => {
                setSmsAlertsEnabled(e.target.checked);
                toast.success('Critical SMS fallback preference updated');
              }}
            />
            <span className="font-medium text-[#122B1E]">Critical risk SMS escalation alert</span>
          </label>
        </div>
      )}

      {/* PRD Safety Notice */}
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#EAF5EE] border border-[#CFE6D7] text-[11px] text-[#124B30]">
        <ShieldAlert className="w-4 h-4 text-[#126A42] shrink-0" />
        <span>
          Alerts highlight physiological baseline deviations and overdue care — consult a registered veterinarian before administering medication.
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
            filter === 'active'
              ? 'bg-[#122B1E] text-white'
              : 'bg-white border border-[#E5EAE1] text-[#5E6C61] hover:text-[#122B1E]'
          }`}
        >
          Active ({activeAlerts.length})
        </button>
        <button
          onClick={() => setFilter('urgent')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
            filter === 'urgent'
              ? 'bg-[#C0392B] text-white'
              : 'bg-white border border-[#E5EAE1] text-[#5E6C61] hover:text-[#122B1E]'
          }`}
        >
          Critical / High ({urgentAlerts.length})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
            filter === 'resolved'
              ? 'bg-[#126A42] text-white'
              : 'bg-white border border-[#E5EAE1] text-[#5E6C61] hover:text-[#122B1E]'
          }`}
        >
          Resolved ({resolvedAlerts.length})
        </button>
      </div>

      {/* Alert Cards Grid (1 col on mobile, 2 col on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {displayedAlerts.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-[22px] p-5 border border-[#E5EAE1] shadow-sm space-y-3.5 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              {/* Top Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className={`px-3 py-0.5 rounded-full font-semibold text-xs ${getBadgeStyle(item.risk_level)}`}>
                    {item.risk_level}
                  </span>
                  {item.is_acknowledged && !item.is_resolved && (
                    <span className="px-2 py-0.5 rounded-full bg-[#EAF5EE] text-[#126A42] text-[10px] font-semibold">
                      Acknowledged
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#5E6C61] font-mono font-medium">
                  {item.tag_id}
                </span>
              </div>

              {/* Title & Desc */}
              <div>
                <h3 className="text-base font-bold text-[#122B1E] leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-[#5E6C61] mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Safe Next Step Callout Banner */}
              <div className="p-3.5 rounded-xl bg-[#EAF5EE] text-[#126A42] text-xs font-medium leading-relaxed">
                <strong>Safe next step:</strong> {item.recommended_action}
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#7A887D]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
                {item.model_version && <span className="font-mono">{item.model_version}</span>}
              </div>
            </div>

            {/* Action Buttons Row */}
            {!item.is_resolved ? (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={() => onScheduleVet(item)}
                  className="flex-1 min-w-[120px] py-2.5 px-3 rounded-2xl bg-[#122B1E] hover:bg-[#1b3b2a] text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{item.action_cta_label || 'Consult Vet'}</span>
                </button>

                {!item.is_acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(item)}
                    className="py-2.5 px-3 rounded-2xl border border-[#D0D6CB] hover:bg-black/5 bg-white text-[#122B1E] font-semibold text-xs transition"
                    title="Acknowledge alert"
                  >
                    Acknowledge
                  </button>
                )}

                <button
                  onClick={() => handleMarkDone(item)}
                  className="py-2.5 px-3 rounded-2xl border border-[#D0D6CB] hover:bg-[#EAF5EE] bg-white text-[#126A42] font-semibold text-xs transition flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Resolve</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[#126A42]">
                <CheckCircle2 className="w-4 h-4" />
                <span>{item.outcome_notes || 'Resolved'}</span>
              </div>
            )}
          </div>
        ))}

        {displayedAlerts.length === 0 && (
          <div className="col-span-full bg-white rounded-[22px] p-8 border border-[#E5EAE1] text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#126A42] mx-auto" />
            <h3 className="font-bold text-base text-[#122B1E]">
              {filter === 'resolved' ? 'No resolved alerts yet' : 'No active alerts in this category'}
            </h3>
            <p className="text-xs text-[#5E6C61]">
              {filter === 'resolved'
                ? 'Resolved alerts and outcomes will appear here.'
                : 'Your herd baselines are stable. Continue logging daily observations.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
