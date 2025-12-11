// ============================================================================
// GEMINI SERVICE - TWO-AI PIPELINE
// ============================================================================
// Step 1: Perplexity Sonar Pro (via OpenRouter) fetches real-time market data
// Step 2: Gemini 2.0 Flash synthesizes polished, publication-quality articles
// ============================================================================

import { MarketArticle, DeepAnalysisData, NewsItem, AnalysisSource, TechnicalOutlookData, Language, SearchResult, SearchSource, Asset, MarketData } from '../types';
import { searchDuckDuckGo, fetchPageContent, SearchResult as DDGResult } from './searchService';

// ============================================================================
// API CONFIGURATION
// ============================================================================

// Gemini for article synthesis
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Approved data sources
const APPROVED_SOURCES = [
  'bloomberg.com',
  'reuters.com',
  'ft.com',
  'investing.com',
  'kitco.com',
  'gold.org'
];

const SOURCE_NAMES: Record<string, string> = {
  'bloomberg.com': 'Bloomberg',
  'reuters.com': 'Reuters',
  'ft.com': 'Financial Times',
  'investing.com': 'Investing.com',
  'kitco.com': 'Kitco',
  'gold.org': 'World Gold Council'
};

// ============================================================================
// API KEY HELPERS
// ============================================================================

const getGeminiKey = (): string | null => {
  const viteKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  const nodeKey = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : null;
  const key = viteKey || nodeKey;

  if (key && key.length > 10) {
    console.log('[Pipeline] Gemini API Key loaded ✓');
    return key;
  }
  console.warn('[Pipeline] Gemini API Key not found');
  return null;
};

export const isAIAvailable = (): boolean => {
  return getGeminiKey() !== null;
};

// ============================================================================
// STEP 1: PERPLEXITY DATA FETCHING (Real-time web search)
// ============================================================================

interface PerplexityResponse {
  content: string;
  citations: string[];
}

const fetchDataFromPerplexity = async (query: string, dashboardPrice?: number): Promise<PerplexityResponse | null> => {
  // NOTE: Switched to DuckDuckGo (Free) + Scraper pipeline
  // Keeping function name to avoid refactoring all call sites

  console.log('[Pipeline] Step 1: Searching DuckDuckGo & Fetching Content...');

  const priceInstruction = dashboardPrice
    ? `For context: The current authoritative gold price is $${dashboardPrice.toFixed(2)}.`
    : '';

  try {
    // 1. Search DuckDuckGo (Free)
    const results = await searchDuckDuckGo(query);

    if (results.length === 0) {
      console.warn('[Pipeline] No search results found');
      return null;
    }

    console.log(`[Pipeline] Found ${results.length} results. Fetching content...`);

    // 2. Fetch content from top 3 results in parallel
    const topResults = results.slice(0, 3);
    const contentPromises = topResults.map(async (result) => {
      const text = await fetchPageContent(result.link);
      return `SOURCE: ${result.title} (${result.source})\nURL: ${result.link}\nDATE: ${result.date || 'Recent'}\nCONTENT:\n${text}\n\n`;
    });

    const contents = await Promise.all(contentPromises);
    const combinedContent = `${priceInstruction}\n\n${contents.join('-------------------\n')}`;
    const citations = topResults.map(r => r.link);

    console.log(`[Pipeline] Fetched ${combinedContent.length} chars of content`);

    return {
      content: combinedContent,
      citations
    };

  } catch (error) {
    console.error('[Pipeline] Search pipeline failed:', error);
    return null;
  }
};

// ============================================================================
// STEP 2: GEMINI ARTICLE SYNTHESIS (Premium writing)
// ============================================================================

