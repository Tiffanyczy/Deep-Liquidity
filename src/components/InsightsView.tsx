import React, { useState, useEffect } from 'react';
import { StockInsight, Stock, TimeframePrice, FinnhubNewsItem, FinnhubRecommendation } from '../types';
import { getTimeframeDataForStock } from '../data/marketData';
import { finnhubService } from '../services/finnhubService';

interface InsightsViewProps {
  currentInsight: StockInsight;
  allStocks: Stock[];
  onSelectTicker: (ticker: string) => void;
  onAskAI: (ticker: string, prompt: string) => Promise<string | null>;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  currentInsight,
  allStocks,
  onSelectTicker,
  onAskAI,
  selectedDate,
  onDateChange,
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState<import('../types').TimeframeKey>('1D');

  // Finnhub Live News & Recommendation State
  const [finnhubNews, setFinnhubNews] = useState<FinnhubNewsItem[]>([]);
  const [finnhubRecs, setFinnhubRecs] = useState<FinnhubRecommendation[]>([]);
  const [loadingFinnhub, setLoadingFinnhub] = useState<boolean>(false);

  // Fetch Finnhub live data for current stock
  useEffect(() => {
    let isMounted = true;
    setLoadingFinnhub(true);

    Promise.all([
      finnhubService.getCompanyNews(currentInsight.ticker),
      finnhubService.getRecommendations(currentInsight.ticker),
    ])
      .then(([news, recs]) => {
        if (isMounted) {
          setFinnhubNews(news.slice(0, 4));
          setFinnhubRecs(recs);
          setLoadingFinnhub(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingFinnhub(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentInsight.ticker]);

  // Interactive Chart State for Trend Price Inspection
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isPinned, setIsPinned] = useState(false);

  const stockObj = allStocks.find((s) => s.ticker === currentInsight.ticker) || {
    ticker: currentInsight.ticker,
    name: currentInsight.companyName,
    price: 202.64,
    change: 0.77,
    changePercent: 0.38,
    isPositive: true,
    volume: '88.1M',
    marketCap: '$645.2B',
    sector: 'Automotive',
    sparklineData: [25, 28, 20, 15, 25, 18, 10, 5],
  };

  const timeframes: Record<import('../types').TimeframeKey, TimeframePrice> =
    currentInsight.timeframes || getTimeframeDataForStock(stockObj, selectedDate);

  const selectedTimeframeData = timeframes[activeTimeframe] || timeframes['1D'];

  // Smooth SVG curve generator with point coordinates output
  const generateSmoothPath = (data: number[], width: number, height: number) => {
    if (!data || data.length === 0) return { linePath: '', areaPath: '', points: [] };
    const maxVal = Math.max(...data, 1);
    const minVal = Math.min(...data, 0);
    const range = maxVal - minVal || 1;

    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 30) - 15;
      return { x, y, val };
    });

    if (points.length === 1) return { linePath: `M 0,${points[0].y}`, areaPath: '', points };

    let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }

    const areaPath = `${d} L ${width},${height} L 0,${height} Z`;
    return { linePath: d, areaPath, points };
  };

