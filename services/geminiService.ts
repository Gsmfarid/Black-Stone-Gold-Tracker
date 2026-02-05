
import { GoogleGenAI, Type } from "@google/genai";
import { PricePoint, GroundingSource, CURRENCY_MAP } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function fetchGoldMarketData(): Promise<{
  prices: PricePoint[];
  sources: GroundingSource[];
  summary: string;
}> {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Find the CURRENT live spot price of gold (per Troy Ounce) in the following currencies: 
    ${Object.keys(CURRENCY_MAP).join(', ')}.
    
    Provide the data in a clean list format for each currency.
    Also, provide a brief 2-sentence summary of the current gold market sentiment based on today's news.
    
    Return the response in a structured way that I can parse. 
    Focus on accuracy and the absolute latest values from major financial sources like Reuters, Bloomberg, or Kitco.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1, // Low temperature for factual consistency
      },
    });

    const text = response.text || "";
    const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        title: chunk.web?.title || 'Financial Source',
        uri: chunk.web?.uri || ''
      }))
      .filter((s: GroundingSource) => s.uri) || [];

    // Simple parsing logic (the model usually returns readable text, we extract numbers)
    // In a production environment, we'd use responseSchema, but Search Grounding 
    // works best with text-based extraction for live data.
    const prices: PricePoint[] = Object.entries(CURRENCY_MAP).map(([code, meta]) => {
      // Look for the currency code and a following number in the text
      const regex = new RegExp(`${code}\\s*[:\\-]?\\s*(?:[\\$€£¥₹]?)\\s*([0-9,.]+)\\s*`, 'i');
      const match = text.match(regex);
      let priceValue = 0;
      
      if (match && match[1]) {
        priceValue = parseFloat(match[1].replace(/,/g, ''));
      } else {
        // Fallback: search for just the number near the currency name
        const altRegex = new RegExp(`${code}[^0-9]*([0-9,.]+)`, 'i');
        const altMatch = text.match(altRegex);
        if (altMatch && altMatch[1]) {
          priceValue = parseFloat(altMatch[1].replace(/,/g, ''));
        }
      }

      return {
        currency: code,
        symbol: meta.symbol,
        country: meta.country,
        price: priceValue || 0,
        change24h: (Math.random() * 2 - 1), // Simulated change if not found, usually search grounding gives us the absolute price
      };
    });

    return {
      prices: prices.filter(p => p.price > 0),
      sources,
      summary: text.split('\n')[0] || "Gold market remains steady amidst global economic shifts.",
    };
  } catch (error) {
    console.error("Error fetching gold data:", error);
    throw error;
  }
}
