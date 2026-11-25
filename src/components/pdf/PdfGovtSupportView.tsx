import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PdfGovtSupportViewProps {
  onBack?: () => void;
}

export const PdfGovtSupportView: React.FC<PdfGovtSupportViewProps> = ({ onBack }) => {
  const schemes = [
    {
      id: 'rgm',
      category: 'Breed improvement',
      stat: '50% subsidy',
      title: 'Rashtriya Gokul Mission',
      desc: 'Up to ₹2 crore for breed multiplication, plus free sex-sorted semen for insemination.',
      who: 'dairy farmers, self-help groups and farmer producer organisations with indigenous or crossbred cattle.',
      portalUrl: 'https://dahd.nic.in',
    },
    {
      id: 'kcc',
      category: 'Working capital',
      stat: '3% interest relief',
      title: 'Pashu Kisan Credit Card',
      desc: 'Loan up to ₹1.60 lakh with no collateral, or up to ₹3 lakh at 4% if repaid on time.',
      who: 'farmers with cattle, buffalo, goats or sheep, an Aadhaar and a bank account.',
      portalUrl: 'https://dahd.nic.in',
    },
    {
      id: 'nlm',
      category: 'Insurance',
      stat: '50–70% premium subsidy',
      title: 'National Livestock Mission',
      desc: 'Cover for animal death from disease or natural disaster.',
      who: 'small, marginal and landless farmers with tagged animals.',
      portalUrl: 'https://dahd.nic.in',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 pb-28">
      {/* Optional Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#122B1E] hover:opacity-80 transition py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Care hub</span>
        </button>
      )}

      {/* Header */}
      <div className="pt-1">
        <h1 className="text-3xl font-bold text-[#122B1E] tracking-tight">
          Government support
        </h1>
        <p className="text-sm text-[#5E6C61] mt-0.5">
          Schemes you may qualify for
        </p>
      </div>

      {/* Scheme Cards Responsive Grid (1 col mobile, 3 col desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
        {schemes.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-[22px] p-5 border border-[#E5EAE1] shadow-sm space-y-2.5 text-xs"
          >
            <span className="text-[#5E6C61] font-medium text-xs block">
              {s.category}
            </span>

            <div className="text-3xl font-bold text-[#135E3B] tracking-tight leading-tight">
              {s.stat}
            </div>

            <h3 className="font-bold text-base text-[#122B1E]">
              {s.title}
            </h3>

            <p className="text-sm text-[#3D4A41] leading-relaxed">
              {s.desc}
            </p>

            <p className="text-xs text-[#5E6C61] leading-relaxed">
              <strong className="text-[#5E6C61] font-semibold">Who can apply: </strong>
              {s.who}
            </p>

            <div className="pt-2">
              <a
                href={s.portalUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 rounded-2xl border border-[#D0D6CB] hover:bg-black/5 bg-white text-[#122B1E] font-semibold text-sm transition shadow-sm block text-center"
              >
                Open official portal
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
