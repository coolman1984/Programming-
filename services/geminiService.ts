
import { GoogleGenAI, Chat } from "@google/genai";
import { MarketArticle, NewsItem, Language, SearchResult, SearchSource, Asset, MarketData, DeepAnalysisData, AnalysisSource } from "../types";

// API Key validation helper - supports both Vite (browser) and Node.js environments
const getApiKey = (): string | null => {
  // Try Vite environment variables first (browser)
  const viteKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  // Fall back to Node.js environment variables (if available)
  const nodeKey = typeof process !== 'undefined' ? (process.env?.API_KEY || process.env?.GEMINI_API_KEY) : null;

  const apiKey = viteKey || nodeKey;

  if (!apiKey ||
    apiKey === 'your_gemini_api_key_here' ||
    apiKey === 'PLACEHOLDER_API_KEY' ||
    apiKey.length < 10) {
    return null;
  }
  return apiKey;
};

const getClient = (): GoogleGenAI | null => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('Gemini API key not configured. AI features will use fallback data.');
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error('Failed to initialize Gemini client:', error);
    return null;
  }
};

// Check if AI features are available
export const isAIAvailable = (): boolean => {
  return getApiKey() !== null;
};

// --- CONSTANTS: STRICT DATA SOURCES ---
const STRICT_SOURCE_LIST = `
🚨 CRITICAL INSTRUCTION: YOU ARE RESTRICTED TO ONLY THESE 6 APPROVED SOURCES. 🚨
Do NOT use or cite data from any other websites (like CNN, BBC, Wikipedia, etc.).
Only search within and cite these specific domains:

=== SOURCE ROLES & SPECIALIZATIONS ===

1. **Bloomberg** (bloomberg.com) - MACROECONOMICS & REAL-TIME MARKET REACTIONS
   PRIMARY USE: Fast, real-time news on central bank moves, trade policy, market reactions
   SPECIALIZES: Global macroeconomics + market immediacy - connects economic policy, geopolitics, interest-rate decisions, inflation/trade-policy shifts with market price movements
   STRENGTH: Broadest, richest daily coverage of global economy, markets, central bank policy, and commodities
   SEARCH FOCUS: "Federal Reserve decisions", "DXY movements", "inflation data", "geopolitical market impact"

2. **Reuters** (reuters.com) - REAL-TIME NEWS & ALERTS
   PRIMARY USE: Fast, real-time news and alerts on central bank moves, trade policy, market reactions
   SPECIALIZES: Up-to-the-minute reporting on finance, global economy, central-bank news, trade, commodities
   STRENGTH: Trusted, wide-ranging coverage with speed and accuracy
   SEARCH FOCUS: "breaking news", "central bank announcements", "market reactions", "policy changes"

3. **Financial Times (FT)** (ft.com) - IN-DEPTH MACROECONOMIC ANALYSIS
   PRIMARY USE: In-depth macroeconomic or trade analysis, long-reads, policy impact
   SPECIALIZES: Deeper economic and trade analysis, long-form articles, global macro, central-bank policy impact
   STRENGTH: Policy impact analysis and connecting economic trends to market movements
   SEARCH FOCUS: "economic analysis", "trade policy impact", "central bank policy analysis", "macroeconomic trends"

4. **Investing.com** (investing.com) - REAL-TIME PRICES & CHARTS
   PRIMARY USE: Tracking gold prices, commodities, precious-metal markets, investment decisions
   SPECIALIZES: Real-time quotes, charts, tools for gold prices, commodities, forex
   STRENGTH: Market data visualization and technical analysis tools
   SEARCH FOCUS: "gold price charts", "technical analysis", "market data", "price forecasts"

5. **Kitco** (kitco.com) - PRECIOUS METALS SPECIALIST
   PRIMARY USE: Metals-market-specific news, mining supply & demand shifts, technical & sentiment analysis
   SPECIALIZES: Precious metals and mining, gold/silver supply, mining output, investor psychology
   STRENGTH: Short-to-medium-term moves in gold/silver, mining-industry developments, investment vs physical demand
   SEARCH FOCUS: "gold mining supply", "precious metals analysis", "investor sentiment", "mining industry news"

6. **World Gold Council** (gold.org) - GOLD FUNDAMENTALS & LONG-TERM CONTEXT
   PRIMARY USE: Gold fundamentals, supply/demand, and long-term context
   SPECIALIZES: Authoritative data, global mining supply, central-bank holdings, physical demand, historical trends
   STRENGTH: Unmatched for examining why gold behaves a certain way over years (not just days)
   SEARCH FOCUS: "gold supply demand", "central bank gold reserves", "historical gold data", "long-term gold trends"

=== STRATEGIC SEARCH GUIDELINES ===
• For real-time market reactions to policy: Bloomberg + Reuters
• For deep policy impact analysis: Financial Times
• For price tracking and technical analysis: Investing.com + Kitco
• For long-term fundamentals and supply/demand: World Gold Council
• For comprehensive coverage: Combine Bloomberg (macro) + Kitco (metals-specific) + World Gold Council (fundamentals)

STRICT CONSTRAINT: ONLY use information from these 6 domains. Ignore all other sources.
`;

