# Development Guide

## Getting Started

### Prerequisites

- **Docker Desktop** (required for development)
- **Node.js** 18+ and **Yarn**
- **Python** 3.8+ (for AI service development)
- **Git**
- **Firebase Account** (for authentication setup)

### Quick Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd quantize-website
   yarn install
   ```

2. **Set up AI service:**
   ```bash
   cd apps/ai-service
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cd ../..
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Launch the application:**
   ```bash
   yarn launch
   ```

## Development Workflow

### Project Structure

```
quantize-website/
├── apps/                    # Applications
│   ├── web/                # Frontend React app
│   ├── api/                # Backend Express API  
│   └── ai-service/         # Python AI service
├── packages/               # Shared packages
│   └── shared/            # Common TypeScript code
├── tools/                 # Development tools
├── tests/                 # Test files
├── docs/                  # Documentation
└── scripts/               # Build/deployment scripts
```

### Available Scripts

```bash
# Development (Docker - Recommended)
yarn launch       # Start all services with Docker
yarn dev          # Alternative: Start with Docker
yarn docker:dev   # Explicit Docker development mode

# Development (Manual)
yarn setup        # One-time setup for manual development
cd apps/ai-service && python app.py  # Start AI service manually

# Building
yarn build        # Build for production
yarn start        # Start production server
yarn docker:prod  # Production Docker build

# Maintenance
yarn clean        # Stop and clean Docker containers
yarn docker:down  # Stop Docker containers
yarn docker:logs  # View container logs
yarn check        # Type check TypeScript

# Docker Management
yarn docker:build # Build Docker containers
yarn docker:up    # Start containers without rebuild
```

### Environment Configuration

Create `.env.local` with required variables:

```bash
# AI Service Configuration
OPENROUTER_API_KEY=your_openrouter_key_here
EXA_API_KEY=your_exa_key_here
FIRECRAWL_API_KEY=your_firecrawl_key_here
AI_SERVICE_URL=http://localhost:5002

# Firebase Authentication (Optional but recommended)
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Development Settings
NODE_ENV=development
PORT=3001

# Optional: Analytics and Monitoring
VERCEL_ANALYTICS_ID=your_analytics_id
```

### Getting API Keys