const callGeminiAPI = async (prompt: string, systemPrompt?: string): Promise<string | null> => {
  const apiKey = getGeminiKey();
  if (!apiKey) return null;

  console.log('[Pipeline] Step 2: Synthesizing with Gemini...');

  try {
    const requestBody: any = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 16000,
        topP: 0.95
      }
    };

    if (systemPrompt) {
      requestBody.systemInstruction = {
        parts: [{ text: systemPrompt }]
      };
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Pipeline] Gemini error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log(`[Pipeline] Gemini returned ${content.length} chars`);

    return content;
  } catch (error) {
    console.error('[Pipeline] Gemini call failed:', error);
    return null;
  }
};

// ============================================================================
// HELPERS
// ============================================================================

const cleanAndParseJSON = (text: string): any => {
  if (!text) return null;

  let cleaned = text.replace(/```json/g, '').replace(/```/g, '');

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

const isApprovedSource = (url: string): boolean => {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return APPROVED_SOURCES.includes(domain);
  } catch {
    return false;
  }
};

const extractDomain = (url: string): string => {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return SOURCE_NAMES[domain] || domain;
  } catch {
    return 'Unknown Source';
  }
};

const citationsToSources = (citations: string[]): AnalysisSource[] => {
  return citations
    .filter(isApprovedSource)
    .map((url, index) => ({
      title: `Source ${index + 1}`,
      source: extractDomain(url),
      url,
      summary: '',
      relevance_score: 0.9 - (index * 0.02),
      sentiment: 'neutral' as const,
      impact_label: index < 5 ? 'High Impact' as const : index < 12 ? 'Medium Impact' as const : 'Low Impact' as const
    }));
};

// ============================================================================
// EXPORTED FUNCTIONS - TWO-AI PIPELINE
// ============================================================================

export const searchMarketQuery = async (query: string, language: Language = 'en'): Promise<SearchResult> => {
  const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Step 1: Perplexity gathers data
  const dataQuery = `
Research query: "${query}"
Date: ${todayStr}
Context: Global Gold Spot Price (XAU/USD)

Gather specific data points:
- Current price levels and recent moves
- Relevant economic indicators
- Analyst quotes and forecasts
- Recent news headlines
- Technical levels if applicable
    `;

  // Step 1: Use DuckDuckGo (Free) to find fresh data
  // We pass the raw query (e.g., "Gold Price Analysis") plus "Gold Price" context
  // explicitly to ensure the search engine understands the topic.
  const searchQuery = query.toLowerCase().includes('gold') ? query : `Gold Price ${query}`;
  const rawData = await fetchDataFromPerplexity(searchQuery, undefined); // dashboardPrice is not available here? 
  // Wait, searchMarketQuery doesn't have dashboardPrice passed in. 
  // But generateDeepAssetAnalysis DOES.
  // This edit is for searchMarketQuery.

  // Let's check generateDeepAssetAnalysis call too.

  if (!rawData) {
    return {
      text: "AI search is currently unavailable. Please check your API configuration.",
      sources: []
    };
  }

  // Step 2: Gemini synthesizes response
  const synthesisPrompt = `
VERIFIED MARKET DATA (from real-time sources):
${rawData.content}

SOURCES USED: ${rawData.citations.map(extractDomain).join(', ')}

Based on this verified data, write a COMPREHENSIVE analysis answering: "${query}"

Structure your response with:
- Executive Summary (2-3 sentences)
## Context & Background
## Core Analysis
## Data Highlights (bullet points with specific numbers)
## Outlook
## Conclusion

Use [Source: Name] citations throughout to indicate data origin.
Write in a professional, authoritative tone suitable for institutional investors.
    `;

  const geminiSystemPrompt = `You are a senior commodities analyst at a top investment bank.
You write clear, data-driven analysis for professional investors.
Always cite sources using [Source: Name] format.
Be specific with numbers, dates, and price levels.`;

  const synthesized = await callGeminiAPI(synthesisPrompt, geminiSystemPrompt);

  if (!synthesized) {
    // Fallback to raw Perplexity data
    return {
      text: rawData.content,
      sources: rawData.citations.filter(isApprovedSource).map(uri => ({ title: extractDomain(uri), uri }))
    };
  }

  const sources: SearchSource[] = rawData.citations
    .filter(isApprovedSource)
    .map(uri => ({ title: extractDomain(uri), uri }));

  return {
    text: synthesized,
    sources
  };
};

