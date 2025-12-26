
import React from 'react';
import { Shloka } from '../types';

interface ShlokaDisplayProps {
  shloka: Shloka;
  sender: 'user' | 'ai' | 'system';
}

const ShlokaDisplay: React.FC<ShlokaDisplayProps> = ({ shloka, sender }) => {
  const isAi = sender === 'ai';
  
  return (
    <div className={`flex flex-col gap-3 p-5 rounded-xl shadow-sm border transition-all ${
      isAi ? 'bg-orange-50/50 border-orange-200 shadow-md' : 'bg-white border-gray-100'
    }`}>
      <div className="flex justify-between items-center mb-1">
        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isAi ? 'text-orange-500' : 'text-blue-500'}`}>
          {isAi ? 'ACHARYA (AI)' : 'YOU'}
        </span>
      </div>
      
      <div className="devanagari text-xl md:text-2xl font-medium text-gray-800 leading-relaxed whitespace-pre-line text-center py-2">
        {shloka.text || "..."}
      </div>
      
      {isAi && (
        <div className="flex justify-end mt-2">
          <div className="px-3 py-1 bg-[#ed8936] text-white rounded-md text-[10px] font-bold shadow-sm uppercase tracking-wider flex items-center gap-1.5">
            Next Challenge: <span className="devanagari text-sm">{shloka.lastChar || "?"}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShlokaDisplay;
