
import { AssetId, MarketData, NewsItem, PricePoint, Language, DeepAnalysisData } from "../types";
import { ASSETS } from "../constants";

// Seed for reproducible random numbers (for consistent demo data)
let seed = 12345;
const seededRandom = (): number => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};

// Reset seed for fresh data generation
const resetSeed = () => {
  seed = Date.now() % 100000;
};

// Helper to generate realistic price history with trends and volatility
const generateHistory = (basePrice: number, days: number, volatility: number): PricePoint[] => {
  const data: PricePoint[] = [];
  const now = Date.now();
  const msPerDay = 86400000;

  // Create a more realistic price movement pattern
  let currentPrice = basePrice - (volatility * 2); // Start slightly lower
  const trendStrength = 0.6; // Slight upward bias (bullish market)

  for (let i = days; i >= 0; i--) {
    const time = now - i * msPerDay;

    // Combine multiple factors for realistic movement
    const dailyTrend = trendStrength * (volatility / days); // Gradual trend
    const cyclicalComponent = Math.sin(i / 7) * (volatility * 0.3); // Weekly cycle
    const randomWalk = (seededRandom() - 0.5) * volatility * 0.8; // Random noise
    const momentumFactor = i < 5 ? (seededRandom() * volatility * 0.5) : 0; // Recent momentum

    currentPrice += dailyTrend + cyclicalComponent * 0.1 + randomWalk + momentumFactor * 0.1;

    // Keep price within reasonable bounds
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

// Initialize data store with realistic values
const initializeDataStore = (): Record<AssetId, MarketData> => {
  resetSeed();
  const basePrice = 2645.20;
  const history = generateHistory(basePrice, 30, 25);
  const currentPrice = history[history.length - 1]?.price || basePrice;
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

// Mock Data Store - GLOBAL FOCUSED
let DATA_STORE: Record<AssetId, MarketData> = initializeDataStore();

// Simulate live price updates
const simulatePriceUpdate = (data: MarketData): MarketData => {
  const volatility = 0.5; // Small tick volatility
  const priceChange = (Math.random() - 0.48) * volatility; // Slight bullish bias
  const newPrice = Math.round((data.currentPrice + priceChange) * 100) / 100;

  const metrics = calculate24hMetrics(data.history, newPrice);

  return {
    ...data,
    currentPrice: newPrice,
    ...metrics,
    lastUpdated: Date.now(),
  };
};

// Helper to create functional google search links
const makeSearchLink = (query: string) => `https://www.google.com/search?q=${encodeURIComponent(query)}`;

export const getMarketData = async (assetId: AssetId): Promise<MarketData> => {
  // Simulate network delay for realism
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

  const data = DATA_STORE[assetId];
  if (!data) {
    throw new Error(`Asset ${assetId} not found`);
  }

  // Update with simulated live price
  const updatedData = simulatePriceUpdate(data);
  DATA_STORE[assetId] = updatedData;

  return updatedData;
};

export const getAllMarketData = async (): Promise<MarketData[]> => {
  // Simulate network delay for realism
  await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 250));

  const gold = DATA_STORE['gold-global'];
  const updatedGold = simulatePriceUpdate(gold);
  DATA_STORE['gold-global'] = updatedGold;

  return [updatedGold];
};

// Refresh all data (useful for manual refresh)
export const refreshMarketData = async (): Promise<void> => {
  DATA_STORE = initializeDataStore();
};

// --- PRE-GENERATED DEEP ANALYSIS REPORT (GLOBAL MACRO) ---
export const getLatestDeepAnalysis = async (): Promise<DeepAnalysisData> => {
  return {
    headline: "Gold Market Analysis: Strategic Outlook",
    executive_summary: "Gold (XAU/USD) continues its structural bull run. The market is pricing in a high probability of a rate cut, which is weighing heavily on real yields and the US Dollar Index (DXY). Institutional demand remains robust, with central banks continuing to diversify reserves away from fiat currencies. Technically, the metal is consolidating in a bullish pattern.",
    macro_analysis: "The macroeconomic backdrop is increasingly favorable for non-yielding assets. US inflation has cooled to 2.4%, giving the Fed ample room to ease policy. Real interest rates are trending lower, reducing the opportunity cost of holding gold. Furthermore, the US fiscal deficit continues to widen, raising long-term concerns about Treasury sustainability, prompting hedge funds to increase their long gold exposure as a hedge against currency debasement.",
    technical_analysis: "**Trend:** Bullish on Weekly/Daily timeframes.\n\n**Support:** Key support lies at $2,600 (50-day MA) and $2,580.\n\n**Resistance:** Immediate resistance at $2,658 (Weekly High), followed by $2,700.\n\n**Indicators:** RSI is at 62 (Neutral-Bullish), suggesting room for further upside without being overbought.",
    geopolitical_analysis: "Geopolitical risk premiums remain embedded in the price. Ongoing tensions in Eastern Europe and the Middle East are sustaining safe-haven demand. While immediate escalation fears have subsided slightly, the structural instability ensures a 'floor' under gold prices.",
    sector_analysis: "Mining stocks (GDX) are beginning to outperform the physical metal, suggesting equity investors are catching up to the rally. Junior miners are seeing increased M&A activity as majors look to replenish reserves.",
    consumer_analysis: "Physical demand in India and China remains resilient despite high prices, driven by wedding season and lunar new year restocking. ETF outflows have stabilized and are beginning to reverse into net inflows.",
    future_outlook: "**Short Term (1W):** Expect volatility around the Fed decision; bias remains upward toward $2,675.\n**Medium Term (1M):** Target $2,700-$2,750 as the dollar weakens further.\n**Strategy:** Buy dips near $2,620 with a trailing stop below $2,580.",
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
};

export const getNews = async (assetId?: AssetId, language: Language = 'en'): Promise<NewsItem[]> => {
  const today = new Date().toISOString();

  // English Global Insights
  const items: NewsItem[] = [
    {
      title: "Fed's Powell Signals 'Open Mind' on December Cut",
      source: "Bloomberg Economics",
      summary: "Federal Reserve Chair Jerome Powell indicated that the central bank is monitoring labor market cooling closely. Markets interpreted his comments as a green light for a rate cut, sending the US Dollar Index (DXY) lower. This dovish pivot significantly reduces the opportunity cost of holding non-yielding assets like Gold.",
      sentiment: "positive",
      url: makeSearchLink("Jerome Powell Fed Speech Gold Impact"),
      id: "en-1",
      publishedAt: today,
      fullContent: undefined
    },
    {
      title: "Central Banks Accelerate De-Dollarization Trend",
      source: "World Gold Council",
      summary: "New data reveals that emerging market central banks added another 80 tonnes of gold to their reserves last month. This structural shift away from US Dollar assets is creating a sustained floor for gold prices, regardless of short-term interest rate fluctuations.",
      sentiment: "positive",
      url: makeSearchLink("Central Bank Gold Buying Trends"),
      id: "en-2",
      publishedAt: today,
      fullContent: undefined
    },
    {
      title: "Geopolitical Risk Premium Returns to Markets",
      source: "Reuters",
      summary: "Renewed tensions in Eastern Europe have prompted a flight to safety across global markets. Gold, traditionally the ultimate safe-haven asset, is seeing inflows as investors hedge against potential supply chain disruptions and energy price spikes. This geopolitical premium is currently adding an estimated $50-$80 to the spot price.",
      sentiment: "neutral",
      url: makeSearchLink("Geopolitical impact on Gold prices"),
      id: "en-3",
      publishedAt: today,
      fullContent: undefined
    },
    {
      title: "Technical Analysis: Bull Flag Formation on Weekly",
      source: "Kitco News",
      summary: "Technical analysts have identified a bullish flag pattern on the weekly XAU/USD chart. A sustained close above $2,650 could trigger algorithmic buying, pushing prices toward the $2,700 extension level. Support remains robust at the 50-day moving average, currently sitting at $2,610.",
      sentiment: "positive",
      url: makeSearchLink("Gold Price Technical Analysis Chart"),
      id: "en-4",
      publishedAt: today,
      fullContent: undefined
    },
    {
      title: "ETF Flows Turn Positive for Third Consecutive Week",
      source: "Gold.org",
      summary: "North American Gold ETFs recorded net inflows of $1.2 billion last week, reversing a months-long trend of outflows. This return of Western institutional capital suggests that money managers are positioning for a prolonged period of lower real interest rates.",
      sentiment: "positive",
      url: makeSearchLink("Gold ETF Inflows Data"),
      id: "en-5",
      publishedAt: today,
      fullContent: undefined
    },
    {
      title: "Dollar Index (DXY) Tests Critical Support",
      source: "FXStreet",
      summary: "The US Dollar Index is testing critical support at 101.50. A breakdown below this level would technically confirm a bearish trend reversal for the Greenback, providing a powerful tailwind for all dollar-denominated commodities, primarily Gold and Silver.",
      sentiment: "positive",
      url: makeSearchLink("DXY Chart Gold Correlation"),
      id: "en-6",
      publishedAt: today,
      fullContent: undefined
    }
  ];
  return items;
};
