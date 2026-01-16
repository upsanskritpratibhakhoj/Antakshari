
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Shloka, GameMessage, GameStatus, ValidationResponse } from '../types';
import { getRandomInitialShloka } from '../constants';
import { lookupShlokaLocally } from '../services/localShlokaService';
import { processUserInput, getTransliterationPreview, containsDevanagari } from '../services/transliterationService';
import ShlokaDisplay from './ShlokaDisplay';

const GameInterface: React.FC = () => {
  const [messages, setMessages] = useState<GameMessage[]>(() => {
    const initialShloka = getRandomInitialShloka();
    return [
      {
        id: 'initial',
        sender: 'ai',
        content: '',
        shloka: initialShloka,
        timestamp: Date.now()
      }
    ];
  });
  const [status, setStatus] = useState<GameStatus>(GameStatus.PLAYING);
  const [inputValue, setInputValue] = useState('');
  const [score, setScore] = useState(0);
  const [usedShlokas, setUsedShlokas] = useState<Set<string>>(() => {
    const initialShloka = getRandomInitialShloka();
    return new Set([initialShloka.text.trim().toLowerCase()]);
  });
  const [transliterationPreview, setTransliterationPreview] = useState<string>('');
  const [isGameTerminated, setIsGameTerminated] = useState<boolean>(false);
  const [terminationReason, setTerminationReason] = useState<string>('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Anti-cheat: Detect tab switching, minimizing, or leaving the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isGameTerminated) {
        setIsGameTerminated(true);
        setTerminationReason('आपने टैब स्विच किया या विंडो मिनिमाइज़ की। खेल समाप्त! (You switched tabs or minimized the window. Game Over!)');
        setStatus(GameStatus.OVER);
      }
    };

    const handleBlur = () => {
      if (!isGameTerminated) {
        setIsGameTerminated(true);
        setTerminationReason('आपने विंडो से फोकस हटाया। खेल समाप्त! (You left the window. Game Over!)');
        setStatus(GameStatus.OVER);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isGameTerminated) {
        e.preventDefault();
        e.returnValue = 'खेल चल रहा है। क्या आप वाकई पेज छोड़ना चाहते हैं? (Game is in progress. Are you sure you want to leave?)';
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isGameTerminated]);

  // Update transliteration preview when input changes
  useEffect(() => {
    if (inputValue.trim() && !containsDevanagari(inputValue)) {
      const preview = getTransliterationPreview(inputValue);
      setTransliterationPreview(preview.isTransliterated ? preview.devanagari : '');
    } else {
      setTransliterationPreview('');
    }
  }, [inputValue]);

  const processTurn = async (input: string) => {
    const tempId = Date.now().toString();
    
    // Process input through transliteration if it's in Roman script
    const processedInput = processUserInput(input);
    
    // Normalize input for comparison
    const normalizedInput = processedInput.trim().toLowerCase();
    
    // Check if shloka has been used before
    if (usedShlokas.has(normalizedInput)) {
      const errorMsg: GameMessage = {
        id: tempId,
        sender: 'system',
        content: 'यह श्लोक पहले ही बोला जा चुका है! कृपया कोई अन्य श्लोक बताएं। (This shloka has already been used! Please provide a different shloka.)',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
      setInputValue('');
      return;
    }
    
    // Preliminary user message
    const userMsg: GameMessage = {
      id: tempId,
      sender: 'user',
      content: processedInput,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setTransliterationPreview('');
    setStatus(GameStatus.LOADING);

    // Get all used shlokas as an array
    const previousShlokas: string[] = Array.from(usedShlokas);
    
    // Lookup shloka in local database only
    const result = lookupShlokaLocally(processedInput, currentTargetChar, previousShlokas);

    if (result.found && result.userShloka && result.aiShloka) {
      // Add both user's shloka and AI's response to used shlokas set
      setUsedShlokas(prev => {
        const newSet = new Set(prev);
        newSet.add(result.userShloka!.text.trim().toLowerCase());
        newSet.add(result.aiShloka!.text.trim().toLowerCase());
        return newSet;
      });
      
      const updatedUserMsg: GameMessage = {
        ...userMsg,
        shloka: result.userShloka,
        content: result.userShloka.text,
        isValid: true
      };
      
      setScore(s => s + 10);

      const aiMsg: GameMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: '',
        shloka: result.aiShloka,
        timestamp: Date.now()
      };

      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempId);
        return [...filtered, updatedUserMsg, aiMsg];
      });
    } else {
      // Show error from local lookup
      const errorMsg: GameMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'system',
        content: result.error || `श्लोक डेटाबेस में नहीं मिला। कृपया एक मान्य संस्कृत श्लोक '${currentTargetChar}' से प्रदान करें। (Shloka not found in database. Please provide a valid Sanskrit shloka starting with '${currentTargetChar}'.)`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    }
    setStatus(GameStatus.PLAYING);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || status === GameStatus.LOADING) return;
    processTurn(inputValue);
  };

  const restartGame = () => {
    const newInitialShloka = getRandomInitialShloka();
    setMessages([
      {
        id: 'initial',
        sender: 'ai',
        content: '',
        shloka: newInitialShloka,
        timestamp: Date.now()
      }
    ]);
    setScore(0);
    setUsedShlokas(new Set([newInitialShloka.text.trim().toLowerCase()]));
    setInputValue('');
    setTransliterationPreview('');
    setIsGameTerminated(false);
    setTerminationReason('');
    setStatus(GameStatus.PLAYING);
  };

  // Show game terminated screen if cheating detected
  if (isGameTerminated) {
    return (
      <div className="flex flex-col h-[calc(100vh-100px)] sm:h-[calc(100vh-140px)] max-w-4xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-red-200">
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-red-50 to-white">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 text-center devanagari">खेल समाप्त!</h2>
          <p className="text-lg sm:text-xl text-gray-700 mb-2 text-center font-semibold">Game Terminated</p>
          <p className="text-sm sm:text-base text-gray-600 mb-6 text-center max-w-md px-4 devanagari">
            {terminationReason}
          </p>
          <div className="bg-orange-50 rounded-xl p-4 mb-6 border border-orange-200">
            <p className="text-sm text-gray-600 text-center">
              <span className="font-semibold">आपका अंतिम स्कोर:</span> <span className="text-xl font-black text-orange-500">{score}</span>
            </p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 mb-8 border border-yellow-200 max-w-md">
            <p className="text-xs sm:text-sm text-yellow-800 text-center">
              <span className="font-bold">नोट:</span> खेल के दौरान टैब स्विच करना, विंडो मिनिमाइज़ करना, या अन्य विंडो खोलना मना है।<br/>
              (Switching tabs, minimizing window, or opening other windows is not allowed during the game.)
            </p>
          </div>
          <button
            onClick={restartGame}
            className="px-8 py-4 bg-saffron text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center gap-3 text-base sm:text-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>पुनः आरंभ करें (Restart Game)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col h-[calc(100vh-100px)] sm:h-[calc(100vh-140px)] max-w-4xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-orange-100"
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Header Info */}
      <div className="bg-orange-50 px-3 sm:px-6 py-3 sm:py-4 border-b border-orange-100 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-saffron flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-inner">
            अ
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-gray-800 tracking-tight">Shloka Session</h3>
            <p className="text-[10px] sm:text-xs text-gray-500">Required: <span className="font-bold text-[#ed8936] text-xs sm:text-sm devanagari">{currentTargetChar}</span></p>
          </div>
        </div>
        <div className="bg-white px-3 sm:px-5 py-1 sm:py-1.5 rounded-full border border-orange-200 shadow-sm flex items-center gap-1 sm:gap-2">
          <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-widest hidden sm:inline">Score:</span>
          <span className="text-base sm:text-xl font-black text-[#ed8936]">{score}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-[#fffaf0]/30 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] sm:max-w-[85%] ${msg.sender === 'system' ? 'w-full text-center' : ''}`}>
              {msg.sender === 'system' ? (
                <div className="py-2 sm:py-3 px-3 sm:px-5 bg-red-50 text-red-600 rounded-xl text-xs sm:text-sm border border-red-100 italic shadow-sm">
                  {msg.content}
                </div>
              ) : msg.shloka ? (
                <ShlokaDisplay shloka={msg.shloka} sender={msg.sender} />
              ) : (
                <div className={`p-3 sm:p-4 rounded-xl shadow-sm border text-sm sm:text-base ${
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
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 flex items-center gap-2 sm:gap-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acharya is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-5 bg-white border-t border-orange-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 items-center max-w-3xl mx-auto">
          <div className="relative flex-1 flex flex-col bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-orange-400/50 transition-all px-3 sm:px-4 group">
            <div className="flex items-center w-full">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`श्लोक के आरंभिक ('${currentTargetChar}') से न्यूनतम दो पद लिखें।`}
                className="flex-1 py-3 sm:py-4 bg-transparent focus:outline-none placeholder-gray-400 font-medium text-gray-700 text-sm sm:text-base"
                disabled={status === GameStatus.LOADING}
              />
              <div className="flex items-center gap-2 sm:gap-4 border-l border-gray-200 ml-2 sm:ml-4 pl-2 sm:pl-4 h-6 sm:h-8">
                <div className="text-orange-500 font-black text-lg sm:text-xl select-none devanagari pb-0.5 min-w-[1rem] sm:min-w-[1.2rem] text-center">
                  {currentTargetChar}
                </div>
              </div>
            </div>
            {transliterationPreview && (
              <div className="pb-2 -mt-1 text-xs sm:text-sm text-orange-600 devanagari truncate">
                <span className="text-gray-400 text-[10px] mr-1">Preview:</span>
                {transliterationPreview}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={status === GameStatus.LOADING || !inputValue.trim()}
            className="px-4 sm:px-8 py-3 sm:py-4 bg-saffron text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 shadow-lg flex items-center gap-1 sm:gap-2 group overflow-hidden text-sm sm:text-base"
          >
            <span className="hidden sm:inline">Send</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
        <p className="mt-2 sm:mt-3 text-[8px] sm:text-[9px] text-gray-400 text-center uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold">
          Sanskrit Shloka Antakshari Practice
        </p>
      </div>
    </div>
  );
};

export default GameInterface;