import { FinnhubQuote, FinnhubNewsItem, FinnhubProfile, FinnhubRecommendation, FinnhubStatus } from '../types';

export const finnhubService = {
  /**
   * Check connection status of Finnhub integration
   */
  async getStatus(): Promise<FinnhubStatus> {
    try {
      const res = await fetch('/api/finnhub/status');
      if (!res.ok) throw new Error('Status fetch failed');
      return await res.json();
    } catch {
      return { connected: false, hasKey: false };
    }
  },

  /**
   * Fetch single quote for symbol (e.g. TSLA)
   */
  async getQuote(symbol: string): Promise<FinnhubQuote | null> {
    try {
      const res = await fetch(`/api/finnhub/quote?symbol=${encodeURIComponent(symbol)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn(`Finnhub quote fetch error for ${symbol}:`, err);
      return null;
    }
  },

  /**
   * Fetch batch quotes for multiple symbols
   */
  async getBatchQuotes(symbols: string[]): Promise<Record<string, FinnhubQuote>> {
    try {
      const symbolsStr = symbols.join(',');
      const res = await fetch(`/api/finnhub/quotes?symbols=${encodeURIComponent(symbolsStr)}`);
      if (!res.ok) return {};
      const json = await res.json();
      return json.quotes || {};
    } catch (err) {
      console.warn('Finnhub batch quotes error:', err);
      return {};
    }
  },

  /**
   * Fetch historical candlestick data
   */
  async getCandles(
    symbol: string,
    resolution: string = 'D',
    from?: number,
    to?: number
  ): Promise<{ c: number[]; h: number[]; l: number[]; o: number[]; t: number[]; s: string } | null> {
    try {
      let url = `/api/finnhub/candles?symbol=${encodeURIComponent(symbol)}&resolution=${encodeURIComponent(resolution)}`;
      if (from) url += `&from=${from}`;
      if (to) url += `&to=${to}`;

      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn(`Finnhub candles fetch error for ${symbol}:`, err);
      return null;
    }
  },

  /**
   * Fetch company news
   */
  async getCompanyNews(symbol: string): Promise<FinnhubNewsItem[]> {
    try {
      const res = await fetch(`/api/finnhub/news?symbol=${encodeURIComponent(symbol)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.news || [];
    } catch (err) {
      console.warn(`Finnhub company news error for ${symbol}:`, err);
      return [];
    }
  },

  /**
   * Fetch general market news
   */
  async getMarketNews(): Promise<FinnhubNewsItem[]> {
    try {
      const res = await fetch('/api/finnhub/market-news');
      if (!res.ok) return [];
      const data = await res.json();
      return data.news || [];
    } catch (err) {
      console.warn('Finnhub market news error:', err);
      return [];
    }
  },

  /**
   * Fetch company profile
   */
  async getProfile(symbol: string): Promise<FinnhubProfile | null> {
    try {
      const res = await fetch(`/api/finnhub/profile?symbol=${encodeURIComponent(symbol)}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn(`Finnhub profile error for ${symbol}:`, err);
      return null;
    }
  },

  /**
   * Fetch analyst recommendations
   */
  async getRecommendations(symbol: string): Promise<FinnhubRecommendation[]> {
    try {
      const res = await fetch(`/api/finnhub/recommendations?symbol=${encodeURIComponent(symbol)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      console.warn(`Finnhub recommendations error for ${symbol}:`, err);
      return [];
    }
  },
};