  // Detailed time and date label generator per timeframe index
  const getPointTimeLabel = (index: number, total: number, tf: import('../types').TimeframeKey) => {
    const ratio = total > 1 ? index / (total - 1) : 1;

    let baseDate = new Date();
    if (selectedDate) {
      try {
        const parts = selectedDate.split('-');
        if (parts.length === 3) {
          baseDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
        }
      } catch {
        baseDate = new Date();
      }
    }

    const formatShort = (d: Date) => {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (tf === '1D') {
      const startMinutes = 9 * 60 + 30; // 9:30 AM
      const currentMin = Math.round(startMinutes + ratio * 390); // 390 mins total
      const hours = Math.floor(currentMin / 60);
      const mins = currentMin % 60;
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours > 12 ? hours - 12 : hours;
      const timeStr = `${displayHours}:${mins < 10 ? '0' : ''}${mins} ${period} EST`;
      return `${formatShort(baseDate)} • ${timeStr}`;
    }

    if (tf === '1W') {
      const targetDate = new Date(baseDate);
      const daysBack = Math.round((1 - ratio) * 6);
      targetDate.setDate(baseDate.getDate() - daysBack);
      return formatShort(targetDate);
    }

    if (tf === '1M') {
      const targetDate = new Date(baseDate);
      const daysBack = Math.round((1 - ratio) * 29);
      targetDate.setDate(baseDate.getDate() - daysBack);
      return formatShort(targetDate);
    }

    if (tf === '3M') {
      const targetDate = new Date(baseDate);
      const daysBack = Math.round((1 - ratio) * 89);
      targetDate.setDate(baseDate.getDate() - daysBack);
      return formatShort(targetDate);
    }

    // 1Y
    const targetDate = new Date(baseDate);
    const daysBack = Math.round((1 - ratio) * 364);
    targetDate.setDate(baseDate.getDate() - daysBack);
    return formatShort(targetDate);
  };

  // Helper to calculate price at index
  const getPointPrice = (index: number, data: number[], tfData: TimeframePrice) => {
    if (!data || data.length === 0) return tfData.price;
    if (index === data.length - 1) return tfData.price;

    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const range = maxVal - minVal || 1;
    const val = data[index];
    const normalized = (val - minVal) / range;
    return tfData.low + normalized * (tfData.high - tfData.low);
  };

  // Formatting date for readable display
  const formatDateDisplay = (isoDate: string) => {
    if (!isoDate) return currentInsight.date;
    try {
      const parts = isoDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return isoDate;
    } catch {
      return isoDate;
    }
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAskingAI(true);
    setAiAnswer(null);

    const fullPrompt = `[Date: ${selectedDate}, Timeframe: ${activeTimeframe}] ${aiPrompt}`;
    const res = await onAskAI(currentInsight.ticker, fullPrompt);
    setAiAnswer(res || 'Unable to generate analysis at this time. Please try again.');
    setIsAskingAI(false);
  };

  // Dynamic preset date buttons relative to today
  const getPresetDates = () => {
    const today = new Date();
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const daysAgo3 = new Date(today);
    daysAgo3.setDate(today.getDate() - 3);

    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setMonth(today.getMonth() - 1);

    return [
      { label: 'Today', value: formatDate(today) },
      { label: 'Yesterday', value: formatDate(yesterday) },
      { label: '3 Days Ago', value: formatDate(daysAgo3) },
      { label: '1 Week Ago', value: formatDate(weekAgo) },
      { label: '1 Month Ago', value: formatDate(monthAgo) },
    ];
  };

  const datePresets = getPresetDates();

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Date & Insight Header */}
      <div className="data-card p-5 bg-[#171f33] border border-[#2d3449] rounded-xl flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-label-sm text-xs text-[#afc6ff] uppercase tracking-wider font-bold">
                AI LIQUIDITY INSIGHTS
              </span>
              <span className="bg-[#2d3449] text-[#c2c6d7] font-label-sm text-[11px] px-2 py-0.5 rounded">
                HISTORICAL ANALYSIS
              </span>
            </div>
            <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-[#dae2fd]">
              Insights for {formatDateDisplay(selectedDate)}
            </h1>
            <p className="font-body-md text-xs sm:text-sm text-[#c2c6d7] mt-1">
              Catalyst breakdowns and multi-timeframe price performance for{' '}
              <span className="font-bold text-[#afc6ff]">{currentInsight.ticker}</span> ({currentInsight.companyName}).
            </p>
          </div>

          {/* Date Selection Box */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-[#0b1326] p-3 rounded-xl border border-[#2d3449]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#afc6ff] text-lg">calendar_month</span>
              <span className="font-label-sm text-xs text-[#c2c6d7] font-medium">Select Date:</span>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-[#171f33] border border-[#424754] text-[#dae2fd] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#afc6ff] font-data-display cursor-pointer"
            />
          </div>
        </div>

        {/* Quick Date Presets & Ticker Selectors */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-[#2d3449]">
          {/* Quick Date Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="font-label-sm text-[11px] text-[#8c90a0] uppercase mr-1">Presets:</span>
            {datePresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => onDateChange(preset.value)}
                className={`px-2.5 py-1 rounded-md font-label-sm text-xs transition-colors ${
                  selectedDate === preset.value
                    ? 'bg-[#528dff] text-[#00275f] font-bold'
                    : 'bg-[#222a3d] text-[#c2c6d7] hover:bg-[#31394d]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Quick Ticker Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="font-label-sm text-[11px] text-[#8c90a0] uppercase mr-1">Ticker:</span>
            {allStocks.slice(0, 6).map((stock) => (
              <button
                key={stock.ticker}
                onClick={() => onSelectTicker(stock.ticker)}
                className={`px-2.5 py-1 rounded-md font-label-md text-xs transition-all ${
                  currentInsight.ticker === stock.ticker
                    ? 'bg-[#4edea3] text-[#003823] font-bold shadow-sm'
                    : 'bg-[#222a3d] text-[#c2c6d7] hover:bg-[#31394d]'
                }`}
              >
                {stock.ticker}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Timeframe Price & Interactive Chart Section (Matches Screenshot) */}
      <section className="data-card p-6 bg-[#0b1326] border border-[#2d3449] rounded-2xl flex flex-col gap-5 shadow-xl">
        {/* Header: Company Name & Big Display Price */}
        {(() => {
          const sparkData = selectedTimeframeData.sparklineData || [];
          const activeIdx = hoverIndex !== null ? hoverIndex : sparkData.length - 1;
          const displayedPrice = getPointPrice(activeIdx, sparkData, selectedTimeframeData);
          const startPrice = getPointPrice(0, sparkData, selectedTimeframeData);
          const priceDiff = displayedPrice - startPrice;
          const priceDiffPercent = startPrice > 0 ? (priceDiff / startPrice) * 100 : 0;
          const isInspecting = hoverIndex !== null;
          const inspectedTimeLabel = isInspecting
            ? getPointTimeLabel(hoverIndex, sparkData.length, activeTimeframe)
            : null;

          return (
            <div>
              <div className="flex justify-between items-center">
                <div className="font-label-md text-xs sm:text-sm font-semibold text-[#8c90a0] uppercase tracking-wider">
                  {currentInsight.companyName || stockObj.name}
                </div>
                {isInspecting && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-[#afc6ff] bg-[#1e293b] px-2.5 py-1 rounded-full border border-[#334155] animate-pulse">
                      🎯 Inspecting {inspectedTimeLabel}
                    </span>
                    <button
                      onClick={() => {
                        setHoverIndex(null);
                        setIsPinned(false);
                      }}
                      className="text-xs text-[#8c90a0] hover:text-[#dae2fd] underline"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="font-data-display text-3xl sm:text-4xl font-bold text-[#dae2fd]">
                  ${displayedPrice.toFixed(2)}
                </span>

                {/* Change pill badge matching screenshot */}
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs sm:text-sm font-mono font-semibold ${
                    isInspecting
                      ? priceDiff >= 0
                        ? 'bg-[#002d1d]/80 border-[#005236] text-[#4edea3]'
                        : 'bg-[#3b0b0e]/80 border-[#690005] text-[#ffb4ab]'
                      : selectedTimeframeData.isPositive
                      ? 'bg-[#002d1d]/80 border-[#005236] text-[#4edea3]'
                      : 'bg-[#3b0b0e]/80 border-[#690005] text-[#ffb4ab]'
                  }`}
                >
                  <span>
                    {isInspecting
                      ? priceDiff >= 0
                        ? '↑'
                        : '↓'
                      : selectedTimeframeData.isPositive
                      ? '↑'
                      : '↓'}
                  </span>
                  <span>
                    {isInspecting
                      ? `${priceDiff >= 0 ? '+' : ''}${priceDiffPercent.toFixed(2)}%`
                      : selectedTimeframeData.changePercent}
                  </span>
                  <span className="opacity-80">
                    (
                    {isInspecting
                      ? `${priceDiff >= 0 ? '+$' : '-$'}${Math.abs(priceDiff).toFixed(2)}`
                      : selectedTimeframeData.change}
                    )
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Main Interactive Chart Container */}
        {(() => {
          const sparkData = selectedTimeframeData.sparklineData || [];
          const { linePath, areaPath, points } = generateSmoothPath(sparkData, 500, 180);

          const handlePointerInteraction = (clientX: number, rect: DOMRect) => {
            if (sparkData.length <= 1) return;
            const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            const idx = Math.round(ratio * (sparkData.length - 1));
            setHoverIndex(idx);
          };

          const activePoint =
            hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

          const activePrice =
            hoverIndex !== null
              ? getPointPrice(hoverIndex, sparkData, selectedTimeframeData)
              : null;

          const activeTimeLabel =
            hoverIndex !== null
              ? getPointTimeLabel(hoverIndex, sparkData.length, activeTimeframe)
              : null;

          return (
            <div
              className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-5 relative overflow-hidden cursor-crosshair group select-none"
              onMouseMove={(e) => {
                if (!isPinned) handlePointerInteraction(e.clientX, e.currentTarget.getBoundingClientRect());
              }}
              onTouchMove={(e) => {
                if (e.touches.length > 0) handlePointerInteraction(e.touches[0].clientX, e.currentTarget.getBoundingClientRect());
              }}
              onClick={(e) => {
                handlePointerInteraction(e.clientX, e.currentTarget.getBoundingClientRect());
                setIsPinned(!isPinned);
              }}
              onMouseLeave={() => {
                if (!isPinned) setHoverIndex(null);
              }}
            >
              {/* Floating Crosshair Price Tooltip Banner */}
              {activePoint && activePrice !== null && (
                <div
                  className="absolute z-20 pointer-events-none transition-all duration-75 transform -translate-x-1/2 -translate-y-12 bg-[#172339] border border-[#528dff]/60 rounded-lg px-3 py-1.5 shadow-2xl flex items-center gap-2"
                  style={{
                    left: `${(activePoint.x / 500) * 100}%`,
                    top: `${Math.max(24, (activePoint.y / 180) * 100)}%`,
                  }}
                >
                  <span className="font-mono text-xs font-bold text-[#dae2fd]">
                    ${activePrice.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-[#afc6ff] border-l border-[#334155] pl-2 font-mono">
                    {activeTimeLabel}
                  </span>
                  <span className="text-[9px] text-[#8c90a0]">
                    {isPinned ? '📌' : 'Click to pin'}
                  </span>
                </div>
              )}

              <div className="h-56 w-full relative">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 500 180"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="timeframeChartGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={selectedTimeframeData.isPositive ? '#4edea3' : '#ffb4ab'}
                        stopOpacity="0.22"
                      />
                      <stop
                        offset="100%"
                        stopColor={selectedTimeframeData.isPositive ? '#4edea3' : '#ffb4ab'}
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>

                  {/* Reference Gridlines */}
                  <line x1="0" y1="45" x2="500" y2="45" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="90" x2="500" y2="90" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="135" x2="500" y2="135" stroke="#1e293b" strokeDasharray="3 3" />

                  {/* Area Gradient */}
                  <path d={areaPath} fill="url(#timeframeChartGrad)" />

                  {/* Glowing Trend Line */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke={selectedTimeframeData.isPositive ? '#4edea3' : '#ffb4ab'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Interactive Crosshair & Cursor Point Dot */}
                  {activePoint && (
                    <g className="transition-all duration-75">
                      {/* Vertical Crosshair Line */}
                      <line
                        x1={activePoint.x}
                        y1="0"
                        x2={activePoint.x}
                        y2="180"
                        stroke="#afc6ff"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        opacity="0.85"
                      />
                      {/* Horizontal Crosshair Line */}
                      <line
                        x1="0"
                        y1={activePoint.y}
                        x2="500"
                        y2={activePoint.y}
                        stroke="#afc6ff"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        opacity="0.4"
                      />
                      {/* Outer Ring Pulse */}
                      <circle
                        cx={activePoint.x}
                        cy={activePoint.y}
                        r="9"
                        fill={selectedTimeframeData.isPositive ? '#4edea3' : '#ffb4ab'}
                        fillOpacity="0.3"
                      />
                      {/* Solid Center Dot */}
                      <circle
                        cx={activePoint.x}
                        cy={activePoint.y}
                        r="4.5"
                        fill="#ffffff"
                        stroke={selectedTimeframeData.isPositive ? '#4edea3' : '#ffb4ab'}
                        strokeWidth="2.5"
                      />
                    </g>
                  )}
                </svg>

                {/* X-Axis Time Labels inside bottom of chart */}
                <div className="absolute bottom-1 inset-x-2 flex justify-between text-[11px] font-mono text-[#8c90a0] pointer-events-none">
                  {(selectedTimeframeData.timeLabels || ['9:30 AM', '12:00 PM', '4:00 PM']).map(
                    (lbl, i) => (
                      <span key={i}>{lbl}</span>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Timeframe Selector Pills directly below chart */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {(['1D', '1W', '1M', '3M', '1Y'] as const).map((tf) => {
            const isSelected = activeTimeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => {
                  setActiveTimeframe(tf);
                  setHoverIndex(null);
                  setIsPinned(false);
                }}
                className={`px-5 py-2 rounded-md font-mono text-xs font-semibold transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#528dff] text-white font-bold shadow-md'
                    : 'text-[#8c90a0] hover:text-[#dae2fd] hover:bg-[#171f33]'
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>

        {/* High / Low & Period Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#2d3449]">
          <div className="bg-[#0f172a] p-3 rounded-lg border border-[#2d3449]">
            <span className="font-label-sm text-[10px] text-[#8c90a0] uppercase">Period High</span>
            <div className="font-data-display text-sm font-semibold text-[#4edea3] mt-0.5">
              ${selectedTimeframeData.high}
            </div>
          </div>
          <div className="bg-[#0f172a] p-3 rounded-lg border border-[#2d3449]">
            <span className="font-label-sm text-[10px] text-[#8c90a0] uppercase">Period Low</span>
            <div className="font-data-display text-sm font-semibold text-[#ffb4ab] mt-0.5">
              ${selectedTimeframeData.low}
            </div>
          </div>
          <div className="bg-[#0f172a] p-3 rounded-lg border border-[#2d3449]">
            <span className="font-label-sm text-[10px] text-[#8c90a0] uppercase">Selected Range</span>
            <div className="font-data-display text-sm font-semibold text-[#dae2fd] mt-0.5">
              {selectedTimeframeData.label}
            </div>
          </div>
          <div className="bg-[#0f172a] p-3 rounded-lg border border-[#2d3449]">
            <span className="font-label-sm text-[10px] text-[#8c90a0] uppercase">Period Net Change</span>
            <div
              className={`font-data-display text-sm font-semibold mt-0.5 ${
                selectedTimeframeData.isPositive ? 'text-[#4edea3]' : 'text-[#ffb4ab]'
              }`}
            >
              {selectedTimeframeData.change}
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Layout for Timeline, Catalyst, and Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Catalyst Timeline (5 Cols) */}
        <div className="md:col-span-5 bg-[#131b2e] border border-[#2d3449] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#2d3449]">
              <span className="material-symbols-outlined text-[#afc6ff] text-xl">schedule</span>
              <h2 className="font-headline-sm text-lg font-semibold text-[#dae2fd]">
                Catalyst Timeline ({formatDateDisplay(selectedDate)})
              </h2>
            </div>

            <div className="space-y-6 relative">
              {currentInsight.timeline.map((item, idx) => (
                <div key={idx} className="timeline-item relative flex gap-4 z-10">
                  <div className="timeline-line flex-shrink-0 mt-1">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        item.isPositive ? 'bg-[#00a572]' : 'bg-[#ff516a]'
                      } flex items-center justify-center relative z-10 ml-4`}
                    />
                  </div>
                  <div>
                    <div className="font-label-sm text-[10px] text-[#c2c6d7] mb-0.5">
                      {item.time}
                    </div>
                    <div className="font-headline-sm text-base text-[#dae2fd] font-semibold leading-tight mb-1">
                      {item.title}
                    </div>
                    <div className="font-body-md text-xs text-[#c2c6d7] leading-relaxed">
                      {item.description}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0b1326] border border-[#2d3449]">
                      <span
                        className={`material-symbols-outlined text-xs ${
                          item.isPositive ? 'text-[#4edea3]' : 'text-[#ffb4ab]'
                        }`}
                      >
                        {item.isPositive ? 'trending_up' : 'trending_down'}
                      </span>
                      <span
                        className={`font-data-display text-[11px] ${
                          item.isPositive ? 'text-[#4edea3]' : 'text-[#ffb4ab]'
                        }`}
                      >
                        {item.changePercent}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Cards (7 Cols) */}
        <div className="md:col-span-7 flex flex-col gap-6">
          {/* The Catalyst Card */}
          <div className="bg-[#131b2e] border border-[#2d3449] rounded-xl p-5 flex-grow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-label-md text-xs text-[#afc6ff] uppercase tracking-wider mb-1">
                  {currentInsight.catalystCategory}
                </div>
                <h3 className="font-headline-md text-xl font-bold text-[#dae2fd]">
                  {currentInsight.catalystTitle}
                </h3>
              </div>
              <span className="material-symbols-outlined text-[#8c90a0] p-2 bg-[#171f33] rounded-lg">
                account_balance
              </span>
            </div>
            <p className="font-body-md text-sm text-[#c2c6d7] leading-relaxed">
              {currentInsight.catalystDescription}
            </p>
          </div>

          {/* Market Reaction & Sentiment Score Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Market Reaction Card */}
            <div className="bg-[#131b2e] border border-[#2d3449] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="font-label-md text-xs text-[#c2c6d7] uppercase tracking-wider mb-2">
                  Market Reaction
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-data-display text-2xl text-[#4edea3] font-bold">
                    {currentInsight.intradayChange}
                  </span>
                  <span className="font-body-md text-xs text-[#c2c6d7]">Intraday</span>
                </div>
                <p className="font-body-md text-xs text-[#c2c6d7] mt-2 leading-relaxed">
                  {currentInsight.intradayNote}
                </p>
              </div>

              {/* Sparkline curve */}
              <div className="mt-4 h-12 w-full flex items-end">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 30">
                  <path
                    d="M0,25 Q10,28 20,20 T40,15 T60,25 T80,5 L100,0"
                    fill="none"
                    stroke="#4edea3"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>

            {/* Sentiment Score Card */}
            <div className="bg-[#131b2e] border border-[#2d3449] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="font-label-md text-xs text-[#c2c6d7] uppercase tracking-wider mb-2">
                  Sentiment Score
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00311f] border border-[#005236] mb-4">
                  <span className="material-symbols-outlined text-[#4edea3] text-sm">mood</span>
                  <span className="font-label-md text-xs text-[#4edea3] font-bold tracking-wider">
                    {currentInsight.sentiment}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between font-label-sm text-xs mb-1">
                    <span className="text-[#c2c6d7]">Retail</span>
                    <span className="text-[#4edea3] font-data-display">
                      {currentInsight.retailScore}/100
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#2d3449] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4edea3]"
                      style={{ width: `${currentInsight.retailScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-label-sm text-xs mb-1">
                    <span className="text-[#c2c6d7]">Institutional</span>
                    <span className="text-[#00a572] font-data-display">
                      {currentInsight.institutionalScore}/100
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#2d3449] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00a572]"
                      style={{ width: `${currentInsight.institutionalScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Finnhub Live News & Analyst Consensus Grid */}
      {(finnhubNews.length > 0 || finnhubRecs.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Real-time Finnhub News (7 Cols) */}
          <div className="md:col-span-7 bg-[#131b2e] border border-[#2d3449] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2d3449]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4edea3]">newspaper</span>
                <h3 className="font-headline-sm text-base font-semibold text-[#dae2fd]">
                  Finnhub Real-Time News Feed
                </h3>
              </div>
              <span className="font-label-sm text-[10px] px-2 py-0.5 bg-[#005236]/30 text-[#4edea3] border border-[#005236] rounded font-semibold">
                LIVE SOURCE
              </span>
            </div>

            <div className="space-y-3.5">
              {finnhubNews.map((item, idx) => (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg bg-[#0b1326] border border-[#2d3449] hover:border-[#528dff] transition-all group"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#8c90a0] mb-1 font-label-sm">
                    <span className="text-[#afc6ff] font-medium">{item.source || 'Market Wire'}</span>
                    <span>
                      {item.datetime ? new Date(item.datetime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                    </span>
                  </div>
                  <h4 className="font-headline-sm text-xs font-semibold text-[#dae2fd] group-hover:text-[#528dff] transition-colors leading-snug line-clamp-2 mb-1">
                    {item.headline}
                  </h4>
                  {item.summary && (
                    <p className="font-body-md text-[11px] text-[#c2c6d7] line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Finnhub Analyst Consensus (5 Cols) */}
          <div className="md:col-span-5 bg-[#131b2e] border border-[#2d3449] rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2d3449]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#afc6ff]">insights</span>
                  <h3 className="font-headline-sm text-base font-semibold text-[#dae2fd]">
                    Analyst Consensus
                  </h3>
                </div>
                <span className="font-label-sm text-[10px] text-[#8c90a0]">
                  {finnhubRecs[0]?.period || 'Current'}
                </span>
              </div>

              {finnhubRecs[0] ? (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between font-label-sm text-xs mb-1">
                      <span className="text-[#4edea3] font-medium">Strong Buy</span>
                      <span className="font-data-display text-[#4edea3] font-bold">
                        {finnhubRecs[0].strongBuy}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0b1326] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4edea3]"
                        style={{
                          width: `${
                            (finnhubRecs[0].strongBuy /
                              Math.max(
                                1,
                                finnhubRecs[0].strongBuy +
                                  finnhubRecs[0].buy +
                                  finnhubRecs[0].hold +
                                  finnhubRecs[0].sell +
                                  finnhubRecs[0].strongSell
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-label-sm text-xs mb-1">
                      <span className="text-[#00a572] font-medium">Buy</span>
                      <span className="font-data-display text-[#00a572] font-bold">
                        {finnhubRecs[0].buy}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0b1326] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00a572]"
                        style={{
                          width: `${
                            (finnhubRecs[0].buy /
                              Math.max(
                                1,
                                finnhubRecs[0].strongBuy +
                                  finnhubRecs[0].buy +
                                  finnhubRecs[0].hold +
                                  finnhubRecs[0].sell +
                                  finnhubRecs[0].strongSell
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-label-sm text-xs mb-1">
                      <span className="text-[#c2c6d7] font-medium">Hold</span>
                      <span className="font-data-display text-[#c2c6d7] font-bold">
                        {finnhubRecs[0].hold}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0b1326] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#c2c6d7]"
                        style={{
                          width: `${
                            (finnhubRecs[0].hold /
                              Math.max(
                                1,
                                finnhubRecs[0].strongBuy +
                                  finnhubRecs[0].buy +
                                  finnhubRecs[0].hold +
                                  finnhubRecs[0].sell +
                                  finnhubRecs[0].strongSell
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-label-sm text-xs mb-1">
                      <span className="text-[#ffb4ab] font-medium">Sell</span>
                      <span className="font-data-display text-[#ffb4ab] font-bold">
                        {finnhubRecs[0].sell + finnhubRecs[0].strongSell}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0b1326] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#ff516a]"
                        style={{
                          width: `${
                            ((finnhubRecs[0].sell + finnhubRecs[0].strongSell) /
                              Math.max(
                                1,
                                finnhubRecs[0].strongBuy +
                                  finnhubRecs[0].buy +
                                  finnhubRecs[0].hold +
                                  finnhubRecs[0].sell +
                                  finnhubRecs[0].strongSell
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="font-body-md text-xs text-[#8c90a0]">
                  Analyst recommendation data will populate from Finnhub.
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#2d3449] flex items-center justify-between text-[11px] text-[#8c90a0]">
              <span>Wall Street Coverage</span>
              <span className="text-[#afc6ff] font-semibold">Institutional Grade</span>
            </div>
          </div>
        </div>
      )}

      {/* Gemini AI Interactive Analyst Module */}
      <div className="data-card p-5 bg-[#171f33] border border-[#2d3449] mt-2">
        <div className="flex items-center gap-2 mb-2 text-[#afc6ff]">
          <span className="material-symbols-outlined">auto_awesome</span>
          <h3 className="font-headline-sm text-base font-semibold">
            Ask Gemini AI Analyst for {currentInsight.ticker} ({formatDateDisplay(selectedDate)})
          </h3>
        </div>
        <p className="font-body-md text-xs text-[#c2c6d7] mb-4">
          Request real-time market sentiment analysis, earnings impact prediction, or option flow analysis for {currentInsight.ticker} on {formatDateDisplay(selectedDate)}.
        </p>

        <form onSubmit={handleAiSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder={`e.g. What were the main liquidity catalysts for ${currentInsight.ticker} on ${formatDateDisplay(selectedDate)}?`}
            className="flex-1 bg-[#0b1326] border border-[#2d3449] rounded-lg px-3.5 py-2 text-xs text-[#dae2fd] placeholder-[#8c90a0] focus:outline-none focus:border-[#afc6ff]"
          />
          <button
            type="submit"
            disabled={isAskingAI}
            className="px-4 py-2 bg-[#528dff] hover:bg-[#afc6ff] text-[#00275f] font-label-md text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            {isAskingAI ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                Analyzing...
              </>
            ) : (
              <>
                <span>Generate</span>
                <span className="material-symbols-outlined text-sm">send</span>
              </>
            )}
          </button>
        </form>

        {aiAnswer && (
          <div className="mt-4 p-4 bg-[#0b1326] border border-[#2d3449] rounded-lg">
            <div className="font-label-sm text-[11px] text-[#afc6ff] uppercase mb-1">
              Gemini Intelligence Synthesis:
            </div>
            <p className="font-body-md text-xs text-[#dae2fd] leading-relaxed whitespace-pre-wrap">
              {aiAnswer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
