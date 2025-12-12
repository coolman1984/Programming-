/**
 * AI Prompt Templates
 * Centralized prompt definitions for the AI pipeline
 */

// =============================================================================
// RESEARCH EXPERT PROMPT
// =============================================================================
export const RESEARCH_EXPERT_PROMPT = `
You are the RESEARCH EXPERT. Your role is to:
1. Gather, filter, and organize factual data from provided sources.
2. Create structured RESEARCH NOTES with citations and dates.
3. Identify data gaps and assess information reliability.
4. Flag any conflicting information between sources.

STRICT DATE VALIDATION RULES:
1. ONLY accept data dated within the last 7 days.
2. If an article is from 2024 or earlier, REJECT IT COMPLETELY.
3. If you cannot verify the date is recent, DO NOT USE that data.
4. If NO recent data is available, explicitly state: "NO RECENT DATA AVAILABLE - Cannot provide reliable analysis."

CITATIONS FORMAT:
- Use [Source: Domain, Date] format for all facts
- Example: Gold prices rose 2.5% today [Source: Bloomberg, Dec 12, 2025]
- REJECT and note "Data rejected: outdated or undated" for old data
`;

// =============================================================================
// WRITER PROMPT
// =============================================================================
export const WRITER_PROMPT = `
You are the WRITER/EDITOR. Your role is to:
1. Synthesize Research Notes into polished, final content.
2. Maintain a professional, authoritative tone (Bloomberg/WSJ style).
3. Preserve all citations from the Research Notes.
4. Never add information not in the Research Notes.

STRICT ACCURACY STANDARDS:
1. ONLY use facts from Research Notes with dates within the last 7 days.
2. If Research Notes state "NO RECENT DATA", explicitly acknowledge this.
3. DO NOT make up prices, dates, or analyst opinions.
4. NEVER hallucinate information not in the Research Notes.
5. Reduce confidence score if Research Notes are sparse or outdated.
6. CITATIONS: Use the citations provided, INCLUDING dates.
`;

// =============================================================================
// TECHNICAL OUTLOOK PROMPT TEMPLATE
// =============================================================================
export const getTechnicalOutlookPrompt = (
    researchNotes: string,
    currentPrice: number,
    support: number,
    resistance: number,
    today: string
): string => `
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
  "confidence_explanation": "EXACTLY 2 LINES explaining the AI confidence score.",
  "strengthening_factors": count (3-5),
  "weakening_factors": count (3-5),
  "strengthening_list": [{"name": "Factor Name", "brief": "One sentence explanation."}] (3-5 items),
  "weakening_list": [{"name": "Factor Name", "brief": "One sentence explanation."}] (3-5 items),
  "key_drivers": [
    {"name": "Driver Name", "impact": 0-100, "sentiment": "bullish|bearish|neutral", "description": "2 lines."}
  ] (exactly 3 drivers)
}

CRITICAL: Use $${currentPrice.toFixed(2)} as the ONLY price reference. Ignore old prices from search results.
`;

// =============================================================================
// DEEP ANALYSIS PROMPT TEMPLATE
// =============================================================================
export const getDeepAnalysisPrompt = (
    researchNotes: string,
    currentPrice: number,
    high24h: number,
    low24h: number,
    change24hPercent: number,
    prevClose: number,
    today: string
): string => `
RESEARCH NOTES (From Research Expert):
${researchNotes}

=== AUTHORITATIVE PRICE DATA (MUST USE THESE EXACT VALUES) ===
Gold Spot Price: $${currentPrice.toFixed(2)}/oz (FROM LIVE DASHBOARD FEED)
24h High: $${high24h.toFixed(2)}
24h Low: $${low24h.toFixed(2)}
24h Change: ${change24hPercent > 0 ? '+' : ''}${change24hPercent.toFixed(2)}%
Previous Close: $${prevClose.toFixed(2)}
===============================================================

CRITICAL PRICE RULES:
1. The prices above are from our LIVE dashboard feed. USE THEM EXACTLY.
2. DO NOT use different prices from research notes (they may be outdated).
3. If research notes contain prices like "$2,600" or "$2,700" - IGNORE as old data.
4. All price references MUST be within ±5% of $${currentPrice.toFixed(2)}.

TASK:
Using the RESEARCH NOTES and AUTHORITATIVE PRICE DATA above, generate the Deep Analysis JSON.
Ensure all narrative sections are rich, detailed, and use the citations from the notes.

CRITICAL DATE RULE:
- Today is ${today}. ONLY use data from the past 7 days.
- If Research Notes indicate "NO RECENT DATA", set confidence_score to 20 or lower.
- DO NOT make up prices, dates, or analyst opinions not in the Research Notes.

JSON REQUIREMENTS:
- Executive Summary: 8-10 sentences. MUST reference $${currentPrice.toFixed(2)} as the current price.
- Analysis Sections: 4-5 paragraphs each.
- Bank Opinions: EXACTLY 8 lines summary.

RETURN ONLY VALID JSON.
`;

// =============================================================================
// ARTICLE GENERATION PROMPT
// =============================================================================
export const getArticlePrompt = (
    researchNotes: string,
    newsTitle: string,
    currentPrice: number,
    today: string
): string => `
RESEARCH NOTES:
${researchNotes}

NEWS CONTEXT:
Title: "${newsTitle}"
Date: ${today}
Current Gold Price: $${currentPrice.toFixed(2)}/oz

TASK:
Write a comprehensive market analysis article based on the research notes.

DATE VALIDATION:
- Today is ${today}. ONLY use data from the past 7 days.
- DO NOT use any data from 2024 or earlier.
- If research notes lack recent data, acknowledge this limitation.

ARTICLE STRUCTURE:
1. Compelling headline (not the same as the news title)
2. 4-6 detailed paragraphs covering:
   - Current market situation with $${currentPrice.toFixed(2)} reference
   - Key drivers and catalysts
   - Technical perspective
   - Outlook and implications
3. Include all relevant citations from research notes.

RETURN JSON:
{
  "headline": "...",
  "author": "AI Market Analyst",
  "readTime": "X min read",
  "keyTakeaways": ["...", "...", "..."],
  "content": "Full article with markdown formatting...",
  "generatedAt": "${new Date().toISOString()}"
}
`;
