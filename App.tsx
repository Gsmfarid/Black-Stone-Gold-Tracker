
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MarketState, UnitType } from './types';
import { fetchGoldMarketData } from './services/geminiService';
import { Header } from './components/Header';
import { PriceCard } from './components/PriceCard';
import { MarketAnalysis } from './components/MarketAnalysis';

const CACHE_KEY = 'black_stone_market_data';
const REFRESH_INTERVAL = 300000; // 5 minutes - safe with public APIs
const COOLDOWN_INTERVAL = 60000; // 1 minute retry if something goes wrong

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
        console.error("Failed to parse cached data");
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
  const lastFetchTime = useRef<number>(Date.now());

  const updateMarketData = useCallback(async (isManual = false) => {
    // throttle manual refreshes
    const now = Date.now();
    if (isManual && now - lastFetchTime.current < 10000) {
       return;
    }

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
      lastFetchTime.current = Date.now();
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: "বাজারের তথ্য লোড করতে সমস্যা হচ্ছে। কিছুক্ষণ পর আবার চেষ্টা করুন।"
      }));
    }
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const age = Date.now() - new Date(parsed.lastUpdated).getTime();
      if (age > REFRESH_INTERVAL) {
        updateMarketData();
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      updateMarketData();
    }

    const interval = setInterval(() => {
      updateMarketData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [updateMarketData]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setQuantity(isNaN(val) ? 0 : val);
  };

  return (
    <div className="min-h-screen p-4 md:p-12 lg:p-16 max-w-7xl mx-auto">
      <Header lastUpdated={state.lastUpdated} isLoading={state.isLoading} />

      {state.error && (
        <div className="mb-8 p-4 rounded-xl text-sm flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/20 text-red-400">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {state.error}
          </div>
          <button 
            onClick={() => updateMarketData(true)}
            disabled={state.isLoading}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-[10px] font-bold uppercase transition-colors"
          >
            Retry Now
          </button>
        </div>
      )}

      {/* Interactive Control Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center mb-10 gap-6 bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <div className="w-full sm:w-auto">
            <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2 ml-1">পরিমাণ (Quantity)</label>
            <div className="relative group">
              <input 
                type="number" 
                value={quantity}
                onChange={handleQuantityChange}
                min="0"
                step="0.01"
                className="bg-black/60 border border-zinc-800 rounded-xl px-4 py-2.5 w-full sm:w-32 font-mono text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all text-lg"
                placeholder="0.00"
              />
              <div className="absolute inset-0 rounded-xl bg-yellow-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2 ml-1">পরিমাপের একক (Unit)</label>
            <div className="flex gap-1 p-1 bg-black/60 rounded-xl border border-zinc-800 overflow-x-auto sm:overflow-visible">
              {(['vori', 'g', 'kg', 'oz'] as UnitType[]).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`whitespace-nowrap px-4 lg:px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    unit === u 
                      ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' 
                      : 'text-zinc-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {u === 'vori' ? 'ভরি' : u === 'oz' ? 'Oz' : u === 'g' ? 'Gram' : 'KG'}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">সিস্টেম স্ট্যাটাস</p>
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            High Efficiency Open Data Sync
          </div>
        </div>
      </div>

      {/* Grid of Prices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {state.prices.length > 0 ? (
          state.prices.map((price) => (
            <PriceCard key={price.currency} data={price} unit={unit} quantity={quantity} />
          ))
        ) : (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card-blur p-6 rounded-2xl h-64 animate-pulse bg-zinc-900/50"></div>
          ))
        )}
      </div>

      <MarketAnalysis summary={state.summary} sources={state.sources} />

      <footer className="mt-20 pt-8 border-t border-zinc-800/50 text-center text-zinc-600 text-[10px] uppercase tracking-[0.3em] font-bold">
        Black Stone Intelligence • Open Source API Powered • {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
