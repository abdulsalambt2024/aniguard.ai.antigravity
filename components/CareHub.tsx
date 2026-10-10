
import React, { useState } from 'react';
import { UserProfile } from '../types';
import DiseaseGuide from './DiseaseGuide';
import GovSupport from './GovSupport';
import FeedPlan from './FeedPlan';
import PlansPage from './PlansPage';
import VaccinesPage from './VaccinesPage';

interface Props {
  profile: UserProfile;
}

const careItems = [
  { id: 'vaccines', label: 'Vaccines', icon: '💉' },
  { id: 'disease', label: 'Disease Guide', icon: '🦠' },
  { id: 'feed', label: 'Feed Plan', icon: '🌾' },
  { id: 'govt', label: 'Gov Support', icon: '🏛️' },
  { id: 'plans', label: 'Plans', icon: '⭐' },
];

const CareHub: React.FC<Props> = ({ profile }) => {
  const [subPage, setSubPage] = useState<string | null>(null);

  if (subPage === 'vaccines') return (
    <div>
      <BackBtn onClick={() => setSubPage(null)} />
      <VaccinesPage profile={profile} />
    </div>
  );
  if (subPage === 'disease') return (
    <div>
      <BackBtn onClick={() => setSubPage(null)} />
      <DiseaseGuide profile={profile} />
    </div>
  );
  if (subPage === 'feed') return (
    <div>
      <BackBtn onClick={() => setSubPage(null)} />
      <FeedPlan profile={profile} />
    </div>
  );
  if (subPage === 'govt') return (
    <div>
      <BackBtn onClick={() => setSubPage(null)} />
      <GovSupport profile={profile} />
    </div>
  );
  if (subPage === 'plans') return (
    <div>
      <BackBtn onClick={() => setSubPage(null)} />
      <PlansPage profile={profile} />
    </div>
  );

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-400">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Care</h1>
        <p className="text-sm text-gray-500 mt-0.5">Tools to keep your herd healthy</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {careItems.map(item => (
          <button
            key={item.id}
            onClick={() => setSubPage(item.id)}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-start gap-3 hover:shadow-md transition-shadow text-left"
          >
            <span className="text-3xl">{item.icon}</span>
            <span className="text-base font-bold text-gray-900">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const BackBtn = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 text-sm font-semibold mb-4"
    style={{ color: '#1a3c2b' }}
  >
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
    Back
  </button>
);

export default CareHub;
