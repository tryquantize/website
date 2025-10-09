# Web Search Fix Verification

## Issue
Web search toggle was always showing as `False` even when enabled in the search interfaces.

## Root Cause
In `/apps/web/src/pages/results.tsx`, the `webSearch` parameter was extracted from URL but not passed to the `performInitialSearch` function.

## Fixes Applied

### 1. Fixed URL Parameter Handling
**File**: `/apps/web/src/pages/results.tsx`

**Before**:
```javascript
setTimeout(() => {
  performInitialSearch(query, conversationId);
}, 100);
```

**After**:
```javascript
setTimeout(() => {
  performInitialSearch(query, conversationId, webSearch);
}, 100);
```

### 2. Updated Function Signature
**Before**:
```javascript
const performInitialSearch = async (query: string, conversationId?: string) => {
```

**After**:
```javascript
const performInitialSearch = async (query: string, conversationId?: string, webSearchEnabled: boolean = false) => {
```

### 3. Fixed API Call
**Before**:
```javascript
webSearchEnabled: webSearch  // webSearch was undefined
```

**After**:
```javascript
webSearchEnabled: webSearchEnabled  // Now properly passed
```

### 4. Added Debug Logging
- Added logging in backend API to track web search parameter
- Added logging in AI service to verify parameter reception
- Added logging in results page to track URL parameter extraction

## Expected Behavior After Fix

### When Web Search is OFF:
- Should use RAG search (local company database)
- `web_search_used: false`
- `rag_used: true`
- `model_used: "RAG_ONLY"`

### When Web Search is ON:
- Should use Exa web search + OpenRouter LLM
- `web_search_used: true`
- `rag_used: false`
- `model_used: "openai/gpt-4o-mini"` (or selected model)

## Testing Steps

1. Start services: `yarn launch`
2. Go to search interface
3. Toggle web search ON
4. Perform a search
5. Check browser network tab for API call
6. Verify `webSearchEnabled: true` in request body
7. Check AI service logs for "Web search is ON"
8. Verify response has web search results with citations

## Files Modified

1. `/apps/web/src/pages/results.tsx` - Fixed web search parameter passing
2. `/apps/api/src/routes/routes.ts` - Added debug logging
3. `/apps/ai-service/app.py` - Added debug logging
4. `/apps/ai-service/src/services/ai_agent.py` - Added debug logging

The fix ensures that the web search toggle state is properly propagated from the frontend UI through the backend API to the AI service, enabling users to get either RAG-based results (web search OFF) or live web search results (web search ON).