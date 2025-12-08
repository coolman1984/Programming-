# Components - AGENTS.md

> Detailed guidance for the `components/` directory containing 22 React UI components.

## Package Identity

This directory contains all reusable UI components for the Gold Insight application.
Built with React 18 + TypeScript + Framer Motion + TailwindCSS.

---

## Component Categories

| Category | Components |
|----------|------------|
| **Price Display** | `PriceCard.tsx`, `PriceChart.tsx`, `NumberTicker.tsx`, `TickerCard.tsx` |
| **AI/Analysis** | `DeepAnalysisView.tsx`, `AIForecastCard.tsx`, `AIChatWidget.tsx`, `TechnicalOutlook.tsx` |
| **Navigation** | `Layout.tsx`, `Navbar.tsx`, `Breadcrumbs.tsx`, `CommandPalette.tsx` |
| **Content** | `NewsFeed.tsx`, `MarketStats.tsx`, `MarketPulse.tsx`, `QuickConverter.tsx` |
| **Utilities** | `LoadingSpinner.tsx`, `ErrorBoundary.tsx`, `PageTransition.tsx`, `LastUpdatedTimer.tsx` |
| **Theme/Logo** | `ThemeToggle.tsx`, `Logo.tsx` |

---

## Setup & Run

Components are part of the main app; no separate build needed.

```bash
# Run dev server to see components
npm run dev

# Check TypeScript errors in components
npx tsc --noEmit
```

---

## Patterns & Conventions

### ✅ DO: Follow These Patterns

**File Structure:**

```tsx
// 1. Imports (React → third-party → local → types)
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SomeIcon } from 'lucide-react';
import { cn, formatCurrency } from '../src/lib/utils';
import { SomeType } from '../types';

// 2. Interface for props
interface ComponentProps {
  prop1: string;
  prop2?: number;  // Optional with ?
}

// 3. Component function
const Component: React.FC<ComponentProps> = ({ prop1, prop2 = 0 }) => {
  // State and hooks
  const [state, setState] = useState(false);
  
  return (
    <motion.div className={cn("base-class", state && "active-class")}>
      {prop1}
    </motion.div>
  );
};

// 4. Export (default for components)
export default Component;
```

**Copy these exemplary components:**

- ✅ **Simple component:** `Logo.tsx` - Clean, minimal props
- ✅ **With animation:** `PriceCard.tsx` - Framer Motion patterns
- ✅ **With data fetching:** `PriceChart.tsx` - Uses Recharts
- ✅ **With context:** `ThemeToggle.tsx` - Uses ThemeContext
- ✅ **Complex view:** `DeepAnalysisView.tsx` - Multiple sections, data rendering

**Tailwind Class Merging:**

```tsx
// Always use cn() for dynamic classes
import { cn } from '../src/lib/utils';

<div className={cn(
  "base-class px-4 py-2",    // Always applied
  isActive && "bg-blue-500", // Conditional
  className                   // Allow override
)} />
```

**Framer Motion Animations:**

```tsx
import { motion, AnimatePresence } from 'framer-motion';

// Fade in on mount
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>

// Use AnimatePresence for conditional renders
<AnimatePresence>
  {showModal && <Modal />}
</AnimatePresence>
```

### ❌ DON'T: Avoid These Anti-Patterns

- ❌ **No class components** - Use functional components only
- ❌ **No inline styles** - Use Tailwind classes
- ❌ **No hardcoded colors** - Use CSS variables or Tailwind colors
- ❌ **No string concatenation for classes** - Use `cn()` utility
- ❌ **No direct API calls in components** - Use services layer

---

## Key Files (Touch Points)

| File | Purpose | Lines |
|------|---------|-------|
| `Layout.tsx` | App shell, contains Navbar, handles routing layout | 170+ |
| `PriceCard.tsx` | Main gold price display with confetti celebration | 225 |
| `DeepAnalysisView.tsx` | Full AI analysis report rendering | 400+ |
| `PriceChart.tsx` | Recharts-based price history chart | 150+ |
| `LoadingSpinner.tsx` | Multiple loading states and skeletons | 200+ |

---

## JIT Index - Quick Find

```bash
# Find component by name
rg -n "const ComponentName" components/

# Find component that uses a specific icon
rg -n "from 'lucide-react'" components/ -A 1

# Find animation patterns
rg -n "motion\." components/

# Find components using specific context
rg -n "useAnalysis" components/
rg -n "useLanguage" components/
rg -n "useTheme" components/

# Find color-related classes
rg -n "emerald|rose|amber|gold" components/

# Find all exported components
rg -n "export default" components/
```

---

## Common Gotchas

1. **CN utility path**: Import from `../src/lib/utils`, not `../utils`
2. **Motion types**: For TypeScript, use `motion.div` not `<motion.div as any>`
3. **Icon sizing**: Lucide icons use `size` prop, not `width/height`
4. **Dark mode**: Classes need `dark:` prefix for dark mode variants
5. **Tailwind purge**: Dynamic class names must use full strings (e.g., `bg-emerald-500` not `bg-${color}-500`)

---

## Pre-PR Checks

```bash
# Run before creating PR for component changes
npx tsc --noEmit && npm run build
```
