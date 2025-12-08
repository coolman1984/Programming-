# AGENTS.md

> AI Agent guidance for navigating and contributing to this codebase.

## Project Snapshot

| Property | Value |
|----------|-------|
| **Type** | Single React SPA (not monorepo) |
| **Stack** | React 18 + Vite + TypeScript (strict) |
| **Styling** | TailwindCSS + CSS variables (`index.css`) |
| **Animation** | Framer Motion |
| **AI** | Google Gemini (`@google/genai`) |
| **Charts** | Recharts |
| **Routing** | React Router DOM (HashRouter) |
| **Deployment** | Firebase Hosting |

Sub-folder AGENTS.md files exist in `components/`, `services/`, `pages/`, and `context/` for detailed guidance.

---

## Quick Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Deploy to Firebase
firebase deploy --only hosting

# TypeScript check
npx tsc --noEmit
```

---

## Universal Conventions

### Code Style

- **TypeScript strict mode** enabled (`tsconfig.json`)
- **Functional components only** - no class components
- **Named exports** for components, default exports for pages
- Use `cn()` utility from `src/lib/utils.ts` for Tailwind class merging

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | `PascalCase.tsx` | `PriceCard.tsx` |
| Pages | `PascalCase.tsx` | `Dashboard.tsx` |
| Services | `camelCase.ts` | `geminiService.ts` |
| Context | `PascalCase.tsx` | `ThemeContext.tsx` |
| Types | `camelCase.ts` | `types.ts` |

### Imports

- Use relative imports (`../components/X`)
- Group order: React → third-party → local components → utils → types

---

## Security & Secrets

> [!CAUTION]
> **NEVER** commit API keys to source control.

| File | Purpose | Committed? |
|------|---------|------------|
| `.env` | Actual secrets | ❌ NO (gitignored) |
| `.env.example` | Template with placeholders | ✅ YES |

**Required environment variables:**

```env
VITE_GEMINI_API_KEY=your_key_here
VITE_METALS_API_KEY=your_key_here
```

See `API_SECURITY_REPORT.md` for detailed security guidance.

---

## JIT Index (what to open, not what to paste)

### Directory Structure

```text
├── components/          → [see components/AGENTS.md](components/AGENTS.md)
│   ├── PriceCard.tsx    # Main price display with animations
│   ├── DeepAnalysisView.tsx  # AI analysis report view
│   ├── Layout.tsx       # App shell with navigation
│   └── ... (22 components total)
├── pages/               → [see pages/AGENTS.md](pages/AGENTS.md)
│   ├── Dashboard.tsx    # Main dashboard (default route)
│   ├── Analysis.tsx     # Deep analysis page
│   ├── AnalysisReportPage.tsx  # Analysis results display
│   ├── ArticlePage.tsx  # News article detail
│   └── AssetDetail.tsx  # Asset detail view
├── services/            → [see services/AGENTS.md](services/AGENTS.md)
│   ├── geminiService.ts # AI/Gemini integration (1134 lines)
│   └── marketDataService.ts  # Gold price data fetching
├── context/             → [see context/AGENTS.md](context/AGENTS.md)
│   ├── AnalysisContext.tsx   # AI analysis state management
│   ├── LanguageContext.tsx   # i18n (English only)
│   └── ThemeContext.tsx      # Dark/light theme
├── src/lib/utils.ts     # Utility functions (cn, formatCurrency)
├── types.ts             # All TypeScript interfaces (204 lines)
├── constants.ts         # App constants and assets
├── translations.ts      # i18n strings
├── App.tsx              # Root component with providers
├── index.tsx            # Entry point
└── index.css            # Global styles + CSS variables (872 lines)
```

### Quick Find Commands

```bash
# Find a React component
rg -n "export default" components/

# Find a type/interface definition
rg -n "export (type|interface) \w+" types.ts

# Find API service function
rg -n "export const \w+ = async" services/

# Find context hook usage
rg -n "use(Language|Analysis|Theme)" components/ pages/

# Find Tailwind class patterns
rg -n "className=" components/ --include "*.tsx"

# Find Framer Motion animations
rg -n "motion\." components/

# Find route definitions
rg -n "<Route" App.tsx

# Find CSS variables
rg -n "^--" index.css
```

---

## Key Patterns

### Component Pattern

```tsx
// components/ExampleComponent.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { SomeIcon } from 'lucide-react';
import { cn } from '../src/lib/utils';
import { SomeType } from '../types';

interface ExampleProps {
  title: string;
  isActive?: boolean;
}

const ExampleComponent: React.FC<ExampleProps> = ({ title, isActive }) => {
  return (
    <motion.div 
      className={cn("base-classes", isActive && "active-classes")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {title}
    </motion.div>
  );
};

export default ExampleComponent;
```

### Service Pattern (with fallback)

```typescript
// Always implement fallback data for offline/error scenarios
const fetchData = async (): Promise<Data> => {
  try {
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    console.warn('Fetch failed, using fallback');
    return FALLBACK_DATA;
  }
};
```

### Context Pattern

```tsx
// context/ExampleContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ContextType {
  value: string;
  setValue: (v: string) => void;
}

const ExampleContext = createContext<ContextType | undefined>(undefined);

export const ExampleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [value, setValue] = useState('');
  return (
    <ExampleContext.Provider value={{ value, setValue }}>
      {children}
    </ExampleContext.Provider>
  );
};

export const useExample = () => {
  const context = useContext(ExampleContext);
  if (!context) throw new Error('useExample must be used within ExampleProvider');
  return context;
};
```

---

## Testing

> [!WARNING]
> No test suite is currently configured.

If adding tests, use **Vitest** (Vite's native test runner):

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

---

## Definition of Done

Before submitting changes:

- [ ] `npm run build` completes without errors
- [ ] `npx tsc --noEmit` passes with no TypeScript errors
- [ ] No hardcoded API keys in source code
- [ ] Component follows existing patterns (see sub-folder AGENTS.md)
- [ ] Imports are properly organized (React → third-party → local → types)
- [ ] New components use `cn()` for dynamic Tailwind classes
