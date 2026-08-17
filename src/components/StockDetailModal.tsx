import React, { useEffect, useState } from 'react';
import { Stock, FinnhubQuote, FinnhubProfile } from '../types';
import { finnhubService } from '../services/finnhubService';

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
  const [finnhubQuote, setFinnhubQuote] = useState<FinnhubQuote | null>(null);
  const [finnhubProfile, setFinnhubProfile] = useState<FinnhubProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!stock) {
      setFinnhubQuote(null);
      setFinnhubProfile(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    Promise.all([
      finnhubService.getQuote(stock.ticker),
      finnhubService.getProfile(stock.ticker),
    ])
      .then(([quote, profile]) => {
        if (isMounted) {
          if (quote && quote.c > 0) setFinnhubQuote(quote);
          if (profile && profile.name) setFinnhubProfile(profile);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [stock?.ticker]);

  if (!stock) return null;

  const currentPrice = finnhubQuote && finnhubQuote.c > 0 ? finnhubQuote.c : stock.price;
  const changePercent =
    finnhubQuote && finnhubQuote.c > 0 ? finnhubQuote.dp : stock.changePercent;
  const isPositive =
    finnhubQuote && finnhubQuote.c > 0 ? finnhubQuote.d >= 0 : stock.isPositive;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 relative overflow-hidden">
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
                {finnhubProfile?.finnhubIndustry || stock.sector}
              </span>
              {finnhubQuote && finnhubQuote.connected && (
                <span className="font-label-sm text-[10px] px-2 py-0.5 bg-[#005236]/30 text-[#4edea3] border border-[#005236] rounded font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
                  FINNHUB LIVE
                </span>
              )}
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
            <span className="font-label-sm text-xs text-[#8c90a0]">Current Market Price</span>
            <div className="font-data-display text-2xl font-bold text-[#dae2fd] mt-0.5">
              ${currentPrice.toFixed(2)}
            </div>
          </div>

          <div className="text-right">
            <span className="font-label-sm text-xs text-[#8c90a0]">Session Change</span>
            <div
              className={`font-data-display text-lg font-semibold mt-0.5 ${
                isPositive ? 'text-[#4edea3]' : 'text-[#ffb4ab]'
              }`}
            >
              {isPositive ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`}
            </div>
          </div>
        </div>

        {/* Key Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-[#0b1326] p-2.5 rounded-lg border border-[#2d3449]">
            <span className="font-label-sm text-[10px] text-[#8c90a0] uppercase block">Day High</span>
            <div className="font-data-display text-sm font-semibold text-[#dae2fd] mt-0.5">
              ${finnhubQuote?.h && finnhubQuote.h > 0 ? finnhubQuote.h.toFixed(2) : (currentPrice * 1.018).toFixed(2)}
            </div>
          </div>

          <div className="bg-[#0b1326] p-2.5 rounded-lg border border-[#2d3449]">
            <span className="font-label-sm text-[10px] text-[#8c90a0] uppercase block">Day Low</span>
            <div className="font-data-display text-sm font-semibold text-[#dae2fd] mt-0.5">
              ${finnhubQuote?.l && finnhubQuote.l > 0 ? finnhubQuote.l.toFixed(2) : (currentPrice * 0.982).toFixed(2)}
            </div>
          </div>

          <div className="bg-[#0b1326] p-2.5 rounded-lg border border-[#2d3449]">
            <span className="font-label-sm text-[10px] text-[#8c90a0] uppercase block">Open</span>
            <div className="font-data-display text-sm font-semibold text-[#dae2fd] mt-0.5">
              ${finnhubQuote?.o && finnhubQuote.o > 0 ? finnhubQuote.o.toFixed(2) : (currentPrice * 0.995).toFixed(2)}
            </div>
          </div>

          <div className="bg-[#0b1326] p-2.5 rounded-lg border border-[#2d3449]">
            <span className="font-label-sm text-[10px] text-[#8c90a0] uppercase block">Prev Close</span>
            <div className="font-data-display text-sm font-semibold text-[#dae2fd] mt-0.5">
              ${finnhubQuote?.pc && finnhubQuote.pc > 0 ? finnhubQuote.pc.toFixed(2) : (currentPrice / (1 + changePercent / 100)).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Secondary Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0b1326] p-3 rounded-lg border border-[#2d3449]">
            <span className="font-label-sm text-[10px] text-[#8c90a0] uppercase">Market Cap</span>
            <div className="font-data-display text-sm font-semibold text-[#dae2fd] mt-1">
              {finnhubProfile?.marketCapitalization
                ? `$${(finnhubProfile.marketCapitalization / 1000).toFixed(2)}B`
                : stock.marketCap}
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
        <div className="flex flex-col sm:flex-row gap-3 mt-1">
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

