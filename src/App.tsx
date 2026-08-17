import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { MarketsView } from './components/MarketsView';
import { InsightsView } from './components/InsightsView';
import { WatchlistView } from './components/WatchlistView';
import { SearchView } from './components/SearchView';
import { StockDetailModal } from './components/StockDetailModal';
import {
  initialMarketIndices,
  initialAIPulse,
  initialStocks,
  getDynamicInsightForStock,
} from './data/marketData';
import { Stock, StockInsight, AIPulse, FinnhubStatus } from './types';
import { finnhubService } from './services/finnhubService';

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('markets');
  const [marketIndices, setMarketIndices] = useState(initialMarketIndices);
  const [aiPulse, setAiPulse] = useState<AIPulse>(initialAIPulse);
  const [stocks, setStocks] = useState<Stock[]>(initialStocks);

  // Watchlist initialized with GOOGL, MSFT, AMZN, META from data
  const [watchlist, setWatchlist] = useState<Stock[]>(() => {
    const defaultTickers = ['GOOGL', 'MSFT', 'AMZN', 'META'];
    return initialStocks.filter((s) => defaultTickers.includes(s.ticker));
  });

  const [currentTicker, setCurrentTicker] = useState<string>('TSLA');
  const [selectedInsightDate, setSelectedInsightDate] = useState<string>(getTodayString());
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(true);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [isRegeneratingPulse, setIsRegeneratingPulse] = useState(false);
  const [finnhubStatus, setFinnhubStatus] = useState<FinnhubStatus>({ connected: false, hasKey: false });
  const [isRefreshingData, setIsRefreshingData] = useState<boolean>(false);

  // Refresh live stock and indices data from Finnhub API
  const refreshMarketData = useCallback(async () => {
    setIsRefreshingData(true);
    try {
      const status = await finnhubService.getStatus();
      setFinnhubStatus(status);

      const allSymbols = [
        'TSLA', 'NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'AMD', 'PLTR', 'COIN',
        'SPY', 'QQQ', 'DIA'
      ];

      const quotes = await finnhubService.getBatchQuotes(allSymbols);

      if (quotes && Object.keys(quotes).length > 0) {
        // Update stock list with live Finnhub prices
        setStocks((prevStocks) =>
          prevStocks.map((stock) => {
            const q = quotes[stock.ticker];
            if (q && q.c > 0) {
              const isPos = q.d >= 0;
              return {
                ...stock,
                price: Number(q.c.toFixed(2)),
                change: Number(q.d.toFixed(2)),
                changePercent: Number(q.dp.toFixed(2)),
                isPositive: isPos,
                sparklineData: stock.sparklineData.length > 0 ? stock.sparklineData : [q.o, (q.o + q.c) / 2, q.h, q.l, q.c],
              };
            }
            return stock;
          })
        );

        // Update market indices with ETF proxies (SPY for S&P 500, QQQ for Nasdaq, DIA for Dow Jones)
        setMarketIndices((prevIndices) =>
          prevIndices.map((idx) => {
            let proxySymbol = '';
            if (idx.symbol.includes('S&P') || idx.symbol.includes('SPX')) proxySymbol = 'SPY';
            else if (idx.symbol.includes('NASDAQ') || idx.symbol.includes('IXIC')) proxySymbol = 'QQQ';
            else if (idx.symbol.includes('DOW') || idx.symbol.includes('DJI')) proxySymbol = 'DIA';

            const q = quotes[proxySymbol];
            if (q && q.c > 0) {
              const isPos = q.d >= 0;
              return {
                ...idx,
                value: q.c.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                change: isPos ? `+${q.d.toFixed(2)}` : `${q.d.toFixed(2)}`,
                changePercent: isPos ? `+${q.dp.toFixed(2)}%` : `${q.dp.toFixed(2)}%`,
                isPositive: isPos,
              };
            }
            return idx;
          })
        );
      }
    } catch (err) {
      console.warn('Finnhub data refresh error:', err);
    } finally {
      setIsRefreshingData(false);
    }
  }, []);

  // Check Finnhub status & fetch live data on mount
  useEffect(() => {
    refreshMarketData();
  }, [refreshMarketData]);

  // Get current stock insight dynamically based on ticker and selected date
  const getCurrentInsight = (): StockInsight => {
    const stock = stocks.find((s) => s.ticker === currentTicker) || stocks[0];
    return getDynamicInsightForStock(stock, selectedInsightDate);
  };

  const handleSelectStock = (stock: Stock) => {
    setSelectedStock(stock);
  };

  const handleViewInsightsForTicker = (ticker: string) => {
    setCurrentTicker(ticker);
    setActiveTab('insights');
  };

  const handleAddToWatchlist = (stock: Stock) => {
    if (!watchlist.some((item) => item.ticker === stock.ticker)) {
      setWatchlist([...watchlist, stock]);
    }
  };

  const handleRemoveFromWatchlist = (ticker: string) => {
    setWatchlist(watchlist.filter((item) => item.ticker !== ticker));
  };

  const handleToggleWatchlist = (stock: Stock) => {
    if (watchlist.some((item) => item.ticker === stock.ticker)) {
      handleRemoveFromWatchlist(stock.ticker);
    } else {
      handleAddToWatchlist(stock);
    }
  };

  const handleAskAI = async (ticker: string, prompt: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, prompt }),
      });
      const data = await res.json();
      return data.analysis || null;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleRegenerateAIPulse = async () => {
    setIsRegeneratingPulse(true);
    try {
      const res = await fetch('/api/regenerate-pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.title && data.summary) {
        setAiPulse({
          title: data.title,
          summary: data.summary,
          tags: data.tags || ['TECH', 'HIGH MOMENTUM'],
          lastUpdated: 'Just now',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegeneratingPulse(false);
    }
  };

  const handleToggleNotifications = () => {
    setShowNotificationToast(!showNotificationToast);
    setUnreadNotifications(false);
  };

  return (
    <div className="bg-[#0b1326] text-[#dae2fd] min-h-screen flex flex-col font-body-md antialiased selection:bg-[#528dff] selection:text-[#00275f]">
      {/* Top Application Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => setActiveTab('search')}
        unreadNotifications={unreadNotifications}
        onToggleNotifications={handleToggleNotifications}
        finnhubConnected={finnhubStatus.connected}
        isRefreshingData={isRefreshingData}
        onRefreshData={refreshMarketData}
      />

      {/* Notification Toast Dropdown */}
      {showNotificationToast && (
        <div className="fixed top-16 right-4 z-50 bg-[#171f33] border border-[#2d3449] rounded-xl p-4 shadow-2xl max-w-sm w-full">
          <div className="flex justify-between items-center mb-2">
            <span className="font-label-md text-xs text-[#afc6ff] font-bold">
              Market Alert Notification
            </span>
            <button
              onClick={() => setShowNotificationToast(false)}
              className="text-[#c2c6d7] hover:text-white"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          <p className="font-body-md text-xs text-[#c2c6d7] leading-relaxed">
            NVDA surged +4.00% past $822 threshold following institutional liquidity inflow signal.
          </p>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow pt-20 pb-24 px-4 sm:px-6 md:pl-28 md:pr-8 max-w-7xl mx-auto w-full">
        {activeTab === 'markets' && (
          <MarketsView
            marketIndices={marketIndices}
            aiPulse={aiPulse}
            stocks={stocks}
            onSelectStock={handleSelectStock}
            onViewInsightsForTicker={handleViewInsightsForTicker}
            onRegenerateAIPulse={handleRegenerateAIPulse}
            isRegeneratingPulse={isRegeneratingPulse}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView
            currentInsight={getCurrentInsight()}
            allStocks={stocks}
            onSelectTicker={setCurrentTicker}
            onAskAI={handleAskAI}
            selectedDate={selectedInsightDate}
            onDateChange={setSelectedInsightDate}
          />
        )}

        {activeTab === 'watchlist' && (
          <WatchlistView
            watchlist={watchlist}
            allStocks={stocks}
            onSelectStock={handleSelectStock}
            onAddToWatchlist={handleAddToWatchlist}
            onRemoveFromWatchlist={handleRemoveFromWatchlist}
            onViewInsightsForTicker={handleViewInsightsForTicker}
          />
        )}

        {activeTab === 'search' && (
          <SearchView
            stocks={stocks}
            watchlist={watchlist}
            onSelectStock={handleSelectStock}
            onAddToWatchlist={handleAddToWatchlist}
            onViewInsightsForTicker={handleViewInsightsForTicker}
          />
        )}
      </main>

      {/* Bottom & Side Navigation Bar */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Stock Detail Modal */}
      <StockDetailModal
        stock={selectedStock}
        onClose={() => setSelectedStock(null)}
        onViewInsights={handleViewInsightsForTicker}
        isInWatchlist={
          selectedStock
            ? watchlist.some((item) => item.ticker === selectedStock.ticker)
            : false
        }
        onToggleWatchlist={handleToggleWatchlist}
      />
    </div>
  );
}
