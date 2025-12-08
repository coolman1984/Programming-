# Gold Insight - CLAUDE.md

> **This is the authoritative source for Claude Code development guidance.**
> Subdirectories contain specialized CLAUDE.md files that extend these rules.

## Overview

| Property | Value |
|----------|-------|
| **Type** | Single React SPA |
| **Stack** | React 18 + Vite + TypeScript (strict) + TailwindCSS |
| **AI Integration** | Google Gemini (`@google/genai`) |
| **Animation** | Framer Motion |
| **Charts** | Recharts |
| **Deployment** | Firebase Hosting |
| **Testing** | ⚠️ No test suite configured |

---

## Universal Development Rules

### Code Quality (MUST)

- **MUST** write TypeScript in strict mode
- **MUST** use functional components only (no class components)
- **MUST** use `cn()` utility from `src/lib/utils.ts` for Tailwind class merging
- **MUST** implement error boundaries for component trees
- **MUST** provide fallback data for all API calls
- **MUST NOT** commit API keys, tokens, or credentials to git
- **MUST NOT** use `any` type without explicit justification
- **MUST NOT** bypass TypeScript with `@ts-ignore` or `@ts-expect-error`

### Best Practices (SHOULD)

- **SHOULD** use named exports for components, default exports for pages
- **SHOULD** group imports: React → third-party → local → types
- **SHOULD** keep components under 300 lines (extract logic to hooks)
- **SHOULD** use Framer Motion for all animations
- **SHOULD** implement loading states for async operations
- **SHOULD** use CSS variables from `index.css` for theming

### Anti-Patterns (MUST NOT)

- **MUST NOT** hardcode colors - use Tailwind theme/CSS variables
- **MUST NOT** make API calls directly in components - use service layer
- **MUST NOT** use inline styles - use Tailwind classes
- **MUST NOT** store sensitive data in localStorage
- **MUST NOT** use `dangerouslySetInnerHTML` without sanitization

---

## Core Commands

### Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
```

### Deployment

```bash
firebase deploy --only hosting    # Deploy to Firebase
```

### Quality Checks

```bash
npx tsc --noEmit     # TypeScript validation
npm run build        # Full build validation
```

### Pre-PR Validation (run all before submitting)

```bash
npx tsc --noEmit && npm run build
```

---

## Project Structure

```text
├── CLAUDE.md              # This file - universal rules
├── App.tsx                # Root component with providers
├── index.tsx              # Entry point
├── index.css              # Global styles + CSS variables
├── index.html             # HTML template
│
├── components/            → [components/CLAUDE.md](components/CLAUDE.md)
│   ├── Layout.tsx         # App shell with navigation
│   ├── PriceCard.tsx      # Main price display
│   ├── PriceChart.tsx     # Price history chart
│   ├── DeepAnalysisView.tsx  # AI analysis display
│   └── ... (22 total)
│
├── pages/                 # Route pages (lazy loaded)
│   ├── Dashboard.tsx      # Main dashboard
│   ├── Analysis.tsx       # Deep analysis page
│   ├── ArticlePage.tsx    # News article detail
│   └── ... (5 total)
│
├── services/              → [services/CLAUDE.md](services/CLAUDE.md)
│   ├── geminiService.ts   # Google Gemini AI integration
│   └── marketDataService.ts  # Gold price data fetching
│
├── context/               # React context providers
│   ├── AnalysisContext.tsx
│   ├── LanguageContext.tsx
│   └── ThemeContext.tsx
│
├── src/lib/utils.ts       # Utility functions (cn, formatCurrency)
├── types.ts               # All TypeScript interfaces
├── constants.ts           # App constants
└── translations.ts        # i18n strings
```

---

## Quick Find Commands

### Code Navigation

```bash
# Find a React component
rg -n "^const \w+.*React\.FC" components/

# Find component by name
rg -n "export default ComponentName" components/

# Find type/interface
rg -n "^export (type|interface) \w+" types.ts

# Find context usage
rg -n "use(Analysis|Language|Theme)" components/ pages/

# Find API service function
rg -n "^export const \w+ = async" services/

# Find Framer Motion usage
rg -n "motion\." components/

# Find all imports of a module
rg -n "from '\.\./services/" components/ pages/
```

### Dependency Analysis

```bash
# Check what imports a specific module
rg -n "from.*geminiService"

# Find unused exports
rg -l "export" --type ts | xargs -I{} sh -c 'for exp in $(rg -o "export (const|function|type|interface) \w+" {} | cut -d" " -f3); do rg -q "$exp" --type ts && echo "Used: $exp in {}" || echo "UNUSED: $exp in {}"; done'
```

---

## Security Guidelines

### Secrets Management

| Level | Where to Store | Example |
|-------|----------------|---------|
| **Development** | `.env` (gitignored) | `VITE_GEMINI_API_KEY=...` |
| **Template** | `.env.example` (committed) | `VITE_GEMINI_API_KEY=your_key_here` |
| **Production** | Firebase/CI environment | Set in hosting config |

### CRITICAL Security Rules

- ⛔ **NEVER** commit `.env` files
- ⛔ **NEVER** hardcode API keys in source code
- ⛔ **NEVER** log API keys or tokens
- ⛔ **NEVER** expose keys in client-side error messages

### Known Security Issue

> [!CAUTION]
> **REMOVE the hardcoded API key in `services/geminiService.ts` line 14**
> See `API_SECURITY_REPORT.md` for remediation steps.

---

## Git Workflow

- **Main branch**: `main` (protected)
- **Feature branches**: `feature/description` or `fix/description`  
- **Commit format**: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`)
- **Merge strategy**: Squash and merge
- **Delete branches**: After merge

---

## Tool Permissions

### Allowed (✅)

- Read any source file
- Write to `.tsx`, `.ts`, `.css`, `.md` files
- Run npm scripts (`npm run dev`, `npm run build`)
- Run TypeScript checker (`npx tsc`)
- Git operations (commit, push to feature branches)

### Require Confirmation (⚠️)

- Editing `.env` files
- Running destructive git commands (`reset --hard`, `push --force`)
- Installing new dependencies (`npm install <package>`)
- Firebase deployment (`firebase deploy`)

### Blocked (❌)

- Running `rm -rf` on project directories
- Modifying `.gitignore` to include `.env`
- Pushing directly to `main`

---

## Specialized Context

When working in specific directories, refer to their CLAUDE.md:

| Directory | Focus | Link |
|-----------|-------|------|
| `components/` | React component patterns | [components/CLAUDE.md](components/CLAUDE.md) |
| `services/` | API integration patterns | [services/CLAUDE.md](services/CLAUDE.md) |

---

## Definition of Done

Before any change is considered complete:

- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] No hardcoded secrets in code
- [ ] Component follows existing patterns
- [ ] Imports properly organized
- [ ] Loading/error states handled for async operations
