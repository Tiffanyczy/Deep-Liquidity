import React from 'react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  unreadNotifications: boolean;
  onToggleNotifications: () => void;
  finnhubConnected?: boolean;
  isRefreshingData?: boolean;
  onRefreshData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  unreadNotifications,
  onToggleNotifications,
  finnhubConnected = false,
  isRefreshingData = false,
  onRefreshData,
}) => {
  return (
    <header className="bg-[#0b1326] fixed top-0 w-full z-50 border-b border-[#424754]/50 flex items-center justify-between px-4 sm:px-6 h-14 transition-colors duration-200">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('markets')}>
          <span className="material-symbols-outlined text-[#afc6ff] text-2xl">analytics</span>
          <span className="font-bold text-xl text-[#afc6ff] tracking-tight">Deep Liquidity</span>
        </div>

        {/* Finnhub Connection Status Badge */}
        <div
          title={
            finnhubConnected
              ? 'Finnhub API Connected — Streaming real-time market data'
              : 'Finnhub API Route Configured (Add FINNHUB_API_KEY in Settings)'
          }
          className={`hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-label-sm border ${
            finnhubConnected
              ? 'bg-[#005236]/30 text-[#4edea3] border-[#005236]'
              : 'bg-[#171f33] text-[#c2c6d7] border-[#2d3449]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              finnhubConnected ? 'bg-[#4edea3] animate-pulse' : 'bg-[#8c90a0]'
            }`}
          />
          <span className="font-medium tracking-wide">
            {finnhubConnected ? 'FINNHUB LIVE' : 'FINNHUB CONNECTED'}
          </span>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2 h-full">
        <button
          onClick={() => setActiveTab('markets')}
          className={`font-label-md text-xs px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'markets'
              ? 'text-[#4edea3] font-bold bg-[#171f33]'
              : 'text-[#c2c6d7] hover:text-[#dae2fd] hover:bg-[#2d3449]/50'
          }`}
        >
          Markets
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`font-label-md text-xs px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'insights'
              ? 'text-[#4edea3] font-bold bg-[#171f33]'
              : 'text-[#c2c6d7] hover:text-[#dae2fd] hover:bg-[#2d3449]/50'
          }`}
        >
          Insights
        </button>
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`font-label-md text-xs px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'watchlist'
              ? 'text-[#4edea3] font-bold bg-[#171f33]'
              : 'text-[#c2c6d7] hover:text-[#dae2fd] hover:bg-[#2d3449]/50'
          }`}
        >
          Watchlist
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`font-label-md text-xs px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'search'
              ? 'text-[#4edea3] font-bold bg-[#171f33]'
              : 'text-[#c2c6d7] hover:text-[#dae2fd] hover:bg-[#2d3449]/50'
          }`}
        >
          Search
        </button>
      </nav>

      {/* Action Icons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onRefreshData && (
          <button
            onClick={onRefreshData}
            aria-label="Refresh Market Data"
            title="Refresh Live Market Data via Finnhub"
            disabled={isRefreshingData}
            className="text-[#c2c6d7] hover:text-[#dae2fd] hover:bg-[#2d3449] p-1.5 rounded-lg transition-colors"
          >
            <span
              className={`material-symbols-outlined text-xl ${
                isRefreshingData ? 'animate-spin text-[#afc6ff]' : ''
              }`}
            >
              sync
            </span>
          </button>
        )}
        <button
          onClick={onOpenSearch}
          aria-label="Search"
          className="text-[#c2c6d7] hover:text-[#dae2fd] hover:bg-[#2d3449] p-1.5 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-xl">search</span>
        </button>
        <button
          onClick={onToggleNotifications}
          aria-label="Notifications"
          className="text-[#c2c6d7] hover:text-[#dae2fd] hover:bg-[#2d3449] p-1.5 rounded-lg transition-colors relative"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
          {unreadNotifications && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#4edea3] rounded-full ring-2 ring-[#0b1326]"></span>
          )}
        </button>
      </div>
    </header>
  );
};
