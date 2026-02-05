
import React, { useState, useMemo } from 'react';
import { PricePoint, UnitType } from '../types';
import { ComposedChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

interface PriceCardProps {
  data: PricePoint;
  unit: UnitType;
  quantity: number;
}

const COLOR_UP = '#22c55e'; // Green
const COLOR_DOWN = '#ef4444'; // Red

export const PriceCard: React.FC<PriceCardProps> = ({ data, unit, quantity }) => {
  const [selectedKarat, setSelectedKarat] = useState<'24K' | '22K'>('24K');

  const conversionFactor = useMemo(() => {
    switch (unit) {
      case 'vori': return 11.6638 / 31.1035;
      case 'g': return 1 / 31.1035;
      case 'kg': return 1000 / 31.1035;
      default: return 1;
    }
  }, [unit]);

  const karatMultiplier = selectedKarat === '24K' ? 1 : (22 / 24);
  const currentUnitPrice = data.price * conversionFactor * karatMultiplier;
  const currentTotalPrice = currentUnitPrice * (quantity || 0);

  const chartData = useMemo(() => {
    return data.history.map(item => {
      const open = item.open * conversionFactor * karatMultiplier;
      const close = item.close * conversionFactor * karatMultiplier;
      const high = item.high * conversionFactor * karatMultiplier;
      const low = item.low * conversionFactor * karatMultiplier;
      
      return {
        name: item.date,
        open,
        close,
        high,
        low,
        body: [open, close],
        wick: [low, high],
        isUp: close >= open
      };
    });
  }, [data.history, conversionFactor, karatMultiplier]);

  const locale = data.currency === 'BDT' ? 'bn-BD' : 'en-US';
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: data.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const isPositive = data.change24h >= 0;

  const getUnitLabel = () => {
    switch(unit) {
      case 'vori': return 'ভরি';
      case 'g': return 'গ্রাম';
      case 'kg': return 'কেজি';
      case 'oz': return 'আউন্স';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-[#09090b] border border-zinc-800 p-3 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-white font-black text-xs mb-2 border-b border-zinc-800 pb-1">{label}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500 text-[10px] font-bold uppercase">শুরু (Open):</span>
              <span className="text-white font-mono text-[10px]">{formatter.format(item.open)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500 text-[10px] font-bold uppercase">সর্বোচ্চ (High):</span>
              <span className="text-green-400 font-mono text-[10px]">{formatter.format(item.high)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500 text-[10px] font-bold uppercase">সর্বনিম্ন (Low):</span>
              <span className="text-red-400 font-mono text-[10px]">{formatter.format(item.low)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500 text-[10px] font-bold uppercase">শেষ (Close):</span>
              <span className="text-white font-mono text-[10px] font-black">{formatter.format(item.close)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card-blur p-5 rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/10 hover:border-yellow-500/40 group flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-black text-white group-hover:text-yellow-500 transition-colors flex items-center gap-2">
            {data.currency}
            <span className="text-xs font-normal text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded uppercase tracking-tighter">
              {data.symbol}
            </span>
          </h3>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">{data.country}</p>
        </div>
        <div className={`text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-inner ${isPositive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {Math.abs(data.change24h).toFixed(2)}%
        </div>
      </div>

      <div className="flex bg-black/40 p-1 rounded-xl mb-4 border border-zinc-800/50 self-start">
        <button onClick={() => setSelectedKarat('24K')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedKarat === '24K' ? 'bg-yellow-500 text-black' : 'text-zinc-500'}`}>24K</button>
        <button onClick={() => setSelectedKarat('22K')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedKarat === '22K' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}>22K</button>
      </div>

      <div className="flex flex-col flex-grow">
        <div className={`p-4 rounded-2xl border transition-all duration-500 ${selectedKarat === '24K' ? 'bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20 shadow-xl' : 'bg-zinc-900/40 border-zinc-800/50'}`}>
          <div className="flex justify-between items-baseline mb-3">
            <span className={`text-[11px] font-black uppercase tracking-widest ${selectedKarat === '24K' ? 'text-yellow-500' : 'text-zinc-400'}`}>
              {selectedKarat === '24K' ? '২৪ ক্যারেট' : '২২ ক্যারেট'}
            </span>
          </div>
          <div className="mb-3">
            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-0.5">প্রতি {getUnitLabel()}</p>
            <p className={`text-lg font-mono font-bold ${selectedKarat === '24K' ? 'text-zinc-100' : 'text-zinc-400'}`}>
              {formatter.format(currentUnitPrice)}
            </p>
          </div>
          <div className={`pt-3 border-t ${selectedKarat === '24K' ? 'border-yellow-500/10' : 'border-zinc-800/50'}`}>
            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-0.5">মোট ({quantity} {getUnitLabel()})</p>
            <p className={`text-2xl font-mono font-black tracking-tighter ${selectedKarat === '24K' ? 'text-white' : 'text-zinc-300'}`}>
              {formatter.format(currentTotalPrice)}
            </p>
          </div>
        </div>
      </div>

      {/* FIXED: Added minWidth and minHeight to ResponsiveContainer to stop warnings */}
      <div className="mt-6 h-36 w-full relative min-h-[144px]">
        <div className="absolute top-0 left-0 text-[8px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1 z-10">
          <Info size={8} /> ক্যান্ডেলস্টিক চার্ট (১২ দিন)
        </div>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={144}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="1 4" vertical={false} stroke="#27272a" />
            <XAxis dataKey="name" hide />
            <YAxis domain={['auto', 'auto']} hide />
            <Tooltip content={<CustomTooltip />} />
            
            <Bar dataKey="wick" barSize={1} isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-wick-${index}`} fill={entry.isUp ? COLOR_UP : COLOR_DOWN} />
              ))}
            </Bar>
            <Bar dataKey="body" barSize={8} radius={[1, 1, 1, 1]} isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-body-${index}`} fill={entry.isUp ? COLOR_UP : COLOR_DOWN} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex items-center gap-2">
        <div className="h-1 flex-1 bg-zinc-900 rounded-full overflow-hidden">
          <div className={`h-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: '65%' }}></div>
        </div>
        <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">Live Feed</span>
      </div>
    </div>
  );
};
