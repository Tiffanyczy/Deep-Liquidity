import { MarketIndex, Stock, StockInsight, AIPulse } from '../types';

export const initialMarketIndices: MarketIndex[] = [
  {
    symbol: 'S&P 500',
    name: 'S&P 500 Index',
    value: '5,137.08',
    change: '+63.02',
    changePercent: '+1.24%',
    isPositive: true,
    sparklineData: [25, 22, 28, 15, 18, 10, 12, 5, 8, 2, 5],
  },
  {
    symbol: 'NASDAQ',
    name: 'Nasdaq Composite',
    value: '16,274.94',
    change: '+295.72',
    changePercent: '+1.85%',
    isPositive: true,
    sparklineData: [28, 20, 24, 10, 15, 5, 8, 2],
  },
  {
    symbol: 'DOW JONES',
    name: 'Dow Jones Industrial Average',
    value: '39,043.32',
    change: '-58.56',
    changePercent: '-0.15%',
    isPositive: false,
    sparklineData: [5, 8, 2, 15, 12, 25],
  },
  {
    symbol: 'RUSSELL 2000',
    name: 'Russell 2000 Small-Cap Index',
    value: '2,078.40',
    change: '+18.96',
    changePercent: '+0.92%',
    isPositive: true,
    sparklineData: [20, 18, 22, 14, 10, 8, 4],
  },
  {
    symbol: 'BITCOIN',
    name: 'Bitcoin / USD',
    value: '$67,420.00',
    change: '+$2,060.00',
    changePercent: '+3.15%',
    isPositive: true,
    sparklineData: [35, 30, 25, 20, 15, 10, 5, 2],
  },
];

export const initialAIPulse: AIPulse = {
  title: 'Bullish sentiment driven by tech earnings',
  summary:
    'Algorithmic analysis indicates a strong rotation into mega-cap technology stocks following robust forward guidance. Institutional liquidity flows remain concentrated in semiconductor and AI-infrastructure equities, overriding broader macroeconomic headwinds in the manufacturing sector.',
  tags: ['TECH', 'HIGH MOMENTUM'],
  lastUpdated: 'Just now',
};

export const initialStocks: Stock[] = [
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corp',
    price: 822.79,
    change: 31.65,
    changePercent: 4.0,
    isPositive: true,
    volume: '42.8M',
    marketCap: '$2.05T',
    sector: 'Tech',
    hasAIAlert: true,
    sparklineData: [10, 15, 12, 25, 30, 28, 38, 40],
  },
  {
    ticker: 'AAPL',
    name: 'Apple Inc',
    price: 179.66,
    change: -1.08,
    changePercent: -0.6,
    isPositive: false,
    volume: '54.2M',
    marketCap: '$2.78T',
    sector: 'Tech',
    hasAIAlert: false,
    sparklineData: [5, 8, 12, 10, 18, 22, 28],
  },
  {
    ticker: 'TSLA',
    name: 'Tesla Inc',
    price: 202.64,
    change: 0.77,
    changePercent: 0.38,
    isPositive: true,
    volume: '88.1M',
    marketCap: '$645.2B',
    sector: 'Automotive',
    hasAIAlert: true,
    sparklineData: [25, 28, 20, 15, 25, 18, 10, 5],
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 174.32,
    change: 2.13,
    changePercent: 1.24,
    isPositive: true,
    volume: '28.4M',
    marketCap: '$2.18T',
    sector: 'Tech',
    hasAIAlert: true,
    sparklineData: [30, 28, 35, 20, 5, 25, 15, 5, 18, 8, 12],
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corp.',
    price: 412.05,
    change: 3.47,
    changePercent: 0.85,
    isPositive: true,
    volume: '22.1M',
    marketCap: '$3.06T',
    sector: 'Tech',
    hasAIAlert: false,
    sparklineData: [25, 25, 15, 18, 20, 30, 15, 5],
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 185.1,
    change: 3.81,
    changePercent: 2.1,
    isPositive: true,
    volume: '35.9M',
    marketCap: '$1.92T',
    sector: 'Tech',
    hasAIAlert: true,
    sparklineData: [35, 30, 32, 15, 20, 2],
  },
  {
    ticker: 'META',
    name: 'Meta Platforms',
    price: 495.2,
    change: -2.24,
    changePercent: -0.45,
    isPositive: false,
    volume: '16.8M',
    marketCap: '$1.26T',
    sector: 'Tech',
    hasAIAlert: false,
    sparklineData: [5, 15, 10, 25, 20, 35],
  },
  {
    ticker: 'AMD',
    name: 'Advanced Micro Devices',
    price: 178.5,
    change: 5.25,
    changePercent: 3.03,
    isPositive: true,
    volume: '62.4M',
    marketCap: '$288.5B',
    sector: 'Tech',
    hasAIAlert: true,
    sparklineData: [28, 22, 18, 12, 8, 4],
  },
  {
    ticker: 'NFLX',
    name: 'Netflix Inc',
    price: 610.4,
    change: 8.9,
    changePercent: 1.48,
    isPositive: true,
    volume: '8.1M',
    marketCap: '$264.1B',
    sector: 'Tech',
    hasAIAlert: false,
    sparklineData: [30, 25, 20, 15, 10, 5],
  },
  {
    ticker: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    price: 512.8,
    change: 6.2,
    changePercent: 1.22,
    isPositive: true,
    volume: '74.5M',
    marketCap: '$502B',
    sector: 'Finance',
    hasAIAlert: false,
    sparklineData: [22, 20, 18, 12, 8, 5],
  },
];

