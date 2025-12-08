# Services - CLAUDE.md

> API integration patterns for the Gold Insight application.
> **Parent Context**: This extends [../CLAUDE.md](../CLAUDE.md)

## Package Identity

**Technology**: TypeScript + Google Gemini SDK + REST APIs
**Files**: 2 service modules
**Pattern**: Async functions with fallbacks

---

## Service Modules

### geminiService.ts (1134 lines)

**Purpose**: Google Gemini AI for market analysis

| Export | Purpose |
|--------|---------|
| `isAIAvailable()` | Check if API key configured |
| `createChatSession()` | Start AI chat |
| `searchMarketQuery()` | Search-based analysis |
| `generateDeepAssetAnalysis()` | Full 6-domain deep analysis |
| `generateMarketArticle()` | Generate news article |

**API Key Resolution Order:**

```text
1. VITE_GEMINI_API_KEY (Vite env - recommended)
2. process.env.API_KEY (Node.js)
3. process.env.GEMINI_API_KEY (Node.js)
4. ⚠️ Hardcoded key (REMOVE - security risk)
```

### marketDataService.ts (412 lines)

**Purpose**: Gold price data with multi-source fallback

| Export | Purpose |
|--------|---------|
| `fetchLiveGoldData()` | Current price with fallbacks |
| `getMarketData(assetId)` | Cached market data |
| `getAllMarketData()` | All asset data |
| `refreshMarketData()` | Force cache refresh |
| `getNews(assetId, lang)` | News items |

**Data Source Priority:**

```text
1. GoldPrice.org (free, no key) → Primary
2. TradingView Scanner (free, no key) → Fallback 1
3. Metals-API (key required) → Fallback 2
4. Hardcoded (~$2650) → Ultimate fallback
```

---

## Rules (MUST/MUST NOT)

### API Integration (MUST)

- **MUST** implement fallback data for all API calls
- **MUST** handle errors with try/catch
- **MUST** log errors with `console.error` or `console.warn`
- **MUST** cache API responses to reduce calls
- **MUST** use environment variables for API keys

### Security (MUST NOT)

- **MUST NOT** hardcode API keys in source code
- **MUST NOT** log API keys or tokens
- **MUST NOT** expose keys in error messages
- **MUST NOT** store keys in localStorage

### Pattern (SHOULD)

- **SHOULD** use async/await over .then() chains
- **SHOULD** check response.ok before parsing JSON
- **SHOULD** implement request timeouts
- **SHOULD** provide meaningful error messages

---

## Service Pattern Template

```typescript
// Standard service function pattern
export const fetchSomething = async (): Promise<DataType | null> => {
  try {
    const response = await fetch(API_URL, {
      headers: { 'Accept': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.warn('Fetch failed, using fallback:', error);
    return FALLBACK_DATA;  // Always have fallback
  }
};
```

## Caching Pattern

```typescript
let CACHE: DataType | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute

export const getData = async (): Promise<DataType> => {
  const now = Date.now();
  
  if (!CACHE || now - lastFetchTime > CACHE_DURATION) {
    CACHE = await fetchFreshData();
    lastFetchTime = now;
  }
  
  return CACHE;
};
```

---

## CRITICAL: Security Fix Required

> [!CAUTION]
> **Line 14 in geminiService.ts contains a hardcoded API key.**

**Current (DANGEROUS):**

```typescript
const hardcodedKey = 'AIzaSyCPVp2c04JvnFOMjBEseli2l-xOory6uLU';
```

**Required Fix:**

```typescript
// Remove hardcodedKey variable entirely
const apiKey = viteKey || nodeKey || null;
```

See `API_SECURITY_REPORT.md` for complete remediation steps.

---

## Environment Variables

| Variable | Purpose | Required? |
|----------|---------|-----------|
| `VITE_GEMINI_API_KEY` | Google Gemini AI | Yes (for AI features) |
| `VITE_METALS_API_KEY` | Metals-API prices | No (has fallbacks) |

**Setup:**

```bash
# In .env file (never commit)
VITE_GEMINI_API_KEY=your_key_here
VITE_METALS_API_KEY=your_key_here
```

---

## Quick Search Commands

```bash
# Find exported functions
rg -n "^export const \w+ = async" services/

# Find API endpoints
rg -n "fetch\(" services/

# Find fallback data
rg -n "fallback|FALLBACK" services/

# Find API key usage
rg -n "API_KEY|apiKey" services/

# Find cache logic
rg -n "CACHE|lastFetch" services/

# Find error handling
rg -n "catch \(" services/

# Check for hardcoded keys (should return 0 after fix)
rg -n "AIza" services/
```

---

## Common Gotchas

| Issue | Cause | Solution |
|-------|-------|----------|
| API key not loading | Missing VITE_ prefix | Use `VITE_GEMINI_API_KEY` |
| CORS errors | Missing headers | Add required Origin header |
| Rate limits | Too many requests | Implement caching |
| AI returns markdown | Raw text needs parsing | Use `cleanAndParseJSON()` helper |
| Stale data | Cache not refreshing | Check `CACHE_DURATION` value |
