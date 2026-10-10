
import React from 'react';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
}

const overdueVaccines = [
  {
    month: 'OCT',
    day: '04',
    name: 'PPR Sungri 96',
    disease: 'Peste des petits ruminants',
    animal: 'Moti · 1 ml',
    isOverdue: true,
  },
];

const upcomingVaccines = [
  {
    month: 'OCT',
    day: '27',
    name: 'FMD trivalent',
    disease: 'Foot-and-mouth disease',
    animal: 'Gauri · 2 ml',
    isOverdue: false,
  },
  {
    month: 'NOV',
    day: '03',
    name: 'HS oil adjuvant',
    disease: 'Hemorrhagic septicemia',
    animal: 'Shera · 3 ml',
    isOverdue: false,
  },
];

const VaccineCard = ({ v }: { v: typeof overdueVaccines[0] }) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
    {/* Date Box */}
    <div
      className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
      style={v.isOverdue
        ? { backgroundColor: '#fdecea' }
        : { backgroundColor: '#e3f2fd' }
      }
    >
      <span
        className="text-[10px] font-bold uppercase"
        style={{ color: v.isOverdue ? '#c62828' : '#1565c0' }}
      >
        {v.month}
      </span>
      <span
        className="text-2xl font-bold leading-none"
        style={{ color: v.isOverdue ? '#c62828' : '#1565c0' }}
      >
        {v.day}
      </span>
    </div>

    {/* Info */}
    <div>
      <p className="text-base font-bold text-gray-900">{v.name}</p>
      <p className="text-xs text-gray-500 mt-0.5">{v.disease}</p>
      <p className="text-xs text-gray-400 mt-0.5">{v.animal}</p>
    </div>
  </div>
);

const SectionLabel = ({ label, isOverdue }: { label: string; isOverdue: boolean }) => (
  <div className="mb-3">
    <span
      className="text-xs font-semibold px-3 py-1 rounded-full"
      style={isOverdue
        ? { backgroundColor: '#fdecea', color: '#c62828' }
        : { backgroundColor: '#e8f5e9', color: '#2e7d32' }
      }
    >
      {label}
    </span>
  </div>
);

const VaccinesPage: React.FC<Props> = ({ profile }) => {
  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-400">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vaccines</h1>
        <p className="text-sm text-gray-500 mt-0.5">Booster and deworming calendar</p>
      </div>

      {/* Overdue */}
      <div>
        <SectionLabel label="Overdue" isOverdue={true} />
        <div className="space-y-3">
          {overdueVaccines.map((v, i) => <VaccineCard key={i} v={v} />)}
        </div>
        <button
          className="w-full mt-3 py-4 rounded-2xl text-white text-base font-semibold"
          style={{ backgroundColor: '#1a3c2b' }}
        >
          Book vet for Moti
        </button>
      </div>

      {/* Coming Up */}
      <div>
        <SectionLabel label="Coming up" isOverdue={false} />
        <div className="space-y-3">
          {upcomingVaccines.map((v, i) => <VaccineCard key={i} v={v} />)}
        </div>
      </div>

      {/* Add Record */}
      <button className="w-full py-4 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50 transition shadow-sm">
        Add vaccination record
      </button>
    </div>
  );
};

export default VaccinesPage;
