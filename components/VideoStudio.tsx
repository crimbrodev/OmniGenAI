
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { blobToBase64 } from '../utils/audio-utils';
import { Language } from '../types';

// Add props interface to include language
interface VideoStudioProps {
  language: Language;
}

const VideoStudio: React.FC<VideoStudioProps> = ({ language }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [lastOperation, setLastOperation] = useState<any>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [sourceVideo, setSourceVideo] = useState<File | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setVideoUrl(null);
    try {
      const { url, operation } = await geminiService.generateVideo(prompt, aspectRatio);
      setVideoUrl(url);
      setLastOperation(operation);
    } catch (error) {
      console.error(error);
      alert("Video generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExtend = async () => {
    if (!lastOperation || !prompt) return;
    setIsGenerating(true);
    try {
      // Destructure the expected return object containing both the new video URL and the operation for future extensions.
      const { url, operation } = await geminiService.extendVideo(lastOperation, `Continue the scene: ${prompt}`);
      setVideoUrl(url);
      setLastOperation(operation);
    } catch (error) {
      console.error(error);
      alert("Extension failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSourceVideo(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!sourceVideo) return;
    setIsGenerating(true);
    try {
      const base64 = await blobToBase64(sourceVideo);
      const res = await geminiService.analyzeMedia(base64, sourceVideo.type, "Analyze this video sequence for cinematic continuity and technical details.");
      setAnalysis(res || "No data.");
    } catch (error) {
      console.error(error);
      alert("Analysis failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2 underline decoration-purple-600 decoration-4">Veo Pro Engine</h1>
          <p className="text-gray-500">Professional cinematic pipeline with Sequence Extension.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setAspectRatio('16:9')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${aspectRatio === '16:9' ? 'bg-white text-black' : 'bg-gray-800 text-gray-400'}`}>16:9</button>
           <button onClick={() => setAspectRatio('9:16')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${aspectRatio === '9:16' ? 'bg-white text-black' : 'bg-gray-800 text-gray-400'}`}>9:16</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Director's Input</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-purple-600 outline-none h-40 mb-4" placeholder="Describe your vision..." />
            <div className="flex flex-col gap-3">
              <button onClick={handleGenerate} disabled={isGenerating || !prompt} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-xl shadow-purple-900/20 transition-all disabled:opacity-50">Generate Clip</button>
              {lastOperation && (
                <button onClick={handleExtend} disabled={isGenerating} className="w-full py-4 border border-purple-600/50 text-purple-400 rounded-2xl font-bold hover:bg-purple-600/10 transition-all flex items-center justify-center gap-2">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2"/></svg>
                   Extend +7s
                </button>
              )}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Sequence Analysis</h3>
            <div className="border-2 border-dashed border-gray-800 rounded-xl p-6 text-center hover:border-blue-500/50 transition-colors mb-4 relative">
              <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="video/*" />
              <div className="text-xs text-gray-500">{sourceVideo ? sourceVideo.name : 'Drop clip to analyze'}</div>
            </div>
            {sourceVideo && <button onClick={handleAnalyze} className="w-full py-3 border border-blue-500 text-blue-400 rounded-xl text-sm font-bold hover:bg-blue-500/10 transition-all">Run Vision Analysis</button>}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="aspect-video bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden flex items-center justify-center relative shadow-2xl">
            {isGenerating && (
              <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center p-8 text-center animate-pulse">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6" />
                <h4 className="text-xl font-bold text-white mb-2">Synthesizing World Data</h4>
                <p className="text-gray-400 text-sm max-w-xs">Connecting to Veo 3.1 Pro... Expected duration: 60s</p>
              </div>
            )}
            {videoUrl ? (
              <video src={videoUrl} controls className="w-full h-full object-contain" autoPlay loop />
            ) : (
              <div className="text-center opacity-10">
                <svg className="w-32 h-32 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="0.5"/></svg>
                <div className="text-3xl font-black uppercase tracking-tighter">Veo Engine Standby</div>
              </div>
            )}
          </div>
          {analysis && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 animate-in slide-in-from-bottom-8">
              <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">Technical Logs</h3>
              <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{analysis}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;
