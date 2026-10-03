import React from 'react';
import {
  AlertTriangle,
  Clock,
  PhoneCall,
  CheckCircle2,
  Syringe,
  Stethoscope,
  Info,
  Calendar,
} from 'lucide-react';
import { HealthAlert } from '../../types/aniguard';

interface UrgentAlertsCardProps {
  alerts: HealthAlert[];
  onScheduleVet: (alert: HealthAlert) => void;
  onAlertAction: (alert: HealthAlert) => void;
}

export const UrgentAlertsCard: React.FC<UrgentAlertsCardProps> = ({
  alerts,
  onScheduleVet,
  onAlertAction,
}) => {
  const unresolvedAlerts = alerts.filter((a) => !a.is_resolved);

  return (
    <div className="bg-[#0B1520] border border-[#182635] rounded-xl p-5 text-white shadow-lg flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#182635]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#25180A] flex items-center justify-center text-[#F59E0B]">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Urgent Alerts & Clinical Reminders
            </h3>
          </div>
          {unresolvedAlerts.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800">
              {unresolvedAlerts.length} Action Needed
            </span>
          )}
        </div>

        {/* Alerts List */}
        <div className="space-y-3 mt-3">
          {unresolvedAlerts.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">All Clinical Signals Normal</p>
              <p className="text-xs text-slate-500 mt-1">Zero pending vaccinations or critical veterinary flags.</p>
            </div>
          ) : (
            unresolvedAlerts.map((alert) => {
              const isHigh = alert.severity === 'High';
              const isMedium = alert.severity === 'Medium';

              const cardBorder = isHigh
                ? 'border-[#3E2810] bg-[#1A1408]'
                : isMedium
                ? 'border-[#182635] bg-[#0E1A26]'
                : 'border-[#134E3E] bg-[#0A1A16]';

              const titleColor = isHigh
                ? 'text-[#F59E0B]'
                : isMedium
                ? 'text-cyan-400'
                : 'text-emerald-400';

              const isVaccine = alert.alert_type === 'vaccine_overdue';

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border ${cardBorder} text-white transition hover:border-slate-600 shadow-sm`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isVaccine ? (
                        <Syringe className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                      <h4 className={`font-bold text-sm ${titleColor}`}>{alert.title}</h4>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                      {alert.animal_name.split(' ')[0]}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {alert.description}
                  </p>

                  {alert.action_recommended && (
                    <div className="mt-2 text-[11px] text-slate-400 bg-black/20 p-2 rounded-lg border border-white/5 flex items-start gap-1.5">
                      <Info className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                      <span>{alert.action_recommended}</span>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => onScheduleVet(alert)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 shadow-sm ${
                        isHigh
                          ? 'bg-[#F59E0B] hover:bg-[#D97706] text-black'
                          : 'bg-[#0E2E25] hover:bg-[#134E3E] text-emerald-300 border border-emerald-700/60'
                      }`}
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Dispatch Field Vet</span>
                    </button>

                    <button
                      onClick={() => onAlertAction(alert)}
                      className="text-xs text-slate-400 hover:text-white transition px-2 py-1"
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Emergency Triage Hotline */}
      <div className="pt-3 mt-3 border-t border-[#182635] flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>Priority Triage: Anand District</span>
        </span>
        <span className="font-mono text-slate-300">Hotline 24/7</span>
      </div>
    </div>
  );
};
