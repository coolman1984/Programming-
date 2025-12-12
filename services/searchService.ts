export interface SearchResult {
    title: string;
    link: string;
    snippet: string;
    source: string;
    date?: string;
}

import { PROXIES, TIMEOUTS } from '../config/constants';

// Allowed/trusted news sources for gold data
const ALLOWED_DOMAINS = [
    'kitco.com',
    'gold.org',
    'bloomberg.com',
    'reuters.com',
    'investing.com'
];

const fetchWithRetries = async (url: string): Promise<string> => {
    let lastError;
    for (const proxy of PROXIES) {
        try {
            const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
            console.log(`[Search] Fetching via ${proxy.split('/')[2]}...`);

            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.PROXY); // 8s timeout

            const response = await fetch(proxyUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`Status ${response.status}`);
            return await response.text();
        } catch (e: any) {
            console.warn(`[Search] Proxy failed:`, e.message || e);
            lastError = e;
        }
    }
    throw lastError;
};

// Helper to execute RSS fetch and parse
const queryGoogleRSS = async (queryString: string): Promise<SearchResult[]> => {
    try {
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(queryString)}&hl=en-US&gl=US&ceid=US:en`;
        console.log(`[Search] Querying Google News RSS: ${queryString}`);

        const xmlData = await fetchWithRetries(rssUrl);
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlData, 'text/xml');
        const items = doc.querySelectorAll('item');

        const results: SearchResult[] = [];
        items.forEach(item => {
            const title = item.querySelector('title')?.textContent || '';
            const link = item.querySelector('link')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent || '';
            const sourceEl = item.querySelector('source');
            const source = sourceEl?.textContent || 'Unknown';

            if (link) {
                results.push({
                    title,
                    link,
                    snippet: title,
                    source,
                    date: pubDate
                });
            }
        });
        return results;
    } catch (e) {
        console.warn(`[Search] RSS Query failed for "${queryString}":`, e);
        return [];
    }
};

export const searchDuckDuckGo = async (query: string): Promise<SearchResult[]> => {
    // We'll use Google News RSS as primary since it's cleaner for scraping
    // "DuckDuckGo" function name kept for compatibility with existing imports

    try {
        const siteFilter = ALLOWED_DOMAINS.map((site: string) => `site:${site}`).join(' OR ');

        // Attempt 1: Strict (Specific sites + Last 7 days - ENFORCE RECENT DATA ONLY)
        let results = await queryGoogleRSS(`${query} ${siteFilter} when:7d`);
        if (results.length > 0) {
            console.log(`[Search] Found ${results.length} items (Last 7 days)`);
            return results.slice(0, 5);
        }


        // Attempt 2: Relaxed Date (Specific sites + Any time)
        console.log('[Search] Strict search empty. Retrying without date constraint...');
        results = await queryGoogleRSS(`${query} ${siteFilter}`);
        if (results.length > 0) {
            console.log(`[Search] Found ${results.length} items (Site Filtered)`);
            return results.slice(0, 5);
        }

        // Attempt 3: Broad Search (Just query + "gold")
        // We add "gold" to ensure context if query is generic
        console.log('[Search] Site search empty. Retrying broad search...');
        const broadQuery = query.toLowerCase().includes('gold') ? query : `${query} gold`;
        results = await queryGoogleRSS(broadQuery);

        // Filter broad results for approved sources if possible, but keep others if high quality
        const filtered = results.filter(r => {
            const s = r.source.toLowerCase();
            return ALLOWED_DOMAINS.some((approved: string) => s.includes(approved.replace('.com', '')));
        });

        if (filtered.length > 0) {
            console.log(`[Search] Found ${filtered.length} items (Broad + Filtered)`);
            return filtered.slice(0, 5);
        }

        // If still nothing, return whatever we found in broad search
        if (results.length > 0) {
            console.log(`[Search] Found ${results.length} items (Broad Fallback)`);
            return results.slice(0, 5);
        }

        return [];

    } catch (error) {
        console.error('[Search] Search pipeline failed:', error);
        return [];
    }
};

export const fetchPageContent = async (url: string): Promise<string> => {
    try {
        console.log(`[Search] Fetching content for: ${url}`);
        const html = await fetchWithRetries(url);

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Remove noise
        doc.querySelectorAll('script, style, nav, footer, header, aside, .ad, iframe').forEach(e => e.remove());

        // Find main content
        // Heuristics:
        // 1. <article>
        // 2. <main>
        // 3. div with many paragraphs

        let contentEl = doc.querySelector('article') || doc.querySelector('main');

        if (!contentEl) {
            // Fallback: find div with most <p> tags
            const divs = doc.querySelectorAll('div');
            let maxP = 0;
            divs.forEach(div => {
                const pCount = div.querySelectorAll('p').length;
                if (pCount > maxP) {
                    maxP = pCount;
                    contentEl = div;
                }
            });
        }

        const text = (contentEl || doc.body).innerText || '';
        const cleanText = text.replace(/\s+/g, ' ').trim();

        return cleanText.substring(0, 15000); // 15k chars max

    } catch (error) {
        console.error(`[Search] Content fetch failed for ${url}:`, error);
        return '';
    }
};
