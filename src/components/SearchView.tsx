import React, { useEffect, useState } from 'react';
import { CompanyListing, Stock } from '../types';
import { finnhubService } from '../services/finnhubService';

interface SearchViewProps {
  stocks: Stock[];
  watchlist: Stock[];
  onSelectStock: (stock: Stock) => void;
  onAddToWatchlist: (stock: Stock) => void;
  onViewInsightsForTicker: (ticker: string) => void;
  onDiscoverAndViewInsights: (stock: Stock) => void;
}

const MAX_MARKET_RESULTS = 25;

// Placeholder Stock for a company found only in the full-market directory —
// StockDetailModal fetches its own live quote/profile once selected.
const toSkeletonStock = (company: CompanyListing): Stock => ({
  ticker: company.symbol,
  name: company.name,
  price: 0,
  change: 0,
  changePercent: 0,
  isPositive: true,
  volume: '—',
  marketCap: '—',
  sector: 'Unknown',
  sparklineData: [],
});

export const SearchView: React.FC<SearchViewProps> = ({
  stocks,
  watchlist,
  onSelectStock,
  onAddToWatchlist,
  onViewInsightsForTicker,
  onDiscoverAndViewInsights,
}) => {
  const [query, setQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [allCompanies, setAllCompanies] = useState<CompanyListing[]>([]);
  const [companiesLoaded, setCompaniesLoaded] = useState(false);
  const [loadingSymbol, setLoadingSymbol] = useState<string | null>(null);

  const sectors = ['All', 'Tech', 'Automotive', 'Finance'];

  // Load the full US public company directory once (cached server-side),
  // used to power search across the whole market, not just tracked tickers.
  useEffect(() => {
    let cancelled = false;
    finnhubService
      .getSymbols()
      .then((companies) => {
        if (!cancelled) setAllCompanies(companies);
      })
      .finally(() => {
        if (!cancelled) setCompaniesLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredStocks = stocks.filter((stock) => {
    const matchesQuery =
      stock.ticker.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase());
    const matchesSector = selectedSector === 'All' || stock.sector === selectedSector;
    return matchesQuery && matchesSector;
  });

  // Broader market matches beyond the curated/tracked list — only computed
  // once the user is actually searching, and capped to protect the free-tier
  // Finnhub rate limit.
  const curatedTickers = new Set(stocks.map((s) => s.ticker));
  const trimmedQuery = query.trim().toLowerCase();
  const marketMatches = trimmedQuery
    ? allCompanies
        .filter(
          (c) =>
            !curatedTickers.has(c.symbol) &&
            (c.symbol.toLowerCase().includes(trimmedQuery) ||
              c.name.toLowerCase().includes(trimmedQuery))
        )
        .slice(0, MAX_MARKET_RESULTS)
    : [];

  // Fetches a real quote for a market-search company before handing it off,
  // so the Insights view and watchlist cards (which don't fetch live data
  // themselves) don't show a stale $0.00 placeholder.
  const resolveLiveStock = async (company: CompanyListing): Promise<Stock> => {
    setLoadingSymbol(company.symbol);
    try {
      const quote = await finnhubService.getQuote(company.symbol);
      const base = toSkeletonStock(company);
      if (quote && quote.c > 0) {
        return {
          ...base,
          price: Number(quote.c.toFixed(2)),
          change: Number(quote.d.toFixed(2)),
          changePercent: Number(quote.dp.toFixed(2)),
          isPositive: quote.d >= 0,
        };
      }
      return base;
    } finally {
      setLoadingSymbol(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <div>
        <h1 className="font-headline-lg text-2xl font-bold text-[#dae2fd]">Search & Discovery</h1>
        <p className="font-body-md text-sm text-[#c2c6d7] mt-1">
          Explore liquidity flows, asset prices, and AI intelligence tags across{' '}
          {companiesLoaded && allCompanies.length > 0
            ? `${allCompanies.length.toLocaleString()}+ US public companies`
            : 'markets'}
          .
        </p>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c90a0] text-xl">
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by ticker symbol or company name (e.g. NVDA, Tesla, GOOGL)..."
          className="w-full bg-[#171f33] border border-[#2d3449] rounded-xl pl-11 pr-10 py-3 text-sm text-[#dae2fd] placeholder-[#8c90a0] focus:outline-none focus:border-[#afc6ff] shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8c90a0] hover:text-[#dae2fd]"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>

      {/* Sector Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {sectors.map((sector) => (
          <button
            key={sector}
            onClick={() => setSelectedSector(sector)}
            className={`px-3.5 py-1.5 rounded-lg font-label-md text-xs transition-colors ${
              selectedSector === sector
                ? 'bg-[#528dff] text-[#00275f] font-bold shadow-sm'
                : 'bg-[#171f33] text-[#c2c6d7] hover:bg-[#2d3449] border border-[#2d3449]'
            }`}
          >
            {sector}
          </button>
        ))}
      </div>

      {/* Search Results List */}
      <div className="data-card divide-y divide-[#2d3449] overflow-hidden">
        {filteredStocks.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#8c90a0]">
            No financial instruments found matching "{query}".
          </div>
        ) : (
          filteredStocks.map((stock) => {
            const inWatchlist = watchlist.some((item) => item.ticker === stock.ticker);

            return (
              <div
                key={stock.ticker}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#2d3449]/40 transition-colors"
              >
                <div
                  onClick={() => onSelectStock(stock)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#222a3d] border border-[#424754] flex items-center justify-center font-label-md font-bold text-[#afc6ff]">
                    {stock.ticker.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-sm font-bold text-[#dae2fd]">
                        {stock.ticker}
                      </span>
                      <span className="font-label-sm text-[10px] px-1.5 py-0.5 bg-[#2d3449] text-[#c2c6d7] rounded">
                        {stock.sector}
                      </span>
                    </div>
                    <div className="font-body-md text-xs text-[#c2c6d7]">{stock.name}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <div className="font-data-display text-sm font-semibold text-[#dae2fd]">
                      ${stock.price.toFixed(2)}
                    </div>
                    <div
                      className={`font-label-sm text-xs ${
                        stock.isPositive ? 'text-[#4edea3]' : 'text-[#ffb4ab]'
                      }`}
                    >
                      {stock.isPositive ? `+${stock.changePercent.toFixed(2)}%` : `${stock.changePercent.toFixed(2)}%`}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewInsightsForTicker(stock.ticker)}
                      className="px-2.5 py-1 bg-[#222a3d] hover:bg-[#31394d] text-[#afc6ff] font-label-md text-xs rounded border border-[#424754] transition-colors"
                      title="View AI Insights"
                    >
                      Insights
                    </button>

                    <button
                      onClick={() => onAddToWatchlist(stock)}
                      disabled={inWatchlist}
                      className={`px-3 py-1 font-label-md text-xs rounded transition-colors ${
                        inWatchlist
                          ? 'bg-[#2d3449] text-[#8c90a0] cursor-default'
                          : 'bg-[#528dff] hover:bg-[#afc6ff] text-[#00275f] font-bold'
                      }`}
                    >
                      {inWatchlist ? 'Added' : '+ Watchlist'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Broader Market Matches — full US company directory, price loads on demand */}
      {trimmedQuery && (
        <div className="flex flex-col gap-2">
          <h2 className="font-label-md text-xs text-[#8c90a0] tracking-wider uppercase">
            More Across The Market
          </h2>
          <div className="data-card divide-y divide-[#2d3449] overflow-hidden">
            {!companiesLoaded ? (
              <div className="p-6 text-center text-sm text-[#8c90a0]">
                Loading company directory…
              </div>
            ) : marketMatches.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#8c90a0]">
                {allCompanies.length === 0
                  ? 'Full market search needs a Finnhub API key configured on the server.'
                  : `No additional matches for "${query}".`}
              </div>
            ) : (
              marketMatches.map((company) => {
                const skeleton = toSkeletonStock(company);
                const inWatchlist = watchlist.some((item) => item.ticker === company.symbol);
                const isLoading = loadingSymbol === company.symbol;

                return (
                  <div
                    key={company.symbol}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#2d3449]/40 transition-colors"
                  >
                    <div
                      onClick={() => onSelectStock(skeleton)}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#222a3d] border border-[#424754] flex items-center justify-center font-label-md font-bold text-[#afc6ff]">
                        {company.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <span className="font-label-md text-sm font-bold text-[#dae2fd]">
                          {company.symbol}
                        </span>
                        <div className="font-body-md text-xs text-[#c2c6d7]">{company.name}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={async () => {
                          const live = await resolveLiveStock(company);
                          onDiscoverAndViewInsights(live);
                        }}
                        disabled={isLoading}
                        className="px-2.5 py-1 bg-[#222a3d] hover:bg-[#31394d] text-[#afc6ff] font-label-md text-xs rounded border border-[#424754] transition-colors disabled:opacity-50"
                        title="View AI Insights"
                      >
                        {isLoading ? '...' : 'Insights'}
                      </button>

                      <button
                        onClick={async () => {
                          const live = await resolveLiveStock(company);
                          onAddToWatchlist(live);
                        }}
                        disabled={inWatchlist || isLoading}
                        className={`px-3 py-1 font-label-md text-xs rounded transition-colors ${
                          inWatchlist
                            ? 'bg-[#2d3449] text-[#8c90a0] cursor-default'
                            : 'bg-[#528dff] hover:bg-[#afc6ff] text-[#00275f] font-bold disabled:opacity-50'
                        }`}
                      >
                        {inWatchlist ? 'Added' : isLoading ? '...' : '+ Watchlist'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {allCompanies.length > 0 && (
            <p className="font-body-md text-[11px] text-[#8c90a0]">
              Showing up to {MAX_MARKET_RESULTS} of {allCompanies.length.toLocaleString()} US-listed
              companies. Live price loads after you select one.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
