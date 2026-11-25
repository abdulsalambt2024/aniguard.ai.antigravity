import React, { useState } from 'react';

export const PdfAskAniGuardView: React.FC = () => {
  const [messages, setMessages] = useState<
    {
      id: string;
      sender: 'user' | 'assistant';
      text?: string;
      isInitialCard?: boolean;
    }[]
  >([
    {
      id: '1',
      sender: 'assistant',
      text: 'Namaste Ramesh. What is happening with your herd?',
    },
    {
      id: '2',
      sender: 'user',
      text: 'My cow is eating less and giving less milk.',
    },
    {
      id: '3',
      sender: 'assistant',
      isInitialCard: true,
    },
  ]);

  const [inputVal, setInputVal] = useState('');

  const quickChips = ['Udder swelling', 'Goat with fever', 'Not eating'];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg = { id: Date.now().toString(), sender: 'user' as const, text };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    setTimeout(() => {
      const lower = text.toLowerCase();
      let botMsg;

      if (lower.includes('udder') || lower.includes('swelling')) {
        botMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant' as const,
          text: 'Udder inflammation points toward acute mastitis. Inspect milk for flakes or watery clots using a clean paddle. Apply cold water compresses, isolate the animal, and consult your veterinarian if fever exceeds 39.5°C.',
        };
      } else if (lower.includes('fever') || lower.includes('temp')) {
        botMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant' as const,
          text: 'Rectal temperature above 39.5°C suggests active bacterial or viral infection (such as Hemorrhagic septicemia or Theileriosis). Provide shade and cool water immediately, and arrange a vet visit.',
        };
      } else {
        botMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant' as const,
          text: `Symptoms recorded. Monitor rumen movement, hydration, and milk yield for 24 hours. If appetite does not return tomorrow, schedule a vet check-up.`,
        };
      }

      setMessages((prev) => [...prev, botMsg]);
    }, 700);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 pb-28">
      {/* Header */}
      <div className="pt-1">
        <h1 className="text-3xl font-bold text-[#122B1E] tracking-tight">
          Ask AniGuard
        </h1>
        <p className="text-sm text-[#5E6C61] mt-0.5">
          Vet guidance in English, Hindi or Hinglish
        </p>
      </div>

      {/* Chat Thread */}
      <div className="space-y-3.5 pt-1">
        {messages.map((m) => {
          if (m.sender === 'user') {
            return (
              <div key={m.id} className="flex justify-end">
                <div className="bg-[#122B1E] text-white rounded-2xl py-3 px-4 max-w-[85%] sm:max-w-[70%] text-sm font-medium shadow-sm">
                  {m.text}
                </div>
              </div>
            );
          }

          if (m.isInitialCard) {
            return (
              <div
                key={m.id}
                className="bg-white rounded-[22px] p-5 border border-[#E5EAE1] shadow-sm space-y-3 text-sm"
              >
                <h3 className="font-bold text-base text-[#122B1E] leading-snug">
                  Eating less and giving less milk can mean early stress or infection.
                </h3>

                {/* It could be */}
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-[#9C6219]">It could be</h4>
                  <ul className="space-y-1 text-xs text-[#2D3B32]">
                    <li className="flex items-center gap-1.5">• <span>Mastitis</span></li>
                    <li className="flex items-center gap-1.5">• <span>Acidosis or ketosis after a feed change</span></li>
                    <li className="flex items-center gap-1.5">• <span>Mild fever from heat or ticks</span></li>
                  </ul>
                </div>

                {/* Do this now */}
                <div className="space-y-1 pt-1">
                  <h4 className="font-bold text-xs text-[#2693AB]">Do this now</h4>
                  <ul className="space-y-1 text-xs text-[#2D3B32]">
                    <li className="flex items-center gap-1.5">• <span>Check rectal temperature. Normal is 38.3–39.2°C.</span></li>
                    <li className="flex items-center gap-1.5">• <span>Look for clots or watery milk with a CMT paddle.</span></li>
                    <li className="flex items-center gap-1.5">• <span>Give shade and clean water.</span></li>
                  </ul>
                </div>

                {/* Red Callout Box */}
                <div className="p-4 rounded-xl bg-[#FDE8E8] text-[#991B1B] text-xs leading-relaxed">
                  <strong className="font-bold">Call a vet if</strong> temperature is above 39.5°C, or milk drops more than 20% over 48 hours.
                </div>
              </div>
            );
          }

          return (
            <div key={m.id} className="flex justify-start">
              <div className="bg-white text-[#122B1E] rounded-2xl py-3.5 px-4 max-w-[85%] sm:max-w-[70%] border border-[#E5EAE1] text-sm leading-relaxed shadow-sm">
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggested Quick Chips */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
        {quickChips.map((chip) => (
          <button
            key={chip}
            onClick={() => handleSend(chip)}
            className="px-4 py-2 rounded-full bg-white border border-[#DFE4DA] hover:border-[#122B1E] text-xs font-medium text-[#122B1E] shadow-sm transition shrink-0 active:scale-95"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Field & Send Button */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(inputVal)}
          placeholder="Describe the problem"
          className="flex-1 bg-white border border-[#DFE4DA] rounded-2xl px-4 py-3.5 text-sm text-[#122B1E] placeholder-[#8A968E] shadow-sm focus:outline-none focus:ring-1 focus:ring-[#122B1E]"
        />

        <button
          onClick={() => handleSend(inputVal)}
          className="px-6 py-3.5 rounded-2xl bg-[#EFA037] hover:bg-[#e2932b] text-[#122B1E] font-bold text-sm shadow-sm transition active:scale-95 shrink-0"
        >
          Send
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-[#8A968E] pt-1">
        Guidance only. It is not a diagnosis.
      </p>
    </div>
  );
};
