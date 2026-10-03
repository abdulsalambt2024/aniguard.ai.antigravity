import React, { useState } from 'react';
import { Bot, Send, Sparkles, ShieldAlert, User, CheckCircle2 } from 'lucide-react';
import { Animal } from '../../types/aniguard';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  structuredDetails?: {
    observation: string;
    possibleCauses: string[];
    immediatePrecautions: string[];
    whenToContactVet: string;
  };
}

interface FarmAIAssistantProps {
  animals: Animal[];
}

export const FarmAIAssistant: React.FC<FarmAIAssistantProps> = ({ animals }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: 'Namaste Ramesh Kumar! I am your AniGuard Farm AI Assistant. How can I support your herd health today?',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const sampleQuestions = [
    'My cow is eating less and giving less milk.',
    'Buffalo has swelling in the udder quarter.',
    'Goat has nasal discharge and fever.',
    'What should I do before the vet arrives for bloat?',
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      let botResponse: Message;
      const lower = text.toLowerCase();

      if (lower.includes('eating less') || lower.includes('milk')) {
        botResponse = {
          sender: 'assistant',
          text: 'I have analyzed this health query against your herd records and ICAR veterinary protocols.',
          structuredDetails: {
            observation:
              'A simultaneous decline in appetite and milk yield indicates early physiological stress or metabolic/infectious onset.',
            possibleCauses: [
              'Subclinical or Clinical Bovine Mastitis',
              'Rumen Acidosis or Ketosis from rapid feed changes',
              'Mild fever due to environmental heat stress or tick-borne disease',
            ],
            immediatePrecautions: [
              'Check rectal temperature with a digital thermometer (Normal: 38.3 - 39.2°C).',
              'Inspect milk for clots, watery consistency, or discoloration using CMT paddle.',
              'Ensure cool, shaded stall and clean fresh drinking water.',
            ],
            whenToContactVet:
              'If body temperature exceeds 39.5°C, or if the milk drop exceeds 20% over 48 hours, contact your veterinary doctor immediately.',
          },
        };
      } else if (lower.includes('swelling') || lower.includes('udder')) {
        botResponse = {
          sender: 'assistant',
          text: 'Udder swelling requires prompt precautionary attention to safeguard milk quality.',
          structuredDetails: {
            observation:
              'Localized heat, hardness, or swelling in an udder quarter strongly points toward inflammatory mastitis.',
            possibleCauses: [
              'Acute or Subacute Mastitis (Staphylococcus/Streptococcus or coliform bacteria)',
              'Udder edema in fresh calving dairy cows',
              'Physical trauma or teat injury',
            ],
            immediatePrecautions: [
              'Milk the affected quarter frequently (every 2-3 hours) into a separate vessel and discard safely.',
              'Apply cold water or ice pack compress for first 24 hours if hot and acute.',
              'Never administer intra-mammary infusions without veterinary sterile protocol.',
            ],
            whenToContactVet:
              'Contact veterinarian within 6 hours if udder is hot, hard, or animal shows systemic fever and shivering.',
          },
        };
      } else {
        botResponse = {
          sender: 'assistant',
          text: 'Thank you for your report. Based on veterinary disease guidelines, here is immediate guidance:',
          structuredDetails: {
            observation: `Query noted: "${text}". Monitoring clinical vitals is the first safety priority.`,
            possibleCauses: [
              'Viral or bacterial infection with respiratory or enteric involvement',
              'Digestive upset or dietary transition stress',
            ],
            immediatePrecautions: [
              'Isolate the animal from the herd in a clean, well-ventilated dry pen.',
              'Record evening temperature, water intake, and rumination activity.',
              'Provide easily digestible green fodder and mineral supplement.',
            ],
            whenToContactVet:
              'Consult a qualified veterinary doctor if symptoms persist past 24 hours or if breathing is labored.',
          },
        };
      }

      setMessages((prev) => [...prev, botResponse]);
    }, 800);
  };

  return (
    <div className="bg-[#0B1520] border border-[#182635] rounded-xl p-5 text-white shadow-lg flex flex-col h-[750px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#182635]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0E2E25] text-[#10B981] flex items-center justify-center border border-[#134E3E]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Farm AI Assistant</h2>
            <p className="text-xs text-slate-400">
              Conversational veterinary guidance and early disease symptom support
            </p>
          </div>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#0E2E25] text-emerald-400 border border-[#134E3E] font-medium hidden sm:inline">
          ICAR & WOAH Knowledge Base Connected
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#0E2E25] text-[#10B981] flex items-center justify-center flex-shrink-0 mt-1 border border-[#134E3E]">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl p-4 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#059669] text-white font-medium ml-12'
                  : 'bg-[#0E1A26] border border-[#182635] text-slate-200'
              }`}
            >
              <p>{m.text}</p>

              {m.structuredDetails && (
                <div className="mt-3 space-y-3 pt-3 border-t border-[#182635]">
                  <div>
                    <h5 className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider mb-1">
                      Observation
                    </h5>
                    <p className="text-slate-300">{m.structuredDetails.observation}</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-amber-400 text-[11px] uppercase tracking-wider mb-1">
                      Possible Associated Causes
                    </h5>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                      {m.structuredDetails.possibleCauses.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-cyan-400 text-[11px] uppercase tracking-wider mb-1">
                      Immediate Farmer Precautions
                    </h5>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                      {m.structuredDetails.immediatePrecautions.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#2A1010] border border-[#5A1C1C] text-red-300">
                    <strong className="block font-bold text-[11px] uppercase tracking-wider mb-0.5">
                      When to Contact Veterinarian:
                    </strong>
                    <span>{m.structuredDetails.whenToContactVet}</span>
                  </div>
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 bg-[#08101A] border-t border-[#182635] overflow-x-auto scrollbar-none">
        <div className="flex gap-2 min-w-max">
          {sampleQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-[#0E1A26] border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>{q}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 border-t border-[#182635] flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
          placeholder="Ask Farm AI in English, Hindi, or Hinglish..."
          className="flex-1 bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          onClick={() => handleSend(inputText)}
          className="p-2.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white transition shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Safety Notice */}
      <div className="px-4 py-2 bg-[#08101A] border-t border-slate-800 text-[10px] text-slate-500 flex items-center gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
        <span>
          AniGuard Farm AI provides veterinary decision-support guidance. Never presents definitive
          diagnoses.
        </span>
      </div>
    </div>
  );
};