export const generateDeepAssetAnalysis = async (
  asset: Asset,
  data: MarketData,
  language: Language = 'en',
  query?: string
): Promise<DeepAnalysisData | null> => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  console.log('[Pipeline] Starting Deep Analysis generation...');

  // ========================================================================
  // STEP 1: PERPLEXITY FETCHES REAL-TIME MARKET DATA
  // ========================================================================

  const dataQuery = `
URGENT: Gather comprehensive, CURRENT gold market data for ${today}

=== AUTHORITATIVE PRICE DATA (from our live GoldPrice.org/TradingView feed) ===
Gold Spot Price: $${data.currentPrice.toFixed(2)}/oz (USE THIS EXACT PRICE)
24h High: $${data.high24h.toFixed(2)}
24h Low: $${data.low24h.toFixed(2)}
24h Change: ${data.change24hPercent > 0 ? '+' : ''}${data.change24hPercent.toFixed(2)}%
Previous Close: $${data.prevClose.toFixed(2)}
=============================================================================
${query ? `USER FOCUS: "${query}"` : ''}

DO NOT override the price above with different prices. Our live feed is the source of truth.
Gather CONTEXT and ANALYSIS data to explain WHY gold is at $${data.currentPrice.toFixed(2)}:

REQUIRED DATA POINTS (be SPECIFIC with numbers):

1. FEDERAL RESERVE & MONETARY POLICY:
   - Current Fed funds rate
   - Next FOMC meeting date
   - Market-implied rate cut/hike probabilities (from CME FedWatch)
   - Recent Fed official statements

2. US DOLLAR & YIELDS:
   - DXY Dollar Index current level
   - 10-Year Treasury yield
   - 2-Year Treasury yield
   - Real yields (TIPS)

3. GOLD-SPECIFIC DATA:
   - Gold ETF flows (GLD, IAU) - tonnage changes
   - COMEX positioning
   - Central bank purchases (latest data)
   - Major bank price forecasts (Goldman, JPMorgan, UBS, Citi, BofA, etc.)

4. GEOPOLITICAL & MACRO:
   - Key geopolitical events affecting gold
   - Latest CPI/PCE inflation data
   - Safe-haven demand indicators

5. TECHNICAL ANALYSIS:
   - Key support levels
   - Key resistance levels
   - 50-day and 200-day moving averages
   - RSI reading

Report ALL data with source attribution.
`;

  const rawData = await fetchDataFromPerplexity(dataQuery, data.currentPrice);

  if (!rawData) {
    console.error('[Pipeline] Failed to fetch data from Perplexity');
    return null;
  }

  console.log('[Pipeline] Raw data received, citations:', rawData.citations.length);

  // ========================================================================
  // STEP 2: GEMINI SYNTHESIZES INTO PREMIUM ARTICLE
  // ========================================================================

  const geminiSystemPrompt = `You are a World-Class Commodities Analyst writing for a PREMIUM financial intelligence service.

THIS IS A PAID SERVICE - Users expect Wall Street Journal / Bloomberg Terminal quality.

CRITICAL LENGTH REQUIREMENTS:
- executive_summary: MINIMUM 8-10 full sentences with specific data
- macro_analysis: MINIMUM 4-5 full paragraphs with Fed rates, DXY levels, inflation data
- geopolitical_analysis: MINIMUM 4-5 full paragraphs covering all major factors
- sector_analysis: MINIMUM 3-4 paragraphs on investor sentiment and ETF flows
- technical_analysis: MINIMUM 4-5 paragraphs with SPECIFIC PRICE LEVELS
- consumer_analysis: MINIMUM 3-4 paragraphs on supply/demand dynamics
- bank_opinions.summary: EXACTLY 8 lines of professional analysis

DO NOT ABBREVIATE. Write FULL, DETAILED paragraphs with specific numbers and [Source: Name] citations.`;

  const synthesisPrompt = `
VERIFIED REAL-TIME MARKET DATA (from Perplexity web search):
=============================================================
${rawData.content}
=============================================================

SOURCES VERIFIED: ${rawData.citations.map(extractDomain).join(', ')}

CURRENT MARKET SNAPSHOT:
- Gold Spot Price: $${data.currentPrice}/oz
- 24h Change: ${data.change24hPercent > 0 ? '+' : ''}${data.change24hPercent.toFixed(2)}%
- 24h Range: $${data.low24h} - $${data.high24h}
- Date: ${today}

${query ? `USER QUESTION: "${query}"` : ''}

Using the VERIFIED DATA above, generate a COMPREHENSIVE JSON analysis.
Every fact must come from the data provided - do not hallucinate numbers.

{
  "headline": "Compelling headline with specific price reference, e.g., 'Gold Rallies to $${(data.currentPrice + 20).toFixed(0)} as Fed Pivot Expectations Surge'",
  
  "executive_summary": "WRITE 8-10 SENTENCES covering: primary market catalyst with specifics, Fed policy stance with rate probabilities from the data, DXY current level, Treasury yields, geopolitical factors, institutional flows, price action today, key technical levels, and strategic outlook. Include [Source: Name] citations.",
  
  "macro_analysis": "WRITE 4-5 FULL PARAGRAPHS using the Fed, DXY, and yields data provided. Paragraph 1: Fed policy with exact rate probabilities from data. Paragraph 2: Treasury yields - cite specific 10Y, 2Y levels. Paragraph 3: DXY trend and impact. Paragraph 4: Inflation data (CPI/PCE from sources). Paragraph 5: Interconnections. Use [Source: Name] citations.",
  
  "geopolitical_analysis": "WRITE 4-5 FULL PARAGRAPHS using the geopolitical data provided. Cover central bank purchases with tonnage, regional tensions, safe-haven flows. Use [Source: Name] citations.",
  
  "sector_analysis": "WRITE 3-4 FULL PARAGRAPHS on ETF flows (cite specific tonnage from data), COMEX positioning, institutional vs retail sentiment. Use [Source: Name] citations.",
  
  "technical_analysis": "WRITE 4-5 FULL PARAGRAPHS with SPECIFIC PRICES from the data: support levels, resistance levels, moving averages, RSI/MACD readings. Use [Source: Name] citations.",
  
  "consumer_analysis": "WRITE 3-4 FULL PARAGRAPHS on supply/demand: mine production, central bank demand, jewelry demand seasonality. Use [Source: Name] citations.",
  
  "future_outlook": "**Base Case (60%)**: Price target $X,XXX based on the data.\\n\\n**Bullish Case (25%)**: $X,XXX if specific triggers.\\n\\n**Bearish Case (15%)**: Downside to $X,XXX if risks materialize.",
  
  "risk_overview": "2 paragraphs on key risks based on the data.",
  
  "market_outlook": "Strong concluding paragraph synthesizing the analysis.",
  
  "metrics": [
    {"label": "DXY Dollar Index", "value": "[from data]", "trend": "up|down|stable", "color": "green|red|amber", "description": "Impact on gold"},
    {"label": "10Y Real Yield", "value": "[from data]", "trend": "up|down|stable", "color": "green|red|amber", "description": "Yield impact"},
    {"label": "Fed Rate Odds", "value": "[from data]", "trend": "up|down|stable", "color": "green|red|amber", "description": "Rate expectations"},
    {"label": "GLD ETF Flows", "value": "[from data]", "trend": "up|down|stable", "color": "green|red|amber", "description": "Institutional flows"}
  ],
  
  "overall_sentiment_score": 0-100,
  "confidence_score": 0-100,
  
  "drivers": [
    {"name": "Fed Policy", "impact_score": 0-100, "sentiment": "bullish|bearish|neutral", "description": "Specific driver with [Source: Name]"},
    {"name": "Dollar Weakness", "impact_score": 0-100, "sentiment": "bullish|bearish|neutral", "description": "Specific driver with [Source: Name]"},
    {"name": "Safe Haven", "impact_score": 0-100, "sentiment": "bullish|bearish|neutral", "description": "Specific driver with [Source: Name]"}
  ],
  
  "sources": [
    {"title": "Article headline", "source": "Bloomberg", "url": "https://bloomberg.com", "summary": "Key insight", "relevance_score": 0.95, "sentiment": "positive|negative|neutral", "impact_label": "High Impact|Medium Impact|Low Impact"}
  ],
  
  "outlook_analysis": {"sentiment": "bullish|bearish|neutral", "strengthening_count": 0-10, "weakening_count": 0-10, "strength_distribution": 0-100},
  
  "current_price_drivers": {
    "summary": "Gold is primarily driven by [factors from data].",
    "drivers": [{"name": "Factor", "description": "Details", "weight": 0-100, "impact": "positive|negative|neutral", "stats": "Specific stat"}]
  },
  
  "historical_context": "Current price comparison to historical levels.",
  
  "forecasts": {
    "tomorrow": {"price": ${(data.currentPrice * 1.002).toFixed(2)}, "change_percent": 0.2, "confidence_min": ${(data.currentPrice * 0.995).toFixed(2)}, "confidence_max": ${(data.currentPrice * 1.01).toFixed(2)}, "certainty_score": 65, "sentiment": "bullish|bearish|neutral"},
    "week": {"price": ${(data.currentPrice * 1.01).toFixed(2)}, "change_percent": 1.0, "confidence_min": ${(data.currentPrice * 0.98).toFixed(2)}, "confidence_max": ${(data.currentPrice * 1.03).toFixed(2)}, "certainty_score": 55, "sentiment": "bullish|bearish|neutral"},
    "month": {"price": ${(data.currentPrice * 1.03).toFixed(2)}, "change_percent": 3.0, "confidence_min": ${(data.currentPrice * 0.95).toFixed(2)}, "confidence_max": ${(data.currentPrice * 1.08).toFixed(2)}, "certainty_score": 45, "sentiment": "bullish|bearish|neutral"}
  },
  
  "factors": {
    "strengthening": [{"title": "Factor", "description": "Details [Source: Name]", "weight": 0-100, "confidence": 0-100, "source_url": "url", "source_name": "Name", "type": "strengthening"}],
    "weakening": [{"title": "Factor", "description": "Details [Source: Name]", "weight": 0-100, "confidence": 0-100, "source_url": "url", "source_name": "Name", "type": "weakening"}]
  },
  
  "factors_bullish": ["List of bullish factors from the data"],
  "factors_bearish": ["List of bearish factors from the data"],
  
  "bank_opinions": {
    "summary": "WRITE EXACTLY 8 LINES of high-quality professional analysis about major bank gold forecasts. Use the bank price targets from the data. Write in article-style prose covering: which banks are most bullish, consensus price target range, diverging views, key reasoning, and overall institutional sentiment. Include [Source: Name] citations.",
    "banks": [
      {"name": "Goldman Sachs", "stance": "bullish|bearish|neutral", "price_target": "$X,XXX", "timeframe": "12 months", "comment": "Key reasoning"},
      {"name": "JPMorgan", "stance": "bullish|bearish|neutral", "price_target": "$X,XXX", "timeframe": "Q1 2025", "comment": "Key reasoning"},
      {"name": "UBS", "stance": "bullish|bearish|neutral", "price_target": "$X,XXX", "timeframe": "2024", "comment": "Key reasoning"},
      {"name": "Citi", "stance": "bullish|bearish|neutral", "price_target": "$X,XXX", "timeframe": "12 months", "comment": "Key reasoning"},
      {"name": "Bank of America", "stance": "bullish|bearish|neutral", "price_target": "$X,XXX", "timeframe": "Q2 2025", "comment": "Key reasoning"},
      {"name": "Deutsche Bank", "stance": "bullish|bearish|neutral", "price_target": "$X,XXX", "timeframe": "2024", "comment": "Key reasoning"},
      {"name": "HSBC", "stance": "bullish|bearish|neutral", "price_target": "$X,XXX", "timeframe": "Year-end", "comment": "Key reasoning"},
      {"name": "Barclays", "stance": "bullish|bearish|neutral", "price_target": "$X,XXX", "timeframe": "Year-end", "comment": "Key reasoning"},
      {"name": "Morgan Stanley", "stance": "bullish|bearish|neutral", "price_target": "$X,XXX", "timeframe": "Q1 2025", "comment": "Key reasoning"},
      {"name": "Credit Suisse", "stance": "bullish|bearish|neutral", "price_target": "$X,XXX", "timeframe": "2024 H2", "comment": "Key reasoning"}
    ]
  }
}

CRITICAL: Use ONLY the data provided. Every number must come from the Perplexity research.
`;

  const synthesized = await callGeminiAPI(synthesisPrompt, geminiSystemPrompt);

  if (!synthesized) {
    console.error('[Pipeline] Gemini synthesis failed');
    return null;
  }

  const parsed = cleanAndParseJSON(synthesized);
  if (!parsed || !parsed.headline) {
    console.error('[Pipeline] Failed to parse Gemini response as JSON');
    return null;
  }

  // Merge citations from Perplexity
  const citationSources = citationsToSources(rawData.citations);
  if (parsed.sources) {
    parsed.sources = [...parsed.sources.filter((s: AnalysisSource) => isApprovedSource(s.url)), ...citationSources];
  } else {
    parsed.sources = citationSources;
  }

  // Remove duplicates
  const seenUrls = new Set<string>();
  parsed.sources = parsed.sources.filter((s: AnalysisSource) => {
    if (seenUrls.has(s.url)) return false;
    seenUrls.add(s.url);
    return true;
  });

  parsed.generated_at = today;

  console.log('[Pipeline] Deep Analysis complete ✓');

  return parsed as DeepAnalysisData;
};

