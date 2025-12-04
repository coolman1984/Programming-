
import { GoogleGenAI, Chat } from "@google/genai";
import { MarketArticle, NewsItem, Language, SearchResult, SearchSource, Asset, MarketData, DeepAnalysisData } from "../types";

// API Key validation helper
const getApiKey = (): string | null => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
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

export const createChatSession = (): Chat | null => {
  const ai = getClient();
  if (!ai) {
    console.warn("AI Client not initialized - chat session unavailable");
    return null;
  }

  try {
    return ai.chats.create({
      model: 'gemini-1.5-pro',
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
      model: 'gemini-1.5-flash',
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

export const generateDeepAssetAnalysis = async (asset: Asset, data: MarketData, language: Language = 'en'): Promise<DeepAnalysisData | null> => {
  const ai = getClient();
  if (!ai) {
    console.log("AI client unavailable, will use fallback analysis data");
    return null;
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const prompt = `
      You are a Chief Global Market Strategist at a top investment bank (e.g., Goldman Sachs, JP Morgan).
      Task: Perform a "Deep Strategic Analysis" of the Global Gold Market (XAU/USD).
      
      Current Price: $${data.currentPrice} / oz
      Date: ${today} (December 2025 Context)

      STRICT RULES:
      1. **SOURCES**: Use 16+ distinct, high-quality global sources (Bloomberg, Reuters, Kitco, World Gold Council, Federal Reserve).
      2. **DATE**: Do NOT use data from 2024. Focus on Q4 2025.
      3. **FOCUS**: Federal Reserve Policy, US Dollar Index (DXY), US Treasuries, Geopolitics, Central Bank Reserves.
      4. **OUTPUT**: Professional Financial English.

      Required JSON Format:
      {
        "headline": "Professional Headline (e.g., Gold Eyes $2700...)",
        "executive_summary": "300-word deep dive article narrative.",
        "macro_analysis": "Fed Policy, Inflation, Real Yields analysis.",
        "technical_analysis": "Key levels, RSI, Moving Averages for XAU/USD.",
        "geopolitical_analysis": "Global risk assessment.",
        "metrics": [
           {"label": "DXY Index", "value": "102.xx", "trend": "down", "color": "red", "description": "USD Strength"}
        ],
        "overall_sentiment_score": 85,
        "confidence_score": 90,
        "drivers": [
           {"name": "Fed Pivot", "impact_score": 95, "sentiment": "bullish", "description": "Rate cut expectations."}
        ],
        "sources": [
           {"title": "Article Title", "source": "Bloomberg", "url": "https://...", "summary": "Brief insight..."},
           ... (16 items)
        ],
        "factors_bearish": ["Reason 1", "Reason 2"],
        "factors_bullish": ["Reason 1", "Reason 2"]
      }
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const result = cleanAndParseJSON(response.text || "{}");
    if (!result || !result.headline) {
      console.warn("AI response did not contain valid analysis data");
      return null;
    }

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && result.sources) {
      let chunkIndex = 0;
      result.sources = result.sources.map((s: any) => {
        const matchingChunk = chunks.find((c: any) => c.web?.title?.includes(s.source) || c.web?.title?.includes(s.title));
        if (matchingChunk?.web?.uri) {
          return { ...s, url: matchingChunk.web.uri };
        }
        const currentChunk = chunks[chunkIndex];
        if (currentChunk?.web?.uri) {
          const uri = currentChunk.web.uri;
          chunkIndex = (chunkIndex + 1) % chunks.length;
          return { ...s, url: uri };
        }
        return s;
      });
    }

    result.generated_at = today;
    return result as DeepAnalysisData;
  } catch (error) {
    console.error("Deep analysis failed:", error);
    return null;
  }
};

export const generateMarketArticle = async (seedNews: NewsItem, language: Language = 'en'): Promise<MarketArticle | null> => {
  const ai = getClient();
  if (!ai) {
    console.log("AI client unavailable for article generation");
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
      model: 'gemini-1.5-flash',
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
