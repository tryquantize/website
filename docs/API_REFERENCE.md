# API Reference

## Overview

The Quantize Website API provides endpoints for advanced AI-powered search, user authentication via Firebase, AI tool management, company enrichment, and administrative operations. The API features dual-mode search (RAG + Web), real-time streaming, and comprehensive AI service integration. All endpoints follow REST principles and return JSON responses.

## Base URLs

- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-domain.com/api`

## Authentication

The API uses Firebase Authentication with support for Google OAuth and email/password authentication. JWT tokens are managed by Firebase and verified server-side using Firebase Admin SDK.

### Firebase Authentication

Authentication is handled client-side through Firebase Auth. The API verifies Firebase ID tokens for protected endpoints.

**Client-side Authentication:**
```javascript
// Google OAuth
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);

// Email/Password
import { createUserWithEmailAndPassword } from 'firebase/auth';
const userCredential = await createUserWithEmailAndPassword(auth, email, password);
```

**Protected Endpoint Usage:**
```javascript
// Get Firebase ID token
const idToken = await user.getIdToken();

// Use in API requests
fetch('/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  }
});
```

**Server-side Token Verification:**
The API automatically verifies Firebase ID tokens using Firebase Admin SDK for protected endpoints.



## Tools Management

### List Tools

```http
GET /api/tools
```

**Query Parameters:**
- `search` (string) - Search term for tool names and descriptions
- `status` (string) - Filter by status: `approved`, `pending`, `rejected`
- `industries` (string) - Comma-separated list of industries
- `pricingModel` (string) - Filter by pricing model

**Example:**
```http
GET /api/tools?search=chatbot&industries=healthcare,finance&pricingModel=freemium
```

**Response (200):**
```json
{
  "tools": [
    {
      "id": "tool_123",
      "name": "AI Chatbot Pro",
      "description": "Advanced chatbot for customer service",
      "category": "Customer Service",
      "pricing": "Starting at $29/month",
      "website": "https://example.com",
      "features": ["24/7 Support", "Multi-language", "Analytics"],
      "industries": ["Healthcare", "Finance"],
      "pricingModel": "freemium",
      "status": "approved",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

### Get Tool by ID

```http
GET /api/tools/:id
```

**Response (200):**
```json
{
  "id": "tool_123",
  "name": "AI Chatbot Pro",
  "description": "Advanced chatbot for customer service",
  "category": "Customer Service",
  "pricing": "Starting at $29/month",
  "website": "https://example.com",
  "features": ["24/7 Support", "Multi-language", "Analytics"],
  "views": 150,
  "clicks": 25
}
```

**Error Responses:**
- `404` - Tool not found
- `500` - Failed to fetch tool

### Create Tool

```http
POST /api/tools
```

**Request Body:**
```json
{
  "name": "New AI Tool",
  "description": "Description of the tool",
  "category": "Productivity",
  "pricing": "Free",
  "website": "https://newtool.com",
  "features": ["Feature 1", "Feature 2"],
  "industries": ["Technology"],
  "pricingModel": "free"
}
```

**Response (200):**
```json
{
  "id": "tool_456",
  "name": "New AI Tool",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- `400` - Invalid tool data

### Update Tool

```http
PATCH /api/tools/:id
```

**Request Body:**
```json
{
  "name": "Updated Tool Name",
  "pricing": "Updated pricing"
}
```

**Response (200):**
```json
{
  "id": "tool_123",
  "name": "Updated Tool Name",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Delete Tool

```http
DELETE /api/tools/:id
```

**Response (200):**
```json
{
  "message": "Tool deleted successfully"
}
```

## Search

### Dual-Mode AI Search

```http
POST /api/search
```

**Request Body:**
```json
{
  "query": "AI chatbots for customer service",
  "userId": "user_123",
  "selectedModel": "GPT-4o Mini",
  "selectedTypes": ["company", "product"],
  "selectedLocations": ["San Francisco", "New York"],
  "webSearchEnabled": false,
  "context": {
    "industry": "healthcare",
    "budget": "under_100",
    "company_size": "startup"
  }
}
```

**Search Modes:**
- `webSearchEnabled: false` - **RAG-Only Mode**: Uses curated company database (fast, reliable)
- `webSearchEnabled: true` - **Web Search Mode**: Uses real-time Exa API search (comprehensive, current)

**Response (200) - RAG Mode:**
```json
{
  "query": "AI chatbots for customer service",
  "aiResponse": "Based on your query, here are the best AI chatbot solutions from our curated database...",
  "suggestions": [
    "Best free chatbot alternatives",
    "Enterprise chatbot solutions",
    "Chatbot integration guides"
  ],
  "companies": [
    {
      "name": "Vapi",
      "description": "Voice AI platform for building conversational agents",
      "features": ["Voice AI", "Real-time", "Custom voices", "API-first"],
      "pricing": "Starting at $0.05/minute",
      "website": "https://vapi.ai",
      "category": "Voice AI",
      "location": "San Francisco",
      "founded": "2023",
      "employees": "10-50",
      "keySpecs": [
        "Sub-500ms latency",
        "Custom voice cloning",
        "Multi-language support",
        "Real-time interruption",
        "API-first architecture"
      ],
      "enhancedAbout": "Vapi is a cutting-edge voice AI platform that enables developers to build sophisticated conversational agents with ultra-low latency...",
      "enhancedUseCases": [
        "Customer service automation with natural voice interactions",
        "Sales qualification and lead generation through voice",
        "Healthcare patient intake and appointment scheduling"
      ],
      "relevanceScore": 18.5
    }
  ],
  "citations": [],
  "ragMode": true,
  "webSearchEnabled": false,
  "count": 3,
  "aiPowered": true,
  "success": true,
  "processingTime": "0.8s"
}
```

**Response (200) - Web Search Mode:**
```json
{
  "query": "latest AI chatbot tools 2025",
  "aiResponse": "Based on current web search results, here are the latest AI chatbot tools available in 2025...",
  "suggestions": [
    "AI chatbot comparison 2025",
    "Enterprise chatbot platforms",
    "Open source chatbot frameworks"
  ],
  "companies": [
    {
      "name": "ChatGPT Enterprise",
      "description": "Latest enterprise chatbot solution from OpenAI",
      "features": ["GPT-4 integration", "Enterprise security", "Custom training"],
      "pricing": "Contact for pricing",
      "website": "https://openai.com/enterprise",
      "category": "Enterprise AI",
      "extractedFromWeb": true
    }
  ],
  "citations": [
    {
      "title": "Best AI Chatbots of 2025 - TechCrunch",
      "url": "https://techcrunch.com/2025/01/ai-chatbots",
      "snippet": "The latest AI chatbot platforms are revolutionizing customer service...",
      "citationNumber": 1
    }
  ],
  "ragMode": false,
  "webSearchEnabled": true,
  "count": 5,
  "aiPowered": true,
  "success": true,
  "processingTime": "2.3s"
}
```

**Fallback Response (AI Service Unavailable):**
```json
{
  "query": "AI chatbots for customer service",
  "aiResponse": "Here are some AI tools related to your query. The AI service is currently unavailable, showing database results.",
  "companies": [],
  "traditionalResults": [],
  "aiPowered": false,
  "fallback": true,
  "aiError": "Connection timeout"
}
```

### Real-time Search Streaming (Server-Sent Events)

```http
GET /api/research/stream?q=AI%20chatbots&types=company&webSearch=true
```

**Response Headers:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: *
```

**Event Stream:**
```
data: {"type": "connected", "timestamp": "2025-01-01T12:00:00Z"}

data: {"type": "reasoning", "title": "Query Analysis", "content": "Analyzing search query for AI chatbots..."}

data: {"type": "tool_call", "title": "RAG Search", "toolName": "rag_search", "status": "started"}

data: {"type": "tool_result", "title": "RAG Results", "success": true, "count": 3, "companies": ["Vapi", "Yellow.ai", "Quibble AI"]}

data: {"type": "tool_call", "title": "Web Search", "toolName": "exa_search", "status": "started"}

data: {"type": "tool_result", "title": "Web Search Complete", "success": true, "sources": 5}

data: {"type": "reasoning", "title": "AI Processing", "content": "Generating comprehensive response with citations..."}

data: {"type": "complete", "processingTime": "2.1s", "totalResults": 8}
```

## Admin Operations

### Get Pending Tools

```http
GET /api/admin/pending-tools
```

**Response (200):**
```json
{
  "tools": [
    {
      "id": "tool_789",
      "name": "Pending Tool",
      "status": "pending",
      "submittedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Approve Tool

```http
POST /api/admin/tools/:id/approve
```

**Response (200):**
```json
{
  "message": "Tool approved successfully"
}
```

### Reject Tool

```http
POST /api/admin/tools/:id/reject
```

**Response (200):**
```json
{
  "message": "Tool rejected successfully"
}
```

## AI Service Integration

### Compare Companies

```http
POST /api/ai-service/compare
```

**Request Body:**
```json
{
  "companies": [
    {
      "name": "Vapi",
      "features": ["Voice AI", "Real-time", "Custom voices"],
      "pricing": "$0.05/minute",
      "category": "Voice AI",
      "useCases": ["Customer service", "Sales calls"]
    },
    {
      "name": "Yellow.ai", 
      "features": ["Conversational AI", "Multi-channel", "Analytics"],
      "pricing": "Custom pricing",
      "category": "Conversational AI",
      "useCases": ["Customer support", "Employee assistance"]
    }
  ],
  "comparisonCriteria": ["pricing", "features", "use_cases", "scalability"]
}
```

**Response (200):**
```json
{
  "comparison": {
    "summary": "Vapi excels in voice-first applications with real-time capabilities, while Yellow.ai offers comprehensive multi-channel conversational AI...",
    "detailed_comparison": {
      "pricing": {
        "vapi": "Usage-based at $0.05/minute - cost-effective for moderate usage",
        "yellow_ai": "Custom enterprise pricing - better for high-volume deployments"
      },
      "features": {
        "vapi": "Specialized in voice AI with sub-500ms latency",
        "yellow_ai": "Comprehensive platform with multi-channel support"
      },
      "best_for": {
        "vapi": "Voice-first applications, phone automation, real-time interactions",
        "yellow_ai": "Enterprise-wide conversational AI, multi-channel customer service"
      }
    },
    "recommendation": "Choose Vapi for voice-specific use cases, Yellow.ai for comprehensive conversational AI needs"
  },
  "success": true,
  "processing_time": "1.2s"
}
```

### Add Company to RAG Database

```http
POST /api/add-company
```

**Request Body:**
```json
{
  "companyName": "Anthropic",
  "website": "https://anthropic.com",
  "linkedinPage": "https://linkedin.com/company/anthropic",
  "description": "AI safety company focused on building helpful, harmless, and honest AI systems",
  "category": "AI Research",
  "features": "Constitutional AI, Claude models, Safety research",
  "useCases": "Conversational AI, Content generation, Research assistance",
  "pricing": "API pricing starting at $0.008/1K tokens",
  "location": "San Francisco",
  "founded": "2021",
  "employees": "100-500"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Company added successfully to RAG database",
  "companyId": "anthropic",
  "filesCreated": [
    "company_info.txt",
    "features.txt",
    "pricing.txt",
    "use_cases.txt",
    "clients.txt",
    "links.json"
  ],
  "ragReloaded": true,
  "processingTime": "0.5s"
}
```

### Auto-fill Company with Firecrawl

```http
POST /api/auto-fill-company
```

**Request Body:**
```json
{
  "companyName": "Perplexity AI",
  "website": "https://perplexity.ai",
  "linkedinPage": "https://linkedin.com/company/perplexityai"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "companyName": "Perplexity AI",
    "description": "AI-powered search engine that provides accurate, real-time answers with citations",
    "category": "AI Search",
    "features": "Real-time search, Citation-backed answers, Multiple AI models, Research tools",
    "useCases": "Research assistance, Information discovery, Academic research, Professional analysis",
    "pricing": "Free tier available, Pro at $20/month, Enterprise custom pricing",
    "location": "San Francisco, CA",
    "founded": "2022",
    "employees": "50-100",
    "funding": "Series B - $73.6M",
    "socialLinks": {
      "twitter": "https://twitter.com/perplexity_ai",
      "linkedin": "https://linkedin.com/company/perplexityai"
    }
  },
  "sources_used": ["website", "linkedin"],
  "scraping_method": "firecrawl",
  "fields_filled": 10,
  "processing_time": "3.2s",
  "confidence_score": 0.92
}
```

### AI Text Enhancement

```http
POST /api/enhance-text
```

**Request Body:**
```json
{
  "text": "AI tool for chatbots",
  "type": "description",
  "context": {
    "industry": "technology",
    "tone": "professional",
    "target_audience": "developers",
    "word_limit": 150
  },
  "enhancement_type": "expand_and_improve"
}
```

**Response (200):**
```json
{
  "success": true,
  "original_text": "AI tool for chatbots",
  "enhanced_text": "Advanced AI-powered chatbot development platform that enables developers to build sophisticated conversational agents with natural language processing capabilities, multi-channel support, and intelligent response generation. Features include real-time conversation handling, sentiment analysis, and seamless integration with popular messaging platforms and business systems.",
  "improvements": [
    "Expanded basic concept into comprehensive description",
    "Added technical details relevant to developers",
    "Included key features and capabilities",
    "Enhanced professional tone and clarity",
    "Optimized for target audience"
  ],
  "word_count": {
    "original": 4,
    "enhanced": 47
  },
  "enhancement_type": "expand_and_improve",
  "processing_time": "0.8s"
}
```

## Analytics

### Get Search Analytics

```http
GET /api/analytics/search
```

**Query Parameters:**
- `period` (string) - Time period: `day`, `week`, `month`
- `user_id` (string) - Filter by specific user
- `search_mode` (string) - Filter by `rag` or `web` search mode

**Response (200):**
```json
{
  "period": "week",
  "total_searches": 1250,
  "unique_users": 89,
  "search_modes": {
    "rag_only": 750,
    "web_search": 500
  },
  "average_response_time": {
    "rag_mode": "0.8s",
    "web_mode": "2.1s"
  },
  "top_queries": [
    {"query": "AI chatbots", "count": 45},
    {"query": "voice AI tools", "count": 32},
    {"query": "customer service AI", "count": 28}
  ],
  "success_rate": 0.96,
  "daily_breakdown": [
    {"date": "2025-01-01", "searches": 180, "users": 15},
    {"date": "2025-01-02", "searches": 165, "users": 12}
  ]
}
```

### Get Tool Analytics

```http
GET /api/tools/:id/analytics
```

**Response (200):**
```json
{
  "toolId": "tool_123",
  "views": 150,
  "clicks": 25,
  "clickThroughRate": 0.167,
  "searchAppearances": 89,
  "averagePosition": 2.3,
  "dailyViews": [
    {"date": "2025-01-01", "views": 10, "clicks": 2},
    {"date": "2025-01-02", "views": 15, "clicks": 3}
  ],
  "topQueries": [
    {"query": "AI chatbots", "appearances": 12},
    {"query": "customer service tools", "appearances": 8}
  ]
}
```

### Record Tool Click

```http
POST /api/tools/:id/click
```

**Response (200):**
```json
{
  "message": "Click recorded"
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "success": false,
  "error": "Detailed error information (development only)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Rate Limiting

### Current Implementation
- **AI Service**: Built-in rate limiting for external API calls
- **Search Endpoints**: Intelligent throttling based on complexity
- **Authentication**: Firebase handles rate limiting for auth endpoints

### Planned Enhancements
- **General API**: 100 requests per minute per IP
- **Authenticated Users**: 1000 requests per hour
- **AI Endpoints**: Tiered limits based on user plan
- **Streaming**: Connection limits for SSE endpoints

### Current Limits
```json
{
  "search": "10 requests per minute per user",
  "auto_fill": "5 requests per minute per user",
  "enhance_text": "20 requests per minute per user",
  "streaming": "2 concurrent connections per user"
}
```

## Real-time Features

### Server-Sent Events (SSE)
Currently implemented for real-time search streaming:

```javascript
// Client-side SSE connection
const eventSource = new EventSource('/api/research/stream?q=AI%20tools');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Search update:', data);
};

eventSource.addEventListener('complete', (event) => {
  console.log('Search completed');
  eventSource.close();
});
```

### Webhooks (Planned)
Future webhook support for:
- **Company Updates**: RAG database changes
- **Search Analytics**: Usage pattern notifications
- **User Events**: Authentication and preference changes
- **System Health**: Service status updates

## SDK and Client Libraries

### JavaScript/TypeScript Client
```typescript
// Example client usage
import { QuantizeAPI } from '@quantize/api-client';

const client = new QuantizeAPI({
  baseURL: 'https://api.quantize.com',
  apiKey: 'your-api-key'
});

// Dual-mode search
const results = await client.search({
  query: 'AI chatbots',
  webSearchEnabled: false,
  selectedTypes: ['company']
});

// Real-time streaming
const stream = client.searchStream('AI tools');
stream.on('data', (update) => console.log(update));
```

### Python Client (Planned)
```python
# Example Python client
from quantize_api import QuantizeClient

client = QuantizeClient(api_key='your-api-key')

# Search with RAG mode
results = client.search(
    query='AI chatbots',
    web_search_enabled=False,
    selected_types=['company']
)

# Company auto-fill
company_data = client.auto_fill_company(
    name='OpenAI',
    website='https://openai.com'
)
```

### cURL Examples
Comprehensive cURL examples are provided throughout this documentation for all endpoints.