1. **OpenRouter API Key** (Required):
   - Visit [openrouter.ai](https://openrouter.ai)
   - Sign up for an account
   - Generate API key in dashboard
   - Add to `.env.local` as `OPENROUTER_API_KEY`
   - Used for: AI model access (GPT-4o Mini, Gemini 2.0, etc.)

2. **Exa API Key** (Required for web search):
   - Visit [exa.ai](https://exa.ai)
   - Create account and get API key
   - Add to `.env.local` as `EXA_API_KEY`
   - Used for: Real-time web search functionality

3. **Firecrawl API Key** (Required for company auto-fill):
   - Visit [firecrawl.dev](https://firecrawl.dev)
   - Sign up and get API key
   - Add to `.env.local` as `FIRECRAWL_API_KEY`
   - Used for: Web scraping and company data extraction

4. **Firebase Setup** (Optional but recommended):
   - Follow the [Firebase Setup Guide](FIREBASE_SETUP.md)
   - Configure authentication and get config values
   - Add all `VITE_FIREBASE_*` variables to `.env.local`
   - Used for: User authentication and data storage

## Development Best Practices

### Code Style

#### TypeScript/JavaScript
```typescript
// Use descriptive names
const searchResults = await fetchSearchResults(query);

// Prefer const over let
const API_BASE_URL = 'http://localhost:3001/api';

// Use proper typing
interface SearchRequest {
  query: string;
  filters?: SearchFilters;
}

// Document complex functions
/**
 * Performs AI-powered search with fallback to traditional search
 * @param query - Search query string
 * @param options - Search configuration options
 * @returns Promise resolving to search results
 */
async function performSearch(query: string, options: SearchOptions): Promise<SearchResults> {
  // Implementation
}
```

#### Python
```python
# Follow PEP 8 style guide
def process_search_query(query: str, context: Dict[str, Any]) -> SearchResult:
    """
    Process search query using AI models and RAG database.
    
    Args:
        query: User search query
        context: Additional context for search
        
    Returns:
        SearchResult object with AI response and citations
        
    Raises:
        SearchError: If search processing fails
    """
    # Implementation
```

### Component Structure (React)

```typescript
// components/SearchInterface.tsx
/**
 * @file SearchInterface.tsx
 * @description Main search interface component with AI-powered suggestions
 */

import React, { useState, useCallback } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { SearchInput } from './SearchInput';
import { SearchResults } from './SearchResults';

interface SearchInterfaceProps {
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
}

/**
 * SearchInterface component provides the main search functionality
 * 
 * @param props - Component props
 * @returns JSX element
 */
export const SearchInterface: React.FC<SearchInterfaceProps> = ({
  onResultSelect,
  placeholder = "Search for AI tools..."
}) => {
  const [query, setQuery] = useState('');
  const { results, isLoading, error, search } = useSearch();

  const handleSearch = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    await search(searchQuery);
  }, [search]);

  return (
    <div className="search-interface">
      <SearchInput
        value={query}
        onChange={setQuery}
        onSearch={handleSearch}
        placeholder={placeholder}
        isLoading={isLoading}
      />
      
      {error && (
        <div className="error-message">
          {error.message}
        </div>
      )}
      
      <SearchResults
        results={results}
        onResultSelect={onResultSelect}
        isLoading={isLoading}
      />
    </div>
  );
};
```

### API Route Structure (Express)

```typescript
// routes/search.ts
/**
 * @file search.ts
 * @description Search-related API endpoints
 */

import { Router } from 'express';
import { z } from 'zod';
import { searchService } from '../services/searchService';

const router = Router();

// Request validation schema
const searchRequestSchema = z.object({
  query: z.string().min(1).max(500),
  filters: z.object({
    category: z.string().optional(),
    priceRange: z.string().optional(),
  }).optional(),
});

/**
 * @route POST /search
 * @description Perform AI-powered search
 * @access Public
 */
router.post('/search', async (req, res) => {
  try {
    // Validate request
    const { query, filters } = searchRequestSchema.parse(req.body);
    
    // Perform search
    const results = await searchService.search(query, filters);
    
    // Return results
    res.json({
      success: true,
      results,
      query,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Search failed',
    });
  }
});

export { router as searchRouter };
```

### Python Service Structure

```python
# services/search_service.py
"""
@file search_service.py
@description AI-powered search service with RAG integration
"""

from typing import Dict, List, Any, Optional
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class SearchResult:
    """Data class for search results"""
    title: str
    description: str
    url: str
    relevance_score: float
    source: str

class SearchService:
    """
    AI-powered search service that combines RAG database queries
    with web search and AI model responses.
    """
    
    def __init__(self, rag_service, ai_client, web_search_client):
        """
        Initialize search service with required dependencies.
        
        Args:
            rag_service: RAG database service
            ai_client: AI model client (OpenRouter)
            web_search_client: Web search client (Exa)
        """
        self.rag_service = rag_service
        self.ai_client = ai_client
        self.web_search_client = web_search_client
    
    async def search(
        self, 
        query: str, 
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Perform comprehensive AI-powered search.
        
        Args:
            query: User search query
            context: Additional search context
            
        Returns:
            Dictionary containing search results, AI response, and citations
            
        Raises:
            SearchError: If search processing fails
        """
        try:
            logger.info(f"Processing search query: {query}")
            
            # Get RAG results
            rag_results = await self.rag_service.search(query)
            
            # Perform web search if enabled
            web_results = []
            if context and context.get('web_search_enabled'):
                web_results = await self.web_search_client.search(query)
            
            # Generate AI response
            ai_response = await self._generate_ai_response(
                query, rag_results, web_results, context
            )
            
            return {
                'success': True,
                'ai_response': ai_response,
                'rag_results': rag_results,
                'web_results': web_results,
                'query': query,
            }
            
        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            raise SearchError(f"Search processing failed: {str(e)}")
```

## Testing Guidelines

### Frontend Testing

```typescript
// __tests__/SearchInterface.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchInterface } from '../SearchInterface';

describe('SearchInterface', () => {
  it('should render search input', () => {
    render(<SearchInterface />);
    expect(screen.getByPlaceholderText(/search for ai tools/i)).toBeInTheDocument();
  });

  it('should perform search on submit', async () => {
    const mockSearch = jest.fn();
    render(<SearchInterface onSearch={mockSearch} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'chatbots' } });
    fireEvent.submit(input);
    
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith('chatbots');
    });
  });
});
```

### Backend Testing

```typescript
// __tests__/search.test.ts
import request from 'supertest';
import { app } from '../app';

describe('POST /api/search', () => {
  it('should return search results', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({ query: 'AI chatbots' })
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('results');
    expect(response.body.query).toBe('AI chatbots');
  });

  it('should validate request data', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({ query: '' })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Invalid request data');
  });
});
```

### Python Testing

```python
# tests/test_search_service.py
import pytest
from unittest.mock import Mock, AsyncMock
from services.search_service import SearchService, SearchError

@pytest.fixture
def search_service():
    rag_service = Mock()
    ai_client = Mock()
    web_search_client = Mock()
    return SearchService(rag_service, ai_client, web_search_client)

@pytest.mark.asyncio
async def test_search_success(search_service):
    """Test successful search operation"""
    # Mock dependencies
    search_service.rag_service.search = AsyncMock(return_value=[])
    search_service._generate_ai_response = AsyncMock(return_value="AI response")
    
    # Perform search
    result = await search_service.search("test query")
    
    # Assertions
    assert result['success'] is True
    assert result['query'] == "test query"
    assert 'ai_response' in result

@pytest.mark.asyncio
async def test_search_failure(search_service):
    """Test search failure handling"""
    # Mock failure
    search_service.rag_service.search = AsyncMock(side_effect=Exception("DB error"))
    
    # Test exception handling
    with pytest.raises(SearchError):
        await search_service.search("test query")
```

## Debugging

### Frontend Debugging

1. **React Developer Tools**: Install browser extension
2. **Console Logging**: Use `console.log` for development
3. **Network Tab**: Monitor API requests
4. **Vite HMR**: Hot reload for instant feedback

```typescript
// Debug hook for development
const useDebug = (value: any, label: string) => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${label}:`, value);
    }
  }, [value, label]);
};
```

### Backend Debugging

1. **Request Logging**: Enabled by default in development
2. **Error Stack Traces**: Full traces in development mode
3. **Database Queries**: Log all storage operations

```typescript
// Debug middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`${req.method} ${req.path}`, req.body);
  }
  next();
});
```

### AI Service Debugging

1. **Python Logging**: Configured for INFO level
2. **Request/Response Logging**: All AI service calls logged
3. **Error Handling**: Graceful degradation with fallbacks

```python
# Debug logging setup
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def debug_request(func):
    """Decorator for debugging API requests"""
    def wrapper(*args, **kwargs):
        logger.info(f"Calling {func.__name__} with args: {args}, kwargs: {kwargs}")
        result = func(*args, **kwargs)
        logger.info(f"{func.__name__} returned: {type(result)}")
        return result
    return wrapper
