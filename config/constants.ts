/**
 * Centralized configuration constants
 * All hardcoded values should be defined here for easy maintenance
 */

// =============================================================================
// CACHE SETTINGS
// =============================================================================
export const CACHE = {
    /** Market data cache duration in milliseconds */
    MARKET_DATA_TTL: 60_000, // 1 minute
    /** Search results cache duration */
    SEARCH_TTL: 300_000, // 5 minutes
} as const;

// =============================================================================
// TIMEOUTS
// =============================================================================
export const TIMEOUTS = {
    /** API call timeout in milliseconds */
    API: 5_000,
    /** Proxy timeout for search requests */
    PROXY: 8_000,
    /** AI generation timeout */
    AI_GENERATION: 30_000,
} as const;

// =============================================================================
// DEFAULTS
// =============================================================================
export const DEFAULTS = {
    /** Default gold price when all APIs fail */
    GOLD_PRICE: 4311.97,
    /** Default language */
    LANGUAGE: 'en' as const,
} as const;

// =============================================================================
// PROXY SERVERS
// =============================================================================
export const PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://thingproxy.freeboard.io/fetch/',
] as const;

// =============================================================================
// APPROVED DATA SOURCES
// =============================================================================
export const APPROVED_SOURCES = {
    domains: [
        'bloomberg.com',
        'reuters.com',
        'kitco.com',
        'gold.org',
        'investing.com',
        'fxstreet.com',
        'forexlive.com',
        'wsj.com',
        'ft.com',
        'marketwatch.com',
        'zerohedge.com',
        'goldprice.org',
    ],

    /** Domain to display name mapping */
    displayNames: {
        'bloomberg.com': 'Bloomberg',
        'reuters.com': 'Reuters',
        'kitco.com': 'Kitco',
        'gold.org': 'World Gold Council',
        'investing.com': 'Investing.com',
        'fxstreet.com': 'FXStreet',
        'wsj.com': 'Wall Street Journal',
        'ft.com': 'Financial Times',
    } as Record<string, string>,
} as const;

// =============================================================================
// PRICE CALCULATION
// =============================================================================
export const PRICE_CALC = {
    /** Support level as percentage below current price */
    SUPPORT_PERCENT: 0.97,
    /** Resistance level as percentage above current price */
    RESISTANCE_PERCENT: 1.02,
    /** Target high as percentage above current price */
    TARGET_HIGH_PERCENT: 1.05,
    /** Target low as percentage above current price */
    TARGET_LOW_PERCENT: 1.02,
} as const;

// =============================================================================
// UI SETTINGS
// =============================================================================
export const UI = {
    /** Minimum content length before using fallback (characters) */
    MIN_CONTENT_LENGTH: 500,
    /** Progress bar animation interval (ms) */
    PROGRESS_INTERVAL: 500,
    /** Analysis simulation delay (ms) */
    ANALYSIS_DELAY: 4000,
} as const;
