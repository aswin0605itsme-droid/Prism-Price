import React, { useState, useRef } from 'react';
// Added Zap to the lucide-react imports
import { Upload, X, Loader2, ScanLine, Camera, Smartphone, RefreshCw, Zap } from 'lucide-react';
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
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysis(null);
        setIsCameraActive(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    setSelectedImage(null);
    setAnalysis(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setIsCameraActive(false);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setSelectedImage(dataUrl);
        
        // Stop camera
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        setIsCameraActive(false);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setLoading(true);
    try {
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

  const resetModal = () => {
    setSelectedImage(null);
    setAnalysis(null);
    setIsCameraActive(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto !p-0 border-white/20">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ScanLine className="w-6 h-6 text-indigo-400" />
            Visual Scanner
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!selectedImage && !isCameraActive ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* File Upload Option */}
              <div className="relative h-64 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:bg-white/5 hover:border-indigo-500/50 transition-all group cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-8 h-8 text-indigo-400" />
                </div>
                <p className="text-slate-200 font-bold">From Gallery</p>
                <p className="text-slate-500 text-sm mt-1 px-4 text-center">Upload saved price tags or product photos</p>
              </div>

              {/* Camera Option */}
              <button 
                onClick={startCamera}
                className="h-64 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:bg-white/5 hover:border-purple-500/50 transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-slate-200 font-bold">Use Camera</p>
                <p className="text-slate-500 text-sm mt-1 px-4 text-center">Scan items directly in real-time</p>
              </button>
            </div>
          ) : isCameraActive ? (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-indigo-500/30 pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-indigo-400/50 rounded-3xl"></div>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={capturePhoto}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-500 transition-colors"
                >
                  <Camera className="w-5 h-5" /> Capture Price Tag
                </button>
                <button 
                  onClick={resetModal}
                  className="px-6 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden bg-black/40 aspect-video flex items-center justify-center border border-white/10 group">
                <img src={selectedImage!} alt="Scan Preview" className="max-h-full max-w-full object-contain" />
                <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <ScanLine className="w-12 h-12 text-white animate-pulse" />
                </div>
                <button 
                  onClick={resetModal}
                  className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-red-500 rounded-full text-white transition-all shadow-xl"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {!analysis && (
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg shadow-2xl shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" /> Deep Scanning...
                    </>
                  ) : (
                    <>
                      <ScanLine className="w-6 h-6" /> Run Price Analysis
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {analysis && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> AI Insights
                </h3>
                <div className="text-slate-100 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                    {analysis}
                </div>
                <button 
                  onClick={resetModal}
                  className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 text-slate-400 text-sm font-medium rounded-xl transition-all"
                >
                  Scan Another Item
                </button>
            </div>
          )}
        </div>
      </GlassCard>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageAnalysisModal;