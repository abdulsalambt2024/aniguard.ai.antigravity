
import React, { useState, useRef } from 'react';
import { analyzeCropDisease } from '../services/geminiService';
import { DiseaseAnalysisResult, UserProfile } from '../types';
import { UI_STRINGS } from '../constants';

interface DiseaseDetectorProps {
  profile: UserProfile;
}

const DiseaseDetector: React.FC<DiseaseDetectorProps> = ({ profile }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiseaseAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const strings = UI_STRINGS[profile.language];

  // Handle image selection and preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Gemini API for disease analysis
  const runAnalysis = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    
    try {
      const base64Data = selectedImage.split(',')[1];
      const data = await analyzeCropDisease(base64Data, profile.region, profile.language);
      
      if (!data || !data.diseaseName) {
        throw new Error("Invalid analysis data");
      }
      
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError("AI Analysis failed. Please upload a clearer photo of the affected plant area.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 professional-shadow overflow-hidden transition-colors duration-300">
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg">
              <i className="fa-solid fa-microscope"></i>
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest">{strings.detect}</h2>
          </div>
          {selectedImage && !isAnalyzing && (
            <button 
              onClick={() => setSelectedImage(null)}
              className="text-xs font-bold text-slate-400 hover:text-red-600 transition"
            >
              Reset Image
            </button>
          )}
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-400 text-xs font-semibold">
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{error}</span>
            </div>
          )}

          {!selectedImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-cloud-arrow-up text-xl text-slate-400"></i>
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Upload plant specimen photo</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">Supported: JPG, PNG • Max 5MB</p>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="relative w-full md:w-48 h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                <img src={selectedImage} className={`w-full h-full object-cover ${isAnalyzing ? 'animate-pulse' : ''}`} alt="Specimen" />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-4 text-center md:text-left">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Ready for Diagnostic Analysis</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Our AI will evaluate leaf patterns, color shifts, and textural anomalies to provide an organic treatment plan.</p>
                <button 
                  onClick={runAnalysis}
                  disabled={isAnalyzing}
                  className="bg-emerald-700 text-white px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-emerald-800 transition shadow-lg shadow-emerald-900/10 disabled:opacity-50"
                >
                  {isAnalyzing ? strings.analyzing : "Initiate Diagnostics"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 pb-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 professional-shadow overflow-hidden transition-colors">
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-emerald-50/20 dark:bg-emerald-900/10">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-1 bg-emerald-700 text-white text-[9px] font-bold uppercase tracking-widest rounded">Diagnosis</span>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{result.confidence || 'Medium'} Match</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">{result.diseaseName}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{result.description}</p>
              </div>
              
              <div className="p-6 space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cost Benefit Analysis (per Acre)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Traditional Chem.</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{result?.costComparison?.chemicalEstimate || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                    <p className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase mb-1">Organic Protocol</p>
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{result?.costComparison?.organicEstimate || 'N/A'}</p>
                  </div>
                </div>
                <div className="p-3 bg-emerald-700 text-white rounded-lg flex items-center justify-between shadow-inner">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Potential Savings</span>
                  <span className="text-lg font-extrabold">{result?.costComparison?.savings || 'N/A'}</span>
                </div>
              </div>
            </div>

            {result.organicTreatment && (
              <div className="bg-emerald-900 dark:bg-emerald-950 rounded-2xl text-white professional-shadow p-6 flex flex-col justify-between relative overflow-hidden transition-colors">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-emerald-400 mb-6">
                    <i className="fa-solid fa-flask-vial"></i>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Organic Protocol</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4">{result.organicTreatment.title}</h3>
                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Ingredients / Materials</p>
                      <ul className="text-xs space-y-1 opacity-90">
                        {result.organicTreatment.materials.map((m, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <i className="fa-solid fa-leaf text-[8px] text-emerald-400"></i>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Preparation & Application</p>
                      <ol className="text-xs space-y-3 opacity-90 list-decimal ml-4">
                        {result.organicTreatment.steps.map((s, idx) => (
                          <li key={idx} className="pl-1">{s}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pt-4 border-t border-white/10 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-emerald-400 uppercase">Est. Prep Time</span>
                    <span className="text-xs font-bold">{result.organicTreatment.preparationTime}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] font-bold text-emerald-400 uppercase">Method</span>
                    <span className="text-xs font-bold">{result.organicTreatment.applicationMethod}</span>
                  </div>
                </div>

                {/* Decorative background leaf */}
                <i className="fa-solid fa-leaf absolute -right-4 -bottom-4 text-white/5 text-[120px] pointer-events-none rotate-12"></i>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseDetector;