```

## Performance Optimization

### Frontend Performance

1. **Code Splitting**: Lazy load components
2. **Memoization**: Use React.memo and useMemo
3. **Bundle Analysis**: Monitor bundle size

```typescript
// Lazy loading
const SearchResults = lazy(() => import('./SearchResults'));

// Memoization
const MemoizedSearchResult = React.memo(SearchResult);

// Performance monitoring
const usePerformance = (name: string) => {
  useEffect(() => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
    };
  }, [name]);
};
```

### Backend Performance

1. **Response Caching**: Cache frequent requests
2. **Database Optimization**: Efficient queries
3. **Compression**: Gzip responses

```typescript
// Simple in-memory cache
const cache = new Map();

const cacheMiddleware = (duration: number) => (req, res, next) => {
  const key = req.originalUrl;
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < duration) {
    return res.json(cached.data);
  }
  
  const originalJson = res.json;
  res.json = function(data) {
    cache.set(key, { data, timestamp: Date.now() });
    return originalJson.call(this, data);
  };
  
  next();
};
```

## Deployment

### Development Deployment

```bash
# Start all services
yarn launch

# Services will be available at:
# - Frontend: http://localhost:3001
# - API: http://localhost:3001/api
# - AI Service: http://localhost:5002
```

### Production Build

```bash
# Build frontend
yarn build

# Start production server
yarn start
```

### Environment Variables

Ensure all required environment variables are set:

```bash
# Check environment
node -e "console.log(process.env.OPENROUTER_API_KEY ? '✓ OpenRouter API key set' : '✗ Missing OpenRouter API key')"
node -e "console.log(process.env.EXA_API_KEY ? '✓ Exa API key set' : '✗ Missing Exa API key')"
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Kill processes on port 3001
   lsof -ti:3001 | xargs kill -9
   
   # Kill processes on port 5002
   lsof -ti:5002 | xargs kill -9
   ```

2. **Python Virtual Environment Issues**:
   ```bash
   # Recreate virtual environment
   cd apps/ai-service
   rm -rf venv
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Node Modules Issues**:
   ```bash
   # Clean install
   rm -rf node_modules yarn.lock
   yarn install
   ```

4. **AI Service Connection Issues**:
   - Check if AI service is running on port 5002
   - Verify API keys are set correctly
   - Check firewall settings

### Debug Commands

```bash
# Check service health
curl http://localhost:5002/health

# Test API endpoint
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}'

# Check Python dependencies
cd apps/ai-service && pip list

# Check Node.js version
node --version && yarn --version
```

## Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow code style guidelines**
4. **Add tests for new functionality**
5. **Update documentation**
6. **Submit pull request**

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Error handling is implemented
- [ ] Performance impact is considered
- [ ] Security implications are reviewed