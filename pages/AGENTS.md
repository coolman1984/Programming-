# Pages - AGENTS.md

> Detailed guidance for the `pages/` directory containing route-level page components.

## Package Identity

This directory contains all route-level page components for the Gold Insight application.
Pages are lazy-loaded via React.lazy() in `App.tsx` for optimal bundle splitting.

---

## Page Overview

| Page | Route | Purpose |
|------|-------|---------|
| `Dashboard.tsx` | `/` | Main dashboard with price chart, technical outlook, news feed |
| `Analysis.tsx` | `/analysis` | Deep AI analysis trigger page |
| `AnalysisReportPage.tsx` | `/report` | Full AI analysis report display |
| `ArticlePage.tsx` | `/article/:id` | Individual news article view |
| `AssetDetail.tsx` | `/asset/:id` | Asset detail view (unused currently) |

---

## Setup & Run

Pages are part of the main app; no separate build needed.

```bash
# Run dev server to see pages
npm run dev

# Check TypeScript errors
npx tsc --noEmit

# Routes are defined in App.tsx
rg -n "<Route" App.tsx
```

---

## Patterns & Conventions

### ✅ DO: Follow These Patterns

**Page Structure:**

```tsx
// pages/ExamplePage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SomeComponent from '../components/SomeComponent';
import { useLanguage } from '../context/LanguageContext';
import { useAnalysis } from '../context/AnalysisContext';
import { SomeType } from '../types';

const ExamplePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<SomeType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data on mount
    fetchData();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Page content */}
    </div>
  );
};

export default ExamplePage;  // Default export for lazy loading
```

**Copy these exemplary pages:**

- ✅ **Dashboard pattern:** `Dashboard.tsx` - Data fetching, multiple sections, context usage
- ✅ **Report pattern:** `AnalysisReportPage.tsx` - Displaying AI analysis results
- ✅ **Detail pattern:** `ArticlePage.tsx` - URL params, single item display

**Lazy Loading (in App.tsx):**

```tsx
// All pages MUST be lazy loaded
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analysis = lazy(() => import('./pages/Analysis'));
```

**Navigation:**

```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Programmatic navigation
navigate('/report');
navigate('/article/123');
navigate(-1);  // Go back
```

**URL Parameters:**

```tsx
import { useParams } from 'react-router-dom';

// For route: /article/:id
const { id } = useParams<{ id: string }>();
```

### ❌ DON'T: Avoid These Anti-Patterns

- ❌ **No named exports** - Pages must use `export default` for lazy loading
- ❌ **No direct API calls** - Use services layer (`services/`)
- ❌ **No inline styles** - Use Tailwind classes
- ❌ **No hardcoded text** - Use `t()` from LanguageContext for i18n

---

## Key Files (Touch Points)

| File | Purpose | Lines |
|------|---------|-------|
| `Dashboard.tsx` | Main dashboard, most complex page | 203 |
| `AnalysisReportPage.tsx` | Renders DeepAnalysisView component | ~50 |
| `ArticlePage.tsx` | News article detail with markdown | ~100 |
| `Analysis.tsx` | Analysis trigger/loading page | ~80 |
| `AssetDetail.tsx` | Asset detail (placeholder) | ~50 |

---

## Context Usage

All pages have access to these contexts:

```tsx
// Language/i18n
import { useLanguage } from '../context/LanguageContext';
const { t, language, dir } = useLanguage();

// AI Analysis state
import { useAnalysis } from '../context/AnalysisContext';
const { 
  isAnalyzing, 
  progress, 
  analysisResult, 
  triggerAnalysis,
  technicalOutlook,
  technicalOutlookLoading 
} = useAnalysis();

// Theme (if needed)
import { useTheme } from '../context/ThemeContext';
const { theme, setTheme } = useTheme();
```

---

## JIT Index - Quick Find

```bash
# Find all page components
rg -n "export default" pages/

# Find route usage
rg -n "useNavigate|useParams" pages/

# Find context usage in pages
rg -n "useAnalysis|useLanguage|useTheme" pages/

# Find data fetching patterns
rg -n "useEffect.*fetch|useState.*loading" pages/

# Find all imports from services
rg -n "from '../services/" pages/
```

---

## Common Gotchas

1. **Lazy loading required**: All pages must use `export default` for React.lazy() to work
2. **HashRouter**: App uses HashRouter, so URLs are `/#/analysis` not `/analysis`
3. **Analysis redirect**: Dashboard auto-redirects to `/report` when analysis completes
4. **Loading states**: Always show skeleton/spinner while fetching data
5. **Error boundaries**: Pages are wrapped in ErrorBoundary in App.tsx

---

## Pre-PR Checks

```bash
# Verify page exports are default
rg -n "export default" pages/

# Typecheck
npx tsc --noEmit

# Build (ensures lazy loading works)
npm run build