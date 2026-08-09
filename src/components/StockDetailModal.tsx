import React from 'react';
import { Stock } from '../types';

interface StockDetailModalProps {
  stock: Stock | null;
  onClose: () => void;
  onViewInsights: (ticker: string) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (stock: Stock) => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  stock,
  onClose,
  onViewInsights,
  isInWatchlist,
  onToggleWatchlist,
}) => {
  if (!stock) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
        {/* Top ambient glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#528dff] via-[#4edea3] to-[#afc6ff]" />

        {/* Modal Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-md text-lg font-bold text-[#dae2fd]">
                {stock.ticker}
              </span>
              <span className="font-label-sm text-xs px-2 py-0.5 bg-[#2d3449] text-[#c2c6d7] rounded font-medium">
                {stock.sector}
              </span>
            </div>
            <h2 className="font-body-lg text-sm text-[#c2c6d7]">{stock.name}</h2>
          </div>

          <button
            onClick={onClose}
            className="text-[#c2c6d7] hover:text-[#dae2fd] p-1.5 rounded-lg hover:bg-[#2d3449] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Price & Change Banner */}
        <div className="bg-[#131b2e] border border-[#2d3449] rounded-xl p-4 flex justify-between items-center">
          <div>
            <span className="font-label-sm text-xs text-[#8c90a0]">Current Price</span>
            <div className="font-data-display text-2xl font-bold text-[#dae2fd] mt-0.5">
              ${stock.price.toFixed(2)}
            </div>
          </div>

          <div className="text-right">
            <span className="font-label-sm text-xs text-[#8c90a0]">Today Change</span>
            <div
              className={`font-data-display text-lg font-semibold mt-0.5 ${
                stock.isPositive ? 'text-[#4edea3]' : 'text-[#ffb4ab]'
              }`}
            >
              {stock.isPositive ? `+${stock.changePercent.toFixed(2)}%` : `${stock.changePercent.toFixed(2)}%`}
            </div>
          </div>
        </div>

        {/* Key Statistics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0b1326] p-3 rounded-lg border border-[#2d3449]">
            <span className="font-label-sm text-[10px] text-[#8c90a0] uppercase">Market Cap</span>
            <div className="font-data-display text-sm font-semibold text-[#dae2fd] mt-1">
              {stock.marketCap}
            </div>
          </div>

          <div className="bg-[#0b1326] p-3 rounded-lg border border-[#2d3449]">
            <span className="font-label-sm text-[10px] text-[#8c90a0] uppercase">Volume</span>
            <div className="font-data-display text-sm font-semibold text-[#dae2fd] mt-1">
              {stock.volume}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button
            onClick={() => {
              onViewInsights(stock.ticker);
              onClose();
            }}
            className="flex-1 py-2.5 bg-[#528dff] hover:bg-[#afc6ff] text-[#00275f] font-label-md text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <span className="material-symbols-outlined text-base">psychology</span>
            <span>View Deep AI Insights</span>
          </button>

          <button
            onClick={() => onToggleWatchlist(stock)}
            className={`px-4 py-2.5 rounded-xl font-label-md text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
              isInWatchlist
                ? 'bg-[#ff516a]/15 border-[#ff516a] text-[#ffb4ab] hover:bg-[#ff516a]/25'
                : 'bg-[#171f33] border-[#424754] text-[#dae2fd] hover:bg-[#2d3449]'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {isInWatchlist ? 'star_half' : 'star'}
            </span>
            <span>{isInWatchlist ? 'Remove Watchlist' : 'Add Watchlist'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
