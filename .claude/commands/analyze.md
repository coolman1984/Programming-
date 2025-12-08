# Analyze Command

Perform a deep analysis on the Gold Insight application: $ARGUMENTS

## Analysis Process

### 1. Understand the Request

- Parse the analysis focus from arguments
- If no arguments, perform general health check

### 2. Scan Relevant Files

```bash
# Find related components
rg -n "$ARGUMENTS" components/ pages/ --type tsx

# Find related services
rg -n "$ARGUMENTS" services/ --type ts

# Find type definitions
rg -n "$ARGUMENTS" types.ts
```

### 3. Analysis Areas

**If analyzing components:**

- Check component structure follows patterns
- Verify proper prop types
- Review animation consistency
- Check error/loading state handling

**If analyzing services:**

- Check API error handling
- Verify fallback data exists
- Review caching implementation
- Check for security issues

**If analyzing performance:**

- Check for unnecessary re-renders
- Review lazy loading usage
- Check bundle size implications
- Review API call frequency

**If analyzing security:**

- Scan for hardcoded secrets
- Check environment variable usage
- Review data handling
- Check for XSS vulnerabilities

### 4. Output Format

Provide:

1. **Summary**: One paragraph overview
2. **Findings**: Numbered list with file references
3. **Recommendations**: Prioritized action items
4. **Code Examples**: Before/after for key fixes
