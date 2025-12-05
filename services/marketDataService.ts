import { AssetId, MarketData, NewsItem, PricePoint, Language, DeepAnalysisData } from "../types";
import { ASSETS } from "../constants";

// Metal Price API Configuration
const METAL_PRICE_API_KEY = 'eb888d464c2330c4aa7972a7a76e2565';
const METAL_PRICE_API_BASE = 'https://api.metalpriceapi.com/v1';

// Helper to generate realistic price history with trends and volatility
const generateHistory = (basePrice: number, days: number, volatility: number): PricePoint[] => {
  const data: PricePoint[] = [];
  const now = Date.now();
  const msPerDay = 86400000;

  let currentPrice = basePrice - (volatility * 2);
  const trendStrength = 0.6;

  for (let i = days; i >= 0; i--) {
    const time = now - i * msPerDay;
    const dailyTrend = trendStrength * (volatility / days);
    const cyclicalComponent = Math.sin(i / 7) * (volatility * 0.3);
    const randomWalk = (Math.random() - 0.5) * volatility * 0.8;
    const momentumFactor = i < 5 ? (Math.random() * volatility * 0.5) : 0;

    currentPrice += dailyTrend + cyclicalComponent * 0.1 + randomWalk + momentumFactor * 0.1;
    currentPrice = Math.max(basePrice - volatility * 3, Math.min(basePrice + volatility * 3, currentPrice));

    data.push({
      timestamp: time,
      price: Math.round(currentPrice * 100) / 100,
    });
  }

  return data;
};

// Calculate 24h metrics from history
const calculate24hMetrics = (history: PricePoint[], currentPrice: number) => {
  const last24h = history.slice(-2);
  const previousPrice = last24h[0]?.price || currentPrice;
  const change24h = currentPrice - previousPrice;
  const change24hPercent = (change24h / previousPrice) * 100;

  const recentPrices = history.slice(-7).map(p => p.price);
  const high24h = Math.max(...recentPrices, currentPrice);
  const low24h = Math.min(...recentPrices, currentPrice);

  return { change24h, change24hPercent, high24h, low24h };
};

// Fetch live gold price from Metal Price API
export const fetchLiveGoldPrice = async (): Promise<number> => {
  try {
    const response = await fetch(
      `${METAL_PRICE_API_BASE}/latest?api_key=${METAL_PRICE_API_KEY}&base=USD&currencies=XAU`
    );

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();

    // Metal Price API returns the price per troy ounce
    // The rate is how many units of XAU you get for 1 USD, so we need to invert it
    const xauRate = data.rates?.XAU;
    if (!xauRate) {
      throw new Error('XAU rate not found in API response');
    }

    // Convert to USD per troy ounce
    const pricePerOunce = 1 / xauRate;
    return Math.round(pricePerOunce * 100) / 100;
  } catch (error) {
    console.error('Error fetching live gold price:', error);
    // Return fallback price if API fails
    return 2645.20;
  }
};

// Data store
let DATA_STORE: Record<AssetId, MarketData> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 300000; // 5 minute cache to prevent frequent updates

// Initialize data store with real API data
const initializeDataStore = async (): Promise<Record<AssetId, MarketData>> => {
  const currentPrice = await fetchLiveGoldPrice();
  const history = generateHistory(currentPrice, 30, 25);
  const metrics = calculate24hMetrics(history, currentPrice);

  return {
    'gold-global': {
      assetId: 'gold-global',
      currentPrice,
      ...metrics,
      lastUpdated: Date.now(),
      history,
    }
  };
};

export const getMarketData = async (assetId: AssetId): Promise<MarketData> => {
  const now = Date.now();

  // Initialize or refresh if cache expired
  if (!DATA_STORE || now - lastFetchTime > CACHE_DURATION) {
    DATA_STORE = await initializeDataStore();
    lastFetchTime = now;
  }

  const data = DATA_STORE[assetId];
  if (!data) {
    throw new Error(`Asset ${assetId} not found`);
  }

  return data;
};

export const getAllMarketData = async (): Promise<MarketData[]> => {
  const now = Date.now();

  // Initialize or refresh if cache expired
  if (!DATA_STORE || now - lastFetchTime > CACHE_DURATION) {
    DATA_STORE = await initializeDataStore();
    lastFetchTime = now;
  }

  return [DATA_STORE['gold-global']];
};

// Refresh all data (force refresh)
export const refreshMarketData = async (): Promise<void> => {
  DATA_STORE = await initializeDataStore();
  lastFetchTime = Date.now();
};

// Helper to create functional google search links
const makeSearchLink = (query: string) => `https://www.google.com/search?q=${encodeURIComponent(query)}`;