// --- HELPER: ROBUST JSON PARSER ---
const cleanAndParseJSON = (text: string): any => {
  if (!text) return null;

  let cleaned = text;
  cleaned = cleaned.replace(/```json/g, '').replace(/```/g, '');

  const firstOpen = cleaned.indexOf('{');
  if (firstOpen === -1) return null;

  let balance = 0;
  let lastClose = -1;
  for (let i = firstOpen; i < cleaned.length; i++) {
    if (cleaned[i] === '{') balance++;
    else if (cleaned[i] === '}') {
      balance--;
      if (balance === 0) {
        lastClose = i;
        break;
      }
    }
  }

  if (lastClose === -1) return null;
  cleaned = cleaned.substring(firstOpen, lastClose + 1);

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    try {
      const flattened = cleaned.replace(/[\r\n]+/g, ' ');
      return JSON.parse(flattened);
    } catch (e2) {
      return null;
    }
  }
};

// --- HELPER: Extract sources from grounding metadata ---
const extractSourcesFromResponse = (response: any): AnalysisSource[] => {
  const sources: AnalysisSource[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

  if (chunks) {
    chunks.forEach((chunk: any, index: number) => {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || `Source ${index + 1}`,
          source: extractDomain(chunk.web.uri),
          url: chunk.web.uri,
          summary: chunk.web.title,
          relevance_score: 0.9 - (index * 0.02), // Higher relevance for earlier sources
          sentiment: 'neutral',
          impact_label: index < 5 ? 'High Impact' : index < 12 ? 'Medium Impact' : 'Low Impact'
        });
      }
    });
  }
  return sources;
};

// Helper to extract domain name from URL
const extractDomain = (url: string): string => {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const approvedSources: Record<string, string> = {
      'bloomberg.com': 'Bloomberg',
      'reuters.com': 'Reuters',
      'ft.com': 'Financial Times',
      'investing.com': 'Investing.com',
      'kitco.com': 'Kitco',
      'gold.org': 'World Gold Council'
    };
    return approvedSources[domain] || domain;
  } catch {
    return 'Unknown Source';
  }
};

export const createChatSession = (): Chat | null => {
  const ai = getClient();
  if (!ai) {
    console.warn("AI Client not initialized - chat session unavailable");
    return null;
  }

  try {
    return ai.chats.create({
      model: 'gemini-2.0-flash',
      config: {
        systemInstruction: "You are a Senior Global Macro Strategist specialized in Gold (XAU/USD). Focus on the Federal Reserve, DXY, and Geopolitics.",
      }
    });
  } catch (error) {
    console.error("Failed to create chat session:", error);
    return null;
  }
};

