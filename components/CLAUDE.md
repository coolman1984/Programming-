# Components - CLAUDE.md

> React UI component patterns for the Gold Insight application.
> **Parent Context**: This extends [../CLAUDE.md](../CLAUDE.md)

## Package Identity

**Technology**: React 18 + TypeScript + Framer Motion + TailwindCSS
**Entry Points**: Individual components imported by pages
**Component Count**: 22 components

---

## Component Categories

| Category | Components | Pattern |
|----------|------------|---------|
| **Price Display** | `PriceCard`, `PriceChart`, `NumberTicker`, `TickerCard` | Real-time data, animations |
| **AI/Analysis** | `DeepAnalysisView`, `AIForecastCard`, `AIChatWidget`, `TechnicalOutlook` | Async loading, markdown rendering |
| **Navigation** | `Layout`, `Navbar`, `Breadcrumbs`, `CommandPalette` | Routing, state management |
| **Content** | `NewsFeed`, `MarketStats`, `MarketPulse`, `QuickConverter` | Data transformation |
| **Utilities** | `LoadingSpinner`, `ErrorBoundary`, `PageTransition`, `LastUpdatedTimer` | UX helpers |

---

## Component Pattern (MUST follow)

```tsx
// 1. Imports (React → third-party → local → types)
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconName } from 'lucide-react';
import { cn, formatCurrency } from '../src/lib/utils';
import { SomeType } from '../types';

// 2. Props interface (always export)
interface ComponentNameProps {
  requiredProp: string;
  optionalProp?: number;
  className?: string;  // Always allow className override
}

// 3. Component function
const ComponentName: React.FC<ComponentNameProps> = ({
  requiredProp,
  optionalProp = 0,
  className,
}) => {
  // Hooks first
  const [state, setState] = useState(false);
  
  // Effects next
  useEffect(() => {
    // Side effects
  }, []);
  
  // Handlers
  const handleClick = () => {
    setState(true);
  };

  return (
    <motion.div
      className={cn(
        "base-classes px-4 py-2",      // Base styles
        state && "state-specific",      // Conditional
        className                        // Override
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {requiredProp}
    </motion.div>
  );
};

// 4. Default export
export default ComponentName;
```

---

## Exemplary Files (copy these patterns)

| Pattern | File | Key Techniques |
|---------|------|----------------|
| Simple component | `Logo.tsx` | Minimal props, SVG |
| Animation | `PriceCard.tsx` | Framer Motion, confetti |
| Charts | `PriceChart.tsx` | Recharts integration |
| Context usage | `ThemeToggle.tsx` | useTheme hook |
| Complex view | `DeepAnalysisView.tsx` | Multiple sections, markdown |
| Error handling | `ErrorBoundary.tsx` | Class-based error boundary |
| Loading states | `LoadingSpinner.tsx` | Skeleton patterns |

---

## Rules (MUST/MUST NOT)

### Structure (MUST)

- **MUST** use functional components with hooks
- **MUST** define props interface before component
- **MUST** use `cn()` for dynamic Tailwind classes
- **MUST** accept `className` prop for style overrides
- **MUST** use Framer Motion for animations

### Styling (MUST)

- **MUST** use Tailwind utility classes only
- **MUST** use CSS variables for theme colors
- **MUST** use `emerald-*` for positive, `rose-*` for negative, `amber-*` for warnings
- **MUST NOT** hardcode colors (use `text-emerald-400` not `text-[#10b981]`)
- **MUST NOT** use inline styles

### Animation (SHOULD)

- **SHOULD** use `motion.div` for animated containers
- **SHOULD** include `initial`, `animate`, `exit` for visibility animations
- **SHOULD** wrap conditionally rendered elements in `<AnimatePresence>`

### Anti-Patterns (MUST NOT)

- **MUST NOT** use class components (except ErrorBoundary)
- **MUST NOT** make API calls directly - use services layer
- **MUST NOT** use `dangerouslySetInnerHTML` without sanitization
- **MUST NOT** use string concatenation for classes - use `cn()`

---

## Quick Search Commands

```bash
# Find component definition
rg -n "^const \w+.*React\.FC" components/

# Find component using specific icon
rg -n "from 'lucide-react'" components/ -A 2

# Find animation patterns
rg -n "motion\." components/

# Find context usage
rg -n "use(Analysis|Language|Theme)" components/

# Find all Tailwind color usage
rg -n "(bg|text|border)-(emerald|rose|amber)" components/

# Find error handling
rg -n "(catch|ErrorBoundary)" components/
```

---

## Common Gotchas

| Issue | Solution |
|-------|----------|
| `cn()` import path | Import from `../src/lib/utils`, not `../utils` |
| Motion types | Use `motion.div` directly, TypeScript infers types |
| Icon sizing | Use `size={24}` prop, not `width/height` |
| Dark mode | Add `dark:` prefix for dark variants |
| Dynamic classes | Use full class names (Tailwind purges partial) |
| Async in components | Use hooks or services, not direct async |

---

## Pre-Edit Checklist

Before modifying a component:

1. Read existing component structure
2. Check for context dependencies
3. Verify animation patterns match existing ones
4. Ensure cn() is imported for class merging
