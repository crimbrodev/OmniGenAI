
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { blobToBase64 } from '../utils/audio-utils';
import { Language } from '../types';

// Add props interface to include language
interface AIPhotoshopProps {
  language: Language;
}

const AIPhotoshop: React.FC<AIPhotoshopProps> = ({ language }) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [brushColor, setBrushColor] = useState('#ff0000');
  const [tool, setTool] = useState<'brush' | 'mask'>('mask');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        bgImageRef.current = img;
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const containerWidth = canvas.parentElement?.clientWidth || 800;
        const ratio = img.height / img.width;
        canvas.width = containerWidth;
        canvas.height = containerWidth * ratio;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setImageLoaded(true);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const getPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e: any) => {
    setIsDrawing(true);
    const { x, y } = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = tool === 'mask' ? 'rgba(255, 0, 0, 0.4)' : brushColor;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleMagicEdit = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !prompt) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const base64 = canvas.toDataURL('image/png').split(',')[1];
      const result = await geminiService.editImage(base64, prompt);
      
      const img = new Image();
      img.onload = () => {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = result;
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An unexpected error occurred during processing.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpscale = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const base64 = canvas.toDataURL('image/png').split(',')[1];
      const result = await geminiService.upscaleImage(base64);
      
      const img = new Image();
      img.onload = () => {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = result;
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Upscaling failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !bgImageRef.current) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
      <div className="lg:w-72 space-y-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Pro Tools</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setTool('mask')}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all border ${tool === 'mask' ? 'bg-red-600/20 text-red-400 border-red-500/40 shadow-lg shadow-red-500/10' : 'bg-gray-800/40 text-gray-400 border-transparent hover:bg-gray-800'}`}
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-bold text-sm">Magic Mask</span>
            </button>
            <button 
              onClick={() => setTool('brush')}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all border ${tool === 'brush' ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-gray-800/40 text-gray-400 border-transparent hover:bg-gray-800'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2.5"/></svg>
              <span className="font-bold text-sm">Art Brush</span>
            </button>

            <div className="h-px bg-gray-800 my-4" />

            <button 
              onClick={handleUpscale}
              disabled={isProcessing || !imageLoaded}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all border bg-emerald-600/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/20 disabled:opacity-30 shadow-lg shadow-emerald-500/5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" strokeWidth="2.5"/></svg>
              <span className="font-bold text-sm text-center">AI Upscale (4K)</span>
            </button>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Brush Size</label>
                <span className="text-[10px] font-bold text-blue-400">{brushSize}px</span>
              </div>
              <input type="range" min="5" max="150" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-full accent-blue-600" />
            </div>
            
            {tool === 'brush' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Pigment</label>
                <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="w-full h-12 rounded-xl cursor-pointer border-4 border-gray-800 bg-gray-800" />
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-800/50">
            <button onClick={clearCanvas} className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors flex items-center justify-center gap-2">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2.5"/></svg>
              Discard Changes
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6">
        {errorMessage && (
          <div className="bg-red-900/40 border border-red-500/50 rounded-2xl p-4 flex items-start gap-4 animate-in slide-in-from-top-4">
            <div className="p-2 bg-red-500 rounded-lg shrink-0">
               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="2"/></svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-200 text-sm">Processing Error</h4>
              <p className="text-xs text-red-300/80 leading-relaxed mt-1">{errorMessage}</p>
              {errorMessage.includes("ACCESS_DENIED") && (
                <button 
                  // @ts-ignore
                  onClick={() => window.aistudio?.openSelectKey()} 
                  className="mt-3 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded-lg transition-colors"
                >
                  Update API Key
                </button>
              )}
            </div>
          </div>
        )}

        <div className="relative bg-gray-900/50 border border-gray-800 rounded-[2.5rem] overflow-hidden min-h-[500px] flex items-center justify-center group shadow-2xl backdrop-blur-sm">
          {!imageLoaded && (
            <div className="text-center p-12 animate-in zoom-in-95 duration-700">
              <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="1.5"/></svg>
              </div>
              <h4 className="text-2xl font-black text-white mb-2">OmniGen Photoshop</h4>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">Upload any image to start Magic Repainting. Draw a red mask to tell the AI exactly where to focus.</p>
            </div>
          )}
          <canvas 
            ref={canvasRef} 
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
            className={`max-w-full h-auto cursor-crosshair transition-opacity duration-1000 ${!imageLoaded ? 'hidden opacity-0' : 'block opacity-100'}`}
          />
          
          {isProcessing && (
            <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-md flex flex-col items-center justify-center z-40 animate-in fade-in duration-300">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-blue-400 font-black animate-pulse uppercase tracking-[0.3em] text-[10px]">Neural Re-composition In Progress</p>
            </div>
          )}
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-[2rem] p-4 flex flex-col md:flex-row gap-4 items-center backdrop-blur-xl">
          <div className="flex-1 w-full relative">
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleMagicEdit()}
              className="w-full bg-gray-950/80 border border-gray-800 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm pr-12 text-white font-medium"
              placeholder="Magic instructions... e.g., 'Turn the masked area into a sci-fi cyber-eye'"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.989-2.386l-.548-.547z" strokeWidth="2"/></svg>
            </div>
          </div>
          <button 
            onClick={handleMagicEdit}
            disabled={!prompt || isProcessing || !imageLoaded}
            className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 transition-all rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20 group"
          >
            {isProcessing ? 'PROCESSING...' : (
              <>
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2.5"/></svg>
                APPLY MAGIC
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPhotoshop;
