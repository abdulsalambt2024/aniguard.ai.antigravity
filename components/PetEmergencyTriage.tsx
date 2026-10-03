
import React, { useState } from 'react';
import { scanAnimalHealth } from '../services/geminiService';
import { HealthAnalysisResult, UserProfile } from '../types';
import { UI_STRINGS } from '../constants';

interface Props {
  profile: UserProfile;
}

const PetEmergencyTriage: React.FC<Props> = ({ profile }) => {
  const [image, setImage] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HealthAnalysisResult | null>(null);
  const strings = UI_STRINGS[profile.language];

  const handleFile = (e: any) => {
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(e.target.files[0]);
  };

  const handleScan = async () => {
    if (!image && !symptoms) return;
    setLoading(true);
    try {
      const data = await scanAnimalHealth(image?.split(',')[1] || '', symptoms, profile.language);
      setResult(data);
    } catch (e) {
      alert("Scan failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 professional-shadow transition-colors">
        <div className="p-8 bg-red-50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/40 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center text-xl">
                <i className="fa-solid fa-kit-medical"></i>
             </div>
             <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Emergency Triage</h2>
                <p className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-widest mt-1">Instant AI Assessment</p>
             </div>
          </div>
          {image && (
            <button onClick={() => setImage(null)} className="text-[10px] font-black text-slate-400 uppercase">Clear Photo</button>
          )}
        </div>

        <div className="p-8">
           <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 {!image ? (
                   <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center h-64 cursor-pointer hover:bg-slate-50 transition-colors">
                      <i className="fa-solid fa-camera text-3xl text-slate-300 mb-4"></i>
                      <p className="text-xs font-black text-slate-400 uppercase">Upload Symptom Photo</p>
                      <input type="file" className="hidden" onChange={handleFile} />
                   </label>
                 ) : (
                   <div className="rounded-[2rem] overflow-hidden h-64 border border-slate-200 dark:border-slate-800">
                      <img src={image} className="w-full h-full object-cover" />
                   </div>
                 )}
              </div>
              <div className="flex flex-col h-full space-y-4">
                 <div className="flex-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Describe Symptoms</label>
                   <textarea 
                     className="w-full h-full min-h-[160px] p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 text-sm mt-2 dark:text-white resize-none"
                     placeholder="e.g. My dog is breathing heavily and won't stand up..."
                     value={symptoms} onChange={e => setSymptoms(e.target.value)}
                   />
                 </div>
                 <button 
                   onClick={handleScan}
                   disabled={loading || (!image && !symptoms)}
                   className="w-full bg-red-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-900/20 hover:bg-red-700 transition flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-microscope"></i>}
                   Run AI Triage
                 </button>
              </div>
           </div>
        </div>
      </div>

      {result && (
        <div className="animate-in slide-in-from-bottom-4 duration-500 grid md:grid-cols-2 gap-6">
           <div className={`p-8 rounded-[2rem] text-white ${
             result.severity === 'EMERGENCY' ? 'bg-red-700' : 
             result.severity === 'URGENT' ? 'bg-amber-600' : 'bg-emerald-700'
           }`}>
              <div className="flex justify-between items-start">
                 <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Triage Level</span>
                 <span className="text-xs font-bold opacity-80">{result.confidence} AI Confidence</span>
              </div>
              <h3 className="text-4xl font-black mt-4">{result.severity}</h3>
              <h4 className="text-xl font-bold mt-2 border-b border-white/20 pb-4 mb-4">{result.conditionName}</h4>
              <p className="text-sm font-medium leading-relaxed opacity-90">{result.description}</p>
           </div>

           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 professional-shadow flex flex-col gap-6">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Immediate First Aid</p>
                 <ul className="space-y-3">
                   {result.treatmentPlan.immediateSteps.map((step, i) => (
                     <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-red-50 text-red-600 rounded flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{step}</span>
                     </li>
                   ))}
                 </ul>
              </div>
              <div className="pt-6 border-t border-slate-50 dark:border-slate-800 mt-auto">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Final Advice</p>
                 <p className="text-xs italic text-slate-600 dark:text-slate-400 font-medium">"{result.treatmentPlan.advice}"</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PetEmergencyTriage;
