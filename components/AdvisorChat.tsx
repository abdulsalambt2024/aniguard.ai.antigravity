
import React, { useState, useRef, useEffect } from 'react';
import { getChatResponse, generateSpeech } from '../services/geminiService';
import { ChatMessage, UserProfile } from '../types';
import { SUGGESTED_QUESTIONS, UI_STRINGS } from '../constants';

interface AdvisorChatProps {
  profile: UserProfile;
}

const AdvisorChat: React.FC<AdvisorChatProps> = ({ profile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const strings = UI_STRINGS[profile.language];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    if (currentSourceRef.current) {
      currentSourceRef.current.stop();
      currentSourceRef.current = null;
    }
    setIsSpeaking(null);
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const handleReadAloud = async (text: string, messageId: string) => {
    if (isSpeaking === messageId) {
      stopAudio();
      return;
    }

    stopAudio();
    setIsSpeaking(messageId);

    try {
      const pcmData = await generateSpeech(text, profile.language);
      if (!pcmData) throw new Error("TTS failed");

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const audioBuffer = await decodeAudioData(pcmData, audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        if (isSpeaking === messageId) setIsSpeaking(null);
      };

      currentSourceRef.current = source;
      source.start();
    } catch (err) {
      console.error(err);
      setIsSpeaking(null);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const context = `Farmer in ${profile.region}, ${profile.language}. Complex Mode: ${isThinking}.`;
      const response = await getChatResponse(text, context, profile.language, isThinking);
      const modelMsg: ChatMessage = { role: 'model', text: response, timestamp: Date.now() };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = { 
        role: 'model', 
        text: "Connection interrupted. Please try again.", 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] lg:h-[700px] bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 professional-shadow overflow-hidden transition-all duration-300">
      <div className="px-6 py-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-700 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <i className="fa-solid fa-robot text-xl"></i>
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.15em] leading-none">Agri-Advisor AI</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Always Learning</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={isThinking} 
                onChange={() => setIsThinking(!isThinking)} 
              />
              <div className={`w-10 h-6 rounded-full transition-colors ${isThinking ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isThinking ? 'translate-x-4' : ''}`}></div>
            </div>
            <span className={`ml-3 text-[10px] font-black uppercase tracking-widest ${isThinking ? 'text-emerald-600' : 'text-slate-400'}`}>Deep Think</span>
          </label>
          <button 
            onClick={() => setMessages([])} 
            className="w-10 h-10 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-300 hover:text-red-500 transition-colors"
            title="Clear History"
          >
            <i className="fa-solid fa-trash-can text-sm"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/20 dark:bg-slate-900/20 no-scrollbar" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl flex items-center justify-center text-emerald-700 dark:text-emerald-500 shadow-xl">
              <i className="fa-solid fa-seedling text-3xl"></i>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Agricultural Intelligence</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
                Ask about crop health, livestock nutrition, or market trends. Use <span className="text-emerald-600 font-bold">Deep Think</span> for complex problems.
              </p>
            </div>
            
            <div className="w-full space-y-3 max-w-sm">
              {SUGGESTED_QUESTIONS[profile.language].map((q, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(q)}
                  className="w-full text-left text-[11px] p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all font-bold text-slate-600 dark:text-slate-300"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] relative rounded-[2rem] p-5 text-sm leading-relaxed shadow-sm transition-all ${
              msg.role === 'user' 
                ? 'bg-slate-800 dark:bg-slate-700 text-white' 
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700'
            }`}>
              {msg.text}
              
              {msg.role === 'model' && (
                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, dotIdx) => (
                      <div key={dotIdx} className={`w-1 h-1 rounded-full ${isSpeaking === `msg_${i}` ? 'bg-emerald-500 animate-bounce' : 'bg-slate-200'}`} style={{ animationDelay: `${dotIdx * 0.15}s` }}></div>
                    ))}
                  </div>
                  <button 
                    onClick={() => handleReadAloud(msg.text, `msg_${i}`)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      isSpeaking === `msg_${i}` 
                        ? 'bg-emerald-600 text-white shadow-lg' 
                        : 'bg-slate-50 dark:bg-slate-700 text-slate-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700'
                    }`}
                  >
                    <i className={`fa-solid ${isSpeaking === `msg_${i}` ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
                    {isSpeaking === `msg_${i}` ? 'Stop' : 'Read Aloud'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              {isThinking && <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 animate-pulse">Deep Reasoning Active</span>}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
          className="flex gap-3"
        >
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your agricultural query..."
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 dark:text-slate-100 transition-all placeholder:text-slate-400"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()} 
            className="w-14 h-14 bg-emerald-700 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-800 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-900/20"
          >
            <i className="fa-solid fa-paper-plane text-xl"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdvisorChat;
