import React, { useState } from 'react';
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
  stockInsightsMap,
} from './data/marketData';
import { Stock, StockInsight, AIPulse } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('markets');
  const [marketIndices] = useState(initialMarketIndices);
  const [aiPulse, setAiPulse] = useState<AIPulse>(initialAIPulse);
  const [stocks] = useState<Stock[]>(initialStocks);

  // Watchlist initialized with GOOGL, MSFT, AMZN, META from data
  const [watchlist, setWatchlist] = useState<Stock[]>(() => {
    const defaultTickers = ['GOOGL', 'MSFT', 'AMZN', 'META'];
    return initialStocks.filter((s) => defaultTickers.includes(s.ticker));
  });

  const [currentTicker, setCurrentTicker] = useState<string>('TSLA');
  const [selectedInsightDate, setSelectedInsightDate] = useState<string>('2024-03-15');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(true);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [isRegeneratingPulse, setIsRegeneratingPulse] = useState(false);

  // Get current stock insight or create dynamic fallback
  const getCurrentInsight = (): StockInsight => {
    if (stockInsightsMap[currentTicker]) {
      return stockInsightsMap[currentTicker];
    }

    const stock = stocks.find((s) => s.ticker === currentTicker) || stocks[0];
    return {
      ticker: stock.ticker,
      companyName: stock.name,
      date: 'March 15, 2024',
      catalystTitle: `${stock.name} Quarterly Capital Allocation`,
      catalystCategory: 'THE CATALYST',
      catalystDescription: `Institutional trading activity around ${stock.ticker} shows elevated buy-side interest driven by sector momentum and AI infrastructure expansions. Market makers report balanced order books around $${stock.price.toFixed(2)}.`,
      intradayChange: stock.isPositive ? `+${stock.changePercent.toFixed(2)}%` : `${stock.changePercent.toFixed(2)}%`,
      intradayNote: `Heavy institutional block trading detected during market open. Technical support holds firm at $${(stock.price * 0.98).toFixed(2)}.`,
      intradaySparkline: stock.sparklineData,
      sentiment: stock.isPositive ? 'BULLISH' : 'NEUTRAL',
      retailScore: stock.isPositive ? 84 : 62,
      institutionalScore: stock.isPositive ? 78 : 55,
      timeline: [
        {
          time: '9:30 AM EST',
          title: 'Market Open',
          description: `Opening volume surge in ${stock.ticker} following sector upgrades.`,
          changePercent: stock.isPositive ? '+0.8%' : '-0.5%',
          isPositive: stock.isPositive,
        },
        {
          time: '1:00 PM EST',
          title: 'Midday Liquidity Surge',
          description: 'Institutional block trades cross secondary market.',
          changePercent: stock.isPositive ? '+1.5%' : '-0.2%',
          isPositive: stock.isPositive,
        },
      ],
    };
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
