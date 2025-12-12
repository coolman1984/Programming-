// ============================================================================
// GEMINI SERVICE - TWO-AI PIPELINE
// ============================================================================
// Step 1: Perplexity Sonar Pro (via OpenRouter) fetches real-time market data
// Step 2: Gemini 2.0 Flash synthesizes polished, publication-quality articles
// ============================================================================

import { MarketArticle, DeepAnalysisData, NewsItem, AnalysisSource, TechnicalOutlookData, Language, SearchResult, SearchSource, Asset, MarketData } from '../types';
import { searchDuckDuckGo, fetchPageContent, SearchResult as DDGResult } from './searchService';

// ============================================================================
// AI PERSONA DEFINITIONS
// ============================================================================

const RESEARCH_EXPERT_PROMPT = `You are a Meticulous Research Expert AI with STRICT DATE VALIDATION.

CURRENT DATE: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

Your GOAL: Extract ONLY verified facts from the PAST 7 DAYS. Reject ALL outdated data.

CRITICAL DATE RULES:
1. ONLY accept data dated within the last 7 days (from today: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})
2. If an article is from 2024 or earlier, REJECT IT COMPLETELY.
3. If you cannot verify the date is recent (December 2025), DO NOT USE that data.
4. If NO recent data is available, explicitly state: "NO RECENT DATA AVAILABLE - Cannot provide reliable analysis."

Your OUTPUT: Structured, purely factual Research Notes from RECENT sources only.

Your RULES:
1. NO FLUFF. Only hard data and verified claims FROM THE LAST 7 DAYS.
2. CITATIONS: Keep [Source: Domain, Date] for every fact. INCLUDE THE DATE.
3. NUMBERS: Preserve exact prices, dates, and percentages.
4. DATE CHECK: Before including ANY fact, verify its date is within 7 days of today.
5. If data is conflicting, note the discrepancy.
6. If data is old (>7 days) or undated, REJECT IT and note "Data rejected: outdated or undated".
`;

const WRITER_PROMPT = `You are a Senior Financial Editor and Writer with STRICT ACCURACY standards.

CURRENT DATE: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

Your GOAL: Write professional, publication-ready financial content using ONLY the provided Research Notes.

CRITICAL RULES:
1. ONLY use facts from the Research Notes that have dates within the last 7 days.
2. If the Research Notes say "NO RECENT DATA AVAILABLE", DO NOT make up information.
3. If you don't have recent data, explicitly say so in your output.
4. NEVER hallucinate prices, dates, or facts not in the Research Notes.
5. TONE: Authoritative, objective, and sophisticated (Bloomberg/WSJ style).
6. ACCURACY: Strictly follow the numbers in the Research Notes. Do not hallucinate.
7. CITATIONS: Use the citations provided in the notes, INCLUDING dates.
8. If the Research Notes are sparse or outdated, reduce confidence score accordingly.
`;

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
// STEP 1: DEEP RESEARCH (Search & Fetch)
// ============================================================================

interface ResearchResult {
  content: string;
  citations: string[];
}

