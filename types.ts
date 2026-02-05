
export interface PricePoint {
  currency: string;
  symbol: string;
  price: number;
  change24h: number;
  country: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface MarketState {
  prices: PricePoint[];
  lastUpdated: Date;
  sources: GroundingSource[];
  summary: string;
  isLoading: boolean;
  error: string | null;
}

export type UnitType = 'vori' | 'oz' | 'g' | 'kg';

export const CURRENCY_MAP: Record<string, { symbol: string, country: string }> = {
  BDT: { symbol: '৳', country: 'Bangladesh' },
  USD: { symbol: '$', country: 'United States' },
  EUR: { symbol: '€', country: 'Eurozone' },
  GBP: { symbol: '£', country: 'United Kingdom' },
  JPY: { symbol: '¥', country: 'Japan' },
  INR: { symbol: '₹', country: 'India' },
  CNY: { symbol: '¥', country: 'China' },
  AED: { symbol: 'د.إ', country: 'UAE' },
  AUD: { symbol: 'A$', country: 'Australia' },
  CAD: { symbol: 'C$', country: 'Canada' },
  CHF: { symbol: 'Fr', country: 'Switzerland' },
  ZAR: { symbol: 'R', country: 'South Africa' },
};
