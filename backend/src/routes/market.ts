import { Hono } from "hono";
import { z } from "zod";
import { env } from "../env";
import { extractResponseText } from "../lib/openai";

const marketRouter = new Hono();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuoteResult {
  symbol: string;
  price: number;
  change: number;
  changePercent: string;
  volume: number;
  latestTradingDay: string;
}

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

interface ShariahScreenResult {
  symbol: string;
  isCompliant: boolean;
  score: number;
  concerns: string[];
  details: string;
}

// ---------------------------------------------------------------------------
// Helpers - Alpha Vantage
// ---------------------------------------------------------------------------

const ALPHA_VANTAGE_BASE = "https://www.alphavantage.co/query";

/**
 * Known stock prices used as fallback when the demo API does not return data.
 */
const KNOWN_STOCKS: Record<string, { price: number; name: string }> = {
  AAPL: { price: 189.84, name: "Apple Inc" },
  MSFT: { price: 378.91, name: "Microsoft Corporation" },
  GOOGL: { price: 141.8, name: "Alphabet Inc" },
  AMZN: { price: 178.25, name: "Amazon.com Inc" },
  META: { price: 390.42, name: "Meta Platforms Inc" },
  TSLA: { price: 248.42, name: "Tesla Inc" },
  NVDA: { price: 495.22, name: "NVIDIA Corporation" },
  JPM: { price: 172.45, name: "JPMorgan Chase & Co" },
  V: { price: 275.96, name: "Visa Inc" },
  JNJ: { price: 156.74, name: "Johnson & Johnson" },
  WMT: { price: 163.42, name: "Walmart Inc" },
  PG: { price: 152.18, name: "Procter & Gamble Co" },
  MA: { price: 412.85, name: "Mastercard Inc" },
  UNH: { price: 527.72, name: "UnitedHealth Group Inc" },
  HD: { price: 348.42, name: "The Home Depot Inc" },
  DIS: { price: 91.52, name: "The Walt Disney Company" },
  BAC: { price: 33.18, name: "Bank of America Corp" },
  XOM: { price: 104.63, name: "Exxon Mobil Corporation" },
  PFE: { price: 28.95, name: "Pfizer Inc" },
  KO: { price: 59.18, name: "The Coca-Cola Company" },
};

function generateMockQuote(symbol: string): QuoteResult {
  const known = KNOWN_STOCKS[symbol.toUpperCase()];
  const basePrice = known ? known.price : 50 + Math.random() * 200;
  const change = parseFloat(((Math.random() - 0.5) * basePrice * 0.04).toFixed(2));
  const price = parseFloat((basePrice + change).toFixed(2));
  const changePercent = ((change / basePrice) * 100).toFixed(4) + "%";
  const volume = Math.floor(10_000_000 + Math.random() * 90_000_000);

  const today = new Date();
  const day = today.getDay();
  // If weekend, roll back to Friday
  if (day === 0) today.setDate(today.getDate() - 2);
  if (day === 6) today.setDate(today.getDate() - 1);
  const latestTradingDay = today.toISOString().split("T")[0] as string;

  return {
    symbol: symbol.toUpperCase(),
    price,
    change,
    changePercent,
    volume,
    latestTradingDay,
  };
}

