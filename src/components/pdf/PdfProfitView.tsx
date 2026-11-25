import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PdfProfitViewProps {
  onBack?: () => void;
}

export const PdfProfitView: React.FC<PdfProfitViewProps> = ({ onBack }) => {
  const weeklyBars = [
    { week: 'Wk 35', milkH: '72%', feedH: '38%', profitH: '28%' },
    { week: 'Wk 36', milkH: '75%', feedH: '40%', profitH: '30%' },
    { week: 'Wk 37', milkH: '78%', feedH: '41%', profitH: '32%' },
    { week: 'Wk 38', milkH: '82%', feedH: '42%', profitH: '33%' },
    { week: 'Wk 39', milkH: '86%', feedH: '43%', profitH: '36%' },
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
          <span>Farm overview</span>
        </button>
      )}

      {/* Header */}
      <div className="pt-1">
        <h1 className="text-3xl font-bold text-[#122B1E] tracking-tight">
          Profit
        </h1>
        <p className="text-sm text-[#5E6C61] mt-0.5">
          This week, week 39
        </p>
      </div>

      {/* Responsive Grid for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
        {/* Left Column: Net Profit + Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          {/* Dark Forest Green Net Profit Card */}
          <div className="bg-[#122B1E] text-white rounded-[26px] p-6 shadow-sm space-y-2">
            <span className="text-sm text-[#9DB8A6] font-medium block">
              Net profit
            </span>

            <div className="text-5xl font-bold text-white tracking-tight leading-none pt-1">
              ₹4,960
            </div>

            <div className="flex items-center gap-3 pt-3">
              <span className="px-3.5 py-1 rounded-full bg-[#D6F4E3] text-[#12482B] font-semibold text-xs">
                +12% vs last week
              </span>
              <span className="text-sm text-[#9DB8A6] font-medium">
                37.8% margin
              </span>
            </div>
          </div>

          {/* Breakdown White Card */}
          <div className="bg-white rounded-[22px] p-5 border border-[#E5EAE1] shadow-sm space-y-4">
            {/* Milk Sales */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2693AB] shrink-0" />
                <span className="text-sm text-[#2D3B32]">Milk sales · 327.6 L at ₹40</span>
              </div>
              <span className="font-bold text-sm text-[#122B1E]">₹13,104</span>
            </div>

            {/* Feed and Silage */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EFA037] shrink-0" />
                <span className="text-sm text-[#2D3B32]">Feed and silage</span>
              </div>
              <span className="font-bold text-sm text-[#122B1E]">₹6,400</span>
            </div>

            {/* Health and Vaccines */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D94141] shrink-0" />
                <span className="text-sm text-[#2D3B32]">Health and vaccines</span>
              </div>
              <span className="font-bold text-sm text-[#122B1E]">₹1,744</span>
            </div>
          </div>
        </div>

        {/* Right Column: Last 5 Weeks Chart Card */}
        <div className="lg:col-span-7 bg-white rounded-[22px] p-6 border border-[#E5EAE1] shadow-sm space-y-5 flex flex-col justify-between">
          <h3 className="font-bold text-base text-[#122B1E]">Last 5 weeks</h3>

          {/* Grouped Bar Chart Area */}
          <div className="h-56 sm:h-64 flex items-end justify-between px-2 pt-6 pb-2">
            {weeklyBars.map((bar) => (
              <div key={bar.week} className="flex flex-col items-center gap-2 flex-1">
                <div className="flex items-end gap-1.5 sm:gap-2 h-44 sm:h-52">
                  {/* Milk Bar */}
                  <div
                    className="w-3 sm:w-4 bg-[#2693AB] rounded-t-sm transition-all duration-500"
                    style={{ height: bar.milkH }}
                    title="Milk"
                  />
                  {/* Feed Bar */}
                  <div
                    className="w-3 sm:w-4 bg-[#EFA037] rounded-t-sm transition-all duration-500"
                    style={{ height: bar.feedH }}
                    title="Feed"
                  />
                  {/* Profit Bar */}
                  <div
                    className="w-3 sm:w-4 bg-[#185834] rounded-t-sm transition-all duration-500"
                    style={{ height: bar.profitH }}
                    title="Profit"
                  />
                </div>
                <span className="text-xs text-[#5E6C61] font-medium">{bar.week}</span>
              </div>
            ))}
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-5 text-xs text-[#5E6C61] pt-2 px-2 border-t border-[#E5EAE1]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2693AB]" />
              <span>Milk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EFA037]" />
              <span>Feed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#185834]" />
              <span>Profit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