export const searchMarketQuery = async (query: string, language: Language = 'en'): Promise<SearchResult> => {
  const ai = getClient();
  if (!ai) {
    return {
      text: "AI search is currently unavailable. Please configure your API key to enable this feature.",
      sources: []
    };
  }

  const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Determine search strategy based on query content
  let searchStrategy = "";
  const queryLower = query.toLowerCase();

  if (queryLower.includes('federal reserve') || queryLower.includes('fed') || queryLower.includes('interest rate') || queryLower.includes('inflation') || queryLower.includes('dxy') || queryLower.includes('dollar')) {
    searchStrategy = `
SEARCH STRATEGY: MACROECONOMIC FOCUS
- For real-time policy moves: "${query}" site:bloomberg.com OR site:reuters.com
- For deep policy analysis: "${query}" site:ft.com
- For market data: "${query}" site:investing.com`;
  } else if (queryLower.includes('technical') || queryLower.includes('chart') || queryLower.includes('support') || queryLower.includes('resistance') || queryLower.includes('rsi') || queryLower.includes('macd')) {
    searchStrategy = `
SEARCH STRATEGY: TECHNICAL ANALYSIS FOCUS
- For technical analysis: "${query}" site:investing.com OR site:kitco.com
- For market reactions: "${query}" site:bloomberg.com`;
  } else if (queryLower.includes('geopolitical') || queryLower.includes('conflict') || queryLower.includes('sanction') || queryLower.includes('trade war') || queryLower.includes('safe haven')) {
    searchStrategy = `
SEARCH STRATEGY: GEOPOLITICAL FOCUS
- For real-time market reactions: "${query}" site:bloomberg.com OR site:reuters.com
- For deep analysis: "${query}" site:ft.com
- For fundamentals: "${query}" site:gold.org`;
  } else if (queryLower.includes('mining') || queryLower.includes('supply') || queryLower.includes('production') || queryLower.includes('aisc') || queryLower.includes('exploration')) {
    searchStrategy = `
SEARCH STRATEGY: MINING & SUPPLY FOCUS
- For mining industry: "${query}" site:kitco.com
- For market reactions: "${query}" site:bloomberg.com
- For fundamentals: "${query}" site:gold.org`;
  } else if (queryLower.includes('demand') || queryLower.includes('jewelry') || queryLower.includes('imports') || queryLower.includes('physical') || queryLower.includes('bullion')) {
    searchStrategy = `
SEARCH STRATEGY: PHYSICAL DEMAND FOCUS
- For industry data: "${query}" site:kitco.com OR site:gold.org
- For market reactions: "${query}" site:bloomberg.com
- For price tracking: "${query}" site:investing.com`;
  } else {
    searchStrategy = `
SEARCH STRATEGY: COMPREHENSIVE COVERAGE
- For real-time coverage: "${query}" site:bloomberg.com OR site:reuters.com
- For deep analysis: "${query}" site:ft.com
- For technical data: "${query}" site:investing.com OR site:kitco.com
- For fundamentals: "${query}" site:gold.org`;
  }

  const prompt = `
    You are a top-tier financial analyst writing a publication-quality analytical response.
    
    === TOPIC ===
    "${query} ${todayStr}"
    Context: Global Gold Spot Price (XAU/USD), Federal Reserve, Geopolitics.
    
    === CRITICAL INSTRUCTIONS ===
    Write a top-tier, publication-quality analytical response following this EXACT structure:
    
    **1. Executive Summary (3–6 sentences)**
    Provide a high-level synthesis of the answer to the query.
    
    **2. Context & Background**
    Establish the landscape and explain how the situation evolved.
    
    **3. Core Analysis**
    Break down into:
    **A) Macroeconomic Drivers** - Interest rates, inflation, central bank policy, currency dynamics
    **B) Geopolitical Forces** - Global tensions, trade policy, strategic competition
    **C) Market Sentiment** - Risk appetite, capital flows, market positioning
    **D) Fundamental Dynamics** - Supply-demand, production, structural constraints
    
    **4. Data Highlights**
    Include 3-6 impactful data-driven insights with statistics.
    
    **5. Scenario Forecasts**
    • Base Case — Most likely path
    • Bullish Case — Upside scenario
    • Bearish Case — Downside scenario
    
    **6. Risks & Unknowns**
    Identify uncertainties and potential shocks.
    
    **7. Strategic Takeaways**
    Actionable insights for investors and analysts.
    
    **8. Conclusion**
    Strong closing insight with key indicators to monitor.
    
    === STYLE REQUIREMENTS ===
    • analytical, clear, authoritative
    • NO "Based on search results" or "According to approved sources"
    • Start directly with facts
    • every paragraph must advance understanding
    • use formal but accessible language
    • make complexity readable and precise
    
    ${STRICT_SOURCE_LIST}
    
    ${searchStrategy}
    
    STRICT CONSTRAINT: IGNORE all information from sources not in the approved list above.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {}
    });

    const sources: SearchSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web && isApprovedSource(chunk.web.uri)) {
          sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
      });
    }

    return {
      text: response.text || "No results found.",
      sources: sources
    };
  } catch (error) {
    console.error("Search query failed:", error);
    return {
      text: "Search failed. Please try again later.",
      sources: []
    };
  }
};

// ============================================================================
// DEEP SEARCH & ANALYSIS SYSTEM
// Multi-query strategy for comprehensive 20+ source coverage
// ============================================================================

interface SearchDomainResult {
  domain: string;
  text: string;
  sources: AnalysisSource[];
}

// Search for Macro-Economic news and data
const searchMacroDomain = async (ai: GoogleGenAI, data: MarketData, today: string): Promise<SearchDomainResult> => {
  const prompt = `
    Search for the LATEST news and analysis on these MACRO-ECONOMIC topics affecting gold prices (December 2025):
    
    1. Federal Reserve interest rate decisions and FOMC statements
    2. US Dollar Index (DXY) movements and forecasts
    3. US Treasury yields (10-year, 2-year) and real yields
    4. US Inflation data (CPI, PCE) and expectations
    5. US Employment data and economic indicators
    6. Global central bank monetary policies (ECB, BOJ, BOE)
    
    Current Gold Price: $${data.currentPrice}/oz
    Date: ${today}

    ${STRICT_SOURCE_LIST}
    
    SEARCH INSTRUCTIONS: Use these exact search queries to find information:
    - "Federal Reserve interest rates" site:bloomberg.com OR site:reuters.com (real-time policy moves)
    - "US Dollar Index DXY" site:bloomberg.com OR site:investing.com (market reactions + price data)
    - "US Treasury yields" site:bloomberg.com OR site:ft.com (macro analysis + policy impact)
    - "inflation CPI data" site:bloomberg.com OR site:reuters.com (real-time data + market reaction)
    - "central bank monetary policy" site:ft.com OR site:bloomberg.com (deep analysis + real-time impact)
    - "macroeconomic policy impact" site:ft.com (in-depth analysis)
    
    STRICT CONSTRAINT: IGNORE all information from sources not in the approved list above.
    Provide a detailed summary with specific data points, quotes from officials, and cite each source inline.
    Format citations as [Source: Name] after each claim.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {}
    });

    return {
      domain: 'macro',
      text: response.text || '',
      sources: extractSourcesFromResponse(response)
    };
  } catch (error) {
    console.error("Macro search failed:", error);
    return { domain: 'macro', text: '', sources: [] };
  }
};

