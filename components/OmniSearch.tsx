
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { blobToBase64 } from '../utils/audio-utils';
import { Language } from '../types';

// Add props interface to include language
interface OmniSearchProps {
  language: Language;
}

const OmniSearch: React.FC<OmniSearchProps> = ({ language }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleSearch = async () => {
    if (!query || files.length === 0) return;
    setIsSearching(true);
    setResult(null);
    try {
      const payloads = await Promise.all(files.map(async f => ({
        data: await blobToBase64(f),
        mimeType: f.type
      })));
      const response = await geminiService.omniSearch(query, payloads);
      setResult(response || "No data found.");
    } catch (error) {
      console.error(error);
      alert("Search failed.");
    } finally {
      setIsSearching(false);
    }
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-1000">
      <header className="text-center space-y-4">
        <h2 className="text-5xl font-black text-white tracking-tighter">Omni-Search</h2>
        <p className="text-gray-500 text-lg">Query across images, videos, and audio in one shared context.</p>
      </header>

      <div className="space-y-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-[2rem] p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <label className="aspect-square border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center hover:border-blue-500/50 transition-all cursor-pointer group">
              <input type="file" multiple onChange={handleFileUpload} className="hidden" />
              <svg className="w-8 h-8 text-gray-700 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2"/></svg>
              <span className="text-[10px] font-black text-gray-600 mt-2 uppercase tracking-widest">Add Files</span>
            </label>
            
            {files.map((f, i) => (
              <div key={i} className="aspect-square bg-gray-950 border border-gray-800 rounded-3xl p-4 flex flex-col justify-between relative group overflow-hidden">
                <button 
                  onClick={() => removeFile(i)}
                  className="absolute top-2 right-2 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg>
                </button>
                <div className="text-center">
                  <div className="text-2xl mb-1">
                    {f.type.startsWith('image') ? '🖼️' : f.type.startsWith('video') ? '🎥' : '🔊'}
                  </div>
                  <p className="text-[10px] text-gray-400 truncate w-full">{f.name}</p>
                </div>
                <div className="text-[8px] font-bold text-gray-600 uppercase text-center">
                  {(f.size / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>
            ))}
          </div>

          <div className="relative">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-gray-950 border-2 border-gray-800 rounded-2xl px-8 py-6 outline-none focus:border-blue-600 transition-all font-medium text-lg pr-32"
              placeholder="e.g., 'Compare the person in the video to the first photo...'"
            />
            <button 
              onClick={handleSearch}
              disabled={isSearching || !query || files.length === 0}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all rounded-xl font-black text-xs shadow-xl shadow-blue-500/20"
            >
              {isSearching ? "Thinking..." : "Search Context"}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-gray-900/80 border border-blue-500/20 rounded-[2.5rem] p-10 animate-in slide-in-from-bottom-8">
            <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] mb-6">Omni-Analysis Result</h4>
            <div className="prose prose-invert prose-blue max-w-none text-gray-300 leading-relaxed text-lg">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OmniSearch;
