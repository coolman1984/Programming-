# Fix Security Command

Fix the security vulnerability in the geminiService.ts file.

## Issue

There is a hardcoded API key in `services/geminiService.ts` at line 14:

```typescript
const hardcodedKey = 'AIzaSyCPVp2c04JvnFOMjBEseli2l-xOory6uLU';
```

## Required Actions

### 1. Remove Hardcoded Key

Edit `services/geminiService.ts`:

**Before (lines 13-16):**

```typescript
// HARDCODED FALLBACK to ensure it works immediately for the user
const hardcodedKey = 'AIzaSyCPVp2c04JvnFOMjBEseli2l-xOory6uLU';

const apiKey = viteKey || nodeKey || hardcodedKey;
```

**After:**

```typescript
// Return null if no key configured - AI features will be disabled
const apiKey = viteKey || nodeKey || null;
```

### 2. Verify Fix

```bash
# Ensure no hardcoded keys remain
rg -n "AIza" services/
# Should return 0 results
```

### 3. Test Application

```bash
npm run dev
```

- Verify app loads without API key errors
- AI features should show "unavailable" message gracefully

### 4. Update .env

Ensure `.env` file has the regenerated key:

```env
VITE_GEMINI_API_KEY=your_new_regenerated_key_here
```

## Post-Fix

1. Regenerate the exposed API key at <https://aistudio.google.com/apikey>
2. Update `.env` with new key
3. Commit the fix
4. Consider cleaning git history if repo is public
