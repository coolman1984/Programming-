# Architecture

## App Definition

This is a multi-page web app that presents AI-generated financial articles and analytical cards to executives. It does not perform accounting calculations. It consumes structured AI outputs and displays them consistently.

## Hard Rules (Invariants)

These are non-negotiable engineering rules. Breaking any of them is a bug.

- Pages never call external APIs directly (no `fetch()` in pages).
- UI components never call external APIs directly (no `fetch()` in `components/`).
- Only the service layer may talk to the network.
- Only `services/geminiService.ts` may talk to the AI SDK.
- Only `services/marketDataService.ts` may talk to market/news data sources.
- Pages may call services, but UI components must receive data via props or context.
- Cards are dumb: no business logic, no network, no side effects.
- State that must survive navigation lives in context, not in navigation state.
- Any route that can be bookmarked must be loadable from URL alone (no required `location.state`).
- AI outputs consumed by the app are JSON only; any markdown is inside JSON string fields.
- AI outputs are treated as untrusted input (sanitize/escape before rendering).
- No secrets are committed: API keys must come from env configuration.
- Errors must be surfaced to the UI (never fail silently).
- Every async operation has: loading state, error state, and a fallback strategy.
- Types are the contract: service functions return typed data defined in `types.ts`.
- Cross-cutting UI (layout, nav, language, analysis state) is owned by providers, not pages.
- No duplicated domain logic across pages; shared logic lives in services or context.
- Components must be testable in isolation (data in via props; no hidden globals).

## Page Map

Routing uses a hash-based router (see `App.tsx`), so these appear in the browser as `/#/...`.

- `/#/` – Dashboard (Live Price, Technical Outlook, News Feed, Analysis Trigger)
- `/#/analysis` – Search & Q&A (Static suggestions, Gemini search)
- `/#/article/:id` – Read-only article view (Full markdown content, Premium badge)
- `/#/report` – Deep Analysis Report (Context-dependent analysis view)

## State & Data Flow

### `/` (Dashboard)

- Price Chart: `marketDataService.getAllMarketData()` → External APIs (GoldPrice.org → TradingView → Metals-API) → module-level in-memory cache (60s) → Dashboard state → rendered
- Technical Outlook: `AnalysisContext.generateTechnicalOutlook()` → `geminiService.generateTechnicalOutlook()` → Gemini API (or fallback data) → AnalysisContext state → rendered
- News Feed: `marketDataService.getNews()` → hardcoded mock data → Dashboard state → rendered

### `/analysis`

- Search Results: User query → `geminiService.searchMarketQuery()` → Gemini API with grounding → rendered
- Suggestions: Hardcoded array in component → rendered
- Note: The query input is currently read-only; queries are selected via the suggestion buttons (see `pages/Analysis.tsx`).

### `/article/:id`

- Article Content: NewsItem seed (from Dashboard click) → `geminiService.generateMarketArticle()` → Gemini API → rendered
- No storage. Generated on-demand per navigation.
- Note: The `:id` route param is not currently used to load content; the page relies on navigation state (`location.state.seed`).

### `/report`

- Deep Analysis: `AnalysisContext.triggerAnalysis()` → `geminiService.generateDeepAssetAnalysis()` → Gemini API multi-query → React context state → rendered
- Fallback: `marketDataService.getLatestDeepAnalysis()` → hardcoded mock data
