
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { Language } from '../types';

// Add props interface to include language
interface ConceptToProductProps {
  language: Language;
}

const ConceptToProduct: React.FC<ConceptToProductProps> = ({ language }) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [designUrl, setDesignUrl] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  
  // Modular Controls
  const [config, setConfig] = useState({ generateDesign: true, generateCode: true });

  const handleStart = async () => {
    if (!description) return;
    setIsGenerating(true);
    setStep(1);
    setDesignUrl(null);
    setCode(null);
    try {
      let currentDesign = "";
      if (config.generateDesign) {
        const design = await geminiService.generateImage(`Modern UI design for: ${description}. Professional Figma style.`, "16:9", "1K");
        setDesignUrl(design);
        currentDesign = design;
      }
      
      if (config.generateCode) {
        setStep(2);
        const codePrompt = config.generateDesign && currentDesign 
          ? await geminiService.visionToCode(currentDesign.split(',')[1])
          : await geminiService.sendMessage(`Write responsive Tailwind CSS code for this UI concept: ${description}`, [], true);
        
        // @ts-ignore
        setCode(codePrompt.text || codePrompt);
      }
      setStep(3);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-[2.5rem] p-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white mb-2">Concept-to-Product</h2>
          <p className="text-blue-200/60 max-w-xl">Zero to Prototype. Visual reasoning + code generation.</p>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-xs font-bold text-gray-400">
            <input type="checkbox" checked={config.generateDesign} onChange={e => setConfig({...config, generateDesign: e.target.checked})} className="w-4 h-4 rounded border-gray-800 bg-gray-900 text-blue-600 focus:ring-0" />
            UI Design
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-gray-400">
            <input type="checkbox" checked={config.generateCode} onChange={e => setConfig({...config, generateCode: e.target.checked})} className="w-4 h-4 rounded border-gray-800 bg-gray-900 text-blue-600 focus:ring-0" />
            Codebase
          </label>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-sm text-white h-48 mb-6 focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="Describe your app idea..."
            />
            <button 
              onClick={handleStart}
              disabled={isGenerating || !description || (!config.generateDesign && !config.generateCode)}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all rounded-2xl font-black"
            >
              {isGenerating ? "Synthesizing..." : "Generate Prototype"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          {designUrl && (
            <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden animate-in zoom-in-95">
              <img src={designUrl} className="w-full h-auto" alt="UI Design" />
            </div>
          )}
          {code && (
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 font-mono text-xs text-blue-300 overflow-x-auto h-[400px] no-scrollbar animate-in slide-in-from-bottom-4">
              <pre className="whitespace-pre-wrap">{code}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConceptToProduct;
