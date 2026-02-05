
import React from 'react';
import { GroundingSource } from '../types';

interface MarketAnalysisProps {
  summary: string;
  sources: GroundingSource[];
}

export const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ summary, sources }) => {
  return (
    <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 card-blur p-8 rounded-3xl border-l-4 border-l-yellow-500">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Gemini Market Insight
        </h3>
        <p className="text-zinc-300 leading-relaxed italic">
          "{summary}"
        </p>
      </div>

      <div className="card-blur p-8 rounded-3xl">
        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">Verification Sources</h3>
        <div className="space-y-3">
          {sources.length > 0 ? sources.slice(0, 4).map((source, idx) => (
            <a 
              key={idx}
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium text-zinc-300 group"
            >
              <div className="w-2 h-2 rounded-full bg-yellow-500/50 group-hover:bg-yellow-500 transition-colors"></div>
              <span className="truncate">{source.title}</span>
              <svg className="w-3 h-3 ml-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )) : (
            <p className="text-xs text-zinc-500 italic">No grounding data available yet...</p>
          )}
        </div>
      </div>
    </div>
  );
};
