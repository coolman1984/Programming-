/**
 * DataSynthesizer - Research and Content Generation Pipeline
 * 
 * Responsibilities:
 * - Deep research (search + fetch)
 * - Data analysis and extraction
 * - Content synthesis for articles and analysis
 */

import { searchDuckDuckGo, fetchPageContent, SearchResult as DDGResult } from '../searchService';
import { callGeminiAPI, generateText, cleanAndParseJSON } from './GeminiClient';
import { RESEARCH_EXPERT_PROMPT, WRITER_PROMPT } from '../../prompts';
import { AnalysisSource } from '../../types';

// ============================================================================
// APPROVED DATA SOURCES
// ============================================================================

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
// TYPES
// ============================================================================

export interface ResearchResult {
    content: string;
    citations: string[];
}

export interface SynthesisResult {
    content: string;
    sources: AnalysisSource[];
}

// ============================================================================
// SOURCE HELPERS
// ============================================================================

export const isApprovedSource = (url: string): boolean => {
    try {
        const domain = new URL(url).hostname.replace('www.', '');
        return APPROVED_SOURCES.includes(domain);
    } catch {
        return false;
    }
};

export const extractDomain = (url: string): string => {
    try {
        const domain = new URL(url).hostname.replace('www.', '');
        return SOURCE_NAMES[domain] || domain;
    } catch {
        return 'Unknown Source';
    }
};

export const citationsToSources = (citations: string[]): AnalysisSource[] => {
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
// STEP 1: DEEP RESEARCH
// ============================================================================

/**
 * Perform deep research by searching and fetching content from multiple sources
 */
export const performDeepResearch = async (
    query: string,
    dashboardPrice?: number
): Promise<ResearchResult | null> => {
    console.log('[DataSynthesizer] Step 1: Deep Research...');

    const priceContext = dashboardPrice
        ? `For context: The current authoritative gold price is $${dashboardPrice.toFixed(2)}.`
        : '';

    try {
        // 1. Search for relevant content
        const results = await searchDuckDuckGo(query);

        if (results.length === 0) {
            console.warn('[DataSynthesizer] No search results found');
            return null;
        }

        console.log(`[DataSynthesizer] Found ${results.length} results. Fetching content...`);

        // 2. Fetch content from top results in parallel
        const topResults = results.slice(0, 4);
        const contentPromises = topResults.map(async (result) => {
            try {
                const text = await fetchPageContent(result.link);
                return `SOURCE: ${result.title} (${result.source})\nURL: ${result.link}\nDATE: ${result.date || 'Recent'}\nCONTENT:\n${text}\n\n`;
            } catch (e) {
                console.warn(`[DataSynthesizer] Failed to fetch ${result.link}`);
                return '';
            }
        });

        const contents = await Promise.all(contentPromises);
        const validContents = contents.filter(c => c.length > 50);

        if (validContents.length === 0) {
            console.warn('[DataSynthesizer] Failed to fetch content from any source');
            return null;
        }

        const combinedContent = `${priceContext}\n\n${validContents.join('-------------------\n')}`;
        const citations = topResults.map(r => r.link);

        console.log(`[DataSynthesizer] Fetched ${combinedContent.length} chars of content`);

        return { content: combinedContent, citations };
    } catch (error) {
        console.error('[DataSynthesizer] Research failed:', error);
        return null;
    }
};

// ============================================================================
// STEP 2: RESEARCH EXPERT ANALYSIS
// ============================================================================

/**
 * Have the Research Expert analyze and structure raw data
 */
export const analyzeRawData = async (
    query: string,
    rawData: ResearchResult
): Promise<string | null> => {
    console.log('[DataSynthesizer] Step 2: Research Expert analyzing...');

    const today = new Date().toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
    });

    const analysisPrompt = `
RAW SEARCH DATA:
${rawData.content}

TASK:
Analyze the data above and produce detailed RESEARCH NOTES for: "${query}"

CRITICAL DATE VALIDATION (Today: ${today}):
- REJECT any data from 2024 or earlier.
- REJECT any undated sources.
- ONLY include data from the past 7 days.

Organize into:
1. Verified Facts: Hard data FROM THE LAST 7 DAYS ONLY
2. Key Narratives: Main stories from THIS WEEK
3. Expert Opinions: Quotes with dates
4. Market Sentiment: Bullish/Bearish indicators
5. Conflict Check: Any contradictory data
6. Rejected Sources: Data rejected due to old/missing dates

FORMAT: Bullet points with [Source: Domain, Date] citations.
`;

    return await generateText(analysisPrompt, RESEARCH_EXPERT_PROMPT);
};

// ============================================================================
// STEP 3: CONTENT SYNTHESIS
// ============================================================================

/**
 * Have the Writer synthesize final content from research notes
 */
export const synthesizeContent = async (
    researchNotes: string,
    task: string,
    outputFormat?: string
): Promise<string | null> => {
    console.log('[DataSynthesizer] Step 3: Writer synthesizing...');

    const today = new Date().toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
    });

    const synthesisPrompt = `
RESEARCH NOTES:
${researchNotes}

TODAY'S DATE: ${today}

TASK:
${task}

CRITICAL DATE RULE:
- ONLY use data from the past 7 days.
- If Research Notes indicate "NO RECENT DATA", explicitly state this.
- DO NOT use any data from 2024 or earlier.

${outputFormat ? `OUTPUT FORMAT:\n${outputFormat}` : ''}
`;

    return await generateText(synthesisPrompt, WRITER_PROMPT);
};

// ============================================================================
// FULL PIPELINE
// ============================================================================

/**
 * Run the complete research → analyze → synthesize pipeline
 */
export const runResearchPipeline = async (
    query: string,
    task: string,
    options?: {
        dashboardPrice?: number;
        outputFormat?: string;
    }
): Promise<SynthesisResult | null> => {
    // Step 1: Research
    const rawData = await performDeepResearch(query, options?.dashboardPrice);
    if (!rawData) return null;

    // Step 2: Analyze
    const researchNotes = await analyzeRawData(query, rawData);
    if (!researchNotes) {
        return {
            content: rawData.content.substring(0, 500) + '...\n(Analysis failed)',
            sources: citationsToSources(rawData.citations)
        };
    }

    // Step 3: Synthesize
    const content = await synthesizeContent(researchNotes, task, options?.outputFormat);
    if (!content) {
        return {
            content: researchNotes,
            sources: citationsToSources(rawData.citations)
        };
    }

    return {
        content,
        sources: citationsToSources(rawData.citations)
    };
};
