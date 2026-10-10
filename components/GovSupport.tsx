
import React from 'react';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
}

const schemes = [
  {
    category: 'Breed improvement',
    headline: '50% subsidy',
    name: 'Rashtriya Gokul Mission',
    description: 'Up to ₹2 crore for breed multiplication, plus free sex-sorted semen for insemination.',
    eligibility: 'Who can apply: dairy farmers, self-help groups and farmer producer organisations with indigenous or crossbred cattle.',
    link: 'https://dahd.gov.in/schemes/programmes/rashtriya_gokul_mission',
  },
  {
    category: 'Working capital',
    headline: '3% interest relief',
    name: 'Pashu Kisan Credit Card',
    description: 'Loan up to ₹1.60 lakh with no collateral, or up to ₹3 lakh at 4% if repaid on time.',
    eligibility: 'Who can apply: farmers with cattle, buffalo, goats or sheep, an Aadhaar and a bank account.',
    link: 'https://pmkisan.gov.in',
  },
  {
    category: 'Insurance',
    headline: '50–70% premium subsidy',
    name: 'National Livestock Mission',
    description: 'Cover for animal death from disease or natural disaster.',
    eligibility: 'Who can apply: small, marginal and landless farmers with tagged animals.',
    link: 'https://nlm.udyamimitra.in',
  },
];

const GovSupport: React.FC<Props> = ({ profile }) => {
  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-400">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Government support</h1>
        <p className="text-sm text-gray-500 mt-0.5">Schemes you may qualify for</p>
      </div>

      {/* Scheme Cards */}
      <div className="space-y-4">
        {schemes.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">{s.category}</p>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#1a5c30' }}>{s.headline}</h2>
            <h3 className="text-base font-bold text-gray-900 mb-2">{s.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{s.description}</p>
            <p className="text-sm text-gray-400 mb-4">{s.eligibility}</p>
            <a
              href={s.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
            >
              Open official portal
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GovSupport;