export const generateMarketArticle = async (seedNews: NewsItem, language: Language = 'en', currentPrice?: number): Promise<MarketArticle | null> => {
  console.log('[Pipeline] Starting Market Article generation...');

  // Step 1: Use DuckDuckGo (Free) to find fresh data
  const searchQuery = `${seedNews.title} analysis impact`;

  const rawData = await fetchDataFromPerplexity(searchQuery, currentPrice);

  if (!rawData) {
    console.error('[Pipeline] Failed to fetch article data');
    return null;
  }

  // Step 2: Gemini writes the article
  const geminiSystemPrompt = `You are a senior financial journalist writing for a premium market intelligence publication.
Your articles are read by institutional investors, hedge fund managers, and financial advisors.
Write with authority, precision, and depth. Always support claims with data and citations.`;

  const synthesisPrompt = `
TOPIC: "${seedNews.title}"
ORIGINAL CONTEXT: ${seedNews.summary}

VERIFIED RESEARCH DATA:
${rawData.content}

SOURCES: ${rawData.citations.map(extractDomain).join(', ')}

Write a COMPREHENSIVE, PUBLICATION-QUALITY article (minimum 1500 words):

1. **Executive Summary** - 2-3 sentences capturing the key development
2. **Context & Background** - 2-3 paragraphs explaining why this matters
3. **Core Analysis** sections:
   - Macroeconomic Implications (2-3 paragraphs)
   - Market Reaction (2-3 paragraphs)
   - Technical Impact (2-3 paragraphs with price levels)
   - Sentiment Analysis (1-2 paragraphs)
4. **Data Highlights** - 5-6 bullet points with specific numbers
5. **Scenario Outlook**:
   - Base Case with price target
   - Bullish Case with triggers
   - Bearish Case with risks
6. **Risks & Unknowns** - Key uncertainties
7. **Strategic Takeaways** - Actionable insights for investors
8. **Conclusion** - Final synthesis

Use [Source: Name] citations throughout.
Write in professional financial journalism style.

Return as JSON:
{
  "headline": "Compelling, specific headline",
  "author": "${seedNews.source}",
  "readTime": "X min read",
  "keyTakeaways": ["Takeaway 1 with data", "Takeaway 2 with data", "Takeaway 3 with data", "Takeaway 4 with data"],
  "content": "Full markdown article content..."
}
`;

  const synthesized = await callGeminiAPI(synthesisPrompt, geminiSystemPrompt);

  if (!synthesized) {
    console.error('[Pipeline] Article synthesis failed');
    return null;
  }

  const parsed = cleanAndParseJSON(synthesized);
  if (!parsed) {
    console.error('[Pipeline] Failed to parse article JSON');
    return null;
  }

  parsed.generatedAt = "Just Now";

  console.log('[Pipeline] Market Article complete ✓');

  return parsed as MarketArticle;
};

