
import { MarketArticle, NewsItem, Language, SearchResult, SearchSource, Asset, MarketData, DeepAnalysisData, AnalysisSource, TechnicalOutlookData } from "../types";

// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'perplexity/sonar-pro';

// Get API key from environment
const getApiKey = (): string | null => {
    const viteKey = (import.meta as any).env?.VITE_OPENROUTER_API_KEY;
    const nodeKey = typeof process !== 'undefined' ? process.env?.OPENROUTER_API_KEY : null;

    const apiKey = viteKey || nodeKey;

    if (apiKey) {
        console.log('OpenRouter API Key loaded:', apiKey.substring(0, 10) + '...', 'Length:', apiKey.length);
    } else {
        console.warn('OpenRouter API Key NOT FOUND in env');
    }

    if (!apiKey || apiKey.length < 10) {
        return null;
    }
    return apiKey;
};

// Check if AI features are available
export const isAIAvailable = (): boolean => {
    return getApiKey() !== null;
};

// --- CONSTANTS: STRICT DATA SOURCES ---
const STRICT_SOURCE_LIST = `
CRITICAL INSTRUCTION: YOU ARE RESTRICTED TO ONLY THESE 6 APPROVED SOURCES.
Do NOT use or cite data from any other websites.
Only search within and cite these specific domains:

1. Bloomberg (bloomberg.com) - MACROECONOMICS & REAL-TIME MARKET REACTIONS
2. Reuters (reuters.com) - REAL-TIME NEWS & ALERTS
3. Financial Times (ft.com) - IN-DEPTH MACROECONOMIC ANALYSIS
4. Investing.com (investing.com) - REAL-TIME PRICES & CHARTS
5. Kitco (kitco.com) - PRECIOUS METALS SPECIALIST
6. World Gold Council (gold.org) - GOLD FUNDAMENTALS & LONG-TERM CONTEXT
`;

// OpenRouter API call helper
interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface OpenRouterResponse {
    id: string;
    choices: {
        message: {
            content: string;
        };
        finish_reason: string;
    }[];
    citations?: string[];
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

const callOpenRouter = async (messages: OpenRouterMessage[]): Promise<{ content: string; citations: string[] } | null> => {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.warn('OpenRouter API key not configured');
        return null;
    }

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Gold Insight'
            },
            body: JSON.stringify({
                model: MODEL,
                messages,
                temperature: 0.7,
                max_tokens: 16000
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API error:', response.status, errorText);
            return null;
        }

        const data: OpenRouterResponse = await response.json();
        return {
            content: data.choices[0]?.message?.content || '',
            citations: data.citations || []
        };
    } catch (error) {
        console.error('OpenRouter API call failed:', error);
        return null;
    }
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

