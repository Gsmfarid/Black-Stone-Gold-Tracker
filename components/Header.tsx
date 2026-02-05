
import React from 'react';

interface HeaderProps {
  lastUpdated: Date;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ lastUpdated, isLoading }) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-1">
          <span className="gold-gradient">Black Stone</span> Gold Tracker
        </h1>
        <p className="text-gray-400 text-sm font-medium">
          Real-time Global Bullion Monitoring Dashboard
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
          <div className={`w-2 h-2 rounded-full mr-2 ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 live-indicator'}`}></div>
          <span className="text-xs uppercase tracking-widest text-zinc-300 font-semibold">
            {isLoading ? 'Updating...' : 'Live Market'}
          </span>
        </div>
        
        <div className="text-right">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Last Synchronized</p>
          <p className="text-sm font-mono text-zinc-300">
            {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
      </div>
    </header>
  );
};