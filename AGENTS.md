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
| **Deployment** | Firebase Hosting |

Sub-folder AGENTS.md files exist in `components/` and `services/` for detailed guidance.

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
```

---

## Universal Conventions

### Code Style

- **TypeScript strict mode** enabled (`tsconfig.json`)
- **Functional components only** - no class components
- **Named exports** for components, default exports for pages
- Use `cn()` utility from `src/lib/utils.ts` for Tailwind class merging

### File Naming

- Components: `PascalCase.tsx` (e.g., `PriceCard.tsx`)
- Pages: `PascalCase.tsx` (e.g., `Dashboard.tsx`)
- Services: `camelCase.ts` (e.g., `geminiService.ts`)
- Context: `PascalCase.tsx` (e.g., `ThemeContext.tsx`)

### Imports

- Use relative imports (`../components/X`)
- Group: React → third-party → local components → utils → types

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
│   └── Layout.tsx       # App shell with navigation
├── pages/               # Route pages (lazy loaded)
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Analysis.tsx     # Deep analysis page
│   └── ArticlePage.tsx  # News article detail
├── services/            → [see services/AGENTS.md](services/AGENTS.md)
│   ├── geminiService.ts # AI/Gemini integration
│   └── marketDataService.ts  # Gold price data fetching
├── context/             # React context providers
│   ├── AnalysisContext.tsx
│   ├── LanguageContext.tsx
│   └── ThemeContext.tsx
├── src/lib/utils.ts     # Utility functions (cn, formatCurrency)
├── types.ts             # All TypeScript interfaces
├── constants.ts         # App constants and assets
└── index.css            # Global styles + CSS variables
```

### Quick Find Commands

```bash
# Find a React component
rg -n "export (default function|const) \w+" components/

# Find a type/interface definition
rg -n "export (type|interface) \w+" types.ts

# Find API service function
rg -n "export const \w+ = async" services/

# Find context usage
rg -n "use(Language|Analysis|Theme)" components/ pages/

# Find Tailwind class patterns
rg -n "className=" components/ --include "*.tsx"

# Find Framer Motion animations
rg -n "motion\." components/
```

---

## Key Patterns

### Component Pattern

```tsx
// components/ExampleComponent.tsx
import { motion } from 'framer-motion';
import { cn } from '../src/lib/utils';

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

---

## Testing

> [!WARNING]
> No test suite is currently configured.

If adding tests, use **Vitest** (Vite's native test runner):

```bash
npm install -D vitest @testing-library/react
```

---

## Definition of Done

Before submitting changes:

- [ ] `npm run build` completes without errors
- [ ] No TypeScript errors in changed files
- [ ] No hardcoded API keys in source code
- [ ] Component follows existing patterns (see examples)
- [ ] Imports are properly organized