// Convert citations array to AnalysisSource format
const citationsToSources = (citations: string[]): AnalysisSource[] => {
    return citations
        .filter(url => isApprovedSource(url))
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

// === EXPORTED FUNCTIONS ===

export const searchMarketQuery = async (query: string, language: Language = 'en'): Promise<SearchResult> => {
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const systemPrompt = `You are a top-tier financial analyst specialized in Gold (XAU/USD) markets.
${STRICT_SOURCE_LIST}

IMPORTANT: Read each source article COMPLETELY before synthesizing. Extract specific data points, quotes, and statistics.`;

    const userPrompt = `Search and analyze: "${query}" (${todayStr})
Context: Global Gold Spot Price (XAU/USD), Federal Reserve, Geopolitics.

Write a COMPREHENSIVE analysis with these sections:
- Executive Summary (2-3 sentences)
## Context & Background
## Core Analysis (Macro, Geopolitical, Technical, Sentiment)
## Data Highlights (bullet points with specific numbers)
## Scenario Outlook
## Conclusion

Use [Source: Name] citations throughout.`;

    const result = await callOpenRouter([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ]);

    if (!result) {
        return {
            text: "AI search is currently unavailable. Please check your API key configuration.",
            sources: []
        };
    }

    const sources: SearchSource[] = result.citations
        .filter(isApprovedSource)
        .map(uri => ({ title: extractDomain(uri), uri }));

    return {
        text: result.content,
        sources
    };
};

export const generateDeepAssetAnalysis = async (asset: Asset, data: MarketData, language: Language = 'en', query?: string): Promise<DeepAnalysisData | null> => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    const systemPrompt = `You are a World-Class Commodities Analyst writing for a PREMIUM financial intelligence service.

THIS IS A PAID SERVICE - Users expect Wall Street Journal / Bloomberg Terminal quality.

${STRICT_SOURCE_LIST}

CRITICAL LENGTH REQUIREMENTS:
- executive_summary: MINIMUM 8-10 full sentences with specific data
- macro_analysis: MINIMUM 4-5 full paragraphs with Fed rates, DXY levels, inflation data
- geopolitical_analysis: MINIMUM 4-5 full paragraphs covering all major factors
- sector_analysis: MINIMUM 3-4 paragraphs on investor sentiment and ETF flows
- technical_analysis: MINIMUM 4-5 paragraphs with SPECIFIC PRICE LEVELS
- consumer_analysis: MINIMUM 3-4 paragraphs on supply/demand dynamics

DO NOT ABBREVIATE. Write FULL, DETAILED paragraphs with specific numbers and [Source: Name] citations.`;

    const userPrompt = `${query ? `USER QUESTION: "${query}"\n\n` : ''}
CURRENT MARKET DATA:
- Gold Spot Price: $${data.currentPrice}/oz
- 24h Change: ${data.change24hPercent > 0 ? '+' : ''}${data.change24hPercent.toFixed(2)}%
- 24h Range: $${data.low24h} - $${data.high24h}
- Date: ${today}

GENERATE A COMPREHENSIVE JSON ANALYSIS with ALL fields populated with SUBSTANTIAL content.

{
  "headline": "Compelling headline like: Gold Rally Accelerates: Fed Pivot Expectations Drive XAU/USD Above $2,600",
  
  "executive_summary": "WRITE 8-10 SENTENCES covering: primary market catalyst, why it matters now, Fed policy stance, DXY current level (e.g., 104.2), Treasury yields, geopolitical factors, institutional flows, price action, and strategic outlook. Include [Source: Name] citations.",
  
  "macro_analysis": "WRITE 4-5 FULL PARAGRAPHS: (1) Federal Reserve policy with rate probabilities, (2) Treasury yields - 10Y, 2Y, real yields with numbers, (3) DXY current level and trend, (4) Inflation - CPI, PCE with percentages, (5) How these interconnect. Use [Source: Name] citations.",
  
  "geopolitical_analysis": "WRITE 4-5 FULL PARAGRAPHS: (1) Central bank gold purchases with tonnage, (2) Middle East tensions, (3) US-China relations, (4) Russia-Ukraine, (5) Safe-haven flows. Use [Source: Name] citations.",
  
  "sector_analysis": "WRITE 3-4 FULL PARAGRAPHS: (1) ETF flows - GLD, IAU with tonnage, (2) COMEX positioning, (3) Institutional vs retail, (4) Analyst forecasts from banks. Use [Source: Name] citations.",
  
  "technical_analysis": "WRITE 4-5 FULL PARAGRAPHS with SPECIFIC PRICES: (1) Support levels ($X,XXX, $X,XXX), (2) Resistance levels, (3) 50-day and 200-day MA, (4) RSI and MACD readings, (5) Volume patterns. Use [Source: Name] citations.",
  
  "consumer_analysis": "WRITE 3-4 FULL PARAGRAPHS: (1) Global mine production, (2) AISC costs, (3) India/China demand, (4) Jewelry vs investment demand. Use [Source: Name] citations.",
  
  "future_outlook": "**Base Case (60%)**: Price target $X,XXX based on factors.\\n\\n**Bullish Case (25%)**: $X,XXX if triggers occur.\\n\\n**Bearish Case (15%)**: Downside to $X,XXX if risks materialize.",
  
  "risk_overview": "2 paragraphs on key risks: Fed hawkishness, dollar strength, geopolitical resolution, equity rally.",
  
  "market_outlook": "Strong concluding paragraph synthesizing the thesis.",
  
  "metrics": [
    {"label": "DXY Dollar Index", "value": "104.25", "trend": "down", "color": "green", "description": "Dollar weakness supports gold"},
    {"label": "10Y Real Yield", "value": "1.85%", "trend": "down", "color": "green", "description": "Falling yields reduce opportunity cost"},
    {"label": "Fed Rate Odds", "value": "78%", "trend": "up", "color": "green", "description": "December cut probability"},
    {"label": "GLD ETF", "value": "+8.5t", "trend": "up", "color": "green", "description": "Institutional buying"}
  ],
  
  "overall_sentiment_score": 72,
  "confidence_score": 85,
  
  "drivers": [
    {"name": "Fed Policy", "impact_score": 90, "sentiment": "bullish", "description": "Rate cut expectations driving gold higher [Source: Bloomberg]"},
    {"name": "Dollar Weakness", "impact_score": 82, "sentiment": "bullish", "description": "DXY decline supporting prices [Source: Reuters]"},
    {"name": "Safe Haven", "impact_score": 78, "sentiment": "bullish", "description": "Geopolitical tensions sustaining demand [Source: FT]"}
  ],
  
  "sources": [
    {"title": "Fed Analysis", "source": "Bloomberg", "url": "https://bloomberg.com", "summary": "Key insight", "relevance_score": 0.95, "sentiment": "positive", "impact_label": "High Impact"}
  ],
  
  "outlook_analysis": {"sentiment": "bullish", "strengthening_count": 5, "weakening_count": 2, "strength_distribution": 72},
  
  "current_price_drivers": {
    "summary": "Gold is primarily driven by Fed pivot expectations and dollar weakness.",
    "drivers": [{"name": "Fed Policy", "description": "Rate cut expectations", "weight": 85, "impact": "positive", "stats": "78% December cut probability"}]
  },
  
  "historical_context": "Current price compares to all-time high of $2,135 reached in December 2023.",
  
  "forecasts": {
    "tomorrow": {"price": ${(data.currentPrice * 1.002).toFixed(2)}, "change_percent": 0.2, "confidence_min": ${(data.currentPrice * 0.995).toFixed(2)}, "confidence_max": ${(data.currentPrice * 1.01).toFixed(2)}, "certainty_score": 65, "sentiment": "bullish"},
    "week": {"price": ${(data.currentPrice * 1.01).toFixed(2)}, "change_percent": 1.0, "confidence_min": ${(data.currentPrice * 0.98).toFixed(2)}, "confidence_max": ${(data.currentPrice * 1.03).toFixed(2)}, "certainty_score": 55, "sentiment": "bullish"},
    "month": {"price": ${(data.currentPrice * 1.03).toFixed(2)}, "change_percent": 3.0, "confidence_min": ${(data.currentPrice * 0.95).toFixed(2)}, "confidence_max": ${(data.currentPrice * 1.08).toFixed(2)}, "certainty_score": 45, "sentiment": "bullish"}
  },
  
  "factors": {
    "strengthening": [{"title": "Fed Pivot", "description": "Rate cuts expected [Source: Bloomberg]", "weight": 90, "confidence": 85, "source_url": "https://bloomberg.com", "source_name": "Bloomberg", "type": "strengthening"}],
    "weakening": [{"title": "Strong Data", "description": "US economy resilient [Source: Reuters]", "weight": 60, "confidence": 70, "source_url": "https://reuters.com", "source_name": "Reuters", "type": "weakening"}]
  },
  
  "factors_bullish": ["Fed rate cut expectations", "Dollar weakness", "Central bank buying", "Geopolitical tensions", "ETF inflows"],
  "factors_bearish": ["Strong US jobs data", "Equity rally reducing haven demand"]
}

CRITICAL: Each text field (macro_analysis, geopolitical_analysis, etc.) MUST be 4-5 FULL paragraphs. NOT 1-2 sentences.`;

    const result = await callOpenRouter([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ]);

    if (!result) {
        console.warn('Deep analysis generation failed');
        return null;
    }

    const parsed = cleanAndParseJSON(result.content);
    if (!parsed || !parsed.headline) {
        console.warn('Failed to parse deep analysis JSON');
        return null;
    }

    // Merge citations from Perplexity with parsed sources
    const citationSources = citationsToSources(result.citations);
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

    return parsed as DeepAnalysisData;
};

