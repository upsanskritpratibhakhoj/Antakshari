
import React from 'react';
import { Shloka } from '../types';
import { getShlokaAudioUrl } from '../data/shlokaAudioDatabase';
import AudioPlayer from './AudioPlayer';

interface ShlokaDisplayProps {
  shloka: Shloka;
  sender: 'user' | 'ai' | 'system';
}

const ShlokaDisplay: React.FC<ShlokaDisplayProps> = ({ shloka, sender }) => {
  const isAi = sender === 'ai';
  const audioUrl = getShlokaAudioUrl(shloka.text);
  
  return (
    <div className={`flex flex-col gap-2 sm:gap-3 p-3 sm:p-5 rounded-xl shadow-sm border transition-all ${
      isAi ? 'bg-orange-50/50 border-orange-200 shadow-md' : 'bg-white border-gray-100'
    }`}>
      <div className="flex justify-between items-center mb-1">
        <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] ${isAi ? 'text-orange-500' : 'text-blue-500'}`}>
          {isAi ? 'ACHARYA (AI)' : 'YOU'}
        </span>
        {audioUrl && (
          <span className="text-[9px] sm:text-[10px] font-medium text-green-600 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            Audio Available
          </span>
        )}
      </div>
      
      <div className="devanagari text-base sm:text-xl md:text-2xl font-medium text-gray-800 leading-relaxed whitespace-pre-line text-center py-1 sm:py-2">
        {shloka.text || "..."}
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div className="mt-2 pt-3 border-t border-gray-200/50">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <span className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wide">Listen to Shloka</span>
          </div>
          <AudioPlayer audioUrl={audioUrl} compact />
        </div>
      )}
      
      {isAi && (
        <div className="flex justify-end mt-1 sm:mt-2">
          <div className="px-2 sm:px-3 py-1 bg-[#ed8936] text-white rounded-md text-[9px] sm:text-[10px] font-bold shadow-sm uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
            Next Challenge: <span className="devanagari text-xs sm:text-sm">{shloka.lastChar || "?"}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShlokaDisplay;
