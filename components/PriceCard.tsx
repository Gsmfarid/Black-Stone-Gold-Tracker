
import React from 'react';
import { PricePoint, UnitType } from '../types';

interface PriceCardProps {
  data: PricePoint;
  unit: UnitType;
  quantity: number;
}

export const PriceCard: React.FC<PriceCardProps> = ({ data, unit, quantity }) => {
  const getConvertedUnitPrice = () => {
    // API returns price per Troy Ounce (31.1035g)
    const pricePerGram = data.price / 31.1035;
    
    switch (unit) {
      case 'vori': return pricePerGram * 11.6638; // 1 Vori = 11.6638g
      case 'g': return pricePerGram;
      case 'kg': return pricePerGram * 1000;
      default: return data.price; // oz
    }
  };

  const unitPrice = getConvertedUnitPrice();
  const totalPrice = unitPrice * (quantity || 0);

  // Using BDT specific locale for Taka
  const locale = data.currency === 'BDT' ? 'bn-BD' : 'en-US';
  
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: data.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedUnitPrice = formatter.format(unitPrice);
  const formattedTotalPrice = formatter.format(totalPrice);

  const isPositive = data.change24h >= 0;

  const getUnitLabel = () => {
    switch(unit) {
      case 'vori': return 'ভরি (Vori)';
      case 'g': return 'গ্রাম (Gram)';
      case 'kg': return 'কেজি (KG)';
      case 'oz': return 'আউন্স (Ounce)';
    }
  };

  return (
    <div className="card-blur p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:border-yellow-500/30 group flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-yellow-500 transition-colors">
              {data.currency}
            </h3>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{data.country}</p>
          </div>
          <div className={`text-xs font-bold px-2 py-1 rounded-md ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {isPositive ? '▲' : '▼'} {Math.abs(data.change24h).toFixed(2)}%
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold mb-1">Unit Price</p>
          <p className="text-xl font-mono font-medium text-zinc-300">
            {formattedUnitPrice} <span className="text-[10px] text-zinc-500">/ {unit === 'vori' ? 'ভরি' : unit}</span>
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800/50">
          <p className="text-[10px] text-yellow-500/80 uppercase tracking-[0.2em] font-bold mb-1">Calculated Value ({quantity} {getUnitLabel()})</p>
          <p className="text-3xl font-mono font-bold text-white tracking-tight">
            {formattedTotalPrice}
          </p>
        </div>
      </div>
      
      <div className="mt-8 w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
          style={{ width: `${40 + (data.price % 50)}%` }}
        ></div>
      </div>
    </div>
  );
};
