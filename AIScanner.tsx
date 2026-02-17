
import React, { useRef, useState, useCallback } from 'react';
import { extractInvoiceFromImage } from '../services/geminiService';
import { InvoiceData } from '../types';

interface Props {
  onData: (data: Partial<InvoiceData>) => void;
  onClose: () => void;
}

const AIScanner: React.FC<Props> = ({ onData, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<'idle' | 'capturing' | 'processing'>('idle');

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 1280, height: 720 } 
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setIsScanning(true);
      setStatus('capturing');
    } catch (err) {
      alert("کیمرہ شروع کرنے میں خرابی پیش آئی۔ (Camera access error)");
      onClose();
    }
  }, [onClose]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  }, [stream]);

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setStatus('processing');
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      
      try {
        const extractedData = await extractInvoiceFromImage(base64Image);
        onData(extractedData);
        stopCamera();
        onClose();
      } catch (err) {
        alert("ڈیٹا نکالنے میں خرابی۔ (AI processing error)");
        setStatus('capturing');
      }
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/10 dark:border-slate-800">
        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950/50">
          <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-400 urdu-text">AI اسکینر (Smart Scanner)</h3>
          <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="relative aspect-video bg-black">
          {status === 'processing' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-emerald-900/40 backdrop-blur-md text-white">
              <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-xl font-black animate-pulse urdu-text">AI ڈیٹا نکال رہا ہے...</p>
              <p className="text-xs font-bold opacity-60 urdu-text">کچھ سیکنڈ انتظار فرمائیں</p>
            </div>
          )}
          
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute inset-0 border-[2px] border-emerald-400/30 m-8 rounded-2xl pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl"></div>
          </div>
        </div>

        <div className="p-8 flex flex-col items-center gap-4 bg-emerald-50/30 dark:bg-emerald-900/10">
          <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400 text-center urdu-text">
            بل یا وزن کی لسٹ کی صاف تصویر لیں
          </p>
          <button 
            disabled={status === 'processing'}
            onClick={captureAndScan}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-xl shadow-emerald-200 dark:shadow-none active:scale-90 transition-all border-8 border-white dark:border-slate-800"
          >
            <div className="w-8 h-8 bg-white dark:bg-slate-300 rounded-full"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIScanner;

