# Context - AGENTS.md

> Detailed guidance for the `context/` directory containing React Context providers.

## Package Identity

This directory contains React Context providers for global state management.
All contexts follow the Provider + Hook pattern for type-safe consumption.

---

## Context Overview

| Context | Purpose | Hook |
|---------|---------|------|
| `AnalysisContext.tsx` | AI analysis state, progress, results | `useAnalysis()` |
| `LanguageContext.tsx` | i18n translations (English only) | `useLanguage()` |
| `ThemeContext.tsx` | Dark/light/system theme | `useTheme()` |

---

## Setup & Run

Contexts are part of the main app; no separate build needed.

```bash
# Run dev server
npm run dev

# Check TypeScript errors
npx tsc --noEmit
```

---

## Architecture

```text
App.tsx
├── ErrorBoundary
│   └── LanguageProvider          ← Outermost (i18n)
│       └── AnalysisProvider      ← AI state
│           └── HashRouter
│               └── Layout
│                   └── Pages...
```

> **Note:** ThemeProvider is NOT currently in App.tsx but can be added.

---

## Context Details

### AnalysisContext.tsx (122 lines)

**Purpose:** Manages AI analysis state, progress tracking, and results caching.

**Exports:**

| Export | Type | Purpose |
|--------|------|---------|
| `AnalysisProvider` | Component | Wraps app to provide context |
| `useAnalysis()` | Hook | Access analysis state |

**State Shape:**

```typescript
interface ExtendedAnalysisContextType {
  isAnalyzing: boolean;              // Is analysis in progress?
  progress: number;                  // 0-100 progress percentage
  analysisResult: DeepAnalysisData | null;  // Full analysis result
  triggerAnalysis: (asset, data, lang, query?) => Promise<void>;
  clearAnalysis: () => void;
  technicalOutlook: TechnicalOutlookData | null;  // Quick outlook
  technicalOutlookLoading: boolean;
  generateTechnicalOutlook: (price: number) => Promise<void>;
}
```

**Usage Example:**

```tsx
import { useAnalysis } from '../context/AnalysisContext';

const MyComponent = () => {
  const { 
    isAnalyzing, 
    progress, 
    analysisResult,
    triggerAnalysis 
  } = useAnalysis();

  const handleAnalyze = () => {
    triggerAnalysis(goldAsset, marketData, 'en');
  };

  if (isAnalyzing) {
    return <ProgressBar value={progress} />;
  }

  return <AnalysisResult data={analysisResult} />;
};
```

---

### LanguageContext.tsx (43 lines)

**Purpose:** Provides i18n translations. Currently hardcoded to English only.

**Exports:**

| Export | Type | Purpose |
|--------|------|---------|
| `LanguageProvider` | Component | Wraps app to provide context |
| `useLanguage()` | Hook | Access translations |

**State Shape:**

```typescript
interface LanguageContextType {
  language: 'en';           // Always 'en'
  setLanguage: (lang) => void;  // No-op (logs warning)
  t: (key: string) => string;   // Translation function
  dir: 'ltr';               // Always LTR
}
```

**Usage Example:**

```tsx
import { useLanguage } from '../context/LanguageContext';

const MyComponent = () => {
  const { t } = useLanguage();

  return (
    <h1>{t('dashboard.title')}</h1>
    <p>{t('dashboard.subtitle')}</p>
  );
};
```

**Translation Keys:** Defined in `translations.ts` at project root.

---

### ThemeContext.tsx (73 lines)

**Purpose:** Manages dark/light/system theme with localStorage persistence.

**Exports:**

| Export | Type | Purpose |
|--------|------|---------|
| `ThemeProvider` | Component | Wraps app to provide context |
| `useTheme()` | Hook | Access theme state |

**State Shape:**

```typescript
type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}
```

**Usage Example:**

```tsx
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
};
```

**Storage:** Theme is persisted to `localStorage` under key `vite-ui-theme`.

---

## Patterns & Conventions

### ✅ DO: Follow These Patterns

**Context Creation Pattern:**

```tsx
// 1. Define types
interface ContextType {
  value: string;
  setValue: (v: string) => void;
}

// 2. Create context with undefined default
const MyContext = createContext<ContextType | undefined>(undefined);

// 3. Create provider component
export const MyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [value, setValue] = useState('');
  
  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
};

// 4. Create typed hook with error boundary
export const useMyContext = () => {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
};
```

### ❌ DON'T: Avoid These Anti-Patterns

- ❌ **No default values in createContext** - Use `undefined` and throw in hook
- ❌ **No direct context consumption** - Always use the custom hook
- ❌ **No business logic in providers** - Keep providers thin, logic in services
- ❌ **No prop drilling** - If passing >2 levels, consider context

---

## JIT Index - Quick Find

```bash
# Find all context providers
rg -n "export const \w+Provider" context/

# Find all context hooks
rg -n "export const use\w+" context/

# Find context usage in components
rg -n "useAnalysis|useLanguage|useTheme" components/ pages/

# Find context state types
rg -n "interface.*Context" context/

# Find localStorage usage
rg -n "localStorage" context/
```

---

## Common Gotchas

1. **Hook must be inside Provider**: Always wrap consuming components in the provider
2. **AnalysisContext auto-redirects**: When analysis completes, Dashboard navigates to `/report`
3. **Language is hardcoded**: `setLanguage()` is a no-op, only English supported
4. **Theme uses system preference**: `'system'` theme follows OS dark mode setting
5. **ThemeProvider not in App.tsx**: Currently not wired up, add if needed

---

## Adding a New Context

1. Create `context/NewContext.tsx` following the pattern above
2. Export `NewProvider` and `useNew` hook
3. Add provider to `App.tsx` in the correct nesting order
4. Update this AGENTS.md with the new context details

---

## Pre-PR Checks

```bash
# Verify hook error handling
rg -n "throw new Error.*must be used within" context/

# Typecheck
npx tsc --noEmit

# Build
npm run build