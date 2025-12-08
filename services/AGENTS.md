# Services - AGENTS.md

> Detailed guidance for the `services/` directory containing API integrations.

## Package Identity

This directory contains external API integrations and data services:

- **geminiService.ts** - Google Gemini AI for market analysis
- **marketDataService.ts** - Gold price data from multiple sources

---

## Architecture Overview

```text
┌──────────────────────────────────────────────────────────────┐
│                    Component Layer                            │
│         (pages/Dashboard.tsx, components/*.tsx)              │
└─────────────────────────┬────────────────────────────────────┘
                          │ calls
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                    Services Layer                             │
│  ┌─────────────────────┐    ┌─────────────────────────────┐  │
│  │  geminiService.ts   │    │  marketDataService.ts       │  │
│  │  - AI analysis      │    │  - Live gold prices         │  │
│  │  - Chat sessions    │    │  - Historical data          │  │
│  │  - Article gen      │    │  - Fallback data            │  │
│  └──────────┬──────────┘    └──────────────┬──────────────┘  │
└─────────────┼───────────────────────────────┼────────────────┘
              │                               │
              ▼                               ▼
     ┌────────────────┐          ┌─────────────────────────┐
     │ Google Gemini  │          │ GoldPrice.org (free)    │
     │ API (requires  │          │ TradingView (free)      │
     │ VITE_GEMINI_   │          │ Metals-API (key req.)   │
     │ API_KEY)       │          │ Fallback (~$2650)       │
     └────────────────┘          └─────────────────────────┘
```

---

## Service Files

### geminiService.ts (52KB, 1134 lines)

**Purpose:** AI-powered market analysis using Google Gemini

**Key Exports:**

| Function | Purpose |
|----------|---------|
| `isAIAvailable()` | Check if Gemini API key is configured |
| `createChatSession()` | Start interactive AI chat |
| `searchMarketQuery()` | Search-based market analysis |
| `generateDeepAssetAnalysis()` | Comprehensive 6-domain deep analysis |
| `generateMarketArticle()` | Generate news article with full content |

**Pattern - Multi-Domain Search:**

```typescript
// The service uses parallel domain-specific searches:
const [macroResult, technicalResult, geopoliticalResult, ...] = await Promise.all([
  searchMacroDomain(ai, data, today),
  searchTechnicalDomain(ai, data, today),
  searchGeopoliticalDomain(ai, data, today),
  // ... more domains
]);
```

**API Key Resolution Order:**

1. `VITE_GEMINI_API_KEY` (Vite env - recommended)
2. `process.env.API_KEY` (Node.js fallback)
3. `process.env.GEMINI_API_KEY` (Node.js fallback)
4. ⚠️ Hardcoded key (REMOVE THIS - see API_SECURITY_REPORT.md)

### marketDataService.ts (412 lines)

**Purpose:** Fetch live gold prices with multiple fallback sources

**Key Exports:**

| Function | Purpose |
|----------|---------|
| `fetchLiveGoldData()` | Get current gold price with fallbacks |
| `getMarketData(assetId)` | Get cached market data |
| `getAllMarketData()` | Get all asset market data |
| `refreshMarketData()` | Force refresh cached data |
| `getNews(assetId, language)` | Get news items |
| `getLatestDeepAnalysis()` | Get fallback analysis data |

**Data Source Priority:**

```text
1. GoldPrice.org (free, no key needed) → Primary
2. TradingView Scanner API (free, no key) → Fallback 1
3. Metals-API (requires VITE_METALS_API_KEY) → Fallback 2
4. Hardcoded fallback (~$2650) → Ultimate fallback
```

---

## Patterns & Conventions

### ✅ DO: Follow These Patterns

**Always implement fallback data:**

```typescript
// BAD - No fallback
const data = await fetch(url);
return data.json();

// GOOD - With fallback
try {
  const data = await fetch(url);
  return data.json();
} catch (error) {
  console.warn('Fetch failed, using fallback:', error);
  return FALLBACK_DATA;
}
```

**Use async/await with proper error handling:**

```typescript
export const fetchData = async (): Promise<DataType | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Fetch failed:', error);
    return null;
  }
};
```

**Cache API responses:**

```typescript
let DATA_CACHE: DataType | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute

export const getData = async (): Promise<DataType> => {
  const now = Date.now();
  if (!DATA_CACHE || now - lastFetchTime > CACHE_DURATION) {
    DATA_CACHE = await fetchFreshData();
    lastFetchTime = now;
  }
  return DATA_CACHE;
};
```

### ❌ DON'T: Avoid These Anti-Patterns

- ❌ **Never hardcode API keys** - Use environment variables
- ❌ **Never expose API keys in client bundle** - Check build output
- ❌ **Never make API calls without fallbacks** - Always have backup data
- ❌ **Never ignore rate limits** - Implement caching and throttling

---

## Security Requirements

> [!CAUTION]
> **CRITICAL: Remove hardcoded API key in geminiService.ts line 14**

```typescript
// ❌ REMOVE THIS (line 14 in geminiService.ts):
const hardcodedKey = 'AIzaSyCPVp2c04JvnFOMjBEseli2l-xOory6uLU';

// ✅ REPLACE with null fallback:
const apiKey = viteKey || nodeKey || null;
```

**Environment Variables Required:**

```env
# In .env file (NEVER commit this file)
VITE_GEMINI_API_KEY=your_actual_key_here
VITE_METALS_API_KEY=your_actual_key_here  # Optional
```

See `API_SECURITY_REPORT.md` for complete security guidance.

---

## JIT Index - Quick Find

```bash
# Find exported functions
rg -n "export const \w+ = async" services/

# Find API endpoints
rg -n "fetch\(" services/

# Find fallback data
rg -n "fallback|Fallback|FALLBACK" services/

# Find API key usage
rg -n "API_KEY|apiKey" services/

# Find cache logic
rg -n "CACHE|lastFetch" services/

# Find error handling
rg -n "catch \(" services/
```

---

## Common Gotchas

1. **Vite env prefix**: Environment variables must start with `VITE_` to be exposed to client
2. **API key format**: Gemini keys start with `AIza...`, ~39 characters
3. **CORS**: Some APIs (GoldPrice.org) require specific `Origin` headers
4. **Rate limits**: Gemini free tier has quota limits; implement caching
5. **JSON parsing**: AI responses may contain markdown; use `cleanAndParseJSON()` helper

---

## Testing Services Locally

```bash
# Check if API key is loaded (in browser console)
console.log(import.meta.env.VITE_GEMINI_API_KEY?.slice(0, 8) + '...')

# Test gold price fetching (in browser console)
import('./services/marketDataService').then(m => m.fetchLiveGoldData().then(console.log))
```

---

## Pre-PR Checks

```bash
# Verify no hardcoded secrets
rg -n "AIza" services/
# Should return 0 results after cleanup

# Typecheck
npx tsc --noEmit

# Build (ensures env vars are properly injected)
npm run build
```