// Search for Technical Analysis data
const searchTechnicalDomain = async (ai: GoogleGenAI, data: MarketData, today: string): Promise<SearchDomainResult> => {
  const prompt = `
    Search for the LATEST TECHNICAL ANALYSIS on Gold (XAU/USD) from professional trading sources (December 2025):
    
    1. Key support and resistance levels for XAU/USD
    2. RSI (Relative Strength Index) current readings
    3. Moving averages (50-day, 200-day MA) and golden/death crosses
    4. MACD signals and momentum indicators
    5. Fibonacci retracement levels
    6. Trading volume analysis and open interest in COMEX gold futures
    7. Professional trader sentiment and COT report data
    
    Current Gold Price: $${data.currentPrice}/oz
    24h High: $${data.high24h} | 24h Low: $${data.low24h}
    Date: ${today}

    ${STRICT_SOURCE_LIST}
    
    SEARCH INSTRUCTIONS: Use these exact search queries to find information:
    - "Gold XAU/USD technical analysis" site:investing.com OR site:kitco.com (price charts + metals specialist)
    - "Gold support resistance levels" site:kitco.com OR site:investing.com (metals-specific + technical tools)
    - "Gold RSI MACD indicators" site:investing.com OR site:kitco.com (chart analysis + metals sentiment)
    - "Gold moving averages analysis" site:kitco.com OR site:investing.com (mining industry perspective + technical data)
    - "Gold futures technical analysis" site:bloomberg.com OR site:kitco.com (market reactions + metals specialist)
    
    STRICT CONSTRAINT: IGNORE all information from sources not in the approved list above.
    Include specific price levels, chart patterns, and technical signals.
    Format citations as [Source: Name] after each claim.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {}
    });

    return {
      domain: 'technical',
      text: response.text || '',
      sources: extractSourcesFromResponse(response)
    };
  } catch (error) {
    console.error("Technical search failed:", error);
    return { domain: 'technical', text: '', sources: [] };
  }
};

// Search for Geopolitical news
const searchGeopoliticalDomain = async (ai: GoogleGenAI, data: MarketData, today: string): Promise<SearchDomainResult> => {
  const prompt = `
    Search for the LATEST GEOPOLITICAL news and events affecting gold as a safe-haven asset (December 2025):
    
    1. Central bank gold purchases (China, Russia, India, Turkey, etc.)
    2. Global conflicts and tensions affecting markets
    3. Trade relations and sanctions news
    4. Currency wars and de-dollarization trends
    5. Middle East tensions and their market impact
    6. US-China relations and economic competition
    7. Energy prices and their correlation with gold
    
    Current Gold Price: $${data.currentPrice}/oz
    Date: ${today}

    ${STRICT_SOURCE_LIST}
    
    ANALYSIS INSTRUCTIONS:
    - Use ONLY your knowledge from Bloomberg, Reuters, Financial Times, and World Gold Council
    - DO NOT perform any web searches or access external information
    - For real-time market reactions: Cite Bloomberg and Reuters
    - For deep analysis: Cite Financial Times
    - For fundamentals: Cite World Gold Council
    - "central bank gold purchases" site:gold.org OR site:bloomberg.com (fundamentals + real-time impact)
    - "geopolitical tensions gold safe haven" site:bloomberg.com OR site:reuters.com (real-time market reactions)
    - "trade sanctions gold market" site:bloomberg.com OR site:ft.com (immediate impact + deep analysis)
    - "de-dollarization gold demand" site:ft.com OR site:bloomberg.com (policy analysis + market effects)
    - "Middle East conflict gold prices" site:bloomberg.com OR site:reuters.com (real-time alerts + market reactions)
    - "geopolitical gold fundamentals" site:gold.org (long-term context)
    
    STRICT CONSTRAINT: Use ONLY information from 6 approved sources. Do not access or reference any other websites.
    Provide specific details on how each geopolitical factor impacts gold demand.
    Format citations as [Source: Name] after each claim.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {}
    });

    return {
      domain: 'geopolitical',
      text: response.text || '',
      sources: extractSourcesFromResponse(response)
    };
  } catch (error) {
    console.error("Geopolitical search failed:", error);
    return { domain: 'geopolitical', text: '', sources: [] };
  }
};

