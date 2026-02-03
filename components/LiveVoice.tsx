
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { decode, encode, decodeAudioData } from '../utils/audio-utils';
import { Language } from '../types';

// Add props interface to include language
interface LiveVoiceProps {
  language: Language;
}

const LiveVoice: React.FC<LiveVoiceProps> = ({ language }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const stopConversation = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsActive(false);
    setStatus('idle');
    for (const s of sourcesRef.current) {
      try { s.stop(); } catch (e) {}
    }
    sourcesRef.current.clear();
  }, []);

  const startConversation = async () => {
    setIsActive(true);
    setStatus('connecting');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = outCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('listening');
            const source = inCtx.createMediaStreamSource(stream);
            const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscript(prev => [...prev, `Model: ${message.serverContent?.outputTranscription?.text}`]);
            }
            if (message.serverContent?.inputTranscription) {
              setTranscript(prev => [...prev, `You: ${message.serverContent?.inputTranscription?.text}`]);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
            if (base64Audio) {
              setStatus('speaking');
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setStatus('listening');
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const s of sourcesRef.current) s.stop();
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error("Live Error:", e),
          onclose: () => stopConversation(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: 'You are OmniGen, a helpful and hyper-intelligent AI creative companion. Your voice is warm, confident, and professional.'
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsActive(false);
      setStatus('idle');
      alert("Microphone access or connection failed.");
    }
  };

  useEffect(() => {
    return () => {
      stopConversation();
    };
  }, [stopConversation]);

  return (
    <div className="flex flex-col items-center justify-center space-y-12 max-w-4xl mx-auto h-[70vh]">
      <div className="relative group">
        {/* Animated Rings */}
        <div className={`absolute -inset-10 bg-blue-600/20 rounded-full blur-3xl transition-opacity duration-1000 ${isActive ? 'opacity-100 scale-150' : 'opacity-0 scale-100'}`} />
        <div className={`absolute -inset-20 bg-purple-600/10 rounded-full blur-3xl transition-opacity duration-1000 delay-150 ${isActive ? 'opacity-100 scale-125' : 'opacity-0 scale-100'}`} />
        
        <button 
          onClick={isActive ? stopConversation : startConversation}
          className={`relative z-10 w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-500 transform hover:scale-105 ${
            isActive 
              ? 'bg-red-600 shadow-[0_0_60px_rgba(220,38,38,0.4)]' 
              : 'bg-white shadow-[0_0_60px_rgba(255,255,255,0.2)]'
          }`}
        >
          <div className={`text-4xl mb-2 ${isActive ? 'text-white' : 'text-gray-950'}`}>
            {isActive ? (
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H10a1 1 0 01-1-1v-4z"/></svg>
            ) : (
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
            )}
          </div>
          <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-950'}`}>
            {isActive ? 'Stop' : 'Speak'}
          </span>
        </button>
        
        {/* Visualizer bars */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
          {isActive && [1, 2, 3, 4, 5, 6, 7].map(i => (
            <div 
              key={i} 
              className="w-1 bg-white/40 rounded-full animate-bounce" 
              style={{ height: `${20 + Math.random() * 60}px`, animationDuration: `${0.5 + Math.random()}s` }} 
            />
          ))}
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          {status === 'idle' && "Ready to talk?"}
          {status === 'connecting' && "Establishing secure link..."}
          {status === 'listening' && "I'm listening..."}
          {status === 'speaking' && "Synthesizing response..."}
        </h2>
        <p className="text-gray-500 text-sm">Experience the world's most advanced real-time AI conversation engine.</p>
      </div>

      {transcript.length > 0 && (
        <div className="w-full bg-gray-900/40 border border-gray-800 rounded-3xl p-6 h-64 overflow-y-auto no-scrollbar mask-gradient">
           {transcript.map((t, idx) => (
             <div key={idx} className={`mb-3 text-sm ${t.startsWith('You:') ? 'text-blue-400' : 'text-gray-300'}`}>
                {t}
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default LiveVoice;
