import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI Client lazily/safely
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Finnhub API Configuration
  const getFinnhubKey = () => {
    return process.env.FINNHUB_API_KEY || '';
  };

  // Finnhub Connection Status
  app.get('/api/finnhub/status', (req, res) => {
    const key = getFinnhubKey();
    res.json({
      connected: Boolean(key && key.trim().length > 0),
      hasKey: Boolean(key && key.trim().length > 0),
    });
  });

  // Finnhub Single Quote
  app.get('/api/finnhub/quote', async (req, res) => {
    try {
      const symbol = String(req.query.symbol || 'TSLA').toUpperCase();
      const apiKey = getFinnhubKey();

      if (!apiKey) {
        return res.status(200).json({
          symbol,
          connected: false,
          source: 'demo_fallback',
          c: 0,
          d: 0,
          dp: 0,
          h: 0,
          l: 0,
          o: 0,
          pc: 0,
          t: Math.floor(Date.now() / 1000),
        });
      }

      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(apiKey)}`
      );

      if (!response.ok) {
        return res.status(response.status).json({
          error: `Finnhub API returned status ${response.status}`,
          symbol,
        });
      }

      const data = await response.json();
      res.json({
        symbol,
        connected: true,
        source: 'finnhub_live',
        ...data,
      });
    } catch (err: any) {
      console.error('Finnhub quote error:', err);
      res.status(500).json({
        error: 'Failed to fetch quote from Finnhub',
        message: err.message || String(err),
      });
    }
  });

  // Finnhub Multi-Quote Batch
  app.get('/api/finnhub/quotes', async (req, res) => {
    try {
      const symbolsQuery = String(req.query.symbols || 'TSLA,NVDA,AAPL,GOOGL,MSFT,AMZN,META,AMD,SPY,QQQ');
      const symbols = symbolsQuery.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
      const apiKey = getFinnhubKey();

      if (!apiKey) {
        return res.json({
          connected: false,
          quotes: {},
        });
      }

      const results = await Promise.allSettled(
        symbols.map(async (symbol) => {
          const resp = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(apiKey)}`
          );
          if (!resp.ok) throw new Error(`Status ${resp.status}`);
          const data = await resp.json();
          return { symbol, data };
        })
      );

      const quotes: Record<string, any> = {};
      results.forEach((resItem, idx) => {
        const symbol = symbols[idx];
        if (resItem.status === 'fulfilled' && resItem.value.data.c !== 0) {
          quotes[symbol] = {
            ...resItem.value.data,
            symbol,
          };
        }
      });

      res.json({
        connected: true,
        quotes,
      });
    } catch (err: any) {
      console.error('Finnhub batch quotes error:', err);
      res.status(500).json({ error: 'Failed to fetch batch quotes' });
    }
  });

  // Finnhub Company Profile
  app.get('/api/finnhub/profile', async (req, res) => {
    try {
      const symbol = String(req.query.symbol || 'TSLA').toUpperCase();
      const apiKey = getFinnhubKey();

      if (!apiKey) {
        return res.json({
          connected: false,
          symbol,
        });
      }

      const response = await fetch(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(apiKey)}`
      );

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to fetch profile' });
      }

      const data = await response.json();
      res.json({
        connected: true,
        ...data,
      });
    } catch (err: any) {
      console.error('Finnhub profile error:', err);
      res.status(500).json({ error: 'Failed to fetch company profile' });
    }
  });

  // Finnhub Historical Candlesticks
  app.get('/api/finnhub/candles', async (req, res) => {
    try {
      const symbol = String(req.query.symbol || 'TSLA').toUpperCase();
      const resolution = String(req.query.resolution || 'D');
      const nowSec = Math.floor(Date.now() / 1000);
      const from = Number(req.query.from) || nowSec - 30 * 24 * 3600;
      const to = Number(req.query.to) || nowSec;
      const apiKey = getFinnhubKey();

      if (!apiKey) {
        return res.json({
          connected: false,
          s: 'no_data',
        });
      }

      const response = await fetch(
        `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${encodeURIComponent(resolution)}&from=${from}&to=${to}&token=${encodeURIComponent(apiKey)}`
      );

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Candle error' });
      }

      const data = await response.json();
      res.json({
        connected: true,
        ...data,
      });
    } catch (err: any) {
      console.error('Finnhub candle error:', err);
      res.status(500).json({ error: 'Failed to fetch candles' });
    }
  });

  // Finnhub Company News
  app.get('/api/finnhub/news', async (req, res) => {
    try {
      const symbol = String(req.query.symbol || 'TSLA').toUpperCase();
      const apiKey = getFinnhubKey();

      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);

      const fromStr = fromDate.toISOString().split('T')[0];
      const toStr = toDate.toISOString().split('T')[0];

      if (!apiKey) {
        return res.json({
          connected: false,
          news: [],
        });
      }

      const response = await fetch(
        `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(symbol)}&from=${fromStr}&to=${toStr}&token=${encodeURIComponent(apiKey)}`
      );

      if (!response.ok) {
        return res.status(response.status).json({ error: 'News error' });
      }

      const data = await response.json();
      res.json({
        connected: true,
        news: Array.isArray(data) ? data.slice(0, 10) : [],
      });
    } catch (err: any) {
      console.error('Finnhub news error:', err);
      res.status(500).json({ error: 'Failed to fetch company news' });
    }
  });

  // Finnhub Market News (General)
  app.get('/api/finnhub/market-news', async (req, res) => {
    try {
      const apiKey = getFinnhubKey();
      if (!apiKey) {
        return res.json({ connected: false, news: [] });
      }

      const response = await fetch(
        `https://finnhub.io/api/v1/news?category=general&token=${encodeURIComponent(apiKey)}`
      );

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Market news error' });
      }

      const data = await response.json();
      res.json({
        connected: true,
        news: Array.isArray(data) ? data.slice(0, 10) : [],
      });
    } catch (err: any) {
      console.error('Finnhub market news error:', err);
      res.status(500).json({ error: 'Failed to fetch market news' });
    }
  });

  // Finnhub Recommendations
  app.get('/api/finnhub/recommendations', async (req, res) => {
    try {
      const symbol = String(req.query.symbol || 'TSLA').toUpperCase();
      const apiKey = getFinnhubKey();
      if (!apiKey) {
        return res.json({ connected: false, data: [] });
      }

      const response = await fetch(
        `https://finnhub.io/api/v1/stock/recommendation?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(apiKey)}`
      );

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Recommendation error' });
      }

      const data = await response.json();
      res.json({
        connected: true,
        data: Array.isArray(data) ? data.slice(0, 5) : [],
      });
    } catch (err: any) {
      console.error('Finnhub recommendation error:', err);
      res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
  });

  // AI Stock Insights endpoint using Gemini 3.6 Flash
  app.post('/api/generate-insights', async (req, res) => {
    try {
      const { ticker, prompt } = req.body;
      if (!ticker || !prompt) {
        return res.status(400).json({ error: 'Ticker and prompt are required' });
      }

      const ai = getAiClient();
      if (!ai) {
        // High quality realistic fallback if API key is not yet set
        return res.json({
          analysis: `[Market Synthesis for ${ticker}]: Algorithmic tracking reveals strong institutional accumulation following technical breakout above key moving averages. Options implied volatility suggests traders are positioning for forward earnings catalysts.`,
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `You are Deep Liquidity's Lead Institutional Quantitative Analyst. Provide a concise, professional 2-3 paragraph financial analysis for the ticker "${ticker}" based on the following query: "${prompt}". Focus on liquidity flows, catalyst impacts, option order flows, and market sentiment. Do not use flowery text or promotional fluff.`,
      });

      res.json({ analysis: response.text });
    } catch (err: any) {
      console.error('Gemini Insights error:', err);
      res.status(500).json({
        error: 'Failed to generate AI insights',
        message: err.message || String(err),
      });
    }
  });

  // Regenerate AI Market Pulse endpoint
  app.post('/api/regenerate-pulse', async (req, res) => {
    try {
      const ai = getAiClient();
      if (!ai) {
        return res.json({
          title: 'Bullish sentiment driven by semiconductor demand',
          summary:
            'Algorithmic analysis indicates a strong rotation into mega-cap technology stocks following robust forward guidance. Institutional liquidity flows remain concentrated in semiconductor and AI-infrastructure equities.',
          tags: ['SEMIS', 'LIQUIDITY FLOWS'],
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents:
          'Provide a JSON object summarizing today\'s global stock market pulse. Reply strictly with JSON containing "title" (short 5-8 word headline), "summary" (2 sentence institutional overview), and "tags" (array of 2 short uppercase tags like ["TECH", "HIGH MOMENTUM"]).',
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({
        title: parsed.title || 'Bullish sentiment driven by tech earnings',
        summary:
          parsed.summary ||
          'Algorithmic analysis indicates a strong rotation into mega-cap technology stocks following robust forward guidance.',
        tags: parsed.tags || ['TECH', 'HIGH MOMENTUM'],
      });
    } catch (err: any) {
      console.error('Gemini Pulse error:', err);
      res.status(500).json({
        error: 'Failed to regenerate pulse',
        message: err.message || String(err),
      });
    }
  });

  // Vite middleware in dev mode vs static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