export const generateMarketArticle = async (seedNews: NewsItem, language: Language = 'en'): Promise<MarketArticle | null> => {
    const systemPrompt = `You are a top-tier financial analyst writing COMPREHENSIVE, PUBLICATION-QUALITY articles.
${STRICT_SOURCE_LIST}

THIS IS A PREMIUM SERVICE. Write FULL, DETAILED content with specific data and citations.`;

    const userPrompt = `TOPIC: "${seedNews.title}"
Context: ${seedNews.summary}
Source: ${seedNews.source}
Market: Global Gold (XAU/USD)

Write a COMPREHENSIVE article (minimum 1500 words) with:

1. Executive Summary paragraph
2. Context & Background (2-3 paragraphs)
3. Core Analysis sections (Macro, Geopolitical, Sentiment, Technical) - each 2-3 paragraphs
4. Data Highlights (5-6 bullet points with specific numbers)
5. Scenario Outlook (Base, Bullish, Bearish cases with price targets)
6. Risks & Unknowns
7. Strategic Takeaways
8. Conclusion

Return as JSON:
{
  "headline": "Compelling headline",
  "author": "${seedNews.source}",
  "readTime": "8 min read",
  "keyTakeaways": ["Takeaway 1 with data", "Takeaway 2 with data", "Takeaway 3 with data"],
  "content": "Full markdown article content with [Source: Name] citations throughout..."
}`;

    const result = await callOpenRouter([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ]);

    if (!result) {
        console.warn('Article generation failed');
        return null;
    }

    const parsed = cleanAndParseJSON(result.content);
    if (!parsed) {
        console.warn('Failed to parse article JSON');
        return null;
    }

    parsed.generatedAt = "Just Now";
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

    const systemPrompt = `You are a gold market analyst. Provide technical outlook with real data.`;

    const userPrompt = `Gold price: $${currentPrice.toFixed(2)}/oz
Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

Return JSON:
{
  "sentiment": "bullish" | "bearish" | "neutral",
  "confidence": 0-100,
  "summary": "2-3 sentence market outlook with specific data",
  "strengthening_factors": count,
  "weakening_factors": count,
  "key_drivers": [
    { "name": "driver", "impact": 0-100, "sentiment": "bullish"|"bearish"|"neutral", "description": "with data" }
  ]
}`;

    const result = await callOpenRouter([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ]);

    if (!result) {
        return fallback;
    }

    const parsed = cleanAndParseJSON(result.content);
    if (parsed) {
        parsed.generated_at = new Date().toISOString();
        return parsed as TechnicalOutlookData;
    }

    return fallback;
};

// Chat session stub
export const createChatSession = (): null => {
    console.warn('Chat sessions not supported with OpenRouter/Perplexity - use searchMarketQuery instead');
    return null;
};
