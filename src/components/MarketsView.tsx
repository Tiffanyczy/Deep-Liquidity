import React from 'react';
import { MarketIndex, Stock, AIPulse } from '../types';

interface MarketsViewProps {
  marketIndices: MarketIndex[];
  aiPulse: AIPulse;
  stocks: Stock[];
  onSelectStock: (stock: Stock) => void;
  onViewInsightsForTicker: (ticker: string) => void;
  onRegenerateAIPulse?: () => void;
  isRegeneratingPulse?: boolean;
}

export const MarketsView: React.FC<MarketsViewProps> = ({
  marketIndices,
  aiPulse,
  stocks,
  onSelectStock,
  onViewInsightsForTicker,
  onRegenerateAIPulse,
  isRegeneratingPulse,
}) => {
  const [showAllTrending, setShowAllTrending] = React.useState(false);

  const displayedStocks = showAllTrending ? stocks : stocks.slice(0, 3);

  // Helper to generate SVG path for sparkline
  const renderSparkline = (data: number[], isPositive: boolean) => {
    if (!data || data.length === 0) return null;
    const width = 100;
    const height = 30;
    const maxVal = Math.max(...data, 1);
    const minVal = Math.min(...data, 0);
    const range = maxVal - minVal || 1;

    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const pathData = `M ${points.join(' L ')}`;
    const color = isPositive ? '#4edea3' : '#ffb4ab';

    return (
      <svg className="w-full h-8 mt-1" viewBox="0 0 100 30" preserveAspectRatio="none">
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Market Summary Horizontal Scroll */}
      <section className="flex flex-col gap-2">
        <h2 className="font-label-md text-xs text-[#8c90a0] tracking-wider uppercase">
          MARKET SUMMARY
        </h2>
        <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
          {marketIndices.map((index) => (
            <div
              key={index.symbol}
              className="data-card p-4 min-w-[200px] flex-shrink-0 flex flex-col gap-2 hover:border-[#8c90a0] transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="font-label-md text-xs text-[#c2c6d7]">{index.symbol}</span>
                <span
                  className={`font-label-sm text-[10px] px-1.5 py-0.5 rounded ${
                    index.isPositive
                      ? 'bg-[#005236]/30 text-[#4edea3]'
                      : 'bg-[#690005]/30 text-[#ffb4ab]'
                  }`}
                >
                  {index.changePercent}
                </span>
              </div>
              <span className="font-data-display text-lg text-[#dae2fd] font-semibold">
                {index.value}
              </span>
              {renderSparkline(index.sparklineData, index.isPositive)}
            </div>
          ))}
        </div>
      </section>

      {/* Bento Grid for Pulse and Trending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Market Pulse */}
        <section className="lg:col-span-2 flex flex-col gap-2">
          <h2 className="font-label-md text-xs text-[#8c90a0] tracking-wider uppercase">
            AI MARKET PULSE
          </h2>
          <div className="data-card p-6 flex flex-col gap-4 h-full justify-between relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#afc6ff] opacity-10 blur-[60px] rounded-full pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-[#afc6ff]">
                  <span className="material-symbols-outlined text-xl">memory</span>
                  <span className="font-label-md text-xs tracking-wider">SYNTHESIS</span>
                </div>
                {onRegenerateAIPulse && (
                  <button
                    onClick={onRegenerateAIPulse}
                    disabled={isRegeneratingPulse}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#2d3449] hover:bg-[#31394d] text-[#afc6ff] rounded transition-colors"
                  >
                    <span className={`material-symbols-outlined text-sm ${isRegeneratingPulse ? 'animate-spin' : ''}`}>
                      refresh
                    </span>
                    {isRegeneratingPulse ? 'Updating AI...' : 'Refresh AI'}
                  </button>
                )}
              </div>

              <h3 className="font-headline-sm text-xl font-semibold text-[#dae2fd] mb-3">
                {aiPulse.title}
              </h3>
              <p className="font-body-md text-sm text-[#c2c6d7] leading-relaxed">
                {aiPulse.summary}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-[#2d3449]">
              <div className="flex gap-2">
                {aiPulse.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-label-sm text-[10px] px-2 py-1 bg-[#2d3449] text-[#c2c6d7] rounded font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() => onViewInsightsForTicker('TSLA')}
                className="flex items-center gap-1 text-xs font-label-md text-[#4edea3] hover:underline"
              >
                <span>AI DEEP DIVE</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* Trending Today */}
        <section className="flex flex-col gap-2">
          <h2 className="font-label-md text-xs text-[#8c90a0] tracking-wider uppercase">
            TRENDING TODAY
          </h2>
          <div className="data-card flex flex-col h-full">
            <div className="divide-y divide-[#2d3449]">
              {displayedStocks.map((stock) => (
                <div
                  key={stock.ticker}
                  onClick={() => onSelectStock(stock)}
                  className="flex justify-between items-center p-4 hover:bg-[#2d3449]/40 cursor-pointer transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label-md text-sm font-semibold text-[#dae2fd]">
                      {stock.ticker}
                    </span>
                    <span className="font-label-sm text-xs text-[#c2c6d7]">{stock.name}</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 text-right">
                    <span className="font-data-display text-sm font-semibold text-[#dae2fd]">
                      {stock.price.toFixed(2)}
                    </span>
                    <span
                      className={`font-label-sm text-xs ${
                        stock.isPositive ? 'text-[#4edea3]' : 'text-[#ffb4ab]'
                      }`}
                    >
                      {stock.isPositive ? `+${stock.changePercent.toFixed(2)}%` : `${stock.changePercent.toFixed(2)}%`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 mt-auto">
              <button
                onClick={() => setShowAllTrending(!showAllTrending)}
                className="w-full py-2.5 bg-[#528dff] text-[#00275f] font-label-md text-xs font-bold rounded flex items-center justify-center gap-2 hover:bg-[#afc6ff] transition-colors shadow-md"
              >
                <span>{showAllTrending ? 'SHOW LESS' : 'VIEW ALL'}</span>
                <span className="material-symbols-outlined text-base">
                  {showAllTrending ? 'expand_less' : 'arrow_forward'}
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
