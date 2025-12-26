
import React, { useState } from 'react';
import GameInterface from './components/GameInterface';
import { RULES } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'game' | 'learn'>('home');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="bg-white border-b border-orange-100 py-4 px-6 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setView('home')}
          >
            <div className="w-12 h-12 bg-saffron rounded-lg flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
              <span className="devanagari text-2xl font-bold">श</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 tracking-tight">श्लोक चक्र</h1>
              <p className="text-xs text-saffron font-bold tracking-widest uppercase">Sanskrit Shloka Game</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-6">
            <button 
              onClick={() => setView('home')}
              className={`text-sm font-semibold transition-colors ${view === 'home' ? 'text-orange-600' : 'text-gray-500 hover:text-orange-600'}`}
            >
              Home
            </button>
            <button 
              onClick={() => setView('game')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                view === 'game' 
                ? 'bg-saffron text-white shadow-md' 
                : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
              }`}
            >
              Practice Now
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {view === 'home' && (
          <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn">
            <section className="text-center space-y-6 py-10 px-4">
              <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
                <span className="text-gray-900 block mb-2">संस्कृत श्लोकों से</span>
                <span className="text-saffron block">जीत की तैयारी</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
                हमारी एआई के साथ संस्कृत श्लोक अंताक्षरी खेलकर अपने ज्ञान की परीक्षा लें और अभ्यास करें।
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <button 
                  onClick={() => setView('game')}
                  className="px-8 py-4 bg-saffron text-white rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition-all"
                >
                  Start New Game
                </button>
                <button 
                  className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all"
                  onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                >
                  How to Play
                </button>
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-8 pt-10">
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-orange-50">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-saffron">📜</span> खेल के नियम
                </h3>
                <ul className="space-y-4">
                  {RULES.map((rule, idx) => (
                    <li key={idx} className="flex gap-3 text-gray-600">
                      <span className="w-6 h-6 rounded-full bg-orange-100 text-saffron flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        {idx + 1}
                      </span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-saffron p-8 rounded-3xl shadow-lg text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-6">अभ्यास क्यों करें?</h3>
                  <div className="space-y-4 opacity-95">
                    <p className="font-medium">✨ आध्यात्मिक समृद्धि</p>
                    <p className="font-medium">✨ भाषाई सटीकता</p>
                    <p className="font-medium">✨ स्मृति वृद्धि</p>
                    <p className="font-medium">✨ सांस्कृतिक संबंध</p>
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/20">
                    <p className="italic text-sm">"संस्कृत सीखना भारतीय सभ्यता की आत्मा में यात्रा है।"</p>
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 text-9xl opacity-10 font-bold select-none">
                  SANSKRIT
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'game' && <GameInterface />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="devanagari text-2xl text-saffron mb-4">
            ॐ सर्वे भवन्तु सुखिनः
          </div>
          <p className="text-sm">© 2024 Sanskrit Shloka Antakshari. Dedicated to the preservation of Vedic knowledge.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
