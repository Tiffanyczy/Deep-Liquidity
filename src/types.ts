export interface MarketIndex {
  symbol: string;
  name: string;
  value: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  sparklineData: number[];
}

export interface Stock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
  volume: string;
  marketCap: string;
  sector: string;
  hasAIAlert?: boolean;
  sparklineData: number[];
}

export interface TimelineItem {
  time: string;
  title: string;
  description: string;
  changePercent: string;
  isPositive: boolean;
}

export type TimeframeKey = '1D' | '1W' | '1M' | '3M' | '1Y';

export interface TimeframePrice {
  periodKey: TimeframeKey;
  label: string;
  price: number;
  change: string;
  changePercent: string;
  isPositive: boolean;
  high: number;
  low: number;
  sparklineData: number[];
  timeLabels?: string[];
}

export interface StockInsight {
  ticker: string;
  companyName: string;
  date: string;
  catalystTitle: string;
  catalystCategory: string;
  catalystDescription: string;
  intradayChange: string;
  intradayNote: string;
  intradaySparkline: number[];
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  retailScore: number;
  institutionalScore: number;
  timeline: TimelineItem[];
  timeframes?: Record<TimeframeKey, TimeframePrice>;
}

export interface AIPulse {
  title: string;
  summary: string;
  tags: string[];
  lastUpdated: string;
}

export interface FinnhubStatus {
  connected: boolean;
  hasKey: boolean;
}

export interface FinnhubQuote {
  symbol: string;
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High
  l: number; // Low
  o: number; // Open
  pc: number; // Previous close
  t: number; // Timestamp
  connected?: boolean;
  source?: string;
}

export interface FinnhubNewsItem {
  id?: number;
  category: string;
  datetime: number;
  headline: string;
  image?: string;
  related?: string;
  source: string;
  summary: string;
  url: string;
}

export interface FinnhubProfile {
  country?: string;
  currency?: string;
  exchange?: string;
  finnhubIndustry?: string;
  ipo?: string;
  logo?: string;
  marketCapitalization?: number;
  name?: string;
  phone?: string;
  shareOutstanding?: number;
  ticker?: string;
  weburl?: string;
}

export interface FinnhubRecommendation {
  buy: number;
  hold: number;
  period: string;
  sell: number;
  strongBuy: number;
  strongSell: number;
  symbol: string;
}

// A single entry from Finnhub's full US exchange symbol directory
export interface FinnhubSymbol {
  symbol: string;
  description: string;
  type: string;
  displaySymbol?: string;
  currency?: string;
  mic?: string;
}

// Lightweight ticker/name pair used to power market-wide search in the UI
export interface CompanyListing {
  symbol: string;
  name: string;
}