import React from 'react';
import { AlertTriangle, CheckCircle2, PhoneCall, Calendar } from 'lucide-react';
import { HealthAlert } from '../../types/aniguard';
import { aniguardService } from '../../services/aniguardService';

interface HealthAlertsViewProps {
  alerts: HealthAlert[];
  onScheduleVet: (alert: HealthAlert) => void;
  onRefresh: () => void;
}

export const HealthAlertsView: React.FC<HealthAlertsViewProps> = ({
  alerts,
  onScheduleVet,
  onRefresh,
}) => {
  const handleResolve = (id: string) => {
    aniguardService.resolveAlert(id);
    onRefresh();
  };

  return (
    <div className="bg-[#0B1520] border border-[#182635] rounded-xl p-5 text-white shadow-lg space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#182635]">
        <div className="w-10 h-10 rounded-xl bg-[#291F0E] text-[#F59E0B] flex items-center justify-center border border-[#4A3816]">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#F59E0B]">
            Health Risk Alerts & Clinical Escalations
          </h2>
          <p className="text-xs text-slate-400">
            Deduplicated multi-signal warnings and preventive veterinary reminders
          </p>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map((alert) => {
          const isCritical = alert.risk_level === 'Critical' || alert.risk_level === 'High';

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
                alert.is_resolved
                  ? 'bg-[#08101A] border-slate-800 opacity-60'
                  : isCritical
                  ? 'bg-[#1F100A] border-[#4A2010]'
                  : 'bg-[#1A1408] border-[#3E2810]'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      isCritical
                        ? 'bg-[#2E1010] text-[#EF4444] border-[#5A1C1C]'
                        : 'bg-[#261E10] text-[#F59E0B] border-[#4A3816]'
                    }`}
                  >
                    {alert.risk_level} Risk
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Tag: {alert.tag_id}</span>
                  <span className="text-[11px] text-slate-500 font-sans">
                    • {alert.animal_name}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alert.description}</p>

                {alert.recommended_action && (
                  <div className="mt-2 text-xs text-emerald-400 font-medium">
                    Recommended: {alert.recommended_action}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!alert.is_resolved ? (
                  <>
                    <button
                      onClick={() => onScheduleVet(alert)}
                      className="px-3.5 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-black font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Schedule Vet Visit</span>
                    </button>
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-3 py-2 rounded-lg bg-[#0E1A26] border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-medium transition"
                    >
                      Resolve
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Resolved</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
