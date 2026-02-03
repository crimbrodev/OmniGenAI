
import React from 'react';
import { AppTab, Language } from '../types';
import { translations } from '../services/translations';

interface DashboardProps {
  onNavigate: (tab: AppTab) => void;
  language: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, language }) => {
  const t = translations[language];

  const tools = [
    { id: AppTab.IMAGE_STUDIO, title: t.imageStudio, desc: language === 'ru' ? 'Генерация 4K арта и вариации стилей.' : '4K art generation and style variations.', color: 'from-cyan-500/20 to-blue-500/20', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H4a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: AppTab.VIDEO_STUDIO, title: t.videoStudio, desc: language === 'ru' ? 'Создание 720p клипов с расширением сцен.' : 'Generate 720p clips and extend sequences.', color: 'from-purple-500/20 to-pink-500/20', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: AppTab.AI_PHOTOSHOP, title: t.aiPhotoshop, desc: language === 'ru' ? 'Маскирование, перерисовка и композиция.' : 'Magic Mask editing, repaint and hybrid comp.', color: 'from-blue-600/30 to-purple-600/30', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
    { id: AppTab.AUDIO_HUB, title: t.audioHub, desc: language === 'ru' ? 'Синтез диалогов и транскрибация.' : 'Dialogue creation and verbatim transcription.', color: 'from-indigo-500/20 to-blue-500/20', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
  ];

  const pipelines = [
    { id: AppTab.CONCEPT_TO_PROD, title: t.concept2Prod, desc: language === 'ru' ? 'Дизайн интерфейса и код Tailwind за секунды.' : 'Generate UI design and get the Tailwind code.', color: 'border-blue-500/30 bg-blue-500/5', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { id: AppTab.MARKETING_SUITE, title: t.marketing360, desc: language === 'ru' ? 'От одного фото до полных рекламных материалов.' : 'One photo to full ads and video promos.', color: 'border-purple-500/30 bg-purple-500/5', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' },
    { id: AppTab.AUTO_DOC, title: t.autoDoc, desc: language === 'ru' ? 'Превратите текст в озвученный видеоряд.' : 'Turn text into narrated video documentary.', color: 'border-indigo-500/30 bg-indigo-500/5', icon: 'M7 4v16M17 4v16' },
    { id: AppTab.OMNI_SEARCH, title: t.omniSearch, desc: language === 'ru' ? 'Умный поиск по медиафайлам.' : 'Query across images, video and audio.', color: 'border-emerald-500/30 bg-emerald-500/5', icon: 'M21 21l-6-6' },
    { id: AppTab.SMART_DUBBING, title: t.smartDubbing, desc: language === 'ru' ? 'Автоматический перевод и озвучка видео.' : 'Automatic translation and video dubbing.', color: 'border-orange-500/30 bg-orange-500/5', icon: 'M3 5h12M9 3v2' },
    { id: AppTab.STORYBOARD, title: t.liveStoryboard, desc: language === 'ru' ? 'Интерактивное планирование сцен.' : 'Interactive planning of cinematic scenes.', color: 'border-pink-500/30 bg-pink-500/5', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z' }
  ];

  return (
    <div className="space-y-16 animate-in fade-in duration-1000 pb-20">
      <header className="relative py-16 overflow-hidden rounded-[3.5rem] bg-gray-900/40 border border-gray-800 px-12">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] -z-10" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-purple-600/10 blur-[150px] -z-10" />
        
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-500 font-black text-[10px] uppercase tracking-widest mb-6">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
             {language === 'ru' ? 'Мультимодальное ядро 3.0' : 'Multimodal Core 3.0'}
          </div>
          <h1 className="text-7xl font-black tracking-tighter mb-6 text-white leading-[0.9]">
            OmniGen <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">Multiverse</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed font-medium">
            {language === 'ru' 
              ? 'Ультимативная мультимодальная рабочая станция. Объединяйте логику, зрение и голос для создания продуктов.' 
              : 'The ultimate multimodal workstation. Chain reasoning, vision, speech, and video to create complete products.'}
          </p>
        </div>
      </header>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">{t.proPipelines}</h2>
          <div className="h-px flex-1 bg-gray-800 mx-8 hidden md:block" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pipelines.map((p) => (
            <button 
              key={p.id} 
              onClick={() => onNavigate(p.id)} 
              className={`p-6 rounded-[2.5rem] border ${p.color} hover:scale-[1.02] transition-all text-left flex flex-col justify-between min-h-[180px] group shadow-xl`}
            >
              <div>
                <svg className="w-8 h-8 text-blue-400 mb-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={p.icon} strokeWidth="2.5"/></svg>
                <h3 className="text-xl font-black text-white mb-2">{p.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{p.desc}</p>
              </div>
              <span className="text-[10px] font-black uppercase text-blue-500 mt-4 opacity-50 group-hover:opacity-100">{t.runChain} →</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">{t.creativeToolkits}</h2>
          <div className="h-px flex-1 bg-gray-800 mx-8 hidden md:block" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <button 
              key={tool.id} 
              onClick={() => onNavigate(tool.id)} 
              className="group relative p-8 rounded-[2.5rem] bg-gray-950/50 border border-gray-800 hover:border-blue-500/50 transition-all text-left overflow-hidden flex flex-col justify-between min-h-[200px]"
            >
              <div className="relative z-10">
                <div className="mb-6 p-4 rounded-3xl bg-gray-900 group-hover:bg-blue-600/30 w-fit transition-all duration-500 border border-gray-800">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={tool.icon} strokeWidth="1.5"/></svg>
                </div>
                <h3 className="text-xl font-black text-white mb-2">{tool.title}</h3>
                <p className="text-gray-500 group-hover:text-gray-300 text-xs leading-relaxed font-medium">{tool.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
