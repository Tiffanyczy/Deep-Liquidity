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