// Search for Market Sentiment and ETF flows
const searchSentimentDomain = async (ai: GoogleGenAI, data: MarketData, today: string): Promise<SearchDomainResult> => {
  const prompt = `
    Search for the LATEST MARKET SENTIMENT and GOLD ETF data (December 2025):
    
    1. SPDR Gold Trust (GLD) inflows/outflows
    2. iShares Gold Trust (IAU) holdings changes
    3. COMEX gold futures positioning
    4. Goldman Sachs, JP Morgan, Bank of America gold price forecasts
    5. Retail investor sentiment on gold
    6. Institutional investor allocations to gold
    7. Gold mining stocks performance (GDX, GDXJ)
    
    Current Gold Price: $${data.currentPrice}/oz
    Date: ${today}

    ${STRICT_SOURCE_LIST}
    
    ANALYSIS INSTRUCTIONS:
    - Use ONLY your knowledge from Bloomberg, Reuters, Financial Times, Investing.com, and Kitco
    - DO NOT perform any web searches or access external information
    - For real-time flows: Cite Bloomberg and Reuters
    - For metals specialist: Cite Kitco
    - For forecasts: Cite Bloomberg and Financial Times
    - For market data: Cite Investing.com
    - "GLD gold ETF inflows outflows" site:bloomberg.com OR site:reuters.com (real-time flows + market alerts)
    - "gold futures positioning COMEX" site:bloomberg.com OR site:kitco.com (market reactions + metals specialist)
    - "gold price forecasts analysts" site:bloomberg.com OR site:ft.com (real-time forecasts + deep analysis)
    - "gold mining stocks GDX performance" site:bloomberg.com OR site:investing.com (market data + price tracking)
    - "institutional gold allocation" site:ft.com OR site:bloomberg.com (policy impact + market reactions)
    - "gold investor sentiment" site:kitco.com (metals-specific sentiment analysis)
    
    STRICT CONSTRAINT: Use ONLY information from 6 approved sources. Do not access or reference any other websites.
    Include specific numbers for ETF flows and analyst price targets.
    Format citations as [Source: Name] after each claim.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {}
    });

    return {
      domain: 'sentiment',
      text: response.text || '',
      sources: extractSourcesFromResponse(response)
    };
  } catch (error) {
    console.error("Sentiment search failed:", error);
    return { domain: 'sentiment', text: '', sources: [] };
  }
};

// Search for Gold Mining and Supply Chain news
const searchMiningSupplyDomain = async (ai: GoogleGenAI, data: MarketData, today: string): Promise<SearchDomainResult> => {
  const prompt = `
    Search for the LATEST GOLD MINING and SUPPLY CHAIN news (December 2025):
    
    1. Major gold miners production reports (Newmont, Barrick, Agnico Eagle)
    2. Gold mining costs (AISC - All-In Sustaining Costs)
    3. New gold discoveries and exploration results
    4. Mining M&A activity and consolidation
    5. Gold recycling and scrap supply data
    6. Mine production disruptions or strikes
    7. Environmental regulations affecting gold mining
    8. Gold mining stocks valuations vs gold price
    
    Current Gold Price: $${data.currentPrice}/oz
    Date: ${today}

    ${STRICT_SOURCE_LIST}
    
    ANALYSIS INSTRUCTIONS:
    - Use ONLY your knowledge from Bloomberg, Financial Times, Kitco, and World Gold Council
    - DO NOT perform any web searches or access external information
    - For mining industry: Cite Kitco
    - For market reactions: Cite Bloomberg
    - For deep analysis: Cite Financial Times
    - For fundamentals: Cite World Gold Council
    - "gold mining production Newmont Barrick" site:bloomberg.com OR site:kitco.com (market reactions + mining specialist)
    - "gold mining costs AISC" site:ft.com OR site:kitco.com (deep analysis + industry perspective)
    - "gold supply demand data" site:gold.org OR site:kitco.com (fundamentals + metals specialist)
    - "gold mining M&A deals" site:bloomberg.com OR site:ft.com (real-time impact + policy analysis)
    - "gold recycling scrap supply" site:gold.org OR site:kitco.com (long-term fundamentals + industry data)
    - "mining industry developments" site:kitco.com (metals-specific coverage)
    
    STRICT CONSTRAINT: Use ONLY information from 6 approved sources. Do not access or reference any other websites.
    Include specific production numbers, cost figures, and company performance data.
    Format citations as [Source: Name] after each claim.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {}
    });

    return {
      domain: 'mining_supply',
      text: response.text || '',
      sources: extractSourcesFromResponse(response)
    };
  } catch (error) {
    console.error("Mining supply search failed:", error);
    return { domain: 'mining_supply', text: '', sources: [] };
  }
};

