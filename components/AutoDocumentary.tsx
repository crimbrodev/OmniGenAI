
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { decode } from '../utils/audio-utils';
import { Language } from '../types';

interface AutoDocumentaryProps {
  language: Language;
}

const AutoDocumentary: React.FC<AutoDocumentaryProps> = ({ language }) => {
  const [sourceText, setSourceText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [segments, setSegments] = useState<any[]>([]);
  const [config, setConfig] = useState({ voiceover: true, video: true });

  const handleGenerate = async () => {
    if (!sourceText) return;
    setIsProcessing(true);
    setSegments([]);
    try {
      const script = await geminiService.textToScript(sourceText);
      const enrichedSegments = await Promise.all(script.map(async (seg: any) => {
        let audioUrl, videoUrl;
        
        if (config.voiceover) {
          const audioBase64 = await geminiService.generateSpeech(seg.voiceover, 'Fenrir');
          if (audioBase64) {
            const blob = new Blob([decode(audioBase64)], { type: 'audio/pcm' });
            audioUrl = audioBase64; // Keeping raw base64 for playPCM logic
          }
        }

        if (config.video) {
          const videoRes = await geminiService.generateVideo(seg.visual_prompt, "16:9");
          videoUrl = videoRes.url;
        }

        return { ...seg, audioUrl, videoUrl };
      }));
      setSegments(enrichedSegments);
    } catch (error) {
      console.error(error);
      alert(language === 'ru' ? "Сбой создания документалки." : "Documentary synthesis failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const playSegmentAudio = (audioBase64: string) => {
    const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const dataInt16 = new Int16Array(decode(audioBase64).buffer);
    const floatData = new Float32Array(dataInt16.length);
    for(let i=0; i<dataInt16.length; i++) floatData[i] = dataInt16[i] / 32768;
    const b = outCtx.createBuffer(1, floatData.length, 24000);
    b.copyToChannel(floatData, 0);
    const source = outCtx.createBufferSource();
    source.buffer = b;
    source.connect(outCtx.destination);
    source.start();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header className="p-8 bg-gray-900 border border-gray-800 rounded-[2.5rem] flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white mb-2 underline decoration-indigo-600">{language === 'ru' ? 'Авто-Документалка' : 'Auto-Documentary'}</h2>
          <p className="text-gray-400">{language === 'ru' ? 'Превратите текст в полноценный образовательный ролик.' : 'Transform text into a complete educational video.'}</p>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 cursor-pointer">
            <input type="checkbox" checked={config.voiceover} onChange={e => setConfig({...config, voiceover: e.target.checked})} className="w-4 h-4 rounded bg-gray-950 border-gray-800 text-indigo-600 focus:ring-0" />
            {language === 'ru' ? 'Озвучка' : 'Voiceover'}
          </label>
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 cursor-pointer">
            <input type="checkbox" checked={config.video} onChange={e => setConfig({...config, video: e.target.checked})} className="w-4 h-4 rounded bg-gray-950 border-gray-800 text-indigo-600 focus:ring-0" />
            {language === 'ru' ? 'Видеоряд' : 'Visuals'}
          </label>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <textarea 
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-[2rem] p-6 text-sm text-white focus:ring-2 focus:ring-indigo-600 outline-none h-64 mb-6"
            placeholder={language === 'ru' ? 'Вставьте статью или тему...' : 'Paste your research article here...'}
          />
          <button 
            onClick={handleGenerate}
            disabled={isProcessing || !sourceText}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black flex items-center justify-center gap-3 transition-all"
          >
            {isProcessing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
            {isProcessing ? (language === 'ru' ? 'Обработка...' : 'Synthesizing...') : (language === 'ru' ? 'Создать ролик' : 'Generate Doc')}
          </button>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {segments.map((seg, idx) => (
            <div key={idx} className="bg-gray-900 border border-gray-800 rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-xl animate-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 150}ms` }}>
              <div className="w-full md:w-64 bg-black flex items-center justify-center aspect-video shrink-0">
                {seg.videoUrl ? (
                  <video src={seg.videoUrl} controls className="w-full h-full object-cover" />
                ) : (
                  <div className="text-xs text-gray-700 font-bold uppercase tracking-widest">{language === 'ru' ? 'Видео не сгенерировано' : 'No Video'}</div>
                )}
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Segment {idx + 1}</span>
                    {seg.audioUrl && (
                      <button onClick={() => playSegmentAudio(seg.audioUrl)} className="text-indigo-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" strokeWidth="2"/></svg>
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed italic">"{seg.voiceover}"</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-800 text-[10px] text-gray-600 font-bold uppercase">
                   Visual: {seg.visual_prompt}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutoDocumentary;
