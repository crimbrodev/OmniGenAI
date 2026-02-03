
import React from 'react';
import { AppTab, Language } from '../types';
import { translations } from '../services/translations';

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenApiKey: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, language, onLanguageChange, onOpenApiKey }) => {
  const t = translations[language];

  const menuGroups = [
    {
      label: language === 'ru' ? 'Главное' : 'Main',
      items: [
        { id: AppTab.DASHBOARD, label: t.dashboard, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { id: AppTab.AI_CHAT, label: t.creativeThinker, icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
      ]
    },
    {
      label: language === 'ru' ? 'Студии' : 'Studios',
      items: [
        { id: AppTab.IMAGE_STUDIO, label: t.imageStudio, icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H4a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: AppTab.AI_PHOTOSHOP, label: t.aiPhotoshop, icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
        { id: AppTab.VIDEO_STUDIO, label: t.videoStudio, icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: AppTab.AUDIO_HUB, label: t.audioHub, icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
      ]
    },
    {
      label: t.proPipelines,
      items: [
        { id: AppTab.CONCEPT_TO_PROD, label: t.concept2Prod, icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
        { id: AppTab.STORYBOARD, label: t.liveStoryboard, icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z M8 8h8v8H8V8z' },
        { id: AppTab.AUTO_DOC, label: t.autoDoc, icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4' },
        { id: AppTab.SMART_DUBBING, label: t.smartDubbing, icon: 'M3 5h12M9 3v2m1.048 9.5a18.022 18.022 0 01-3.68-3.68m3.68 3.68c.5-1.5 1-3 1.5-4.5M6.368 10.82a18.024 18.024 0 003.68 3.68m-3.68-3.68l-1.5-4.5M9 10c0 1.5-1.5 3-3 3' },
        { id: AppTab.MARKETING_SUITE, label: t.marketing360, icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z' },
        { id: AppTab.OMNI_SEARCH, label: t.omniSearch, icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
      ]
    },
    {
      label: t.experimental,
      items: [
        { id: AppTab.LIVE_VOICE, label: t.liveVoice, icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
      ]
    }
  ];

  return (
    <aside className="w-20 md:w-64 bg-gray-950 border-r border-gray-800 flex flex-col transition-all duration-300 overflow-y-auto no-scrollbar">
      <div className="p-6 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden md:block">OmniGen</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenApiKey}
            className="p-1.5 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-blue-400 hover:border-blue-500/50 transition-colors hidden md:block"
            title={language === 'ru' ? 'API ключ' : 'API Key'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
          </button>
          <button 
            onClick={() => onLanguageChange(language === 'en' ? 'ru' : 'en')}
            className="p-1 px-2 bg-gray-900 border border-gray-800 rounded text-[10px] font-black hover:bg-gray-800 transition-colors hidden md:block"
          >
            {language.toUpperCase()}
          </button>
        </div>
      </div>
      
      <nav className="flex-1 px-3 pb-8 space-y-6">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-2">
            <h4 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hidden md:block">
              {group.label}
            </h4>
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                    activeTab === item.id ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200 border border-transparent'
                  }`}
                >
                  <svg className={`w-5 h-5 shrink-0 transition-colors ${activeTab === item.id ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/>
                  </svg>
                  <span className="font-medium text-sm hidden md:block truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