export function getTimeframeDataForStock(stock: Stock, dateStr?: string): Record<import('../types').TimeframeKey, import('../types').TimeframePrice> {
  const price = stock.price;
  const isPos = stock.isPositive;

  // Safe date parsing for labels
  let baseDate = new Date();
  if (dateStr) {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        baseDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
      }
    } catch {
      baseDate = new Date();
    }
  }

  const formatShortMonthDay = (d: Date) => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  const formatYearLabel = (d: Date) => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const yr = String(d.getFullYear()).slice(-2);
    return `${months[d.getMonth()]} '${yr}`;
  };

  // Compute 1W labels
  const wD1 = new Date(baseDate); wD1.setDate(baseDate.getDate() - 6);
  const wD2 = new Date(baseDate); wD2.setDate(baseDate.getDate() - 3);

  // Compute 1M labels
  const mD1 = new Date(baseDate); mD1.setDate(baseDate.getDate() - 30);
  const mD2 = new Date(baseDate); mD2.setDate(baseDate.getDate() - 15);

  // Compute 3M labels
  const m3D1 = new Date(baseDate); m3D1.setDate(baseDate.getDate() - 90);
  const m3D2 = new Date(baseDate); m3D2.setDate(baseDate.getDate() - 45);

  // Compute 1Y labels
  const yD1 = new Date(baseDate); yD1.setDate(baseDate.getDate() - 365);
  const yD2 = new Date(baseDate); yD2.setDate(baseDate.getDate() - 180);

  // Price adjustment multiplier based on date string
  let dateSeed = 0;
  if (dateStr) {
    for (let i = 0; i < dateStr.length; i++) dateSeed += dateStr.charCodeAt(i);
  }
  const factor = 1 + ((dateSeed % 15) - 7) * 0.01;
  const adjPrice = Number((price * factor).toFixed(2));

  return {
    '1D': {
      periodKey: '1D',
      label: 'Daily (1D)',
      price: adjPrice,
      change: isPos ? `+$${stock.change.toFixed(2)}` : `-$${Math.abs(stock.change).toFixed(2)}`,
      changePercent: isPos ? `+${stock.changePercent.toFixed(2)}%` : `${stock.changePercent.toFixed(2)}%`,
      isPositive: isPos,
      high: Number((adjPrice * 1.018).toFixed(2)),
      low: Number((adjPrice * 0.982).toFixed(2)),
      sparklineData: stock.sparklineData && stock.sparklineData.length > 0 ? stock.sparklineData : [10, 15, 12, 28, 45, 52, 60, 75, 88],
      timeLabels: ['9:30 AM', '12:00 PM', '4:00 PM'],
    },
    '1W': {
      periodKey: '1W',
      label: 'Weekly (1W)',
      price: adjPrice,
      change: '+$9.45',
      changePercent: '+4.88%',
      isPositive: true,
      high: Number((adjPrice * 1.045).toFixed(2)),
      low: Number((adjPrice * 0.955).toFixed(2)),
      sparklineData: [12, 18, 15, 22, 28, 32, 40, 48, 55],
      timeLabels: [formatShortMonthDay(wD1), formatShortMonthDay(wD2), formatShortMonthDay(baseDate)],
    },
    '1M': {
      periodKey: '1M',
      label: 'Monthly (1M)',
      price: adjPrice,
      change: '-$4.35',
      changePercent: '-2.10%',
      isPositive: false,
      high: Number((adjPrice * 1.082).toFixed(2)),
      low: Number((adjPrice * 0.915).toFixed(2)),
      sparklineData: [65, 58, 52, 40, 38, 25, 20, 18, 22],
      timeLabels: [formatShortMonthDay(mD1), formatShortMonthDay(mD2), formatShortMonthDay(baseDate)],
    },
    '3M': {
      periodKey: '3M',
      label: '3 Months (3M)',
      price: adjPrice,
      change: '+$24.10',
      changePercent: '+13.50%',
      isPositive: true,
      high: Number((adjPrice * 1.15).toFixed(2)),
      low: Number((adjPrice * 0.88).toFixed(2)),
      sparklineData: [20, 25, 30, 22, 40, 55, 62, 70, 82],
      timeLabels: [formatShortMonthDay(m3D1), formatShortMonthDay(m3D2), formatShortMonthDay(baseDate)],
    },
    '1Y': {
      periodKey: '1Y',
      label: 'Yearly (1Y)',
      price: adjPrice,
      change: '+$56.20',
      changePercent: '+38.40%',
      isPositive: true,
      high: Number((adjPrice * 1.25).toFixed(2)),
      low: Number((adjPrice * 0.68).toFixed(2)),
      sparklineData: [10, 15, 25, 20, 35, 45, 55, 65, 88],
      timeLabels: [formatYearLabel(yD1), formatYearLabel(yD2), formatYearLabel(baseDate)],
    },
  };
}