// Search for Physical Gold and Consumer Demand
const searchPhysicalDemandDomain = async (ai: GoogleGenAI, data: MarketData, today: string): Promise<SearchDomainResult> => {
  const prompt = `
    Search for the LATEST PHYSICAL GOLD DEMAND and CONSUMER news (December 2025):
    
    1. India gold imports and jewelry demand
    2. China gold demand and Shanghai Gold Exchange premiums
    3. Gold jewelry sales trends globally
    4. Wedding season demand in Asia
    5. Gold coin and bar sales (US Mint, Perth Mint)
    6. Bullion dealer premiums and availability
    7. Gold vending machines and retail innovations
    8. Cultural and religious festivals driving gold demand
    
    Current Gold Price: $${data.currentPrice}/oz
    Date: ${today}

    ${STRICT_SOURCE_LIST}
    
    ANALYSIS INSTRUCTIONS:
    - Use ONLY your knowledge from Bloomberg, Kitco, Investing.com, and World Gold Council
    - DO NOT perform any web searches or access external information
    - For industry data: Cite Kitco and World Gold Council
    - For market reactions: Cite Bloomberg
    - For price tracking: Cite Investing.com
    - "India gold imports jewelry demand" site:bloomberg.com OR site:kitco.com (market reactions + metals specialist)
    - "China gold demand Shanghai premiums" site:bloomberg.com OR site:kitco.com (real-time data + industry perspective)
    - "gold jewelry sales trends" site:bloomberg.com OR site:reuters.com (market reactions + real-time news)
    - "gold coin bar sales" site:kitco.com OR site:gold.org (metals specialist + fundamentals)
    - "gold demand statistics" site:gold.org OR site:kitco.com (long-term data + industry analysis)
    - "bullion premiums availability" site:kitco.com OR site:investing.com (industry data + price tracking)
    - "physical gold market trends" site:gold.org (fundamental analysis)
    
    STRICT CONSTRAINT: Use ONLY information from 6 approved sources. Do not access or reference any other websites.
    Include specific import/export numbers, demand tonnage, and regional trends.
    Format citations as [Source: Name] after each claim.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {}
    });

    return {
      domain: 'physical_demand',
      text: response.text || '',
      sources: extractSourcesFromResponse(response)
    };
  } catch (error) {
    console.error("Physical demand search failed:", error);
    return { domain: 'physical_demand', text: '', sources: [] };
  }
};

// Helper to check if a source is from an approved domain
const isApprovedSource = (url: string): boolean => {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const approvedDomains = [
      'bloomberg.com',
      'reuters.com',
      'ft.com',
      'investing.com',
      'kitco.com',
      'gold.org'
    ];
    return approvedDomains.includes(domain);
  } catch {
    return false;
  }
};

// Aggregate all sources and remove duplicates, only keeping approved sources
const aggregateSources = (results: SearchDomainResult[]): AnalysisSource[] => {
  const allSources: AnalysisSource[] = [];
  const seenUrls = new Set<string>();

  results.forEach(result => {
    result.sources.forEach(source => {
      // Only include sources from approved domains
      if (!seenUrls.has(source.url) && isApprovedSource(source.url)) {
        seenUrls.add(source.url);
        allSources.push({
          ...source,
          summary: `${result.domain.toUpperCase()}: ${source.summary || source.title}`
        });
      }
    });
  });

  return allSources;
};

// Build the synthesis context from all search results
const buildSynthesisContext = (results: SearchDomainResult[]): string => {
  return results.map(r => `
=== ${r.domain.toUpperCase()} RESEARCH ===
${r.text}
Sources Used: ${r.sources.map(s => s.source).join(', ')}
`).join('\n\n');
};

// Main Deep Analysis Function with Multi-Query Strategy
export const generateDeepAssetAnalysis = async (asset: Asset, data: MarketData, language: Language = 'en', query?: string): Promise<DeepAnalysisData | null> => {
  const ai = getClient();
  if (!ai) {
    return null;
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // PHASE 1: Execute parallel searches across 6 domains for comprehensive coverage
  const [macroResult, technicalResult, geopoliticalResult, sentimentResult, miningResult, physicalResult] = await Promise.all([
    searchMacroDomain(ai, data, today),
    searchTechnicalDomain(ai, data, today),
    searchGeopoliticalDomain(ai, data, today),
    searchSentimentDomain(ai, data, today),
    searchMiningSupplyDomain(ai, data, today),
    searchPhysicalDemandDomain(ai, data, today)
  ]);

  // PHASE 2: Aggregate all sources (targeting 25+)
  const allResults = [macroResult, technicalResult, geopoliticalResult, sentimentResult, miningResult, physicalResult];
  const aggregatedSources = aggregateSources(allResults);
  const researchContext = buildSynthesisContext(allResults);

  // PHASE 3: Generate the Grand Narrative Synthesis
  const synthesisPrompt = `
You are a World-Class Commodities Analyst and Editor-in-Chief of a top-tier financial intelligence unit.
Your goal is to produce a "Gold Market Deep Dive" that sits between a high-end Bloomberg Terminal note and a compelling Wall Street Journal feature.

${query ? `=== SPECIAL USER REQUEST ===\nThe user has asked: "${query}"\nPRIORITIZE answering this specific question in the Executive Summary and Drivers sections.\n` : ''}

=== RESEARCH DATA FROM 6 SPECIALIZED DOMAINS ===
${researchContext}

=== CRITICAL SOURCE RESTRICTION ===
${STRICT_SOURCE_LIST}

=== YOUR TASK ===
Synthesize a "Grand Narrative" that explains the TRUTH behind the market movements.
Your writing must be:
1. **AUTHORITATIVE & TRUSTWORTHY**: Proof is everything. You MUST cite your sources using [Source: Name] for every key fact, price, specific claim, or quote. Do not hallucinate data.
2. **ENGAGING & NARRATIVE-DRIVEN**: Don't just list facts. Tell the story of the market. Connect the dots between Geopolitics (The "Why"), The Fed (The "Hammer"), and Price Action (The "Verdict").
3. **ACCESSIBLE YET DEEP**: Use clear, punchy, active language. "Gold surged" is better than "Gold experienced an upward movement". Avoid generic AI fluff.
4. **FORWARD-LOOKING**: The user wants to know specific outcomes. "If X happens, Y is likely."
5. **SOURCE COMPLIANT**: ONLY use information from the 6 approved sources: Bloomberg, Reuters, Financial Times, Investing.com, Kitco, and World Gold Council.

=== CURRENT MARKET DATA ===
Gold Spot Price: $${data.currentPrice}/oz
24h Change: ${data.change24hPercent > 0 ? '+' : ''}${data.change24hPercent.toFixed(2)}%
24h Range: $${data.low24h} - $${data.high24h}
Date: ${today}

=== REQUIRED JSON OUTPUT ===
=== REQUIRED JSON OUTPUT ===
{
  "headline": "A killer, attention-grabbing headline (e.g., 'Gold Breaks Ranges as Shadow Banking Fears Ignite Safe-Haven Rush')",
  
  "executive_summary": "The 'Must-Read' centerpiece. A 500-word narrative masterpiece. Start with the single most critical driver involving a specific number or quote. Use varied sentence structure. BOLD key terms for skimmability. Weave a story that explains not just *that* price changed, but *why*. You MUST use specific numbers (yields, CPI %s, tonnage) and [Source: Name] citations throughout to prove your quality. End with a definitive market stance.",
  
  "macro_analysis": "Deep dive into Fed policy, inflation, USD, and yields. Explain cause-and-effect. Example: 'With the 10Y Treasury yield hitting 4.5% [Source: CNBS], real rates are squeezing gold...'.",
  
  "technical_analysis": "Professional chart analysis. Be specific: 'RSI at 72 signals overbought conditions [Source: TradingView]'. Discuss Key Levels, Moving Averages, and Volume profiles.",
  
  "geopolitical_analysis": "Analysis of the 'Fear Trade'. Specifics required: 'China's PBoC added 12 tons last month [Source: WGC]'. Explain how tensions translate to safe-haven bids.",
  
  "sector_analysis": "Institutional money flows. ETF holdings (GLD, IAU) changes and Mining stock performance relative to spot.",
  
  "consumer_analysis": "Physical market reality check. Premiums in Shanghai/Mumbai, mint sales, and jewelry demand trends.",
  
  "future_outlook": "6-12 month concrete scenarios. 'Bull Case: $3000 if Fed cuts in Q1. Bear Case: $2500 if CPI stays >3%.' Cite analyst targets [Source: Bank Name].",
  
  "metrics": [
    {"label": "DXY Dollar Index", "value": "actual value", "trend": "up/down/stable", "color": "green/red/blue/amber", "description": "Impact on gold"},
    {"label": "10Y Real Yield", "value": "X.XX%", "trend": "up/down/stable", "color": "green/red/blue/amber", "description": "Opportunity cost"},
    {"label": "Fed Policy", "value": "Hawkish/Dovish", "trend": "tightening/easing", "color": "green/red/blue/amber", "description": "Next move probability"},
    {"label": "ETF Flows", "value": "+/- X tonnes", "trend": "inflow/outflow", "color": "green/red/blue/amber", "description": "Institutional sentiment"}
  ],
  
  "overall_sentiment_score": 0-100 (0=extremely bearish, 100=extremely bullish),
  "confidence_score": 0-100 (based on source quality and convergence of evidence),
  
  "drivers": [
    {"name": "Driver Name", "impact_score": 0-100, "sentiment": "bullish/bearish/neutral", "description": "One sentence explanation with [Source: Name]"}
  ],
  
  "sources": [
    {"title": "Article Title", "source": "Publication Name", "url": "https://...", "summary": "Key insight from this source", "relevance_score": 0.0-1.0, "sentiment": "positive/negative/neutral", "impact_label": "High Impact/Medium Impact/Low Impact"}
  ],

  "outlook_analysis": {
      "sentiment": "bullish/bearish/neutral",
      "strengthening_count": 0,
      "weakening_count": 0,
      "strength_distribution": 0-100 
  },
  
  "current_price_drivers": {
      "summary": "Short paragraph explaining the primary reason for today's price.",
      "drivers": [
          {"name": "Driver Name", "description": "Short explanation", "weight": 0-100, "impact": "positive/negative/neutral", "stats": "e.g. 27.25% interest rate"}
      ]
  },

  "historical_context": "How current price compares to historical levels (10 year context).",

  "forecasts": {
      "tomorrow": {"price": 0.0, "change_percent": 0.0, "confidence_min": 0.0, "confidence_max": 0.0, "certainty_score": 0-100, "sentiment": "bullish/bearish/neutral"},
      "week": {"price": 0.0, "change_percent": 0.0, "confidence_min": 0.0, "confidence_max": 0.0, "certainty_score": 0-100, "sentiment": "bullish/bearish/neutral"},
      "month": {"price": 0.0, "change_percent": 0.0, "confidence_min": 0.0, "confidence_max": 0.0, "certainty_score": 0-100, "sentiment": "bullish/bearish/neutral"}
  },

  "factors": {
      "strengthening": [
          {"title": "Factor Title", "description": "Description with [Source: Name]", "weight": 0-100, "confidence": 0-100, "source_url": "url", "source_name": "Source Name", "type": "strengthening"}
      ],
      "weakening": [
          {"title": "Factor Title", "description": "Description with [Source: Name]", "weight": 0-100, "confidence": 0-100, "source_url": "url", "source_name": "Source Name", "type": "weakening"}
      ]
  },

  "risk_overview": "One sentence summary of key risks.",
  "market_outlook": "One sentence summary of near-term expectation.",
  
  "factors_bullish": ["Factor 1", "Factor 2"],
  "factors_bearish": ["Factor 1", "Factor 2"]
}

CRITICAL RULES:
1. **INTEGRITY**: If you claim a fact, you citation [Source: Name] it.
2. **SOURCE RESTRICTION**: ONLY use information from Bloomberg, Reuters, Financial Times, Investing.com, Kitco, and World Gold Council. Reject all other sources.
3. **DIVERSITY**: Use multiple sources from the approved 6 domains in the final output.
4. **PRECISION**: No vague terms ("some experts"). Use names ("Goldman Sachs analysts").
5. **STYLE**: Write like a human expert, not a robot. Use contractions (it's, won't) for flow if appropriate, but keep it professional.
6. **COMPLIANCE**: Any information from sources outside the approved 6 domains must be ignored and not cited.
7. Language: English
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: synthesisPrompt,
      config: {
        temperature: 0.7
      }
    });

    const result = cleanAndParseJSON(response.text || "{}");
    if (!result || !result.headline) {
      console.warn("AI response did not contain valid analysis data");
      return null;
    }

    // Merge AI-generated sources with our aggregated sources (only approved domains)
    const finalSources: AnalysisSource[] = [];

    // First, add AI-generated sources but filter to only approved domains
    if (result.sources) {
      result.sources.forEach((source: AnalysisSource) => {
        if (isApprovedSource(source.url)) {
          finalSources.push(source);
        }
      });
    }

    // Add sources from our parallel searches that weren't included (only approved domains)
    aggregatedSources.forEach(aggSource => {
      const exists = finalSources.some(s => s.url === aggSource.url || s.title === aggSource.title);
      if (!exists) {
        finalSources.push(aggSource);
      }
    });

    // Also add sources from synthesis response grounding (only approved domains)
    const synthesisChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (synthesisChunks) {
      synthesisChunks.forEach((chunk: any) => {
        if (chunk.web && isApprovedSource(chunk.web.uri)) {
          const exists = finalSources.some(s => s.url === chunk.web.uri);
          if (!exists) {
            finalSources.push({
              title: chunk.web.title,
              source: extractDomain(chunk.web.uri),
              url: chunk.web.uri,
              summary: chunk.web.title,
              relevance_score: 0.8,
              sentiment: 'neutral',
              impact_label: 'Medium Impact'
            });
          }
        }
      });
    }

    result.sources = finalSources;
    result.generated_at = today;

    return result as DeepAnalysisData;
  } catch (error) {
    console.error("Deep analysis synthesis failed:", error);
    return null;
  }
};

