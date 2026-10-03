
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { UserProfile } from '../types';
import { UI_STRINGS, SYSTEM_INSTRUCTION, OFFLINE_EMERGENCY_COMMANDS, VOICE_EXAMPLES, VOICE_CATEGORIES } from '../constants';

interface VoiceAssistantProps {
  profile: UserProfile;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ profile }) => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [activeCategory, setActiveCategory] = useState('health');
  const [transcriptionHistory, setTranscriptionHistory] = useState<string[]>([]);
  
  const strings = UI_STRINGS[profile.language] || UI_STRINGS.en;
  const examples = VOICE_EXAMPLES[profile.language] || VOICE_EXAMPLES.en;
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    const handleStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const startSession = async () => {
    if (isOffline) {
      setTranscriptionHistory(prev => [...prev, "System: Entering Offline Emergency Mode. Type 'rabies' or 'fmd' for immediate protocols."]);
      setIsActive(true);
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          setIsActive(true);
          const source = audioContextRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (e) => {
            if (isMuted) return;
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
          };
          
          source.connect(scriptProcessor);
          scriptProcessor.connect(audioContextRef.current!.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.outputTranscription) {
            setTranscriptionHistory(prev => [...prev, "AI: " + message.serverContent!.outputTranscription!.text]);
          }
          if (message.serverContent?.inputTranscription) {
            const text = message.serverContent!.inputTranscription!.text;
            setTranscriptionHistory(prev => [...prev, "You: " + text]);
            
            // Check for offline keywords even when online for speed
            const lower = text.toLowerCase();
            Object.keys(OFFLINE_EMERGENCY_COMMANDS).forEach(key => {
              if (lower.includes(key)) {
                setTranscriptionHistory(prev => [...prev, "Local Alert: " + OFFLINE_EMERGENCY_COMMANDS[key]]);
              }
            });
          }

          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio && outputAudioContextRef.current) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
            const source = outputAudioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContextRef.current.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
          }
        },
        onerror: (e) => console.error("Live Error", e),
        onclose: () => setIsActive(false),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        inputAudioTranscription: {},
        systemInstruction: SYSTEM_INSTRUCTION + ` Respond concisely in ${profile.language}.`,
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
      }
    });

    sessionRef.current = await sessionPromise;
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    setIsActive(false);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, channels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / channels;
    const buffer = ctx.createBuffer(channels, frameCount, sampleRate);
    for (let c = 0; c < channels; c++) {
      const channelData = buffer.getChannelData(c);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * channels + c] / 32768.0;
    }
    return buffer;
  };

  const createBlob = (data: Float32Array): Blob => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
    return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 px-4">
      {/* Dynamic Header with Status */}
      <div className={`rounded-[2.5rem] p-10 text-white text-center relative overflow-hidden shadow-2xl transition-all duration-700 ${isOffline ? 'bg-slate-800' : 'bg-emerald-900'}`}>
        <div className="absolute top-6 left-10 flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-emerald-400 animate-pulse'}`}></div>
           <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
             {isOffline ? strings.voiceOffline : strings.voiceOnline}
           </span>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-black uppercase tracking-tight">{strings.voiceTitle}</h2>
          <p className="text-white/60 text-sm max-w-lg mx-auto leading-relaxed">{strings.voiceExplainer}</p>
          
          <div className="flex justify-center items-center py-8">
            <button 
              onClick={isActive ? stopSession : startSession}
              className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl relative group ${
                isActive ? 'bg-red-500 scale-105' : 'bg-white text-emerald-900 hover:scale-105 active:scale-95'
              }`}
            >
              <i className={`fa-solid ${isActive ? 'fa-stop' : 'fa-microphone'} text-4xl mb-2`}></i>
              <span className="text-[10px] font-black uppercase tracking-widest">{isActive ? 'Stop' : 'Start'}</span>
              
              {isActive && (
                <div className="absolute inset-[-10px] rounded-full border border-red-400/30 animate-ping"></div>
              )}
            </button>
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            {isActive ? "Listening... Speak clearly into the mic" : strings.voicePrompt}
          </p>

          {isActive && !isOffline && (
            <div className="flex justify-center gap-1 h-8 items-center">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 100}ms` }}></div>
              ))}
            </div>
          )}
        </div>
        <i className="fa-solid fa-waveform absolute -right-10 -bottom-10 text-white/5 text-[240px] pointer-events-none rotate-12"></i>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {VOICE_CATEGORIES.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat.id ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'}`}
          >
            <i className={`fa-solid ${cat.icon}`}></i>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Categorized Examples Carousel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {examples.filter(ex => ex.category.toLowerCase() === activeCategory).map((ex, i) => (
          <button 
            key={i}
            onClick={() => setTranscriptionHistory(prev => [...prev, "You: " + ex.text])}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-left hover:border-emerald-500 transition-all shadow-sm group"
          >
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 italic mb-2 group-hover:text-emerald-600 transition">"{ex.text}"</p>
            <span className="text-[8px] font-black uppercase text-slate-400">One-tap query</span>
          </button>
        ))}
      </div>

      {/* Transcription Area */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[300px]">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Conversation Insight</h3>
        <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
          {transcriptionHistory.map((t, i) => (
            <div key={i} className={`p-4 rounded-2xl text-xs font-medium leading-relaxed animate-in slide-in-from-bottom-2 duration-300 ${t.startsWith('You:') ? 'bg-slate-50 dark:bg-slate-800 ml-12 text-right' : 'bg-emerald-50 dark:bg-emerald-900/20 mr-12 text-left'}`}>
              <div className="flex items-center gap-2 mb-1 opacity-50">
                <i className={`fa-solid ${t.startsWith('You:') ? 'fa-user' : 'fa-robot'} text-[8px]`}></i>
                <span className="text-[8px] font-black uppercase tracking-widest">{t.split(':')[0]}</span>
              </div>
              {t.split(':').slice(1).join(':')}
            </div>
          ))}
          {transcriptionHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
               <i className="fa-solid fa-microphone-slash text-4xl mb-4"></i>
               <p className="text-xs font-black uppercase tracking-widest">Start recording to see transcript</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