export const updateMarketArticle = async (originalArticle: MarketArticle, language: Language = 'en'): Promise<MarketArticle | null> => {
  return originalArticle;
};

export const generateLiveDashboardInsights = async (): Promise<NewsItem[]> => {
  return [];
};

export const generateTechnicalOutlook = async (currentPrice: number): Promise<TechnicalOutlookData> => {
  const fallback: TechnicalOutlookData = {
    sentiment: 'neutral',
    confidence: 75,
    summary: 'Gold markets are consolidating as traders await key economic data releases.',
    strengthening_factors: 3,
    weakening_factors: 3,
    key_drivers: [
      { name: 'Fed Policy', impact: 80, sentiment: 'neutral', description: 'Market awaiting clarity on rate path' },
      { name: 'Dollar Index', impact: 70, sentiment: 'neutral', description: 'DXY stabilizing near support levels' },
      { name: 'Risk Sentiment', impact: 65, sentiment: 'neutral', description: 'Mixed signals from equity markets' }
    ],
    generated_at: new Date().toISOString()
  };

  // Step 1: Quick DuckDuckGo lookup
  const searchQuery = `Gold Price Technical Analysis XAU/USD ${currentPrice.toFixed(0)}`;

  const rawData = await fetchDataFromPerplexity(searchQuery, currentPrice);

  if (!rawData) {
    return fallback;
  }

  // Step 2: Gemini synthesizes outlook
  const synthesisPrompt = `
TECHNICAL DATA:
${rawData.content}

Gold Price: $${currentPrice.toFixed(2)}/oz
Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

Return JSON:
{
  "sentiment": "bullish" | "bearish" | "neutral",
  "confidence": 0-100,
  "summary": "2-3 sentence market outlook with specific price levels from the data",
  "strengthening_factors": count of bullish factors,
  "weakening_factors": count of bearish factors,
  "key_drivers": [
    { "name": "driver name", "impact": 0-100, "sentiment": "bullish"|"bearish"|"neutral", "description": "specific observation from data" }
  ]
}
`;

  const synthesized = await callGeminiAPI(synthesisPrompt);

  if (!synthesized) {
    return fallback;
  }

  const parsed = cleanAndParseJSON(synthesized);
  if (parsed) {
    parsed.generated_at = new Date().toISOString();
    return parsed as TechnicalOutlookData;
  }

  return fallback;
};

export const createChatSession = (): null => {
  console.warn('[Pipeline] Chat sessions - use searchMarketQuery for conversational queries');
  return null;
};
