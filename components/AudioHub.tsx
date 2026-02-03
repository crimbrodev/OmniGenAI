
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { blobToBase64, decode } from '../utils/audio-utils';
import { Language } from '../types';

// Add props interface to include language
interface AudioHubProps {
  language: Language;
}

const AudioHub: React.FC<AudioHubProps> = ({ language }) => {
  const [ttsText, setTtsText] = useState('');
  const [convPrompt, setConvPrompt] = useState('');
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Kore');

  const playPCM = async (base64Audio: string) => {
    const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const dataInt16 = new Int16Array(decode(base64Audio).buffer);
    const floatData = new Float32Array(dataInt16.length);
    for(let i=0; i<dataInt16.length; i++) floatData[i] = dataInt16[i] / 32768;
    const b = outCtx.createBuffer(1, floatData.length, 24000);
    b.copyToChannel(floatData, 0);
    const source = outCtx.createBufferSource();
    source.buffer = b;
    source.connect(outCtx.destination);
    source.start();
  };

  const handleTTS = async () => {
    if (!ttsText) return;
    setIsProcessing(true);
    try {
      const base64Audio = await geminiService.generateSpeech(ttsText, selectedVoice);
      if (base64Audio) await playPCM(base64Audio);
    } catch (e) { alert("Speech generation failed."); }
    finally { setIsProcessing(false); }
  };

  const handleConvGen = async () => {
    if (!convPrompt) return;
    setIsProcessing(true);
    try {
      const base64Audio = await geminiService.generateConversation(convPrompt, 'Alex', 'Sarah');
      if (base64Audio) await playPCM(base64Audio);
    } catch (e) { alert("Conversation generation failed."); }
    finally { setIsProcessing(false); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const base64 = await blobToBase64(file);
      const text = await geminiService.analyzeMedia(base64, file.type, "Please provide a verbatim transcription.");
      setTranscription(text || "No speech detected.");
    } catch (err) { alert("Transcription failed."); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      <section className="bg-gray-900/50 border border-gray-800 rounded-[2rem] p-8 space-y-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Dialogue Synthesizer</h2>
          <textarea value={convPrompt} onChange={(e) => setConvPrompt(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-sm text-gray-300 h-24 mb-4" placeholder="Podcast topic... e.g., 'The ethics of AI art'" />
          <button onClick={handleConvGen} disabled={isProcessing || !convPrompt} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold disabled:opacity-50">Generate Multi-Speaker Audio</button>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <h2 className="text-xl font-bold text-white mb-4">Text-to-Speech</h2>
          <textarea value={ttsText} onChange={(e) => setTtsText(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-sm text-gray-300 h-32 mb-4" placeholder="Individual voice text..." />
          <div className="flex gap-4">
            <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} className="flex-1 bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white">
              {['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <button onClick={handleTTS} disabled={isProcessing || !ttsText} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold disabled:opacity-50">Speak</button>
          </div>
        </div>
      </section>

      <section className="bg-gray-900/50 border border-gray-800 rounded-[2rem] p-8 flex flex-col space-y-6">
        <h2 className="text-xl font-bold text-white">Transcription Engine</h2>
        <div className="border-2 border-dashed border-gray-800 rounded-3xl p-10 text-center hover:border-indigo-500 transition-colors relative">
          <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="audio/*,video/*" />
          <p className="font-bold">Drop audio/video file</p>
          <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-bold">Verbatim Analysis Enabled</p>
        </div>
        <div className="flex-1 bg-gray-950 border border-gray-800 rounded-2xl p-6 overflow-y-auto no-scrollbar min-h-[200px]">
          {isProcessing ? (
             <div className="flex items-center justify-center h-full gap-2 text-indigo-400 animate-pulse"><div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />Processing...</div>
          ) : transcription ? (
            <div className="text-sm text-gray-300 whitespace-pre-wrap">{transcription}</div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-800 font-bold uppercase opacity-10">Standby</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AudioHub;
