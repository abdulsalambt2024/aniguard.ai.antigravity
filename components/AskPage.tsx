
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
}

interface Message {
  id: number;
  from: 'bot' | 'user';
  text: string;
  structured?: {
    summary: string;
    couldBe: string[];
    doNow: string[];
    callVetIf: string;
  };
}

const suggestions = ['Udder swelling', 'Goat with fever', 'Not eating'];

const initialMessages: Message[] = [
  { id: 1, from: 'bot', text: 'Namaste Ramesh. What is happening with your herd?' },
  { id: 2, from: 'user', text: 'My cow is eating less and giving less milk.' },
  {
    id: 3,
    from: 'bot',
    text: '',
    structured: {
      summary: 'Eating less and giving less milk can mean early stress or infection.',
      couldBe: ['Mastitis', 'Acidosis or ketosis after a feed change', 'Mild fever from heat or ticks'],
      doNow: [
        'Check rectal temperature. Normal is 38.3–39.2°C.',
        'Look for clots or watery milk with a CMT paddle.',
        'Give shade and clean water.',
      ],
      callVetIf: 'temperature is above 39.5°C, or milk drops more than 20% over 48 hours.',
    },
  },
];

const AskPage: React.FC<Props> = ({ profile }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), from: 'user', text };
    const botMsg: Message = {
      id: Date.now() + 1,
      from: 'bot',
      text: '',
      structured: {
        summary: 'Thank you for sharing that. Here is some guidance based on your description.',
        couldBe: ['Possible stress or environmental issue', 'Nutritional deficiency', 'Early stage infection'],
        doNow: ['Monitor the animal closely for 24 hours.', 'Ensure fresh water and feed are available.', 'Check temperature and appetite.'],
        callVetIf: 'symptoms worsen or do not improve within 48 hours.',
      },
    };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput('');
  };

  return (
    <div className="flex flex-col pb-8 animate-in fade-in duration-400" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* Title */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Ask AniGuard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Vet guidance in English, Hindi or Hinglish</p>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 mb-4">
        {messages.map(msg => {
          if (msg.from === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div
                  className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm font-medium text-white"
                  style={{ backgroundColor: '#1a3c2b' }}
                >
                  {msg.text}
                </div>
              </div>
            );
          }

          if (msg.structured) {
            return (
              <div key={msg.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm font-bold text-gray-900 mb-3">{msg.structured.summary}</p>

                <p className="text-xs font-bold mb-1" style={{ color: '#e65100' }}>It could be</p>
                <ul className="mb-3 space-y-1">
                  {msg.structured.couldBe.map((item, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <p className="text-xs font-bold mb-1" style={{ color: '#1a5c30' }}>Do this now</p>
                <ul className="mb-3 space-y-1">
                  {msg.structured.doNow.map((item, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="rounded-xl p-3" style={{ backgroundColor: '#fdecea' }}>
                  <p className="text-sm" style={{ color: '#c62828' }}>
                    <span className="font-bold">Call a vet if</span> {msg.structured.callVetIf}
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex justify-start">
              <div className="max-w-[80%] bg-white px-4 py-3 rounded-2xl rounded-tl-sm text-sm text-gray-800 shadow-sm border border-gray-100">
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggestion Pills */}
      <div className="flex gap-2 flex-wrap mb-3">
        {suggestions.map(s => (
          <button
            key={s}
            onClick={() => sendMessage(s)}
            className="px-3 py-1.5 rounded-full text-sm text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 transition"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Describe the problem"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none"
        />
        <button
          onClick={() => sendMessage(input)}
          className="px-5 py-3 rounded-xl text-sm font-bold"
          style={{ backgroundColor: '#F5A623', color: '#1a3c2b' }}
        >
          Send
        </button>
      </div>
      <p className="text-center text-xs text-gray-400 mt-2">Guidance only. It is not a diagnosis.</p>
    </div>
  );
};

export default AskPage;
