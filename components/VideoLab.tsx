
import React, { useState, useRef } from 'react';
import { generateInstructionalVideo, analyzeVideo, animateImageToVideo } from '../services/geminiService';
import { UserProfile, AppLanguage } from '../types';
import { UI_STRINGS } from '../constants';

interface Props {
  profile: UserProfile;
}

const VideoLab: React.FC<Props> = ({ profile }) => {
  const [activeMode, setActiveMode] = useState<'generate' | 'analyze' | 'animate'>('generate');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const strings = UI_STRINGS[profile.language];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedFile(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAction = async () => {
    const aiStudio = (window as any).aistudio;
    if (activeMode !== 'analyze' && aiStudio && !(await aiStudio.hasSelectedApiKey())) {
      await aiStudio.openSelectKey();
    }

    setLoading(true);
    setVideoUrl(null);
    setAnalysisResult(null);
    setLoadingMessage(profile.language === AppLanguage.HINDI ? "एआई प्रक्रिया जारी है..." : "AI Processing Engine Active...");

    try {
      if (activeMode === 'generate') {
        const url = await generateInstructionalVideo(prompt);
        setVideoUrl(url);
      } else if (activeMode === 'analyze' && selectedFile) {
        const mimeType = selectedFile.split(';')[0].split(':')[1];
        const base64 = selectedFile.split(',')[1];
        const res = await analyzeVideo(base64, mimeType, prompt || "Summarize the key takeaways for a farmer.", profile.language);
        setAnalysisResult(res);
      } else if (activeMode === 'animate' && selectedFile) {
        const mimeType = selectedFile.split(';')[0].split(':')[1];
        const base64 = selectedFile.split(',')[1];
        const url = await animateImageToVideo(base64, mimeType, prompt, aspectRatio);
        setVideoUrl(url);
      }
    } catch (e: any) {
      alert(e.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-3xl max-w-lg mx-auto transition-colors">
        <button onClick={() => setActiveMode('generate')} className={`flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMode === 'generate' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Tutor Gen</button>
        <button onClick={() => setActiveMode('analyze')} className={`flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMode === 'analyze' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Visual Logic</button>
        <button onClick={() => setActiveMode('animate')} className={`flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMode === 'animate' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Veo Animate</button>
      </div>

      <div className="bg-slate-950 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border border-slate-900">
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-emerald-400 text-2xl shadow-inner border border-white/5">
                <i className={`fa-solid ${activeMode === 'analyze' ? 'fa-brain' : 'fa-video'}`}></i>
             </div>
             <div>
                <h2 className="text-2xl font-black uppercase tracking-tight leading-none">
                  {activeMode === 'generate' ? 'Tutor Generation' : activeMode === 'analyze' ? 'Video Intelligence' : 'Visual Animation'}
                </h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Powered by Gemini 3 Pro & Veo</p>
             </div>
          </div>

          <div className="space-y-6">
            {(activeMode === 'analyze' || activeMode === 'animate') && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-3xl p-10 text-center hover:bg-white/5 transition-colors cursor-pointer"
              >
                {selectedFile ? (
                   <div className="space-y-4">
                      {selectedFile.includes('video') ? (
                         <div className="text-emerald-400 text-4xl mb-2"><i className="fa-solid fa-file-video"></i></div>
                      ) : (
                         <img src={selectedFile} className="w-32 h-32 object-cover rounded-xl mx-auto border border-white/20" />
                      )}
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">File Selected - Click to change</p>
                   </div>
                ) : (
                  <>
                    <i className="fa-solid fa-cloud-arrow-up text-4xl text-white/20 mb-4"></i>
                    <p className="text-sm font-bold uppercase tracking-tight">Upload {activeMode === 'analyze' ? 'Video' : 'Photo'} for AI Processing</p>
                    <p className="text-[10px] text-slate-500 uppercase mt-2">Max Size: 50MB</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept={activeMode === 'analyze' ? "video/*" : "image/*"} />
              </div>
            )}

            <div className="space-y-4">
              <textarea 
                className="w-full p-8 bg-white/5 border border-white/10 rounded-3xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm h-32 resize-none transition-all placeholder:text-slate-600"
                placeholder={activeMode === 'generate' ? "Describe the tutorial procedure (e.g. Grafting a Mango tree)..." : "Ask AI specific questions about this visual content..."}
                value={prompt} onChange={e => setPrompt(e.target.value)}
              />
              
              {activeMode === 'animate' && (
                <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Aspect:</span>
                      <button onClick={() => setAspectRatio('16:9')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${aspectRatio === '16:9' ? 'bg-emerald-600' : 'bg-slate-800'}`}>16:9</button>
                      <button onClick={() => setAspectRatio('9:16')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${aspectRatio === '9:16' ? 'bg-emerald-600' : 'bg-slate-800'}`}>9:16</button>
                   </div>
                </div>
              )}

              <button 
                onClick={handleAction}
                disabled={loading || (activeMode === 'analyze' && !selectedFile) || (activeMode === 'animate' && !selectedFile)}
                className="w-full bg-emerald-600 text-white p-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs hover:bg-emerald-700 transition-all flex items-center justify-center gap-4 disabled:opacity-30 shadow-2xl shadow-emerald-900/40"
              >
                {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-bolt-lightning"></i>}
                {loading ? 'Processing...' : 'Run Intelligence'}
              </button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent"></div>
      </div>

      {loading && (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] border border-slate-200 dark:border-slate-800 text-center animate-pulse professional-shadow">
           <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600">
             <i className="fa-solid fa-atom text-3xl animate-spin"></i>
           </div>
           <p className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em]">{loadingMessage}</p>
           <div className="mt-8 flex justify-center gap-2">
             {[...Array(5)].map((_, i) => (
               <div key={i} className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
             ))}
           </div>
        </div>
      )}

      {analysisResult && (
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 professional-shadow animate-in zoom-in duration-500">
          <div className="flex items-center gap-3 mb-6">
            <i className="fa-solid fa-scroll text-emerald-600"></i>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">AI Video Summary</h3>
          </div>
          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed font-medium text-slate-600 dark:text-slate-400">
            {analysisResult}
          </div>
        </div>
      )}

      {videoUrl && (
        <div className="bg-black rounded-[3.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-800 animate-in slide-in-from-bottom-8 duration-700">
          <video src={videoUrl} controls className="w-full aspect-video" poster="https://placehold.co/1280x720/020617/white?text=AI+Generated+Asset"></video>
          <div className="p-10 bg-slate-950 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Generation Success</p>
                <p className="text-lg font-black text-white">Institutional Tutorial Ready</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Powered by Veo 3.1 Fast</p>
             </div>
             <a 
               href={videoUrl} download="pashuseva_generation.mp4"
               className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white transition-all shadow-xl shadow-emerald-900/20 active:scale-95"
             >
               Download MP4 <i className="fa-solid fa-download ml-2"></i>
             </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoLab;
