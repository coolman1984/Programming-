# Review Command

Perform a comprehensive code review of recent changes:

## Review Checklist

### 1. Code Quality

- Follows TypeScript strict mode conventions
- Uses functional components (no class components except ErrorBoundary)
- Proper error handling with try/catch
- Loading states for async operations

### 2. Component Patterns

- Uses `cn()` for Tailwind class merging
- Framer Motion for animations
- Props interface defined and exported
- Accepts `className` for style overrides

### 3. Security

- No hardcoded API keys or tokens
- Environment variables used correctly (`VITE_` prefix)
- No sensitive data in localStorage
- No `dangerouslySetInnerHTML` without sanitization

### 4. API Integration

- Fallback data implemented for all API calls
- Error handling with meaningful messages
- Caching where appropriate
- No direct API calls in components

### 5. Styling

- Tailwind utility classes only (no inline styles)
- Uses CSS variables for theme colors
- Consistent color scheme (emerald/rose/amber)
- Dark mode support with `dark:` prefix

### 6. Performance

- Lazy loading for route pages
- Proper memoization where needed
- No unnecessary re-renders

## Output

Provide specific, actionable feedback with:

- File paths and line numbers
- Code examples for fixes
- Priority level (Critical/High/Medium/Low)