export function getDynamicInsightForStock(stock: Stock, dateStr: string): StockInsight {
  const formatFullDate = (iso: string) => {
    try {
      const parts = iso.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
      return iso;
    } catch {
      return iso;
    }
  };

  const formattedDateStr = formatFullDate(dateStr);

  const seedString = `${stock.ticker}-${dateStr}`;
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  const catalystsByTicker: Record<string, Array<{ title: string; cat: string; desc: string }>> = {
    TSLA: [
      {
        title: 'FSD Unsupervised Autonomous Testing Approval',
        cat: 'REGULATORY CATALYST',
        desc: `Regulatory filings on ${formattedDateStr} confirmed expanded robotaxi trial permits in key markets. Buy-side interest escalated rapidly following the disclosure.`,
      },
      {
        title: 'Megapack Storage Production & Grid Deployment Record',
        cat: 'CAPITAL ALLOCATION',
        desc: `Energy division shipment throughput on ${formattedDateStr} reached new quarterly highs with utility grid expansion contracts across North America.`,
      },
      {
        title: 'Federal Reserve Rate Policy & Growth Sector Inflows',
        cat: 'MACRO LIQUIDITY',
        desc: `Central bank interest rate commentary on ${formattedDateStr} eased borrowing cost concerns, driving liquidity into high-beta technology leaders.`,
      },
    ],
    NVDA: [
      {
        title: 'Blackwell GPU Datacenter Cluster Allocation Expansion',
        cat: 'PRODUCT CATALYST',
        desc: `Hyperscale cloud operators increased hardware reservations for NVDA Blackwell servers on ${formattedDateStr}, pushing sell-side consensus higher.`,
      },
      {
        title: 'Sovereign AI Infrastructure Investment Expansion',
        cat: 'ENTERPRISE DEAL',
        desc: `National datacenter initiatives announced $3.8B in hardware commitments on ${formattedDateStr}, sparking aggressive institutional accumulation.`,
      },
      {
        title: 'Semiconductor Supply Chain & Advanced Packaging Records',
        cat: 'OPERATIONAL CATALYST',
        desc: `TSMC packaging bottlenecks eased on ${formattedDateStr}, accelerating delivery timelines for enterprise AI compute platforms.`,
      },
    ],
    GOOGL: [
      {
        title: 'Gemini 2.5 Multi-Modal Enterprise Deployment',
        cat: 'AI ENGINE CATALYST',
        desc: `Google Cloud Enterprise AI deals expanded on ${formattedDateStr} following major Healthcare and Automotive multi-year software migrations.`,
      },
      {
        title: 'Waymo Autonomous Commercial Trip Volume Record',
        cat: 'AUTONOMOUS VEHICLES',
        desc: `Waymo logged over 250,000 weekly paid autonomous trips on ${formattedDateStr}, bolstering long-term sum-of-the-parts valuation models.`,
      },
    ],
  };

  const tickerCatalysts = catalystsByTicker[stock.ticker] || [
    {
      title: `${stock.name} Strategic Expansion & Portfolio Optimization`,
      cat: 'BUSINESS CATALYST',
      desc: `Institutional trading activity around ${stock.ticker} on ${formattedDateStr} registered elevated buy-side volume as institutional accounts rebalanced portfolios.`,
    },
    {
      title: `${stock.name} Quarterly Capital Allocation & Market Orders`,
      cat: 'MARKET REACTION',
      desc: `Market makers reported balanced order books around $${stock.price.toFixed(2)} on ${formattedDateStr} with active call options volume.`,
    },
  ];

  const catObj = tickerCatalysts[positiveHash % tickerCatalysts.length];
  const isPositiveDay = (positiveHash % 2) === 0;
  const changeVal = (0.6 + (positiveHash % 38) / 10).toFixed(2);
  const changePercentStr = isPositiveDay ? `+${changeVal}%` : `-${changeVal}%`;
  const retailScore = 62 + (positiveHash % 32);
  const instScore = 58 + ((positiveHash * 3) % 38);

  return {
    ticker: stock.ticker,
    companyName: stock.name,
    date: formattedDateStr,
    catalystTitle: catObj.title,
    catalystCategory: catObj.cat,
    catalystDescription: catObj.desc,
    intradayChange: changePercentStr,
    intradayNote: isPositiveDay
      ? `Heavy institutional block trading on ${formattedDateStr} sustained price momentum above $${(stock.price * 0.985).toFixed(2)}.`
      : `Consolidation pressure on ${formattedDateStr} as short-term traders took profit near technical resistance at $${(stock.price * 1.02).toFixed(2)}.`,
    intradaySparkline: isPositiveDay ? [12, 18, 25, 40, 58, 72, 85] : [85, 70, 52, 45, 38, 22, 15],
    sentiment: isPositiveDay ? 'BULLISH' : 'NEUTRAL',
    retailScore: retailScore,
    institutionalScore: instScore,
    timeline: [
      {
        time: '9:30 AM EST',
        title: 'Market Open Liquidity',
        description: `Opening volume surge in ${stock.ticker} on ${formattedDateStr} as institutional pools opened orders.`,
        changePercent: isPositiveDay ? '+0.9%' : '-0.6%',
        isPositive: isPositiveDay,
      },
      {
        time: '12:30 PM EST',
        title: 'Midday Volume Flow',
        description: `Secondary block trades cleared across major exchanges on ${formattedDateStr}.`,
        changePercent: isPositiveDay ? '+2.1%' : '-1.2%',
        isPositive: isPositiveDay,
      },
      {
        time: '3:45 PM EST',
        title: 'Power Hour Position Settlement',
        description: `Closing market-on-close imbalance executed with high liquidity on ${formattedDateStr}.`,
        changePercent: changePercentStr,
        isPositive: isPositiveDay,
      },
    ],
    timeframes: getTimeframeDataForStock(stock, dateStr),
  };
}