async function fetchQuote(symbol: string): Promise<QuoteResult> {
  try {
    const url = `${ALPHA_VANTAGE_BASE}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=demo`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Alpha Vantage returned ${res.status}`);

    const data = (await res.json()) as Record<string, unknown>;
    const gq = data["Global Quote"] as Record<string, string> | undefined;

    if (gq && gq["05. price"] && parseFloat(gq["05. price"]) > 0) {
      return {
        symbol: (gq["01. symbol"] ?? symbol).toUpperCase(),
        price: parseFloat(gq["05. price"]),
        change: parseFloat(gq["09. change"] ?? "0"),
        changePercent: gq["10. change percent"] ?? "0%",
        volume: parseInt(gq["06. volume"] ?? "0", 10),
        latestTradingDay: gq["07. latest trading day"] ?? new Date().toISOString().split("T")[0] as string,
      };
    }

    // API returned empty or no data for this symbol - fall back to mock
    return generateMockQuote(symbol);
  } catch {
    return generateMockQuote(symbol);
  }
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const quoteQuerySchema = z.object({
  symbol: z.string().min(1, "symbol query parameter is required"),
});

const searchQuerySchema = z.object({
  query: z.string().min(1, "query parameter is required"),
});

const batchQuerySchema = z.object({
  symbols: z.string().min(1, "symbols query parameter is required"),
});

const shariahScreenBodySchema = z.object({
  symbol: z.string().min(1, "symbol is required"),
  sector: z.string().optional(),
});

// ---------------------------------------------------------------------------
// GET /quote?symbol=AAPL
// ---------------------------------------------------------------------------

marketRouter.get("/quote", async (c) => {
  try {
    const parsed = quoteQuerySchema.safeParse(c.req.query());
    if (!parsed.success) {
      return c.json({ error: parsed.error.issues.map((i) => i.message).join("; ") }, 400);
    }

    const { symbol } = parsed.data;
    const quote = await fetchQuote(symbol);
    return c.json(quote);
  } catch (err) {
    console.error("GET /quote error:", err);
    return c.json({ error: "Failed to fetch quote" }, 500);
  }
});

// ---------------------------------------------------------------------------
// GET /search?query=apple
// ---------------------------------------------------------------------------

const POPULAR_STOCKS: SearchResult[] = [
  { symbol: "AAPL", name: "Apple Inc", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "MSFT", name: "Microsoft Corporation", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "GOOGL", name: "Alphabet Inc", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "AMZN", name: "Amazon.com Inc", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "META", name: "Meta Platforms Inc", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "TSLA", name: "Tesla Inc", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "NVDA", name: "NVIDIA Corporation", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "JPM", name: "JPMorgan Chase & Co", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "V", name: "Visa Inc", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "JNJ", name: "Johnson & Johnson", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "WMT", name: "Walmart Inc", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "PG", name: "Procter & Gamble Co", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "MA", name: "Mastercard Inc", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "UNH", name: "UnitedHealth Group Inc", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "HD", name: "The Home Depot Inc", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "DIS", name: "The Walt Disney Company", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "BAC", name: "Bank of America Corp", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "XOM", name: "Exxon Mobil Corporation", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "PFE", name: "Pfizer Inc", type: "Equity", region: "United States", currency: "USD" },
  { symbol: "KO", name: "The Coca-Cola Company", type: "Equity", region: "United States", currency: "USD" },
];

marketRouter.get("/search", async (c) => {
  try {
    const parsed = searchQuerySchema.safeParse(c.req.query());
    if (!parsed.success) {
      return c.json({ error: parsed.error.issues.map((i) => i.message).join("; ") }, 400);
    }

    const { query } = parsed.data;

    try {
      const url = `${ALPHA_VANTAGE_BASE}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=demo`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Alpha Vantage returned ${res.status}`);

      const data = (await res.json()) as Record<string, unknown>;
      const matches = data["bestMatches"] as Array<Record<string, string>> | undefined;

      if (matches && matches.length > 0) {
        const results: SearchResult[] = matches.map((m) => ({
          symbol: m["1. symbol"] ?? "",
          name: m["2. name"] ?? "",
          type: m["3. type"] ?? "Equity",
          region: m["4. region"] ?? "United States",
          currency: m["8. currency"] ?? "USD",
        }));
        return c.json({ results });
      }
    } catch {
      // Fall through to hardcoded list
    }

    // Fallback: filter popular stocks by query
    const lowerQuery = query.toLowerCase();
    const filtered = POPULAR_STOCKS.filter(
      (s) =>
        s.symbol.toLowerCase().includes(lowerQuery) ||
        s.name.toLowerCase().includes(lowerQuery)
    );
    return c.json({ results: filtered.length > 0 ? filtered : POPULAR_STOCKS.slice(0, 10) });
  } catch (err) {
    console.error("GET /search error:", err);
    return c.json({ error: "Failed to search stocks" }, 500);
  }
});