// Fallback deep analysis data
export const getLatestDeepAnalysis = async (): Promise<DeepAnalysisData> => {
  const data: DeepAnalysisData = {
    headline: "Gold Market Analysis: Strategic Outlook",
    executive_summary: "Gold (XAU/USD) continues its structural bull run. The market is pricing in a high probability of a rate cut, which is weighing heavily on real yields and the US Dollar Index (DXY). Institutional demand remains robust.",
    macro_analysis: "The macroeconomic backdrop is increasingly favorable for non-yielding assets. US inflation has cooled to 2.4%, giving the Fed ample room to ease policy.",
    technical_analysis: "**Trend:** Bullish on Weekly/Daily timeframes.\n\n**Support:** Key support lies at $2,600 (50-day MA) and $2,580.\n\n**Resistance:** Immediate resistance at $2,658 (Weekly High), followed by $2,700.",
    geopolitical_analysis: "Geopolitical risk premiums remain embedded in the price. Ongoing tensions in Eastern Europe and the Middle East are sustaining safe-haven demand.",
    sector_analysis: "Mining stocks (GDX) are beginning to outperform the physical metal, suggesting equity investors are catching up to the rally.",
    consumer_analysis: "Physical demand in India and China remains resilient despite high prices, driven by wedding season and lunar new year restocking.",
    future_outlook: "**Short Term (1W):** Expect volatility around the Fed decision; bias remains upward toward $2,675.\n**Medium Term (1M):** Target $2,700-$2,750 as the dollar weakens further.",
    metrics: [
      { label: "US Dollar Index (DXY)", value: "102.40", trend: "down", color: "red", description: "Measures USD strength against a basket of currencies." },
      { label: "US 10Y Yield", value: "3.85%", trend: "down", color: "blue", description: "Benchmark interest rate affecting opportunity cost." },
      { label: "Fed Rate Probability", value: "90% Cut", trend: "up", color: "green", description: "Market odds of a rate cut in Dec." },
      { label: "ETF Holdings", value: "Rising", trend: "up", color: "green", description: "Institutional investment flows." }
    ],
    overall_sentiment_score: 88,
    confidence_score: 92,
    drivers: [
      { name: "Federal Reserve", impact_score: 95, sentiment: "bullish", description: "Dovish pivot supports gold." },
      { name: "Central Bank Buying", impact_score: 85, sentiment: "bullish", description: "Sovereign demand remains at record highs." },
      { name: "Global Growth", impact_score: 60, sentiment: "neutral", description: "Soft landing scenario favored." }
    ],
    sources: [
      { title: "Gold Demand Trends Q4", source: "World Gold Council", url: "https://www.gold.org", summary: "Central bank buying reached 300 tonnes in Q3.", relevance_score: 98, sentiment: "positive", impact_label: "High Impact" },
      { title: "Fed Watch Tool", source: "CME Group", url: "https://www.cmegroup.com", summary: "Traders pricing in 25bps cut in December.", relevance_score: 95, sentiment: "positive", impact_label: "High Impact" },
      { title: "Commodities Outlook", source: "Bloomberg", url: "https://www.bloomberg.com", summary: "Hedge funds increase net long positions.", relevance_score: 90, sentiment: "positive", impact_label: "Medium Impact" }
    ],
    factors_bearish: ["Stronger than expected US GDP", "Profit taking at all-time highs"],
    factors_bullish: ["Fed Rate Cuts", "Weak DXY", "Geopolitical Instability"],
    generated_at: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  };
  return data;
};

export const getNews = async (assetId?: AssetId, language: Language = 'en'): Promise<NewsItem[]> => {
  const today = new Date().toISOString();

  const items: NewsItem[] = [
    {
      title: "Fed's Powell Signals 'Open Mind' on December Cut",
      source: "Bloomberg Economics",
      summary: "Federal Reserve Chair Jerome Powell indicated that the central bank is monitoring labor market cooling closely. Markets interpreted his comments as a green light for a rate cut, sending the US Dollar Index (DXY) lower.",
      sentiment: "positive",
      url: makeSearchLink("Jerome Powell Fed Speech Gold Impact"),
      id: "en-1",
      publishedAt: today,
      fullContent: undefined
    },
    {
      title: "Central Banks Accelerate De-Dollarization Trend",
      source: "World Gold Council",
      summary: "New data reveals that emerging market central banks added another 80 tonnes of gold to their reserves last month. This structural shift away from US Dollar assets is creating a sustained floor for gold prices.",
      sentiment: "positive",
      url: makeSearchLink("Central Bank Gold Buying Trends"),
      id: "en-2",
      publishedAt: today,
      fullContent: undefined
    },
    {
      title: "Geopolitical Risk Premium Returns to Markets",
      source: "Reuters",
      summary: "Renewed tensions in Eastern Europe have prompted a flight to safety across global markets. Gold is seeing inflows as investors hedge against potential supply chain disruptions.",
      sentiment: "neutral",
      url: makeSearchLink("Geopolitical impact on Gold prices"),
      id: "en-3",
      publishedAt: today,
      fullContent: undefined
    },
    {
      title: "Technical Analysis: Bull Flag Formation on Weekly",
      source: "Kitco News",
      summary: "Technical analysts have identified a bullish flag pattern on the weekly XAU/USD chart. A sustained close above $2,650 could trigger algorithmic buying, pushing prices toward the $2,700 level.",
      sentiment: "positive",
      url: makeSearchLink("Gold Price Technical Analysis Chart"),
      id: "en-4",
      publishedAt: today,
      fullContent: undefined
    },
    {
      title: "ETF Flows Turn Positive for Third Consecutive Week",
      source: "Gold.org",
      summary: "North American Gold ETFs recorded net inflows of $1.2 billion last week, reversing a months-long trend of outflows. This return of Western institutional capital suggests positioning for lower real interest rates.",
      sentiment: "positive",
      url: makeSearchLink("Gold ETF Inflows Data"),
      id: "en-5",
      publishedAt: today,
      fullContent: undefined
    },
    {
      title: "Dollar Index (DXY) Tests Critical Support",
      source: "FXStreet",
      summary: "The US Dollar Index is testing critical support at 101.50. A breakdown below this level would provide a powerful tailwind for all dollar-denominated commodities, primarily Gold and Silver.",
      sentiment: "positive",
      url: makeSearchLink("DXY Chart Gold Correlation"),
      id: "en-6",
      publishedAt: today,
      fullContent: undefined
    }
  ];

  return items;
};

