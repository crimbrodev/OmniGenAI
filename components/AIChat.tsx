
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { ChatMessage, Language } from '../types';

// Add props interface to include language
interface AIChatProps {
  language: Language;
}

const AIChat: React.FC<AIChatProps> = ({ language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      const result = await geminiService.sendMessage(input, messages, isThinking);
      
      const groundingLinks = result.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => {
        if (chunk.web) return { title: chunk.web.title, uri: chunk.web.uri };
        if (chunk.maps) return { title: chunk.maps.title, uri: chunk.maps.uri };
        return null;
      }).filter(Boolean) || [];

      const modelMsg: ChatMessage = {
        role: 'model',
        content: result.text || "No response received.",
        timestamp: Date.now(),
        groundingLinks
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        role: 'model',
        content: "Error: Failed to fetch response. Please check your API key.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-5xl mx-auto bg-gray-900/50 rounded-3xl border border-gray-800 overflow-hidden backdrop-blur-xl">
      <header className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-white">Gemini 3 Pro</h2>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Reasoning Mode Active</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
            <span className="text-xs font-semibold text-gray-400">Deep Thinking</span>
            <button 
              onClick={() => setIsThinking(!isThinking)}
              className={`w-10 h-5 rounded-full transition-colors relative ${isThinking ? 'bg-orange-600' : 'bg-gray-700'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isThinking ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <svg className="w-16 h-16 mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
            <p className="text-lg font-medium text-gray-500">How can I help you think today?</p>
            <p className="text-sm text-gray-600 max-w-xs mt-2">Ask about complex logic, real-time events, or location-based services.</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-3xl px-6 py-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none'
            }`}>
              <div className="prose prose-invert prose-sm">
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
              
              {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingLinks.map((link, idx) => (
                      <a 
                        key={idx} 
                        href={link.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs bg-gray-900 px-2 py-1 rounded-md border border-gray-700 text-blue-400 hover:text-blue-300 transition-colors truncate max-w-[200px]"
                      >
                        {link.title || link.uri}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl rounded-tl-none px-6 py-4 flex gap-2 items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>

      <footer className="p-4 bg-gray-900/80 border-t border-gray-800">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe your complex problem..."
            className="w-full bg-gray-950 border border-gray-700 rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="absolute right-3 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </div>
        <p className="mt-3 text-[10px] text-center text-gray-600 uppercase tracking-widest font-bold">Powered by Gemini 3 Pro Reasoning Engine</p>
      </footer>
    </div>
  );
};

export default AIChat;
