
import React from 'react';

interface HeaderProps {
  lastUpdated: Date;
  isLoading: boolean;
}

const Logo = () => (
  <div className="relative w-12 h-12 flex items-center justify-center group cursor-pointer">
    {/* Outer Glow */}
    <div className="absolute inset-0 bg-yellow-500/20 rounded-xl blur-xl group-hover:bg-yellow-500/30 transition-all duration-700"></div>
    
    {/* Geometric Stone Shape */}
    <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 drop-shadow-2xl">
      <defs>
        <linearGradient id="stoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#1a1a1a', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="goldEdge" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#f6d365', stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: '#fda085', stopOpacity: 0.2 }} />
        </linearGradient>
      </defs>
      
      {/* Hexagonal Stone Base */}
      <path 
        d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z" 
        fill="url(#stoneGradient)" 
        stroke="url(#goldEdge)" 
        strokeWidth="1.5"
      />
      
      {/* Inner Facet */}
      <path 
        d="M50 15 L82 33 L82 67 L50 85 L18 67 L18 33 Z" 
        fill="rgba(255,255,255,0.03)" 
      />
      
      {/* The 'S' Facet Highlight */}
      <path 
        d="M40 35 L60 35 L60 45 L40 55 L60 55 L60 65 L40 65" 
        fill="none" 
        stroke="#f6d365" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="opacity-80"
      />
    </svg>
    
    {/* Reflection Shine */}
    <div className="absolute top-2 left-2 w-4 h-8 bg-white/10 -rotate-45 blur-md pointer-events-none"></div>
  </div>
);

export const Header: React.FC<HeaderProps> = ({ lastUpdated, isLoading }) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
      <div className="flex items-center gap-5">
        <Logo />
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-0.5 leading-none">
            <span className="gold-gradient">Black Stone</span>
            <span className="text-white ml-2 font-light">Gold</span>
          </h1>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] font-bold">
            Premium Bullion Analytics
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end mr-2">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black mb-1">Market Pulse</p>
          <div className="flex items-center bg-zinc-950/50 px-3 py-1.5 rounded-full border border-zinc-800/50 shadow-inner">
            <div className={`w-1.5 h-1.5 rounded-full mr-2.5 ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 live-indicator'}`}></div>
            <span className="text-[9px] uppercase tracking-[0.15em] text-zinc-400 font-bold">
              {isLoading ? 'Syncing...' : 'Real-time'}
            </span>
          </div>
        </div>
        
        <div className="h-10 w-px bg-zinc-800/50 hidden md:block"></div>
        
        <div className="text-right">
          <p className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] font-black mb-1">Global Standard Time</p>
          <p className="text-base font-mono text-zinc-100 font-bold tracking-tighter">
            {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </p>
        </div>
      </div>
    </header>
  );
};
