
import React, { useState, useRef } from 'react';
import { parseVoiceCommand } from './services/geminiService';
import { InvoiceItem } from './types';

interface Props {
  onResult: (item: Partial<InvoiceItem>) => void;
}

const VoiceEntry: React.FC<Props> = ({ onResult }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          const result = await parseVoiceCommand(base64Audio);
          onResult(result);
          setIsProcessing(false);
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("مائیکروفون تک رسائی حاصل نہیں ہو سکی۔");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button 
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${isRecording ? 'bg-red-500 scale-125 animate-pulse' : isProcessing ? 'bg-emerald-200' : 'bg-emerald-600 hover:bg-emerald-700'}`}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        )}
      </button>
      <span className="text-[8px] font-black text-emerald-600 urdu-text">
        {isRecording ? "بولیں..." : isProcessing ? "پروسیسنگ..." : "بول کر لکھیں"}
      </span>
    </div>
  );
};

export default VoiceEntry;

