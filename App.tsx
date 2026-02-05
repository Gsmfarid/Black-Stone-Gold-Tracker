
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MarketState, UnitType } from './types.ts';
import { fetchGoldMarketData } from './services/geminiService.ts';
import { Header } from './components/Header.tsx';
import { PriceCard } from './components/PriceCard.tsx';
import { MarketAnalysis } from './components/MarketAnalysis.tsx';

const CACHE_KEY = 'black_stone_market_data_v1';
const REFRESH_INTERVAL = 300000; // 5 minutes

const App: React.FC = () => {
  const [state, setState] = useState<MarketState>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return {
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated),
          isLoading: false,
          error: null
        };
      } catch (e) {
        localStorage.removeItem(CACHE_KEY);
      }
    }
    return {
      prices: [],
      lastUpdated: new Date(),
      sources: [],
      summary: '',
      isLoading: true,
      error: null,
    };
  });

  const [unit, setUnit] = useState<UnitType>('vori');
  const [quantity, setQuantity] = useState<number>(1);
  const isInitialMount = useRef(true);

  const updateMarketData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await fetchGoldMarketData();
      const newState = {
        prices: data.prices,
        lastUpdated: new Date(),
        sources: data.sources,
        summary: data.summary,
        isLoading: false,
        error: null,
      };
      setState(newState);
      localStorage.setItem(CACHE_KEY, JSON.stringify(newState));
    } catch (err: any) {
      console.error("App update error:", err);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: err.message || "বাজারের তথ্য লোড করতে সমস্যা হচ্ছে।"
      }));
    }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      updateMarketData();
      isInitialMount.current = false;
    }

    const interval = setInterval(updateMarketData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [updateMarketData]);

  if (state.isLoading && state.prices.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505]">
        <div className="relative mb-8">
           <div className="w-20 h-20 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-10 h-10 bg-zinc-900 rounded-lg rotate-45 border border-yellow-500/30"></div>
           </div>
        </div>
        <h2 className="text-xl font-bold gold-gradient animate-pulse">Black Stone Syncing...</h2>
        <p className="text-zinc-500 text-xs mt-2 uppercase tracking-widest">Global Bullion Exchange Data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-12 lg:p-16 max-w-7xl mx-auto">
      <Header lastUpdated={state.lastUpdated} isLoading={state.isLoading} />

      {state.error && (
        <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between shadow-lg shadow-red-500/5">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{state.error}</span>
          </div>
          <button onClick={() => updateMarketData()} className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all text-xs font-bold">RETRY</button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center mb-10 gap-6 bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <div className="w-full sm:w-auto">
            <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2 ml-1">পরিমাণ (Quantity)</label>
            <input 
              type="number" 
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              className="bg-black/60 border border-zinc-800 rounded-xl px-4 py-2.5 w-full sm:w-32 font-mono text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all text-lg"
            />
          </div>

          <div className="w-full sm:w-auto">
            <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2 ml-1">একক (Unit)</label>
            <div className="flex gap-1 p-1 bg-black/60 rounded-xl border border-zinc-800">
              {(['vori', 'g', 'kg', 'oz'] as UnitType[]).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    unit === u ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {u === 'vori' ? 'ভরি' : u === 'oz' ? 'OZ' : u === 'g' ? 'G' : 'KG'}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">সিস্টেম স্ট্যাটাস</p>
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
            <span className={`w-2 h-2 rounded-full ${state.error ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></span>
            {state.error ? 'Limited Access Mode' : 'Live Market Feed Active'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {state.prices.map((price) => (
          <PriceCard key={price.currency} data={price} unit={unit} quantity={quantity} />
        ))}
      </div>

      <MarketAnalysis summary={state.summary} sources={state.sources} />

      <footer className="mt-20 pt-8 border-t border-zinc-800/50 text-center text-zinc-600 text-[10px] uppercase tracking-[0.3em] font-bold">
        Black Stone Intelligence • Gold Standard Analysis • {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
