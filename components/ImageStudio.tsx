
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { blobToBase64 } from '../utils/audio-utils';
import { Language } from '../types';

// Add props interface to include language
interface ImageStudioProps {
  language: Language;
}

const ImageStudio: React.FC<ImageStudioProps> = ({ language }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const ratios = ["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"];
  const sizes = ["1K", "2K", "4K"];

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    try {
      const url = await geminiService.generateImage(prompt, aspectRatio, imageSize);
      setResultImage(url);
    } catch (error) {
      console.error(error);
      alert("Failed to generate image.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleEdit = async () => {
    if (!selectedFile || !editPrompt) return;
    setIsLoading(true);
    try {
      const base64 = await blobToBase64(selectedFile);
      const url = await geminiService.editImage(base64, editPrompt);
      setResultImage(url);
    } catch (error) {
      console.error(error);
      alert("Failed to edit image.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      const base64 = await blobToBase64(selectedFile);
      const text = await geminiService.analyzeMedia(base64, selectedFile.type, "Analyze this image in extreme detail.");
      setAnalysisResult(text || "No insights found.");
    } catch (error) {
      console.error(error);
      alert("Analysis failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleColorize = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      const base64 = await blobToBase64(selectedFile);
      const url = await geminiService.colorizeImage(base64);
      setResultImage(url);
    } catch (error) {
      console.error(error);
      alert("Colorization failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Controls */}
      <div className="lg:col-span-4 space-y-6">
        <section className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-md">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <span className="p-2 bg-blue-600/20 rounded-lg text-blue-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            </span>
            Generate New
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none h-32"
                placeholder="A futuristic cyber-city with neon lights and flying cars..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Aspect Ratio</label>
                <select 
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-gray-300"
                >
                  {ratios.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Quality</label>
                <select 
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-gray-300"
                >
                  {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isLoading || !prompt}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all rounded-xl font-bold shadow-lg shadow-blue-500/20"
            >
              {isLoading ? 'Processing...' : 'Generate Art'}
            </button>
          </div>
        </section>

        <section className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-md">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-purple-400">
            <span className="p-2 bg-purple-600/20 rounded-lg text-purple-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
            </span>
            Edit & Analyze
          </h2>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-800 rounded-xl p-4 text-center hover:border-purple-500/50 transition-colors cursor-pointer relative">
              <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
              <div className="text-xs text-gray-500">
                {selectedFile ? selectedFile.name : 'Upload Source Image'}
              </div>
            </div>

            {selectedFile && (
              <>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={handleColorize} 
                    disabled={isLoading} 
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
                    Auto Colorize (B&W)
                  </button>
                  
                  <div className="h-px bg-gray-800 my-2" />
                  
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Manual AI Edit</label>
                  <input 
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                    placeholder="e.g., 'Add a sunset background'"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleEdit} disabled={isLoading || !editPrompt} className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-bold transition-all disabled:opacity-50">Apply</button>
                    <button onClick={handleAnalyze} disabled={isLoading} className="flex-1 py-3 border border-purple-600/50 hover:bg-purple-600/10 rounded-xl text-sm font-bold transition-all">Analyze</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Canvas */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="flex-1 bg-gray-900/30 border border-gray-800 rounded-[2.5rem] p-4 flex items-center justify-center min-h-[500px] relative overflow-hidden group">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-blue-400 font-bold animate-pulse tracking-tighter uppercase text-xs">Processing Neural Channels...</p>
            </div>
          )}
          
          {resultImage ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img src={resultImage} className="max-w-full max-h-full rounded-2xl shadow-2xl transition-transform duration-700 hover:scale-[1.02]" alt="Generated result" />
              <div className="absolute bottom-6 right-6 flex gap-2">
                <a href={resultImage} download="omnigen-art.png" className="p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-all text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center opacity-20">
              <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H4a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <p className="text-2xl font-black">CANVAS READY</p>
            </div>
          )}
        </div>

        {analysisResult && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 animate-in slide-in-from-bottom-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Gemini Vision Analysis</h3>
            <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed">
              {analysisResult}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageStudio;
