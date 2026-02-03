
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { Language } from '../types';

interface DynamicStoryboardProps {
  language: Language;
}

const DynamicStoryboard: React.FC<DynamicStoryboardProps> = ({ language }) => {
  const [scene, setScene] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [frames, setFrames] = useState<Array<{url: string, prompt: string}>>([]);
  const [remixPrompt, setRemixPrompt] = useState('');
  const [activeFrameIdx, setActiveFrameIdx] = useState<number | null>(null);
  
  const handleGenerate = async () => {
    if (!scene) return;
    setIsGenerating(true);
    setFrames([]);
    try {
      const result = await geminiService.generateStoryboard(scene, 4);
      setFrames(result);
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  const handleRemix = async () => {
    if (activeFrameIdx === null || !remixPrompt) return;
    setIsGenerating(true);
    try {
      const currentFrame = frames[activeFrameIdx];
      const base64 = currentFrame.url.split(',')[1];
      const result = await geminiService.editImage(base64, remixPrompt);
      const newFrames = [...frames];
      newFrames[activeFrameIdx] = { ...currentFrame, url: result };
      setFrames(newFrames);
      setRemixPrompt('');
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <header className="p-8 bg-gray-900 border border-gray-800 rounded-[2.5rem] flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white">{language === 'ru' ? 'Живая раскадровка' : 'Dynamic Storyboard'}</h2>
          <p className="text-gray-500">{language === 'ru' ? 'Интерактивное планирование сцен с использованием глубокого визуального анализа.' : 'Deep visual reasoning for cinematic planning.'}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 block">{language === 'ru' ? 'Описание сцены' : 'Scene Vision'}</label>
            <textarea value={scene} onChange={e => setScene(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-sm text-white h-48 mb-6 focus:ring-2 focus:ring-purple-600 outline-none" placeholder={language === 'ru' ? 'Опишите кинематографичную сцену...' : "Describe a cinematic scene (e.g., A samurai duel in a bamboo forest)..."} />
            <button onClick={handleGenerate} disabled={isGenerating || !scene} className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-2xl font-black transition-all">
              {isGenerating ? (language === 'ru' ? 'Мышление...' : 'Reasoning...') : (language === 'ru' ? 'Создать раскадровку' : 'Create Storyboard')}
            </button>
          </div>

          {frames.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 animate-in slide-in-from-top-4">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 block">
                {language === 'ru' ? `Изменить кадр ${activeFrameIdx !== null ? activeFrameIdx + 1 : ''}` : `Remix Frame ${activeFrameIdx !== null ? activeFrameIdx + 1 : ''}`}
              </label>
              <input 
                value={remixPrompt} 
                onChange={e => setRemixPrompt(e.target.value)}
                disabled={activeFrameIdx === null}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-sm text-white mb-4 outline-none focus:ring-1 focus:ring-purple-500" 
                placeholder={language === 'ru' ? 'Напр., Замени куртку на плащ' : "e.g., 'Change jacket to red cloak'"}
              />
              <button onClick={handleRemix} disabled={isGenerating || activeFrameIdx === null || !remixPrompt} className="w-full py-3 bg-gray-800 border border-purple-500/50 rounded-xl font-bold text-purple-400 hover:bg-purple-500/10 transition-all">
                 {language === 'ru' ? 'Применить изменения' : 'Apply Changes'}
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isGenerating && frames.length === 0 && [1,2,3,4].map(i => <div key={i} className="aspect-[16/9] bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />)}
            {frames.map((f, i) => (
              <div 
                key={i} 
                onClick={() => setActiveFrameIdx(i)}
                className={`bg-gray-900 border-2 rounded-3xl overflow-hidden cursor-pointer transition-all ${activeFrameIdx === i ? 'border-purple-500 shadow-2xl scale-[1.02]' : 'border-gray-800 hover:border-gray-600'}`}
              >
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img src={f.url} className="w-full h-full object-cover" alt={`Frame ${i+1}`} />
                  {activeFrameIdx === i && <div className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white text-[10px] font-black rounded uppercase">Active</div>}
                </div>
                <div className="p-4 bg-gray-950/50 text-[10px] text-gray-500 italic truncate">{f.prompt}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicStoryboard;
