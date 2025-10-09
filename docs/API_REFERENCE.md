# API Reference

## Overview

The Quantize Website API provides endpoints for user authentication, AI tool management, search functionality, and administrative operations. The API follows REST principles and returns JSON responses.

## Base URLs

- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-domain.com/api`

## Authentication

Currently, the API uses simple email/password authentication. JWT tokens are planned for future releases.

### Register User

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Error Responses:**
- `400` - Invalid user data or user already exists
- `500` - Registration failed

### Login User

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `400` - Email and password required
- `401` - Invalid credentials
- `500` - Login failed

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

### AI-Powered Search

```http
POST /api/search
```

**Request Body:**
```json
{
  "query": "AI chatbots for customer service",
  "userId": "user_123",
  "context": {
    "industry": "healthcare",
    "budget": "under_100"
  },
  "selectedModel": "gpt-4",
  "selectedTypes": ["chatbot", "automation"],
  "selectedLocations": ["US", "EU"],
  "webSearchEnabled": true
}
```

**Response (200):**
```json
{
  "query": "AI chatbots for customer service",
  "aiResponse": "Based on your query, here are the best AI chatbot solutions...",
  "suggestions": [
    "Best free chatbot alternatives",
    "Enterprise chatbot solutions",
    "Chatbot integration guides"
  ],
  "companies": [
    {
      "name": "ChatBot Pro",
      "description": "Advanced AI chatbot platform",
      "features": ["NLP", "Multi-channel", "Analytics"],
      "pricing": "$29/month",
      "website": "https://chatbotpro.com",
      "category": "Customer Service"
    }
  ],
  "citations": [
    {
      "title": "Best Chatbot Platforms 2024",
      "url": "https://example.com/article",
      "snippet": "Comprehensive review of chatbot platforms..."
    }
  ],
  "traditionalResults": [],
  "count": 5,
  "aiPowered": true,
  "success": true
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

### Research Stream (Server-Sent Events)

```http
GET /api/research/stream?q=chatbots&types=automation
```

**Response Headers:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Event Stream:**
```
data: {"type": "connected"}

data: {"type": "reasoning", "title": "Reasoning", "content": "Analyzing query..."}

data: {"type": "tool_call", "title": "Calling tool: web_search", "toolName": "web_search"}

data: {"type": "tool_result", "title": "Tool Executed", "success": true}

data: {"type": "complete"}
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
      "name": "Company A",
      "features": ["Feature 1", "Feature 2"],
      "pricing": "$50/month"
    },
    {
      "name": "Company B", 
      "features": ["Feature 3", "Feature 4"],
      "pricing": "$75/month"
    }
  ]
}
```

**Response (200):**
```json
{
  "comparison": "Detailed comparison analysis between the companies...",
  "success": true
}
```

### Add Company

```http
POST /api/add-company
```

**Request Body:**
```json
{
  "companyName": "New AI Company",
  "website": "https://newcompany.com",
  "linkedinPage": "https://linkedin.com/company/newcompany",
  "description": "Company description",
  "category": "AI",
  "features": "Key features",
  "useCases": "Use cases",
  "pricing": "Pricing information"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Company added successfully",
  "companyId": "company_123"
}
```

### Auto-fill Company

```http
POST /api/auto-fill-company
```

**Request Body:**
```json
{
  "companyName": "OpenAI",
  "website": "https://openai.com",
  "linkedinPage": "https://linkedin.com/company/openai"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "companyName": "OpenAI",
    "description": "AI research and deployment company",
    "category": "Artificial Intelligence",
    "features": "GPT models, API access, ChatGPT",
    "employees": "500-1000",
    "founded": "2015"
  },
  "sources_used": ["website", "linkedin"],
  "fields_filled": 6
}
```

### Enhance Text

```http
POST /api/enhance-text
```

**Request Body:**
```json
{
  "text": "Basic description text",
  "type": "description",
  "context": {
    "industry": "technology",
    "tone": "professional"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "enhanced_text": "Enhanced and improved description text with better clarity and engagement",
  "improvements": ["Added clarity", "Improved tone", "Enhanced readability"]
}
```

## Analytics

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
  "dailyViews": [
    {"date": "2024-01-01", "views": 10},
    {"date": "2024-01-02", "views": 15}
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

Currently not implemented. Planned for future releases:
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user
- Special limits for AI service endpoints

## Webhooks (Planned)

Future webhook support for:
- Tool approval notifications
- Search analytics updates
- Company data changes

## SDK and Libraries (Planned)

Official SDKs planned for:
- JavaScript/TypeScript
- Python
- cURL examples for all endpoints