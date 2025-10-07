# Location Filter Feature Test

## Overview
This document outlines the location filter feature that has been implemented across all search interfaces.

## Feature Description
- **Globe Icon**: Added next to the brain icon (LLM Selector) in all search interfaces
- **Location Dropdown**: Opens upward with 10 major tech hub locations + "Go Global" option
- **Multi-Select**: Users can select multiple locations
- **Default**: "Go Global" is selected by default (shows global results)
- **Company Focus**: Location filtering applies only to company cards, not product or freelancer cards

## Tech Hub Locations
1. San Francisco, USA
2. New York, USA
3. London, UK
4. Berlin, Germany
5. Tel Aviv, Israel
6. Singapore
7. Bangalore, India
8. Tokyo, Japan
9. Toronto, Canada
10. Sydney, Australia

## Implementation Details

### Frontend Components Updated:
1. **LocationSelector Component** (`/apps/web/src/components/location-selector.tsx`)
   - Globe icon with tooltip
   - Dropdown with tech hub locations
   - Multi-select functionality
   - "Go Global" default option

2. **Search Interfaces Updated**:
   - `search-interface.tsx` (Homepage)
   - `logged-in-search-interface.tsx` (Logged-in homepage)
   - `conversation-sidebar.tsx` (Sidebar search)

3. **Pages Updated**:
   - `results.tsx` - Handles location parameters from URL
   - `search-transition.tsx` - Passes location parameters to API

### Backend Services Updated:
1. **API Routes** (`/apps/api/src/routes/routes.ts`)
   - Added `selectedLocations` parameter to search endpoint

2. **AI Service** (`/apps/ai-service/`)
   - `app.py` - Handles location parameters in Flask app
   - `ai_agent.py` - Processes location filters in search logic
   - `exa_search.py` - Enhanced search queries with location filtering
   - `company_enrichment.py` - Location-aware company enrichment

## How It Works

### Search Flow:
1. User selects location(s) from dropdown
2. Globe icon changes color to green when locations are selected
3. Search query includes location parameters in URL
4. Backend enhances search queries with location terms
5. Exa search focuses on companies in selected locations
6. Company enrichment considers location context
7. Results show companies primarily from selected locations

### Example Search Queries:
- **Global**: "AI companies startups technology business global"
- **Bangalore**: "AI companies startups technology business (\"Bangalore, India\")"
- **Multiple**: "AI companies startups technology business (\"San Francisco, USA\" OR \"London, UK\")"

## Testing Instructions

### Manual Testing:
1. Open any search interface (homepage, logged-in homepage, or sidebar)
2. Look for globe icon next to brain icon
3. Click globe icon to open location dropdown
4. Select one or more locations
5. Perform a search with company filter enabled
6. Verify results focus on companies from selected locations
7. Test "Go Global" option to see worldwide results

### URL Parameters:
- `?q=AI+companies&locations=San+Francisco,+USA,London,+UK`
- Location parameters are passed through the entire search flow

## Expected Behavior:
- **No locations selected**: Shows global results
- **Locations selected**: Focuses search on selected locations
- **Company cards only**: Location filtering applies only to companies
- **Products/Freelancers**: Not affected by location filter
- **Multi-select**: Can select multiple locations simultaneously
- **Visual feedback**: Globe icon changes color when locations are active

## Files Modified:
- `/apps/web/src/components/location-selector.tsx` (NEW)
- `/apps/web/src/components/search-interface.tsx`
- `/apps/web/src/components/logged-in-search-interface.tsx`
- `/apps/web/src/components/conversation-sidebar.tsx`
- `/apps/web/src/pages/results.tsx`
- `/apps/web/src/pages/search-transition.tsx`
- `/apps/api/src/routes/routes.ts`
- `/apps/ai-service/app.py`
- `/apps/ai-service/src/services/ai_agent.py`
- `/apps/ai-service/src/services/exa_search.py`
- `/apps/ai-service/src/services/company_enrichment.py`

The location filter feature is now fully implemented and ready for testing!