export const stockInsightsMap: Record<string, StockInsight> = {
  TSLA: {
    ticker: 'TSLA',
    companyName: 'Tesla Inc',
    date: 'March 15, 2024',
    catalystTitle: 'Federal Reserve Rate Decision',
    catalystCategory: 'THE CATALYST',
    catalystDescription:
      "The primary driver for today's price action was the Federal Open Market Committee's decision to leave benchmark interest rates unchanged at 5.25%-5.50%. While widely anticipated, the accompanying commentary was notably less hawkish than previous statements, leading to a rapid repricing of risk assets across growth sectors.",
    intradayChange: '+5.3%',
    intradayNote:
      'Sharp reversal following 11:00 AM announcement. Heavy institutional buying indicated by block trades exceeding 50k shares.',
    intradaySparkline: [25, 28, 20, 15, 25, 5, 0],
    sentiment: 'BULLISH',
    retailScore: 82,
    institutionalScore: 68,
    timeline: [
      {
        time: '9:30 AM EST',
        title: 'Market Open',
        description:
          'Initial gap down following European market weakness. Volume slightly below 30-day average.',
        changePercent: '-1.2%',
        isPositive: false,
      },
      {
        time: '11:00 AM EST',
        title: 'Fed Announcement',
        description:
          'Interest rate decision holds steady; dovish commentary sparks immediate sector rotation.',
        changePercent: '+2.4%',
        isPositive: true,
      },
      {
        time: '2:00 PM EST',
        title: 'Sector-wide Rally',
        description:
          'Momentum building across EV makers. Breakout above key resistance level at $175.50 on high volume.',
        changePercent: '+4.1%',
        isPositive: true,
      },
    ],
  },
  NVDA: {
    ticker: 'NVDA',
    companyName: 'NVIDIA Corp',
    date: 'March 15, 2024',
    catalystTitle: 'GTC Keynote & Next-Gen Architecture',
    catalystCategory: 'THE CATALYST',
    catalystDescription:
      'Institutional order flows surged following updated supplier checks indicating expanded cloud datacenter allocations. Blackwell GPU architecture demand projections surpassed sell-side estimates by 18%, accelerating buy-side upgrades.',
    intradayChange: '+4.0%',
    intradayNote:
      'Sustained buying throughout morning trade. Heavy call option sweep volume detected at $850 strike.',
    intradaySparkline: [30, 25, 20, 18, 12, 5, 2],
    sentiment: 'BULLISH',
    retailScore: 94,
    institutionalScore: 88,
    timeline: [
      {
        time: '9:30 AM EST',
        title: 'Pre-market Gap Up',
        description: 'Semiconductor sector strength leads market opening.',
        changePercent: '+1.8%',
        isPositive: true,
      },
      {
        time: '12:15 PM EST',
        title: 'Analyst Price Target Hike',
        description:
          'Major Wall Street bank raises price target to $1,000 citing Blackwell platform margins.',
        changePercent: '+3.2%',
        isPositive: true,
      },
      {
        time: '3:45 PM EST',
        title: 'Power Hour Surge',
        description: 'Institutional index rebalancing drives closing high.',
        changePercent: '+4.0%',
        isPositive: true,
      },
    ],
  },
  GOOGL: {
    ticker: 'GOOGL',
    companyName: 'Alphabet Inc.',
    date: 'March 15, 2024',
    catalystTitle: 'Gemini 2.5 Ecosystem Integration',
    catalystCategory: 'THE CATALYST',
    catalystDescription:
      'Enterprise cloud revenue forecasts were revised upward following multi-year AI infra deal disclosures with major healthcare and automotive conglomerates.',
    intradayChange: '+1.24%',
    intradayNote:
      'Steady accumulation in secondary liquidity pools with low volatility.',
    intradaySparkline: [20, 18, 15, 12, 10, 4, 2],
    sentiment: 'BULLISH',
    retailScore: 78,
    institutionalScore: 84,
    timeline: [
      {
        time: '9:30 AM EST',
        title: 'Open Steady',
        description: 'Trading in tight range alongside broader tech index.',
        changePercent: '+0.3%',
        isPositive: true,
      },
      {
        time: '1:30 PM EST',
        title: 'Cloud Contract Announcement',
        description: '$1.2B Enterprise AI contract signed with major automaker.',
        changePercent: '+1.2%',
        isPositive: true,
      },
    ],
  },
};
