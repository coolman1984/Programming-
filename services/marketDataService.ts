
import { AssetId, MarketData, NewsItem, PricePoint, MarketArticle, Language, DeepAnalysisData } from "../types";
import { ASSETS } from "../constants";

// Helper to generate a random sine wave trend for "realistic" looking charts
const generateHistory = (basePrice: number, days: number, volatility: number): PricePoint[] => {
  const data: PricePoint[] = [];
  const now = Date.now();
  const msPerDay = 86400000;
  
  for (let i = days; i >= 0; i--) {
    const time = now - i * msPerDay;
    const randomNoise = (Math.random() - 0.5) * volatility;
    const trend = Math.sin(i / 5) * (volatility * 2); 
    data.push({
      timestamp: time,
      price: basePrice + trend + randomNoise,
    });
  }
  return data;
};

// Mock Data Store - GLOBAL FOCUSED
const DATA_STORE: Record<AssetId, MarketData> = {
  'gold-global': {
    assetId: 'gold-global',
    currentPrice: 2645.20, // Realistic XAU/USD
    change24h: 12.50,       
    change24hPercent: 0.47,
    high24h: 2658.00,
    low24h: 2630.00,
    lastUpdated: Date.now(),
    history: generateHistory(2620, 30, 15), 
  }
};

// Helper to create functional google search links
const makeSearchLink = (query: string) => `https://www.google.com/search?q=${encodeURIComponent(query)}`;

export const getMarketData = async (assetId: AssetId): Promise<MarketData> => {
  const livePrice = DATA_STORE[assetId].currentPrice + (Math.random() - 0.5) * 1;
  return { ...DATA_STORE[assetId], currentPrice: livePrice, lastUpdated: Date.now() };
};

export const getAllMarketData = async (): Promise<MarketData[]> => {
  const gold = DATA_STORE['gold-global'];
  const livePrice = gold.currentPrice + (Math.random() - 0.5) * 1;
  return [{ ...gold, currentPrice: livePrice, lastUpdated: Date.now() }];
};

// --- PRE-GENERATED DEEP ANALYSIS REPORT (GLOBAL MACRO) ---
export const getLatestDeepAnalysis = async (): Promise<DeepAnalysisData> => {
    return {
        headline: "Gold Eyes $2,700 as Fed Pivot Draws Near: A Strategic Outlook for Dec 2025",
        executive_summary: "Gold (XAU/USD) continues its structural bull run, trading firmly above $2,640/oz as the Federal Reserve prepares for its December FOMC meeting. The market is pricing in a 90% probability of a rate cut, which is weighing heavily on real yields and the US Dollar Index (DXY). Institutional demand remains robust, with central banks—led by China and Poland—continuing to diversify reserves away from fiat currencies. Technically, the metal is consolidating in a bullish pennant pattern; a breakout above $2,660 could trigger a rapid move toward the psychological $2,700 barrier. Downside risks are limited by strong physical buying support at $2,600.",
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
        generated_at: "Wednesday, December 3, 2025"
    };
};

export const getNews = async (assetId?: AssetId, language: Language = 'en'): Promise<NewsItem[]> => {
  const today = new Date().toISOString();

  // English Global Insights
  const items: NewsItem[] = [
    {
        title: "Fed's Powell Signals 'Open Mind' on December Cut",
        source: "Bloomberg Economics",
        summary: "Federal Reserve Chair Jerome Powell indicated that the central bank is monitoring labor market cooling closely. Markets interpreted his comments as a green light for a December rate cut, sending the US Dollar Index (DXY) to a 3-month low. This dovish pivot significantly reduces the opportunity cost of holding non-yielding assets like Gold.",
        sentiment: "positive",
        url: makeSearchLink("Jerome Powell Fed Speech Gold Impact"),
        id: "en-1",
        publishedAt: today,
        fullContent: undefined 
    },
    {
        title: "Central Banks Accelerate De-Dollarization Trend",
        source: "World Gold Council",
        summary: "New data reveals that emerging market central banks added another 80 tonnes of gold to their reserves last month. This structural shift away from US Dollar assets is creating a sustained floor for gold prices, regardless of short-term interest rate fluctuations. China and Poland were identified as the largest buyers.",
        sentiment: "positive",
        url: makeSearchLink("Central Bank Gold Buying Trends 2025"),
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
        summary: "North American Gold ETFs recorded net inflows of $1.2 billion last week, reversing a months-long trend of outflows. This return of Western institutional capital suggests that money managers are positioning for a prolonged period of lower real interest rates in 2026.",
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
