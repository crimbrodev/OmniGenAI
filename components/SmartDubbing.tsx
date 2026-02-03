
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { blobToBase64, decode } from '../utils/audio-utils';
import { Language } from '../types';

interface SmartDubbingProps {
  language: Language;
}

const SmartDubbing: React.FC<SmartDubbingProps> = ({ language }) => {
  const [file, setFile] = useState<File | null>(null);
  const [targetLang, setTargetLang] = useState(language === 'ru' ? 'Английский' : 'Spanish');
  const [isProcessing, setIsProcessing] = useState(false);
  const [translation, setTranslation] = useState<string | null>(null);
  
  const handleDub = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const base64 = await blobToBase64(file);
      const text = await geminiService.analyzeMedia(base64, file.type, `Transcribe this video and translate it into ${targetLang}. Language: ${language === 'ru' ? 'Russian' : 'English'}. Keep the emotional tone.`);
      setTranslation(text || "No speech detected.");
      
      const audio = await geminiService.generateSpeech(text || "", 'Fenrir');
      if (audio) {
        const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const dataInt16 = new Int16Array(decode(audio).buffer);
        const floatData = new Float32Array(dataInt16.length);
        for(let i=0; i<dataInt16.length; i++) floatData[i] = dataInt16[i] / 32768;
        const b = outCtx.createBuffer(1, floatData.length, 24000);
        b.copyToChannel(floatData, 0);
        const s = outCtx.createBufferSource();
        s.buffer = b;
        s.connect(outCtx.destination);
        s.start();
      }
    } catch (e) { console.error(e); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <header className="p-8 bg-gray-900 border border-gray-800 rounded-[2.5rem]">
        <h2 className="text-3xl font-black text-white">{language === 'ru' ? 'Умный дубляж' : 'Smart Dubbing'}</h2>
        <p className="text-gray-500">{language === 'ru' ? 'Перевод видео с сохранением тембра и эмоций.' : 'Multimodal translation with tone preservation.'}</p>
      </header>
      
      <div className="bg-gray-950 border border-gray-800 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-2 border-dashed border-gray-800 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-500 transition-all relative overflow-hidden group">
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="video/*" />
            <div className="relative z-0">
               <svg className="w-8 h-8 text-gray-700 mx-auto mb-2 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" strokeWidth="2"/></svg>
               <span className="text-[10px] font-black uppercase text-gray-500">{file ? file.name : (language === 'ru' ? 'Загрузить видео' : 'Upload Source Video')}</span>
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-xs font-black text-gray-600 uppercase tracking-widest">{language === 'ru' ? 'Язык перевода' : 'Target Language'}</label>
            <select 
              value={targetLang} 
              onChange={e => setTargetLang(e.target.value)} 
              className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 text-white outline-none focus:ring-1 focus:ring-blue-500"
            >
              {language === 'ru' ? (
                ['Английский', 'Испанский', 'Французский', 'Немецкий', 'Китайский', 'Японский'].map(l => <option key={l} value={l}>{l}</option>)
              ) : (
                ['English', 'Spanish', 'French', 'German', 'Chinese', 'Russian', 'Japanese'].map(l => <option key={l} value={l}>{l}</option>)
              )}
            </select>
          </div>
        </div>
        
        <button 
          onClick={handleDub} 
          disabled={isProcessing || !file} 
          className="w-full py-5 bg-blue-600 rounded-2xl font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/10 disabled:opacity-50"
        >
          {isProcessing ? (language === 'ru' ? 'Перевод и озвучка...' : 'Translating...') : (language === 'ru' ? 'Начать перевод' : 'Start Translation')}
        </button>
        
        {translation && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 animate-in slide-in-from-top-4">
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">{language === 'ru' ? 'Результат анализа' : 'Analysis Transcript'}</h4>
            <div className="text-sm text-gray-300 leading-relaxed italic whitespace-pre-wrap">
              "{translation}"
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartDubbing;