export const generateMarketArticle = async (seedNews: NewsItem, language: Language = 'en'): Promise<MarketArticle | null> => {
  const ai = getClient();
  if (!ai) {
    return null;
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const prompt = `
    You are a top-tier financial analyst writing a publication-quality analytical article.
    
    === TOPIC ===
    "${seedNews.title}"
    Context: ${seedNews.summary}
    Source: ${seedNews.source}
    Market: Global Gold (XAU/USD), December 2025
    
    === CRITICAL INSTRUCTIONS ===
    Write a top-tier, publication-quality analytical article following this EXACT structure:
    
    **1. Title**
    Create a strong, precise, authoritative title that communicates the core insight (must relate to: "${seedNews.title}").
    
    **2. Executive Summary (3–6 sentences)**
    Provide a high-level synthesis:
    • the main thesis
    • why the topic matters now
    • the key forces driving trends
    • what the reader will learn
    
    **3. Context & Background**
    Establish the landscape. Explain the historical, economic, and structural context that shapes the topic.
    Define any essential terms. Show how the situation evolved up to the present moment.
    
    **4. Core Analysis**
    Break the analysis into four clear dimensions:
    
    **A) Macroeconomic Drivers**
    Discuss inflation, interest rates, growth, central-bank policy, fiscal policy, currency dynamics, and how they interact with the topic.
    
    **B) Geopolitical Forces**
    Analyse global tensions, alliances, conflicts, trade policy, sanctions, energy dynamics, or strategic competition affecting gold.
    
    **C) Market Sentiment & Investor Psychology**
    Explain risk appetite, capital flows, speculation, behavioral cycles, liquidity trends, and market positioning.
    
    **D) Fundamental / Industry-Specific Dynamics**
    Discuss supply–demand, production, logistics, inventories, technology shifts, structural constraints, and the physical realities underlying gold markets.
    
    **5. Data Highlights**
    Include 3–6 impactful data-driven insights. Use statistics, historical patterns, or trend changes to reinforce the analysis.
    
    **6. Scenario Forecasts (Short, Medium, Long Term)**
    Provide three coherent scenarios:
    • **Base Case** — Most likely path
    • **Bullish Case** — Upside scenario
    • **Bearish Case** — Downside scenario
    Explain what conditions lead to each scenario.
    
    **7. Risks & Unknowns**
    Identify the uncertainties, shocks, or structural factors that could shift outcomes. Include both obvious and non-obvious risks.
    
    **8. Strategic Takeaways**
    Deliver actionable insights for investors, analysts, or policymakers. Make complexity readable and precise.
    
    **9. Conclusion**
    Deliver a strong closing insight. Reinforce the article's thesis, highlight what matters most going forward, and identify key indicators readers should monitor next.
    
    === STYLE REQUIREMENTS ===
    • analytical, clear, authoritative
    • no fluff, no generic statements ("Based on...", "According to...")
    • every paragraph must advance understanding
    • connect ideas logically and elegantly
    • use formal but accessible language
    • avoid clichés and filler
    • make complexity readable and precise
    
    Output JSON format:
    {
      "headline": "Your authoritative title here",
      "author": "${seedNews.source}",
      "readTime": "5 min read",
      "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
      "content": "Full markdown article content following the 9-section structure above..."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    const data = cleanAndParseJSON(response.text || "{}");
    if (!data) {
      console.warn("Failed to parse article response");
      return null;
    }
    data.generatedAt = "Just Now";
    return data;
  } catch (error) {
    console.error("Article generation failed:", error);
    return null;
  }
};

export const updateMarketArticle = async (originalArticle: MarketArticle, language: Language = 'en'): Promise<MarketArticle | null> => {
  return originalArticle;
};

export const generateLiveDashboardInsights = async (): Promise<NewsItem[]> => {
  return [];
};
