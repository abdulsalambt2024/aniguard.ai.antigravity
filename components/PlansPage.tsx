
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
}

const PlansPage: React.FC<Props> = ({ profile }) => {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-400">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Plans</h1>
        <p className="text-sm text-gray-500 mt-0.5">Pay securely with Razorpay. GST invoice included.</p>
      </div>

      {/* Billing Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setBilling('monthly')}
          className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
          style={billing === 'monthly'
            ? { backgroundColor: '#1a3c2b', color: 'white' }
            : { backgroundColor: 'white', color: '#374151', border: '1.5px solid #d1d5db' }
          }
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling('yearly')}
          className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
          style={billing === 'yearly'
            ? { backgroundColor: '#1a3c2b', color: 'white' }
            : { backgroundColor: 'white', color: '#374151', border: '1.5px solid #d1d5db' }
          }
        >
          Yearly · save 17%
        </button>
      </div>

      {/* Featured Pro Plan Card */}
      <div className="rounded-2xl p-5 relative overflow-hidden" style={{ backgroundColor: '#1a3c2b' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: '#F5A623', color: '#1a3c2b' }}>
            Most popular
          </span>
          <span className="text-xs text-gray-300">किसान प्रो</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">AniGuard Pro</h2>
        <p className="text-4xl font-bold text-white mb-4">
          ₹499<span className="text-base font-normal text-gray-300">/month</span>
        </p>

        <div className="space-y-2 mb-5">
          {[
            'Unlimited animals',
            'AI disease scanner',
            'Early alerts for milk and appetite drops',
            'One-tap emergency vet call',
            'Voice logging in Hindi and English',
            'Subsidy and KCC loan reports',
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#4ade80" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-200">{f}</span>
            </div>
          ))}
        </div>

        <button
          className="w-full py-3.5 rounded-xl font-bold text-base"
          style={{ backgroundColor: '#F5A623', color: '#1a3c2b' }}
        >
          Upgrade for ₹499
        </button>
      </div>

      {/* Other Plans */}
      <div className="space-y-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-gray-900">Kisan Starter</p>
            <p className="text-xs text-gray-400 mt-0.5">Up to 4 animals, milk log, vaccine reminders</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
            Your plan
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-bold text-gray-900">Commercial Dairy</p>
              <p className="text-xs text-gray-400 mt-0.5">Multi-farm, 24/7 video vet, audit reports</p>
            </div>
            <span className="text-sm font-semibold text-gray-700">₹1,499</span>
          </div>
          <button className="w-full py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition">
            Choose plan
          </button>
        </div>
      </div>

      {/* Book a Vet Service */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">Book a vet service</h2>
        <div className="space-y-3">
          <VetService name="Video call with a vet" desc="15–20 minutes, with e-prescription" price="₹299" />
          <VetService name="Full herd health audit" desc="Risk report and feed balance" price="₹799" />
          <VetService name="Vaccine and deworming plan" desc="Full-year schedule and reminders" price="₹1,199" />
        </div>
      </div>
    </div>
  );
};

const VetService = ({ name, desc, price }: { name: string; desc: string; price: string }) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-semibold text-gray-900">{name}</p>
      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
    </div>
    <span className="text-sm font-bold text-gray-700 ml-3 flex-shrink-0">{price}</span>
  </div>
);

export default PlansPage;
