import React, { useState } from 'react';
import { Stock } from '../types';

interface WatchlistViewProps {
  watchlist: Stock[];
  allStocks: Stock[];
  onSelectStock: (stock: Stock) => void;
  onAddToWatchlist: (stock: Stock) => void;
  onRemoveFromWatchlist: (ticker: string) => void;
  onViewInsightsForTicker: (ticker: string) => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  watchlist,
  allStocks,
  onSelectStock,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onViewInsightsForTicker,
}) => {
  const [toggleMode, setToggleMode] = useState<'Price' | 'Change %' | 'Market Cap'>('Price');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notInWatchlist = allStocks.filter(
    (s) => !watchlist.some((item) => item.ticker === s.ticker)
  );

  const filteredModalStocks = notInWatchlist.filter(
    (s) =>
      s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSparklineSVG = (ticker: string, isPositive: boolean) => {
    const color = isPositive ? '#4edea3' : '#ffb4ab';
    const gradId = `grad-${ticker.toLowerCase()}`;

    // Sample paths for sparklines
    let pathD = 'M0 30 C 10 28, 20 35, 30 20 C 40 5, 50 25, 60 15 C 70 5, 80 18, 90 8 L 100 12';
    let areaD = 'M0 30 C 10 28, 20 35, 30 20 C 40 5, 50 25, 60 15 C 70 5, 80 18, 90 8 L 100 12 L 100 40 L 0 40 Z';

    if (!isPositive) {
      pathD = 'M0 5 L 20 15 L 40 10 L 60 25 L 80 20 L 100 35';
      areaD = 'M0 5 L 20 15 L 40 10 L 60 25 L 80 20 L 100 35 L 100 40 L 0 40 Z';
    }

    return (
      <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path d={areaD} fill={`url(#${gradId})`} />
      </svg>
    );
  };

  const getDisplayValue = (stock: Stock) => {
    if (toggleMode === 'Price') {
      return stock.price.toFixed(2);
    }
    if (toggleMode === 'Change %') {
      return stock.isPositive
        ? `+${stock.changePercent.toFixed(2)}%`
        : `${stock.changePercent.toFixed(2)}%`;
    }
    return stock.marketCap;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      {/* Sub-header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-headline-sm text-2xl font-bold text-[#dae2fd]">My Watchlist</h2>
          <span className="bg-[#2d3449] text-[#c2c6d7] font-label-sm text-xs px-2.5 py-0.5 rounded-full font-medium">
            {watchlist.length} items
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 border rounded transition-colors font-label-md text-xs h-9 ${
              isEditMode
                ? 'bg-[#ff516a]/20 border-[#ff516a] text-[#ffb4ab]'
                : 'bg-[#171f33] border-[#424754] text-[#dae2fd] hover:bg-[#2d3449]'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {isEditMode ? 'check' : 'edit'}
            </span>
            {isEditMode ? 'Done' : 'Edit'}
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-[#528dff] text-[#00275f] rounded hover:bg-[#afc6ff] transition-colors font-label-md text-xs h-9 font-bold shadow-[0_0_15px_rgba(82,141,255,0.2)]"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add Ticker
          </button>
        </div>
      </div>

      {/* Quick Toggles */}
      <div className="w-full overflow-x-auto no-scrollbar pb-1">
        <div className="inline-flex bg-[#222a3d] p-1 rounded-lg border border-[#424754]/50">
          {(['Price', 'Change %', 'Market Cap'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setToggleMode(mode)}
              className={`px-4 py-1.5 rounded-md font-label-md text-xs transition-all ${
                toggleMode === mode
                  ? 'bg-[#31394d] text-[#dae2fd] font-bold shadow-md ring-1 ring-white/10'
                  : 'text-[#c2c6d7] hover:text-[#dae2fd] hover:bg-[#2d3449]/50'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid: Watchlist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {watchlist.map((stock) => (
          <div
            key={stock.ticker}
            className="bg-[#171f33] border border-[#424754]/60 rounded-xl p-4 flex flex-col relative overflow-hidden group hover:border-[#8c90a0] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
          >
            {/* Inner top glow line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Remove button in Edit Mode */}
            {isEditMode && (
              <button
                onClick={() => onRemoveFromWatchlist(stock.ticker)}
                className="absolute top-2 right-2 z-20 w-6 h-6 bg-[#ff516a] text-white rounded-full flex items-center justify-center shadow hover:bg-red-600 transition-colors"
                title="Remove from watchlist"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}

            <div
              onClick={() => onSelectStock(stock)}
              className="flex justify-between items-start mb-3 relative z-10 cursor-pointer"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-sm font-bold text-[#dae2fd]">
                    {stock.ticker}
                  </span>

                  {stock.hasAIAlert && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewInsightsForTicker(stock.ticker);
                      }}
                      className="bg-[#ff516a]/10 border border-[#ff516a]/30 text-[#ffb2b7] px-1.5 py-0.5 rounded flex items-center gap-1 shadow-[0_0_8px_rgba(255,81,106,0.2)] hover:bg-[#ff516a]/20 transition-colors"
                      title="AI Market Pulse Alert"
                    >
                      <span className="material-symbols-outlined text-[12px]">psychology</span>
                    </button>
                  )}
                </div>
                <span className="font-body-md text-xs text-[#c2c6d7] leading-none">
                  {stock.name}
                </span>
              </div>

              <div className="text-right flex flex-col items-end gap-1">
                <span className="font-data-display text-base font-semibold text-[#dae2fd] tracking-tight">
                  {getDisplayValue(stock)}
                </span>
                <div
                  className={`font-label-sm text-[11px] px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                    stock.isPositive
                      ? 'text-[#4edea3] bg-[#4edea3]/10'
                      : 'text-[#ffb4ab] bg-[#ffb4ab]/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-[10px]">
                    {stock.isPositive ? 'arrow_upward' : 'arrow_downward'}
                  </span>
                  {Math.abs(stock.changePercent).toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Sparkline Area */}
            <div
              onClick={() => onSelectStock(stock)}
              className="h-14 w-full mt-auto relative z-10 opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {renderSparklineSVG(stock.ticker, stock.isPositive)}
            </div>
          </div>
        ))}
      </div>

      {/* Add Ticker Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171f33] border border-[#2d3449] rounded-xl max-w-md w-full p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-sm text-lg font-bold text-[#dae2fd]">
                Add Ticker to Watchlist
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#c2c6d7] hover:text-[#dae2fd] p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticker or company name..."
              className="bg-[#0b1326] border border-[#2d3449] rounded-lg px-3.5 py-2 text-xs text-[#dae2fd] placeholder-[#8c90a0] focus:outline-none focus:border-[#afc6ff]"
            />

            <div className="max-h-60 overflow-y-auto divide-y divide-[#2d3449]">
              {filteredModalStocks.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#8c90a0]">
                  No matching tickers available to add.
                </div>
              ) : (
                filteredModalStocks.map((stock) => (
                  <div
                    key={stock.ticker}
                    className="flex justify-between items-center p-3 hover:bg-[#2d3449]/40 transition-colors"
                  >
                    <div>
                      <div className="font-label-md text-xs font-bold text-[#dae2fd]">
                        {stock.ticker}
                      </div>
                      <div className="font-body-md text-[11px] text-[#c2c6d7]">{stock.name}</div>
                    </div>
                    <button
                      onClick={() => {
                        onAddToWatchlist(stock);
                        setIsAddModalOpen(false);
                      }}
                      className="px-3 py-1 bg-[#528dff] hover:bg-[#afc6ff] text-[#00275f] font-label-md text-xs font-bold rounded"
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
