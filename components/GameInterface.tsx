
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Shloka, GameMessage, GameStatus, ValidationResponse } from '../types';
import { INITIAL_SHLOKA } from '../constants';
import { validateAndGetAiResponse } from '../services/geminiService';
import ShlokaDisplay from './ShlokaDisplay';

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const GameInterface: React.FC = () => {
  const [messages, setMessages] = useState<GameMessage[]>([
    {
      id: 'initial',
      sender: 'ai',
      content: '',
      shloka: INITIAL_SHLOKA,
      timestamp: Date.now()
    }
  ]);
  const [status, setStatus] = useState<GameStatus>(GameStatus.PLAYING);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Find the last shloka in history to determine the target character
  const currentTargetChar = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].shloka) {
        return messages[i].shloka!.lastChar;
      }
    }
    return '';
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  const processTurn = async (input: string | { data: string; mimeType: string }) => {
    const isAudio = typeof input !== 'string';
    const tempId = Date.now().toString();
    
    // Preliminary user message
    const userMsg: GameMessage = {
      id: tempId,
      sender: 'user',
      content: isAudio ? "Reciting..." : input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setStatus(GameStatus.LOADING);

    const history = messages.map(m => ({ 
      sender: m.sender, 
      content: m.shloka?.text || m.content 
    }));
    
    const result = await validateAndGetAiResponse(input, currentTargetChar, history);

    if (result.isValid && result.shlokaDetails && result.aiResponse) {
      const updatedUserMsg: GameMessage = {
        ...userMsg,
        shloka: result.shlokaDetails,
        content: result.shlokaDetails.text,
        isValid: true
      };
      
      setScore(s => s + 10);

      const aiMsg: GameMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: '',
        shloka: result.aiResponse,
        timestamp: Date.now()
      };

      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempId);
        return [...filtered, updatedUserMsg, aiMsg];
      });
    } else {
      // Show the actual error from AI if available, otherwise show generic message
      const errorMsg: GameMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'system',
        content: result.error || `Please provide a valid Sanskrit shloka starting with '${currentTargetChar}'.`,
        timestamp: Date.now()
      };
      setMessages(prev => {
        // If it was audio, we keep the "Reciting..." text but mark it as invalid/system error
        // If text, we just append the error
        return [...prev, errorMsg];
      });
    }
    setStatus(GameStatus.PLAYING);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || status === GameStatus.LOADING) return;
    processTurn(inputValue);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const base64Data = await blobToBase64(audioBlob);
        processTurn({ data: base64Data, mimeType: 'audio/webm' });
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied", err);
      const errorMsg: GameMessage = {
        id: Date.now().toString(),
        sender: 'system',
        content: "Microphone access denied. Please enable permissions to speak.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-orange-100">
      {/* Header Info */}
      <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-saffron flex items-center justify-center text-white font-bold text-xl shadow-inner">
            अ
          </div>
          <div>
            <h3 className="font-bold text-gray-800 tracking-tight">Shloka Session</h3>
            <p className="text-xs text-gray-500">Required: <span className="font-bold text-[#ed8936] text-sm devanagari">{currentTargetChar}</span></p>
          </div>
        </div>
        <div className="bg-white px-5 py-1.5 rounded-full border border-orange-200 shadow-sm flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Score:</span>
          <span className="text-xl font-black text-[#ed8936]">{score}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fffaf0]/30 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.sender === 'system' ? 'w-full text-center' : ''}`}>
              {msg.sender === 'system' ? (
                <div className="py-3 px-5 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 italic shadow-sm">
                  {msg.content}
                </div>
              ) : msg.shloka ? (
                <ShlokaDisplay shloka={msg.shloka} sender={msg.sender} />
              ) : (
                <div className={`p-4 rounded-xl shadow-sm border ${
                  msg.sender === 'user' 
                  ? 'bg-blue-600 text-white border-blue-700 rounded-tr-none' 
                  : 'bg-white border-gray-100 text-gray-800 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              )}
            </div>
          </div>
        ))}
        {status === GameStatus.LOADING && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acharya is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-5 bg-white border-t border-orange-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleSubmit} className="flex gap-3 items-center max-w-3xl mx-auto">
          <div className="relative flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-orange-400/50 transition-all px-4 group">
             <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isRecording ? "Listening..." : `Enter shloka starting with '${currentTargetChar}'`}
              className="flex-1 py-4 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 font-medium"
              disabled={status === GameStatus.LOADING || isRecording}
            />
            <div className="flex items-center gap-4 border-l border-gray-200 ml-4 pl-4 h-8">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`transition-all ${isRecording ? 'text-red-500 scale-125 animate-pulse' : 'text-gray-400 hover:text-orange-500 hover:scale-110'}`}
                title={isRecording ? "Stop Recording" : "Record Shloka"}
                disabled={status === GameStatus.LOADING}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <div className="text-orange-500 font-black text-xl select-none devanagari pb-0.5 min-w-[1.2rem] text-center">
                {currentTargetChar}
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={status === GameStatus.LOADING || isRecording || !inputValue.trim()}
            className="px-8 py-4 bg-saffron text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 shadow-lg flex items-center gap-2 group overflow-hidden"
          >
            <span>Send</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
        <p className="mt-3 text-[9px] text-gray-400 text-center uppercase tracking-[0.2em] font-bold">
          Sanskrit Shloka Antakshari Practice
        </p>
      </div>
    </div>
  );
};

export default GameInterface;
