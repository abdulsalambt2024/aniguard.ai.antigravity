
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
}

const initialAlerts = [
  {
    id: 1,
    severity: 'Urgent',
    tag: 'IN-GJ-3090',
    animal: 'Moti',
    title: 'PPR vaccine is overdue',
    desc: 'Moti (Sirohi goat) is 5 days late for the PPR booster.',
    nextStep: 'Next step: book a vet visit for the booster.',
    actionLabel: 'Call vet',
    done: false,
  },
  {
    id: 2,
    severity: 'Watch',
    tag: 'IN-GJ-1042',
    animal: 'Gauri',
    title: 'Month 6 of pregnancy',
    desc: 'Gauri (Holstein) needs more feed to support the calf.',
    nextStep: 'Next step: add 0.8 kg concentrate and mineral mix daily.',
    actionLabel: 'Book check-up',
    done: false,
  },
];

const HealthAlerts: React.FC<Props> = ({ profile }) => {
  const [alerts, setAlerts] = useState(initialAlerts);

  const markDone = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const activeCount = alerts.filter(a => !a.done).length;

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-400">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Health alerts</h1>
        <p className="text-sm text-gray-500 mt-0.5">{activeCount} need action</p>
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        {alerts.map(alert => {
          const isUrgent = alert.severity === 'Urgent';
          return (
            <div key={alert.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              {/* Top row */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={isUrgent
                    ? { backgroundColor: '#fde8e8', color: '#c0392b' }
                    : { backgroundColor: '#fff3e0', color: '#e65100' }
                  }
                >
                  {alert.severity}
                </span>
                <span className="text-xs text-gray-400">{alert.tag} · {alert.animal}</span>
              </div>

              {/* Content */}
              <h3 className="text-base font-bold text-gray-900 mb-1">{alert.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{alert.desc}</p>

              {/* Hint */}
              <div className="rounded-xl p-3 mb-4" style={{ backgroundColor: '#e8f5e9' }}>
                <p className="text-sm font-medium" style={{ color: '#2e7d32' }}>{alert.nextStep}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
                  style={{ backgroundColor: '#1a3c2b' }}
                >
                  {alert.actionLabel}
                </button>
                <button
                  onClick={() => markDone(alert.id)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-800 border border-gray-200 bg-white hover:bg-gray-50 transition"
                >
                  Mark done
                </button>
              </div>
            </div>
          );
        })}

        {alerts.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-semibold">All clear!</p>
            <p className="text-sm mt-1">No health alerts right now.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthAlerts;
