
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
    const knownSources: Record<string, string> = {
      'bloomberg.com': 'Bloomberg',
      'reuters.com': 'Reuters',
      'kitco.com': 'Kitco',
      'gold.org': 'World Gold Council',
      'federalreserve.gov': 'Federal Reserve',
      'investing.com': 'Investing.com',
      'tradingview.com': 'TradingView',
      'wsj.com': 'Wall Street Journal',
      'cnbc.com': 'CNBC',
      'marketwatch.com': 'MarketWatch',
      'ft.com': 'Financial Times',
      'zerohedge.com': 'ZeroHedge',
      'goldprice.org': 'GoldPrice.org',
      'bullionvault.com': 'BullionVault',
      'apmex.com': 'APMEX',
      'jmbullion.com': 'JM Bullion',
      'mining.com': 'Mining.com',
      'spglobal.com': 'S&P Global',
      'imf.org': 'IMF',
      'worldbank.org': 'World Bank',
      'cmegroup.com': 'CME Group',
      'lbma.org.uk': 'LBMA',
      'xe.com': 'XE',
      'fxstreet.com': 'FXStreet',
      'dailyfx.com': 'DailyFX'
    };
    return knownSources[domain] || domain;
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
  const prompt = `
    Query: "${query} ${todayStr}"
    Context: Global Gold Spot Price (XAU/USD), Federal Reserve, Geopolitics.
    Language: English.
    Provide a comprehensive answer based on search results.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const sources: SearchSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
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
    
    Provide a detailed summary with specific data points, quotes from officials, and cite each source inline.
    Format citations as [Source: Name] after each claim.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
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
    
    Include specific price levels, chart patterns, and technical signals.
    Format citations as [Source: Name] after each claim.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
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
    
    Provide specific details on how each geopolitical factor impacts gold demand.
    Format citations as [Source: Name] after each claim.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
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
    
    Include specific numbers for ETF flows and analyst price targets.
    Format citations as [Source: Name] after each claim.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
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
    
    Include specific production numbers, cost figures, and company performance data.
    Format citations as [Source: Name] after each claim.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
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
    
    Include specific import/export numbers, demand tonnage, and regional trends.
    Format citations as [Source: Name] after each claim.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
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

// Aggregate all sources and remove duplicates
const aggregateSources = (results: SearchDomainResult[]): AnalysisSource[] => {
  const allSources: AnalysisSource[] = [];
  const seenUrls = new Set<string>();

  results.forEach(result => {
    result.sources.forEach(source => {
      if (!seenUrls.has(source.url)) {
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
export const generateDeepAssetAnalysis = async (asset: Asset, data: MarketData, language: Language = 'en'): Promise<DeepAnalysisData | null> => {
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
You are a Chief Global Market Strategist at Goldman Sachs writing the DEFINITIVE Gold Market Analysis Report.

=== RESEARCH DATA FROM 6 SPECIALIZED DOMAINS ===
${researchContext}

=== YOUR TASK ===
Using ALL the research above, create a comprehensive "Grand Narrative" analysis that:

1. **WEAVES** all sources together into a coherent story
2. **CITES** sources inline using [Source: Name] format for EVERY major claim
3. **REVEALS** the hidden meaning behind the news - what's REALLY happening
4. **CONNECTS** dots between macro, technical, and geopolitical factors
5. **QUANTIFIES** with specific numbers, dates, and price levels

=== CURRENT MARKET DATA ===
Gold Spot Price: $${data.currentPrice}/oz
24h Change: ${data.change24hPercent > 0 ? '+' : ''}${data.change24hPercent.toFixed(2)}%
24h Range: $${data.low24h} - $${data.high24h}
Date: ${today}

=== REQUIRED JSON OUTPUT ===
{
  "headline": "Compelling headline that captures the main thesis (e.g., 'Gold Surges Past $2800 as Fed Pivot Signals New Bull Run')",
  
  "executive_summary": "A 500-word narrative that reads like a premium Bloomberg article. MUST include inline citations [Source: Name] for every major claim. Weave together the macro, technical, and geopolitical factors into one coherent story. Explain what's BEHIND the news and what it MEANS for gold.",
  
  "macro_analysis": "Deep dive into Fed policy, inflation, USD, and yields. Include specific data points and inline citations [Source: Name]. Explain cause-and-effect relationships.",
  
  "technical_analysis": "Professional chart analysis with specific price levels, indicators, and patterns. Include RSI values, MA levels, support/resistance. Cite technical analysis sources.",
  
  "geopolitical_analysis": "Analysis of global risks, central bank buying, and safe-haven flows. Include specific tonnage numbers for central bank purchases. Cite geopolitical sources.",
  
  "sector_analysis": "Analysis of gold mining sector, ETF flows, and institutional positioning.",
  
  "consumer_analysis": "Analysis of physical gold demand, jewelry markets, and retail investor behavior.",
  
  "future_outlook": "6-12 month price outlook with specific price targets and scenarios. Must cite analyst forecasts [Source: Bank Name].",
  
  "metrics": [
    {"label": "DXY Index", "value": "actual value", "trend": "up/down/stable", "color": "green/red/blue/amber", "description": "Impact on gold"},
    {"label": "10Y Treasury", "value": "X.XX%", "trend": "up/down/stable", "color": "green/red/blue/amber", "description": "Real yield impact"},
    {"label": "Fed Funds Rate", "value": "X.XX%", "trend": "up/down/stable", "color": "green/red/blue/amber", "description": "Policy outlook"},
    {"label": "Gold ETF Flows", "value": "+/- X tonnes", "trend": "up/down/stable", "color": "green/red/blue/amber", "description": "Investor sentiment"}
  ],
  
  "overall_sentiment_score": 0-100 (0=extremely bearish, 100=extremely bullish),
  "confidence_score": 0-100 (based on source quality and agreement),
  
  "drivers": [
    {"name": "Driver Name", "impact_score": 0-100, "sentiment": "bullish/bearish/neutral", "description": "Detailed explanation with source citation"}
  ],
  
  "sources": [
    {"title": "Article Title", "source": "Publication Name", "url": "https://...", "summary": "Key insight from this source", "relevance_score": 0.0-1.0, "sentiment": "positive/negative/neutral", "impact_label": "High Impact/Medium Impact/Low Impact"}
  ],
  
  "factors_bullish": ["Factor 1 with [Source: Name]", "Factor 2 with [Source: Name]", ...],
  "factors_bearish": ["Factor 1 with [Source: Name]", "Factor 2 with [Source: Name]", ...]
}

CRITICAL RULES:
1. EVERY claim MUST have an inline citation [Source: Name]
2. Include at least 20 sources in the sources array
3. Be specific with numbers, dates, and price levels
4. Connect the dots - explain what news MEANS, not just what happened
5. Write like a $500/month premium financial newsletter
6. Language: ${language === 'ar' ? 'Arabic' : 'English'}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: synthesisPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.7
      }
    });

    const result = cleanAndParseJSON(response.text || "{}");
    if (!result || !result.headline) {
      console.warn("AI response did not contain valid analysis data");
      return null;
    }

    // Merge AI-generated sources with our aggregated sources
    const finalSources = [...(result.sources || [])];

    // Add any sources from our parallel searches that weren't included
    aggregatedSources.forEach(aggSource => {
      const exists = finalSources.some(s => s.url === aggSource.url || s.title === aggSource.title);
      if (!exists && finalSources.length < 25) {
        finalSources.push(aggSource);
      }
    });

    // Also add sources from synthesis response grounding
    const synthesisChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (synthesisChunks) {
      synthesisChunks.forEach((chunk: any) => {
        if (chunk.web) {
          const exists = finalSources.some(s => s.url === chunk.web.uri);
          if (!exists && finalSources.length < 30) {
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
    You are a Senior Financial Journalist for Bloomberg or Reuters.
    Write a comprehensive market article based on: "${seedNews.title}".
    Summary: "${seedNews.summary}".
    Context: Global Gold Markets (XAU/USD), December 2025.
    Style: Professional, insightful, data-driven.
    Output JSON: { "headline": "", "author": "Global Markets Desk", "readTime": "4 min read", "keyTakeaways": [], "content": "Markdown content..." }
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
