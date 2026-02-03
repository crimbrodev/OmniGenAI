
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { blobToBase64 } from '../utils/audio-utils';
import { Language } from '../types';

interface MarketingSuiteProps {
  language: Language;
}

const MarketingSuite: React.FC<MarketingSuiteProps> = ({ language }) => {
  const [productPhoto, setProductPhoto] = useState<File | null>(null);
  const [brandName, setBrandName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<{ adText?: string, promoImage?: string, promoVideo?: string } | null>(null);

  // Modular Toggles
  const [config, setConfig] = useState({ 
    genAdCopy: true, 
    genPromoImage: true, 
    genPromoVideo: true 
  });

  const handleGenerate = async () => {
    if (!productPhoto || !brandName) return;
    setIsGenerating(true);
    setResults(null);
    try {
      const base64 = await blobToBase64(productPhoto);
      let adText, promoImage, promoVideo;

      if (config.genAdCopy) {
        adText = await geminiService.analyzeMedia(base64, productPhoto.type, `Create 3 catchy professional marketing ad copies for this product. Brand Name: ${brandName}. Language: ${language === 'ru' ? 'Russian' : 'English'}.`);
      }

      if (config.genPromoImage) {
        promoImage = await geminiService.editImage(base64, "Place this product in a luxury, professional studio setting with cinematic lighting. Commercial photography style.");
      }

      if (config.genPromoVideo) {
        const videoRes = await geminiService.generateVideo(`Premium product reveal for ${brandName}. Elegant lighting, smooth cinematic pans.`, "16:9", base64);
        promoVideo = videoRes.url;
      }

      setResults({ adText, promoImage, promoVideo });
    } catch (error) {
      console.error(error);
      alert(language === 'ru' ? "Сбой в пайплайне маркетинга." : "Marketing pipeline failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-white">{language === 'ru' ? 'Маркетинг 360' : 'Marketing 360 Suite'}</h2>
          <p className="text-gray-500">{language === 'ru' ? 'От одного фото до полных рекламных материалов.' : 'From single photo to full campaign assets.'}</p>
        </div>
        <div className="flex items-center gap-6 bg-gray-900 px-6 py-3 rounded-2xl border border-gray-800">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 cursor-pointer">
            <input type="checkbox" checked={config.genAdCopy} onChange={e => setConfig({...config, genAdCopy: e.target.checked})} className="w-4 h-4 rounded border-gray-800 bg-gray-950 text-blue-600 focus:ring-0" />
            {language === 'ru' ? 'Текст' : 'Ad Copy'}
          </label>
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 cursor-pointer">
            <input type="checkbox" checked={config.genPromoImage} onChange={e => setConfig({...config, genPromoImage: e.target.checked})} className="w-4 h-4 rounded border-gray-800 bg-gray-950 text-blue-600 focus:ring-0" />
            {language === 'ru' ? 'Фото' : 'Promo Image'}
          </label>
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 cursor-pointer">
            <input type="checkbox" checked={config.genPromoVideo} onChange={e => setConfig({...config, genPromoVideo: e.target.checked})} className="w-4 h-4 rounded border-gray-800 bg-gray-950 text-blue-600 focus:ring-0" />
            {language === 'ru' ? 'Видео' : 'Promo Video'}
          </label>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-[2.5rem] p-8 space-y-8">
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 block">{language === 'ru' ? 'Товар' : 'Product Asset'}</label>
            <div className="aspect-square border-2 border-dashed border-gray-800 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden group hover:border-blue-500/50 transition-all cursor-pointer">
              <input type="file" onChange={(e) => setProductPhoto(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              {productPhoto ? (
                <img src={URL.createObjectURL(productPhoto)} className="w-full h-full object-cover opacity-60" alt="Product" />
              ) : (
                <div className="text-center">
                  <svg className="w-12 h-12 text-gray-800 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="1"/></svg>
                  <p className="text-[10px] font-black uppercase text-gray-600">{language === 'ru' ? 'Загрузить фото' : 'Upload Photo'}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 block">{language === 'ru' ? 'Название бренда' : 'Brand Identity'}</label>
            <input 
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              placeholder={language === 'ru' ? 'Напр., Люмина' : 'e.g., Lumina Luxe'}
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !productPhoto || !brandName}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all rounded-3xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-blue-500/20"
          >
            {isGenerating ? (language === 'ru' ? 'Синтез активов...' : 'Synthesizing...') : (language === 'ru' ? 'Запустить кампанию' : 'Execute Campaign')}
          </button>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {results && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in-95 duration-700">
              {results.adText && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-[2.5rem] p-8 space-y-4">
                  <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Ad Copywriter</h4>
                  <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {results.adText}
                  </div>
                </div>
              )}
              
              <div className="space-y-8">
                {results.promoImage && (
                  <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden">
                    <h4 className="p-4 bg-gray-950/50 text-[10px] font-black text-blue-500 uppercase tracking-widest border-b border-gray-800">Promo Image</h4>
                    <img src={results.promoImage} className="w-full h-auto" alt="Promo" />
                  </div>
                )}
                
                {results.promoVideo && (
                  <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden aspect-video">
                    <h4 className="p-4 bg-gray-950/50 text-[10px] font-black text-blue-500 uppercase tracking-widest border-b border-gray-800">Promo Clip</h4>
                    <video src={results.promoVideo} controls className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketingSuite;