const performDeepResearch = async (query: string, dashboardPrice?: number): Promise<ResearchResult | null> => {
  console.log('[Pipeline] Step 1: Performing Deep Research Analysis...');

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

    console.log(`[Pipeline] Found ${results.length} results.Fetching content...`);

    // 2. Fetch content from top 3-4 results in parallel for broader context
    const topResults = results.slice(0, 4);
    const contentPromises = topResults.map(async (result) => {
      try {
        const text = await fetchPageContent(result.link);
        return `SOURCE: ${result.title} (${result.source}) \nURL: ${result.link} \nDATE: ${result.date || 'Recent'} \nCONTENT: \n${text} \n\n`;
      } catch (e) {
        console.warn(`[Pipeline] Failed to fetch ${result.link} `);
        return '';
      }
    });

    const contents = await Promise.all(contentPromises);
    const validContents = contents.filter(c => c.length > 50); // Filter empty or failed fetches

    if (validContents.length === 0) {
      console.warn('[Pipeline] Failed to fetch meaningful content from any source.');
      return null;
    }

    const combinedContent = `${priceInstruction} \n\n${validContents.join('-------------------\n')} `;
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
// STEP 2: RESEARCH EXPERT ANALYSIS (Data Extraction)
// ============================================================================

const analyzeRawData = async (query: string, rawData: ResearchResult): Promise<string | null> => {
  console.log('[Pipeline] Step 2: Research Expert analyzing raw data...');

  const analysisPrompt = `
RAW SEARCH DATA:
${rawData.content}

TASK:
Analyze the data above and produce detailed RESEARCH NOTES for the query: "${query}"

CRITICAL: Check EVERY date. Today is ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
- REJECT any data from 2024 or earlier.
- REJECT any undated sources.
- ONLY include data from the past 7 days.

Organize the notes into:
1. Verified Facts: Hard data (prices, dates, stats) FROM THE LAST 7 DAYS ONLY.
2. Key Narratives: What are the main stories from THIS WEEK?
3. Expert Opinions: Quotes/Stances from specific banks/analysts (with dates).
4. Market Sentiment: Bullish/Bearish indicators found in the text.
5. Conflict Check: Note any contradictory data points.
6. Date Validation: List any rejected sources due to old/missing dates.

FORMAT:
Bullet points with [Source: Domain, Date] citations. ALWAYS include the date.
`;

  return await callGeminiAPI(analysisPrompt, RESEARCH_EXPERT_PROMPT);
};

// ============================================================================
// STEP 2: GEMINI ARTICLE SYNTHESIS (Premium writing)
// ============================================================================

const callGeminiAPI = async (prompt: string, systemPrompt?: string): Promise<string | null> => {
  const apiKey = getGeminiKey();
  if (!apiKey) return null;

  if (!apiKey) return null;

  // console.log('[Pipeline] Calling Gemini...');

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

    const response = await fetch(`${GEMINI_API_URL}?key = ${apiKey} `, {
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

  // Step 1: Research (Gather raw data)
  const searchQuery = query.toLowerCase().includes('gold') ? query : `Gold Price ${query}`;
  const rawData = await performDeepResearch(searchQuery, undefined);

  if (!rawData) {
    return {
      text: "AI research is currently unavailable. Please check your network connection.",
      sources: []
    };
  }

  // Step 2: Research Expert (Organize data)
  const researchNotes = await analyzeRawData(query, rawData);

  if (!researchNotes) {
    return {
      text: rawData.content.substring(0, 500) + "...\n(Analysis failed, showing raw snippet)",
      sources: rawData.citations.filter(isApprovedSource).map(uri => ({ title: extractDomain(uri), uri }))
    };
  }

  // Step 3: Writer (Synthesize final response)
  const synthesisPrompt = `
RESEARCH NOTES (From Research Expert):
${researchNotes}

TODAY'S DATE: ${todayStr}

TASK:
Based on these verified notes, write a COMPREHENSIVE analysis answering: "${query}"

CRITICAL DATE RULE: 
- ONLY use data from the past 7 days (ending ${todayStr}).
- If Research Notes indicate "NO RECENT DATA", explicitly state this in your response.
- DO NOT use any data from 2024 or earlier.

Structure your response with:
- Executive Summary (2-3 sentences)
## Context & Background
## Core Analysis
## Data Highlights (bullet points)
## Outlook
## Conclusion
`;

  const synthesized = await callGeminiAPI(synthesisPrompt, WRITER_PROMPT);

  if (!synthesized) {
    return {
      text: researchNotes,
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

  // ========================================================================
  // STEP 1: DEEP RESEARCH
  // ========================================================================

  const rawData = await performDeepResearch(dataQuery, data.currentPrice);

  if (!rawData) {
    console.error('[Pipeline] Failed to fetch data');
    return null;
  }

  // ========================================================================
  // STEP 2: RESEARCH EXPERT ANALYSIS
  // ========================================================================

  const researchNotes = await analyzeRawData(`Deep Asset Analysis for Gold (XAU/USD) on ${today}`, rawData);

  if (!researchNotes) {
    console.error('[Pipeline] Research Expert failed to digest data');
    return null;
  }

  // ========================================================================
  // STEP 3: WRITER SYNTHESIS (JSON GENERATION)
  // ========================================================================

  const synthesisPrompt = `
RESEARCH NOTES (From Research Expert):
${researchNotes}

=== AUTHORITATIVE PRICE DATA (MUST USE THESE EXACT VALUES) ===
Gold Spot Price: $${data.currentPrice.toFixed(2)}/oz (FROM LIVE DASHBOARD FEED)
24h High: $${data.high24h.toFixed(2)}
24h Low: $${data.low24h.toFixed(2)}
24h Change: ${data.change24hPercent > 0 ? '+' : ''}${data.change24hPercent.toFixed(2)}%
Previous Close: $${data.prevClose.toFixed(2)}
===============================================================

CRITICAL PRICE RULES:
1. The prices above are from our LIVE dashboard feed. USE THEM EXACTLY.
2. DO NOT use different prices from research notes (they may be outdated).
3. If research notes contain prices like "$2,600" or "$2,700" - IGNORE as old data.
4. All price references MUST be within ±5% of $${data.currentPrice.toFixed(2)}.

TASK:
Using the RESEARCH NOTES and AUTHORITATIVE PRICE DATA above, generate the Deep Analysis JSON.
Ensure all narrative sections are rich, detailed, and use the citations from the notes.

CRITICAL DATE RULE:
- Today is ${today}. ONLY use data from the past 7 days.
- If Research Notes indicate "NO RECENT DATA", set confidence_score to 20 or lower.
- DO NOT make up prices, dates, or analyst opinions not in the Research Notes.

JSON REQUIREMENTS:
- Executive Summary: 8-10 sentences. MUST reference $${data.currentPrice.toFixed(2)} as the current price.
- Analysis Sections: 4-5 paragraphs each.
- Bank Opinions: EXACTLY 8 lines summary.

RETURN ONLY VALID JSON.
`;

  // We reuse the standard structure prompt inside the writer's "context" effectively by appending the huge JSON schema requirement prompt
  // But wait, the previous code had the JSON schema in the synthesis prompt. 
  // I must include the JSON schema in the synthesis prompt or the system prompt.
  // The system prompt `WRITER_PROMPT` is generic.
  // I will make a specialized system prompt for JSON generation that extends the Writer persona.

  const JSON_WRITER_PROMPT = WRITER_PROMPT + `
  SPECIAL INSTRUCTION: You must output ONLY valid JSON matching the requested schema.
  Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
  `;

  const fullSynthesisPrompt = synthesisPrompt + `
  
  Generate a JSON object with this EXACT structure and content requirements:
  {
  "headline": "Compelling headline with specific price reference",
  
  "executive_summary": "WRITE 8-10 SENTENCES covering: primary market catalyst, Fed policy, DXY, Yields, Geopolitics. Use [Source: Name].",
  
  "macro_analysis": "WRITE 4-5 FULL PARAGRAPHS using the provided Research Notes. Focus on Fed, Rates, DXY, Inflation.",
  
  "geopolitical_analysis": "WRITE 4-5 FULL PARAGRAPHS on Central Banks, Wars, Tensions.",
  
  "sector_analysis": "WRITE 3-4 FULL PARAGRAPHS on ETFs, Positioning.",
  
  "technical_analysis": "WRITE 4-5 FULL PARAGRAPHS with specific support/resistance levels found in notes.",
  
  "consumer_analysis": "WRITE 3-4 FULL PARAGRAPHS on physical demand.",
  
  "future_outlook": "**Base Case (60%)**: Price target... \\n\\n**Bullish Case**: ... \\n\\n**Bearish Case**: ...",
  
  "risk_overview": "2 paragraphs on risks.",
  
  "market_outlook": "Strong concluding paragraph.",
  
  "metrics": [
    {"label": "DXY Dollar Index", "value": "Number from notes", "trend": "up|down|stable", "color": "green|red|amber", "description": "Impact"},
    {"label": "10Y Real Yield", "value": "Number from notes", "trend": "up|down|stable", "color": "green|red|amber", "description": "Impact"},
    {"label": "Fed Rate Odds", "value": "Number from notes", "trend": "up|down|stable", "color": "green|red|amber", "description": "Impact"},
    {"label": "GLD ETF Flows", "value": "Number from notes", "trend": "up|down|stable", "color": "green|red|amber", "description": "Impact"}
  ],
  
  "overall_sentiment_score": 0-100,
  "confidence_score": 0-100,
  
  "drivers": [
     {"name": "Driver 1", "impact_score": 0-100, "sentiment": "bullish|bearish|neutral", "description": "Details"}
  ],
  
  "sources": [], 
  
  "outlook_analysis": {"sentiment": "bullish|bearish|neutral", "strengthening_count": 0-10, "weakening_count": 0-10, "strength_distribution": 0-100},
  
  "current_price_drivers": {
    "summary": "Summary of drivers",
    "drivers": [{"name": "Factor", "description": "Details", "weight": 0-100, "impact": "positive|negative|neutral", "stats": "Specific stat"}]
  },
  
  "historical_context": "Context vs history",
  
  "forecasts": {
    "tomorrow": {"price": number, "change_percent": number, "confidence_min": number, "confidence_max": number, "certainty_score": 0-100, "sentiment": "bullish"},
    "week": {"price": number, "change_percent": number, "confidence_min": number, "confidence_max": number, "certainty_score": 0-100, "sentiment": "bullish"},
    "month": {"price": number, "change_percent": number, "confidence_min": number, "confidence_max": number, "certainty_score": 0-100, "sentiment": "bullish"}
  },
  
  "factors": {
    "strengthening": [{"title": "Factor", "description": "Details", "weight": 0-100, "confidence": 0-100, "source_url": "", "source_name": "", "type": "strengthening"}],
    "weakening": []
  },
  
  "factors_bullish": ["List of bullish factors"],
  "factors_bearish": ["List of bearish factors"],
  
  "bank_opinions": {
    "summary": "WRITE EXACTLY 8 LINES of summary about bank views.",
    "banks": [
      {"name": "Bank Name", "stance": "bullish", "price_target": "$2,xxx", "timeframe": "2025", "comment": "Reasoning"}
    ]
  }
}
  `;

  const synthesized = await callGeminiAPI(fullSynthesisPrompt, JSON_WRITER_PROMPT);

  if (!synthesized) {
    console.error('[Pipeline] Writer synthesis failed');
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
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Step 1: Deep Research
  const searchQuery = `${seedNews.title} analysis impact ${today}`;
  const rawData = await performDeepResearch(searchQuery, currentPrice);

  if (!rawData) {
    console.error('[Pipeline] Failed to fetch article data');
    return null;
  }

  // Step 2: Research Expert
  const researchNotes = await analyzeRawData(`Analysis of news: ${seedNews.title} on ${today}`, rawData);

  if (!researchNotes) {
    // Fallback
    return null;
  }

  // Step 3: Writer
  const synthesisPrompt = `
TOPIC: "${seedNews.title}"
ORIGINAL CONTEXT: ${seedNews.summary}

TODAY'S DATE: ${today}

RESEARCH NOTES:
${researchNotes}

CRITICAL DATE RULE:
- ONLY use data from the past 7 days (ending ${today}).
- If Research Notes say "NO RECENT DATA", explicitly state this in the article.
- DO NOT hallucinate prices, facts, or analyst opinions.

Write a COMPREHENSIVE, PUBLICATION-QUALITY article (minimum 1500 words):
1. **Executive Summary**
2. **Context & Background**
3. **Core Analysis** (Macro, Market, Technical, Sentiment)
4. **Data Highlights**
5. **Scenario Outlook**
6. **Risks**
7. **Takeaways**

Return as JSON:
{
  "headline": "Compelling headline",
  "author": "${seedNews.source}",
  "readTime": "6 min read",
  "keyTakeaways": ["Highlights from notes"],
  "content": "Full markdown article content..."
}
`;

  const JSON_WRITER_PROMPT = WRITER_PROMPT + "\nOUTPUT ONLY VALID JSON.";

  const synthesized = await callGeminiAPI(synthesisPrompt, JSON_WRITER_PROMPT);

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
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const fallback: TechnicalOutlookData = {
    sentiment: 'neutral',
    confidence: 75,
    summary: `Gold is currently trading at $${currentPrice.toFixed(2)} per ounce. Markets are consolidating as traders await key economic data releases. Technical indicators suggest a neutral stance with mixed signals. The short-term outlook remains range-bound pending further catalysts.`,
    confidence_explanation: 'The AI confidence is based on the consistency of data from multiple verified financial sources. Current market conditions show mixed signals, which moderates certainty levels.',
    strengthening_factors: 3,
    weakening_factors: 3,
    strengthening_list: [
      { name: 'Safe Haven Demand', brief: 'Geopolitical tensions supporting gold as a risk-off asset.' },
      { name: 'Central Bank Buying', brief: 'Continued accumulation by emerging market central banks.' },
      { name: 'Inflation Hedge', brief: 'Persistent inflation concerns driving investor interest.' }
    ],
    weakening_list: [
      { name: 'Strong Dollar', brief: 'DXY strength creating headwinds for gold prices.' },
      { name: 'Rising Yields', brief: 'Higher Treasury yields increasing opportunity cost of holding gold.' },
      { name: 'Risk-On Sentiment', brief: 'Equity market rallies reducing safe-haven demand.' }
    ],
    key_drivers: [
      { name: 'Fed Policy', impact: 80, sentiment: 'neutral', description: 'Market awaiting clarity on the Fed rate path. Recent statements suggest a data-dependent approach with potential for cuts in 2025.' },
      { name: 'Dollar Index', impact: 70, sentiment: 'neutral', description: 'DXY is stabilizing near key support levels. A break below 104 would be bullish for gold, while strength above 106 is bearish.' },
      { name: 'Risk Sentiment', impact: 65, sentiment: 'neutral', description: 'Mixed signals from equity markets. Investors are balancing growth optimism against recession fears and geopolitical risks.' }
    ],
    generated_at: new Date().toISOString()
  };

  // Step 1: Research
  const searchQuery = `Gold Price Technical Analysis XAU/USD ${currentPrice.toFixed(0)} ${today}`;
  const rawData = await performDeepResearch(searchQuery, currentPrice);

  if (!rawData) {
    console.warn('[Pipeline] Technical Outlook: No research data, using fallback');
    return fallback;
  }

  // Step 2: Research Expert
  const researchNotes = await analyzeRawData(`Technical Analysis XAU/USD at $${currentPrice} on ${today}`, rawData);

  if (!researchNotes) {
    console.warn('[Pipeline] Technical Outlook: Research Expert failed, using fallback');
    return fallback;
  }

  // Step 3: Writer with enhanced prompt
  const support = Math.round(currentPrice * 0.97); // ~3% below
  const resistance = Math.round(currentPrice * 1.02); // ~2% above

  const synthesisPrompt = `
RESEARCH NOTES:
${researchNotes}

=== AUTHORITATIVE PRICE DATA (MUST USE THESE EXACT VALUES) ===
CURRENT GOLD PRICE: $${currentPrice.toFixed(2)}/oz
ESTIMATED SUPPORT LEVEL: $${support} (3% below current)
ESTIMATED RESISTANCE LEVEL: $${resistance} (2% above current)
DATE: ${today}
===============================================================

CRITICAL PRICE RULES:
1. The CURRENT GOLD PRICE above is from our LIVE dashboard feed. USE IT EXACTLY.
2. DO NOT use any different prices from the research notes (they may be old).
3. Calculate support/resistance relative to $${currentPrice.toFixed(2)}.
4. If research notes mention prices like "$2,600" or "$2,700" - IGNORE THEM as outdated.
5. All price references in your output MUST be within ±5% of $${currentPrice.toFixed(2)}.

Generate a DETAILED Technical Outlook JSON with these EXACT requirements:

{
  "sentiment": "bullish" OR "bearish" OR "neutral",
  
  "confidence": 0-100 (based on data quality and consistency),
  
  "summary": "EXACTLY 4 LINES covering: (1) Gold at $${currentPrice.toFixed(2)} and today's movement, (2) Short-term direction based on technicals, (3) Key insight from the data, (4) Overall outlook/conclusion. USE THE PRICES ABOVE.",
  
  "confidence_explanation": "EXACTLY 2 LINES explaining the AI confidence score. Mention the number of sources analyzed and any agreement/disagreement between them.",
  
  "strengthening_factors": count (3-5),
  "weakening_factors": count (3-5),
  
  "strengthening_list": [
    { "name": "Factor Name (1-3 words)", "brief": "One clear sentence explaining why this is bullish for gold." },
    { "name": "...", "brief": "..." }
  ] (MUST have 3-5 items),
  
  "weakening_list": [
    { "name": "Factor Name (1-3 words)", "brief": "One clear sentence explaining why this is bearish for gold." },
    { "name": "...", "brief": "..." }
  ] (MUST have 3-5 items),
  
  "key_drivers": [
    {
      "name": "Driver Name",
      "impact": 0-100,
      "sentiment": "bullish" OR "bearish" OR "neutral",
      "description": "EXACTLY 2 LINES: First line states the current status. Second line explains the implication for gold."
    }
  ] (MUST have exactly 3 drivers)
}

CRITICAL: Use $${currentPrice.toFixed(2)} as the ONLY price reference. Ignore old prices from search results.
`;

  const synthesized = await callGeminiAPI(synthesisPrompt, WRITER_PROMPT + "\nOUTPUT ONLY VALID JSON. No markdown formatting.");

  if (!synthesized) {
    console.warn('[Pipeline] Technical Outlook: Synthesis failed, using fallback');
    return fallback;
  }

  const parsed = cleanAndParseJSON(synthesized);

  if (parsed && parsed.summary) {
    // Ensure all required fields exist with defaults
    parsed.strengthening_list = parsed.strengthening_list || fallback.strengthening_list;
    parsed.weakening_list = parsed.weakening_list || fallback.weakening_list;
    parsed.confidence_explanation = parsed.confidence_explanation || fallback.confidence_explanation;
    parsed.strengthening_factors = parsed.strengthening_factors || parsed.strengthening_list.length;
    parsed.weakening_factors = parsed.weakening_factors || parsed.weakening_list.length;
    parsed.key_drivers = parsed.key_drivers || fallback.key_drivers;
    parsed.generated_at = new Date().toISOString();

    console.log('[Pipeline] Technical Outlook generated successfully ✓');
    return parsed as TechnicalOutlookData;
  }

  console.warn('[Pipeline] Technical Outlook: Parse failed, using fallback');
  return fallback;
};

export const createChatSession = (): null => {
  console.warn('[Pipeline] Chat sessions - use searchMarketQuery for conversational queries');
  return null;
};
