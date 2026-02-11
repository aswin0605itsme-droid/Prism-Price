import React, { useState } from 'react';
import { Upload, X, Loader2, ScanLine } from 'lucide-react';
import GlassCard from './GlassCard';
import { analyzeProductImage } from '../services/geminiService';

interface ImageAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImageAnalysisModal: React.FC<ImageAnalysisModalProps> = ({ isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setLoading(true);
    
    try {
      // Remove data url prefix for API
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1];
      
      const result = await analyzeProductImage(base64Data, mimeType);
      setAnalysis(result);
    } catch (error) {
      setAnalysis("Failed to analyze image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto !p-0">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ScanLine className="w-6 h-6 text-purple-400" />
            Image Analysis
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!selectedImage ? (
            <div className="w-full h-64 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center hover:bg-white/5 transition-colors group cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-400" />
              </div>
              <p className="text-slate-300 font-medium">Click or drag image to upload</p>
              <p className="text-slate-500 text-sm mt-1">Receipts, price tags, or products</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden bg-black/20 aspect-video flex items-center justify-center">
                <img src={selectedImage} alt="Upload" className="max-h-full max-w-full object-contain" />
                <button 
                  onClick={() => { setSelectedImage(null); setAnalysis(null); }}
                  className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!analysis && (
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-lg shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <ScanLine className="w-5 h-5" /> Analyze Price
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {analysis && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                <h3 className="text-lg font-semibold text-white mb-2">Analysis Result</h3>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {analysis}
                </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default ImageAnalysisModal;