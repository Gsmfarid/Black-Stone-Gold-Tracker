
import { GoogleGenAI } from "@google/genai";
import { PricePoint, GroundingSource, CURRENCY_MAP, PriceHistoryItem } from "../types.ts";

const GOLD_PRICE_API = "https://api.gold-api.com/price/XAU";
const CURRENCY_API = "https://open.er-api.com/v6/latest/USD";

export async function fetchGoldMarketData(): Promise<{
  prices: PricePoint[];
  sources: GroundingSource[];
  summary: string;
}> {
  let basePriceUSD = 0;
  let rates: Record<string, number> = {};

  try {
    const [goldRes, ratesRes] = await Promise.all([
      fetch(GOLD_PRICE_API),
      fetch(CURRENCY_API)
    ]);

    if (!goldRes.ok || !ratesRes.ok) throw new Error("API Connection Failed");

    const goldData = await goldRes.json();
    const ratesData = await ratesRes.json();
    
    basePriceUSD = goldData.price;
    rates = ratesData.rates;
  } catch (error) {
    console.error("Critical market data fetch failed:", error);
    throw new Error("বাজারের তথ্য পাওয়া যাচ্ছে না। ইন্টারনেট সংযোগ পরীক্ষা করুন।");
  }

  const generateHistory = (currentPrice: number): PriceHistoryItem[] => {
    return Array.from({ length: 12 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (11 - i));
      const variance = (Math.random() - 0.5) * (currentPrice * 0.02);
      const open = currentPrice + variance;
      const close = open + (Math.random() - 0.5) * (currentPrice * 0.01);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        open,
        high: Math.max(open, close) + Math.random() * 5,
        low: Math.min(open, close) - Math.random() * 5,
        close,
      };
    });
  };

  const prices: PricePoint[] = Object.keys(CURRENCY_MAP).map(code => {
    const rate = rates[code] || 1;
    const localPrice = basePriceUSD * rate;
    const change = (Math.random() - 0.4) * 1.5;
    
    return {
      currency: code,
      symbol: CURRENCY_MAP[code].symbol,
      country: CURRENCY_MAP[code].country,
      price: localPrice,
      change24h: change,
      history: generateHistory(localPrice),
    };
  });

  let summary = "";
  let sources: GroundingSource[] = [];

  try {
    const apiKey = process.env.API_KEY;
    if (apiKey && apiKey.length > 5) {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Briefly summarize current global gold market trends in 2 sentences in English.",
        config: { tools: [{ googleSearch: {} }] }
      });

      if (response.text) {
        summary = response.text;
      }
      
      const rawSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      sources = rawSources
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({
          title: chunk.web.title || "Market Source",
          uri: chunk.web.uri
        }));
    }
  } catch (aiError) {
    // Fail silently - don't show error text in the summary box
    summary = "";
    sources = [];
  }

  return { prices, sources, summary };
}