// ---------------------------------------------------------------------------
// GET /batch?symbols=AAPL,MSFT,GOOGL
// ---------------------------------------------------------------------------

marketRouter.get("/batch", async (c) => {
  try {
    const parsed = batchQuerySchema.safeParse(c.req.query());
    if (!parsed.success) {
      return c.json({ error: parsed.error.issues.map((i) => i.message).join("; ") }, 400);
    }

    const symbols = parsed.data.symbols
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (symbols.length === 0) {
      return c.json({ error: "No valid symbols provided" }, 400);
    }

    const quotes = await Promise.all(
      symbols.map(async (symbol) => {
        const q = await fetchQuote(symbol);
        return {
          symbol: q.symbol,
          price: q.price,
          change: q.change,
          changePercent: q.changePercent,
        };
      })
    );

    return c.json({ quotes });
  } catch (err) {
    console.error("GET /batch error:", err);
    return c.json({ error: "Failed to fetch batch quotes" }, 500);
  }
});

// ---------------------------------------------------------------------------
// POST /shariah-screen
// ---------------------------------------------------------------------------

marketRouter.post("/shariah-screen", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = shariahScreenBodySchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.issues.map((i) => i.message).join("; ") }, 400);
    }

    const { symbol, sector } = parsed.data;

    const systemPrompt = `You are an expert Islamic finance analyst specializing in Shariah-compliance screening for publicly traded equities. Analyze the given stock and determine its Shariah compliance based on these criteria:

1. **Debt-to-Assets Ratio**: Total interest-bearing debt should be less than 33% of total assets (or trailing 36-month average market capitalization).
2. **Revenue from Haram Activities**: Revenue from prohibited activities (alcohol, tobacco, gambling, pork, adult entertainment, conventional financial services including interest-based banking) should be less than 5% of total revenue.
3. **Interest Income Threshold**: Interest income and income from non-compliant investments should be less than 5% of total revenue.
4. **Cash & Interest-Bearing Securities**: Cash plus interest-bearing securities should be less than 33% of total assets (or trailing 36-month average market capitalization).
5. **Accounts Receivable**: Accounts receivable should be less than 49% of total assets.
6. **Sector Considerations**: Some sectors (e.g., conventional banking, insurance, alcohol, gambling) are inherently non-compliant.

Respond ONLY with a valid JSON object (no markdown, no code fences) in the following format:
{
  "symbol": "<TICKER>",
  "isCompliant": true/false,
  "score": <number 0-100>,
  "concerns": ["concern 1", "concern 2"],
  "details": "A detailed paragraph explaining the compliance assessment."
}`;

    const userMessage = `Analyze the Shariah compliance of the stock: ${symbol.toUpperCase()}${sector ? ` in the ${sector} sector` : ""}. Provide a thorough screening based on publicly known information about this company.`;

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5.2",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!openaiResponse.ok) {
      const errBody = await openaiResponse.text();
      console.error("OpenAI Responses API error:", openaiResponse.status, errBody);
      return c.json({ error: "Failed to perform Shariah screening via AI" }, 502);
    }

    const openaiData = (await openaiResponse.json()) as Record<string, unknown>;
    const text = extractResponseText(openaiData);

    // Attempt to parse the JSON from the AI response
    let result: ShariahScreenResult;
    try {
      const jsonText = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      result = JSON.parse(jsonText) as ShariahScreenResult;
    } catch {
      // If parsing fails, return a structured fallback
      result = {
        symbol: symbol.toUpperCase(),
        isCompliant: false,
        score: 0,
        concerns: ["Unable to parse AI response"],
        details: text || "The AI response could not be parsed. Please try again.",
      };
    }

    return c.json(result);
  } catch (err) {
    console.error("POST /shariah-screen error:", err);
    return c.json({ error: "Failed to perform Shariah screening" }, 500);
  }
});

export { marketRouter };
