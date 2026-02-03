
import React, { useState, useEffect } from 'react';
import { AppTab, Language } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ImageStudio from './components/ImageStudio';
import AIPhotoshop from './components/AIPhotoshop';
import VideoStudio from './components/VideoStudio';
import LiveVoice from './components/LiveVoice';
import AIChat from './components/AIChat';
import AudioHub from './components/AudioHub';
import ConceptToProduct from './components/ConceptToProduct';
import AutoDocumentary from './components/AutoDocumentary';
import MarketingSuite from './components/MarketingSuite';
import OmniSearch from './components/OmniSearch';
import SmartDubbing from './components/SmartDubbing';
import DynamicStoryboard from './components/DynamicStoryboard';
import { GeminiApiError } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [globalError, setGlobalError] = useState<{status: number, message: string} | null>(null);
  const [userApiKey, setUserApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  useEffect(() => {
    const checkApiKey = async () => {
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        // @ts-ignore
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      } else {
        const savedKey = localStorage.getItem('gemini_api_key');
        const envKey = process.env.API_KEY;
        
        console.log('Saved key:', savedKey ? 'exists' : 'none');
        console.log('Env key:', envKey);
        
        if (savedKey && savedKey.trim() && savedKey !== 'PLACEHOLDER_API_KEY') {
          setUserApiKey(savedKey);
          setHasApiKey(true);
        } else if (envKey && envKey !== 'PLACEHOLDER_API_KEY' && envKey.trim()) {
          setHasApiKey(true);
        } else {
          setHasApiKey(false);
        }
      }
    };
    checkApiKey();

    const handleError = (event: PromiseRejectionEvent) => {
      if (event.reason instanceof GeminiApiError) {
        setGlobalError({ status: event.reason.status, message: event.reason.message });
      }
    };
    window.addEventListener('unhandledrejection', handleError);
    return () => window.removeEventListener('unhandledrejection', handleError);
  }, []);

  const handleOpenApiKey = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
      setGlobalError(null);
    } else {
      setShowApiKeyModal(true);
    }
  };

  const handleSaveApiKey = () => {
    if (tempApiKey.trim()) {
      localStorage.setItem('gemini_api_key', tempApiKey.trim());
      setUserApiKey(tempApiKey.trim());
      setHasApiKey(true);
      setShowApiKeyModal(false);
      setTempApiKey('');
      setGlobalError(null);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD: return <Dashboard onNavigate={setActiveTab} language={language} />;
      case AppTab.IMAGE_STUDIO: return <ImageStudio language={language} />;
      case AppTab.AI_PHOTOSHOP: return <AIPhotoshop language={language} />;
      case AppTab.VIDEO_STUDIO: return <VideoStudio language={language} />;
      case AppTab.LIVE_VOICE: return <LiveVoice language={language} />;
      case AppTab.AI_CHAT: return <AIChat language={language} />;
      case AppTab.AUDIO_HUB: return <AudioHub language={language} />;
      case AppTab.CONCEPT_TO_PROD: return <ConceptToProduct language={language} />;
      case AppTab.AUTO_DOC: return <AutoDocumentary language={language} />;
      case AppTab.MARKETING_SUITE: return <MarketingSuite language={language} />;
      case AppTab.OMNI_SEARCH: return <OmniSearch language={language} />;
      case AppTab.SMART_DUBBING: return <SmartDubbing language={language} />;
      case AppTab.STORYBOARD: return <DynamicStoryboard language={language} />;
      default: return <Dashboard onNavigate={setActiveTab} language={language} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-inter">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        language={language} 
        onLanguageChange={setLanguage}
        onOpenApiKey={handleOpenApiKey}
      />
      <main className="flex-1 overflow-y-auto relative no-scrollbar">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto p-4 md:p-8 pb-20">
          {!hasApiKey && !globalError && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
              <div>
                <h3 className="text-xl font-bold text-blue-100">
                  {language === 'ru' ? 'Pro функции заблокированы' : 'Pro Pipelines Locked'}
                </h3>
                <p className="text-blue-200/70 text-sm">
                  {language === 'ru' ? 'Мультимодальные функции и Veo Video требуют API-ключа с биллингом.' : 'Multimodal features and Veo Video require a Billing-enabled API key.'}
                </p>
              </div>
              <button onClick={handleOpenApiKey} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 transition-colors rounded-full font-bold shadow-lg shadow-blue-500/20 whitespace-nowrap">
                {language === 'ru' ? 'Выбрать ключ' : 'Select API Key'}
              </button>
            </div>
          )}

          {globalError && (
            <div className="mb-8 p-8 bg-red-950/40 border border-red-500/30 rounded-[2rem] backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                   <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-white mb-2">
                    {globalError.status === 403 ? (language === 'ru' ? 'Доступ запрещен' : 'Permission Denied') : 'Error'}
                  </h3>
                  <p className="text-red-200/70 text-sm leading-relaxed mb-6 max-w-2xl">
                    {globalError.message}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={handleOpenApiKey} className="px-6 py-3 bg-red-600 hover:bg-red-500 transition-colors rounded-xl font-bold shadow-lg shadow-red-500/20">
                      {language === 'ru' ? 'Сменить ключ' : 'Change API Key'}
                    </button>
                    <button onClick={() => setGlobalError(null)} className="px-6 py-3 text-gray-500 hover:text-white transition-colors text-sm font-bold">
                      {language === 'ru' ? 'Скрыть' : 'Dismiss'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {renderContent()}
        </div>
      </main>
      
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">
              {language === 'ru' ? 'Введите API ключ' : 'Enter API Key'}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {language === 'ru' 
                ? 'Получите ключ в Google AI Studio с включенным биллингом' 
                : 'Get your key from Google AI Studio with billing enabled'}
            </p>
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder={language === 'ru' ? 'Вставьте ваш API ключ...' : 'Paste your API key...'}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 mb-6 focus:outline-none focus:border-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApiKeyModal(false);
                  setTempApiKey('');
                }}
                className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                {language === 'ru' ? 'Отмена' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveApiKey}
                disabled={!tempApiKey.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors"
              >
                {language === 'ru' ? 'Сохранить' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
