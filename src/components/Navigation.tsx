import React from 'react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="bg-[#171f33] fixed bottom-0 w-full z-50 border-t border-[#424754]/40 flex justify-around items-center h-16 px-2 md:hidden">
        {/* Markets */}
        <button
          onClick={() => setActiveTab('markets')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg w-16 transition-all ${
            activeTab === 'markets'
              ? 'text-[#4edea3] font-bold'
              : 'text-[#c2c6d7] hover:bg-[#31394d]/40'
          }`}
        >
          <span
            className="material-symbols-outlined text-2xl"
            style={{ fontVariationSettings: activeTab === 'markets' ? "'FILL' 1" : "'FILL' 0" }}
          >
            query_stats
          </span>
          <span className="font-label-sm text-[10px] mt-0.5">Markets</span>
        </button>

        {/* Insights */}
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg w-16 transition-all ${
            activeTab === 'insights'
              ? 'text-[#4edea3] font-bold'
              : 'text-[#c2c6d7] hover:bg-[#31394d]/40'
          }`}
        >
          <span
            className="material-symbols-outlined text-2xl"
            style={{ fontVariationSettings: activeTab === 'insights' ? "'FILL' 1" : "'FILL' 0" }}
          >
            psychology
          </span>
          <span className="font-label-sm text-[10px] mt-0.5">Insights</span>
        </button>

        {/* Watchlist */}
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg w-16 transition-all relative ${
            activeTab === 'watchlist'
              ? 'text-[#4edea3] font-bold'
              : 'text-[#c2c6d7] hover:bg-[#31394d]/40'
          }`}
        >
          {activeTab === 'watchlist' && (
            <div className="absolute -top-1 w-8 h-1 bg-[#4edea3] rounded-b-full shadow-[0_0_10px_#4edea3]" />
          )}
          <span
            className="material-symbols-outlined text-2xl"
            style={{ fontVariationSettings: activeTab === 'watchlist' ? "'FILL' 1" : "'FILL' 0" }}
          >
            star
          </span>
          <span className="font-label-sm text-[10px] mt-0.5">Watchlist</span>
        </button>

        {/* Search */}
        <button
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg w-16 transition-all ${
            activeTab === 'search'
              ? 'text-[#4edea3] font-bold'
              : 'text-[#c2c6d7] hover:bg-[#31394d]/40'
          }`}
        >
          <span
            className="material-symbols-outlined text-2xl"
            style={{ fontVariationSettings: activeTab === 'search' ? "'FILL' 1" : "'FILL' 0" }}
          >
            search
          </span>
          <span className="font-label-sm text-[10px] mt-0.5">Search</span>
        </button>
      </nav>

      {/* Desktop Side Navigation Bar */}
      <aside className="hidden md:flex flex-col bg-[#171f33] fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-20 items-center py-6 gap-6 z-40 border-r border-[#424754]/30">
        <button
          onClick={() => setActiveTab('markets')}
          title="Markets"
          className={`flex flex-col items-center justify-center p-3 rounded-xl w-14 transition-all ${
            activeTab === 'markets'
              ? 'text-[#4edea3] bg-[#222a3d] font-bold shadow-md'
              : 'text-[#c2c6d7] hover:bg-[#2d3449]/60'
          }`}
        >
          <span
            className="material-symbols-outlined text-2xl"
            style={{ fontVariationSettings: activeTab === 'markets' ? "'FILL' 1" : "'FILL' 0" }}
          >
            query_stats
          </span>
          <span className="font-label-sm text-[10px] mt-1">Markets</span>
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          title="Insights"
          className={`flex flex-col items-center justify-center p-3 rounded-xl w-14 transition-all ${
            activeTab === 'insights'
              ? 'text-[#4edea3] bg-[#222a3d] font-bold shadow-md'
              : 'text-[#c2c6d7] hover:bg-[#2d3449]/60'
          }`}
        >
          <span
            className="material-symbols-outlined text-2xl"
            style={{ fontVariationSettings: activeTab === 'insights' ? "'FILL' 1" : "'FILL' 0" }}
          >
            psychology
          </span>
          <span className="font-label-sm text-[10px] mt-1">Insights</span>
        </button>

        <button
          onClick={() => setActiveTab('watchlist')}
          title="Watchlist"
          className={`flex flex-col items-center justify-center p-3 rounded-xl w-14 transition-all ${
            activeTab === 'watchlist'
              ? 'text-[#4edea3] bg-[#222a3d] font-bold shadow-md'
              : 'text-[#c2c6d7] hover:bg-[#2d3449]/60'
          }`}
        >
          <span
            className="material-symbols-outlined text-2xl"
            style={{ fontVariationSettings: activeTab === 'watchlist' ? "'FILL' 1" : "'FILL' 0" }}
          >
            star
          </span>
          <span className="font-label-sm text-[10px] mt-1">Watchlist</span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          title="Search"
          className={`flex flex-col items-center justify-center p-3 rounded-xl w-14 transition-all ${
            activeTab === 'search'
              ? 'text-[#4edea3] bg-[#222a3d] font-bold shadow-md'
              : 'text-[#c2c6d7] hover:bg-[#2d3449]/60'
          }`}
        >
          <span
            className="material-symbols-outlined text-2xl"
            style={{ fontVariationSettings: activeTab === 'search' ? "'FILL' 1" : "'FILL' 0" }}
          >
            search
          </span>
          <span className="font-label-sm text-[10px] mt-1">Search</span>
        </button>
      </aside>
    </>
  );
};
