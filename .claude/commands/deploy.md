# Deploy Command

Deploy the Gold Insight application to Firebase Hosting.

## Pre-Deployment Checklist

### 1. Validate Build

```bash
# Run TypeScript validation
npx tsc --noEmit

# Build production bundle
npm run build
```

### 2. Security Check

```bash
# Ensure no hardcoded API keys
rg -n "AIza" services/ components/ pages/

# Verify .env is not in dist
ls -la dist/ | grep -i env
```

### 3. Preview Build Locally

```bash
npm run preview
```

Then manually verify the app works at <http://localhost:4173>

### 4. Deploy

> [!CAUTION]
> This will deploy to production. Confirm before proceeding.

```bash
firebase deploy --only hosting
```

### 5. Post-Deployment

1. Visit deployed URL
2. Verify gold price is loading
3. Test AI analysis feature
4. Check browser console for errors

## Rollback (if needed)

```bash
# List recent deployments
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:rollback
```

## Output

Report:

- Build status (pass/fail)
- Security check results
- Deployment URL
- Any warnings or issues
