# Quantize Website Architecture

## Overview

The Quantize Website is a modern, AI-powered search platform built with a microservices architecture featuring advanced RAG (Retrieval-Augmented Generation) capabilities. It consists of three main applications working together to provide intelligent search capabilities for AI tools and companies, with dual-mode search (curated RAG data + real-time web search), Firebase authentication, and comprehensive company enrichment features.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   AI Service    │
│   (React)       │◄──►│   (Express)     │◄──►│   (Flask)       │
│   Port: 3001    │    │   Port: 3001    │    │   Port: 5002    │
│                 │    │                 │    │                 │
│ • Firebase Auth │    │ • API Proxy     │    │ • RAG System    │
│ • Radix UI      │    │ • Memory Store  │    │ • Web Search    │
│ • Framer Motion │    │ • Analytics     │    │ • AI Models     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Firebase Auth   │    │ In-Memory Store │    │ RAG Database    │
│ Google OAuth    │    │ User Sessions   │    │ 18+ Companies   │
│ User Management │    │ Search Analytics│    │ Structured Data │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                           ┌─────────────────┐
                                           │ External APIs   │
                                           │ • OpenRouter    │
                                           │ • Exa Search    │
                                           │ • Firecrawl     │
                                           └─────────────────┘
```

## Application Components

### 1. Frontend Application (`apps/web/`)

**Technology Stack:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Radix UI for components
- Zustand for state management
- Wouter for routing

**Key Features:**
- Server-side rendering in production
- Hot module replacement in development
- Responsive design with mobile-first approach
- Real-time search interface with streaming
- Company comparison tools
- Firebase authentication with Google OAuth
- User favorites and personalization
- Advanced animations with Framer Motion + GSAP
- Modern UI components with Radix UI + Shadcn/ui

**Directory Structure:**
```
apps/web/src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Radix UI + Shadcn/ui)
│   └── layout/         # Layout components (header, footer)
├── pages/              # Page components and routes
│   ├── auth/          # Authentication pages
│   ├── Home/          # Home page sections
│   └── Products/      # Product pages
├── hooks/              # Custom React hooks
├── contexts/           # React context providers
│   ├── firebase-auth-context.tsx
│   ├── favorites-context.tsx
│   └── conversation-context.tsx
├── services/           # API service functions
│   ├── firebase-storage.ts
│   └── firebase-user-service.ts
├── lib/                # Core libraries
│   ├── firebase-auth.ts
│   └── utils.ts
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── styles/             # Global styles and animations
```

### 2. Backend API (`apps/api/`)

**Technology Stack:**
- Express.js with TypeScript
- Zod for schema validation
- bcryptjs for password hashing
- In-memory storage for development

**Key Features:**
- RESTful API endpoints with Zod validation
- Firebase Admin SDK integration
- Tool management (CRUD operations)
- AI service proxy and integration
- Search functionality with dual-mode support
- Real-time streaming with Server-Sent Events
- Admin panel for tool approval
- Analytics and usage tracking
- Comprehensive error handling

**API Endpoints:**
```
Authentication:
POST /api/auth/register    # User registration
POST /api/auth/login       # User login

Tools:
GET    /api/tools          # List tools with filters
GET    /api/tools/:id      # Get specific tool
POST   /api/tools          # Create new tool
PATCH  /api/tools/:id      # Update tool
DELETE /api/tools/:id      # Delete tool

Search:
POST /api/search           # AI-powered search
GET  /api/research/stream  # Real-time search logs

Admin:
GET  /api/admin/pending-tools     # Get pending tools
POST /api/admin/tools/:id/approve # Approve tool
POST /api/admin/tools/:id/reject  # Reject tool

AI Service Proxy:
POST /api/ai-service/compare      # Compare companies
POST /api/add-company             # Add new company
POST /api/enhance-text            # Enhance text with AI
POST /api/auto-fill-company       # Auto-fill company data
```

### 3. AI Service (`apps/ai-service/`)

**Technology Stack:**
- Flask with Python 3.8+
- OpenRouter for AI model access (GPT-4o Mini, Gemini 2.0, etc.)
- Exa API for real-time web search
- Firecrawl API for web scraping
- Custom RAG (Retrieval-Augmented Generation) system
- Firebase integration for data storage
- Comprehensive logging and error handling

**Key Features:**
- **Dual-mode search**: RAG-only mode (curated data) + Web search mode (real-time)
- **Advanced RAG system**: 18+ pre-loaded companies with structured data
- **Intelligent text matching**: Relevance scoring and keyword matching
- **Company enrichment**: Automatic data enhancement with Firecrawl
- **Web scraping**: Modern Firecrawl integration replacing Scrapy
- **Text enhancement**: AI-powered content improvement
- **Real-time streaming**: Server-sent events for live search updates
- **Multiple AI models**: Support for various LLM providers
- **Fallback mechanisms**: Graceful degradation when APIs fail

**Service Endpoints:**
```
Core Services:
GET  /health              # Health check with detailed status
POST /search              # Dual-mode AI search (RAG + Web)
POST /suggestions         # Generate search suggestions
POST /extract-companies   # Extract company info from text
POST /compare             # Compare multiple companies

Company Management:
POST /add-company         # Add company to RAG database
POST /auto-fill-company   # Auto-fill with Firecrawl scraping
POST /enhance-text        # AI-powered text enhancement

RAG System:
GET  /rag/companies       # List all RAG companies
POST /rag/reload          # Reload RAG data
GET  /rag/stats           # RAG system statistics
```

## Data Flow

### Search Request Flow

#### RAG-Only Mode (`webSearchEnabled: false`)
1. **User Input**: User enters search query in frontend
2. **API Request**: Frontend sends POST to `/api/search` with `webSearchEnabled: false`
3. **AI Service**: Backend forwards request to AI service
4. **RAG Processing**: AI service searches local company database
5. **Text Matching**: Advanced relevance scoring and keyword matching
6. **LLM Enhancement**: OpenRouter formats and enhances RAG data
7. **Response Assembly**: Structured company cards with enhanced descriptions
8. **Frontend Display**: Fast, reliable results with curated data

#### Web Search Mode (`webSearchEnabled: true`)
1. **User Input**: User enters search query in frontend
2. **API Request**: Frontend sends POST to `/api/search` with `webSearchEnabled: true`
3. **AI Service**: Backend forwards request to AI service
4. **Exa Search**: Real-time web search via Exa API
5. **Content Extraction**: Web content parsing and structuring
6. **AI Generation**: OpenRouter generates contextual response with citations
7. **RAG Fallback**: Falls back to RAG data if web search fails
8. **Response Assembly**: Combined results with proper source attribution
9. **Frontend Display**: Real-time results with citations and suggestions

#### Real-time Streaming
1. **SSE Connection**: Frontend establishes Server-Sent Events connection
2. **Live Updates**: Real-time search progress and reasoning
3. **Tool Execution**: Live updates on web search and AI processing
4. **Progressive Results**: Results stream as they become available

### Company Addition Flow

1. **Form Submission**: User submits company form with basic info
2. **Firecrawl Scraping**: AI service scrapes website using Firecrawl API
3. **LinkedIn Scraping**: Additional data from LinkedIn company page
4. **AI Enhancement**: OpenRouter enhances descriptions and features
5. **Data Structuring**: Formats data into RAG-compatible structure
6. **RAG Storage**: Company data stored in structured file system
7. **Firebase Sync**: Optional sync with Firebase for persistence
8. **Confirmation**: Success response with enriched data returned
9. **Auto-reload**: RAG system automatically includes new company

## Security Considerations

### Authentication
- Firebase Authentication with Google OAuth
- Email/password authentication support
- Firebase Admin SDK for server-side verification
- JWT tokens managed by Firebase
- Input validation with Zod schemas
- Secure session management

### API Security
- CORS configuration for local development
- Request rate limiting (planned)
- Input sanitization and validation
- Error handling without information leakage

### AI Service Security
- API key management through environment variables
- Request timeout handling with configurable limits
- Graceful degradation when external APIs fail
- No sensitive data in logs
- Rate limiting for external API calls
- Input sanitization for all user inputs
- Secure file handling for RAG data
- CORS configuration for cross-origin requests

## Performance Optimizations

### Frontend
- Code splitting with Vite
- Lazy loading of components
- Image optimization
- CSS purging in production
- Bundle size optimization

### Backend
- In-memory caching for frequently accessed data
- Connection pooling (when database is added)
- Gzip compression
- Static asset serving optimization

### AI Service
- **RAG System Optimization**:
  - In-memory company data loading for fast retrieval
  - Optimized text matching algorithms with relevance scoring
  - Structured data format for efficient processing
  - Hot-reloading capability for data updates
- **API Optimization**:
  - Connection reuse for external APIs (OpenRouter, Exa, Firecrawl)
  - Request caching for repeated queries
  - Async processing for long-running tasks
  - Intelligent fallback mechanisms
- **Performance Monitoring**:
  - Response time tracking
  - API usage analytics
  - Error rate monitoring
  - Resource utilization tracking

## Deployment Architecture

### Development
```
Local Machine (Docker):
├── Frontend (Vite Dev Server) - :3001
├── Backend API (Express) - :3001/api
├── AI Service (Flask) - :5002
└── Firebase Auth - External service

Local Machine (Manual):
├── Frontend (yarn dev) - :3001
├── Backend API (Express) - :3001/api
├── AI Service (python app.py) - :5002
└── Firebase Auth - External service
```

### Production
```
Cloud Infrastructure:
├── Frontend (Vercel/Static CDN)
├── Backend API (Container/Serverless)
├── AI Service (Render Container)
├── Firebase (Authentication & Storage)
├── RAG Data (File-based/Firebase Storage)
└── External APIs (OpenRouter, Exa, Firecrawl)

Current Production Setup:
├── Frontend: Vercel deployment ready
├── AI Service: Render deployment (configured)
├── Authentication: Firebase (configured)
└── Data: File-based RAG + Firebase integration
```

## Monitoring and Logging

### Current Implementation
- **Structured Logging**: Comprehensive logging across all services
- **Request/Response Tracking**: Detailed API call logging
- **Error Tracking**: Comprehensive error handling and reporting
- **Health Checks**: Multi-level health monitoring
- **Search Analytics**: User behavior and search pattern tracking
- **Performance Metrics**: Response time and success rate monitoring

### Planned Improvements
- **Advanced Analytics**: Real-time dashboard for search patterns
- **Performance Monitoring**: APM integration (DataDog, New Relic)
- **Error Reporting**: Sentry or similar service integration
- **User Analytics**: Advanced user behavior tracking
- **A/B Testing**: Feature flag system for experimentation
- **Alerting**: Automated alerts for system issues

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Microservices architecture
- Load balancer ready
- Database connection pooling

### Vertical Scaling
- Efficient memory usage
- CPU optimization for AI processing
- Caching strategies
- Resource monitoring

## Technology Decisions

### Why React?
- Component reusability
- Strong TypeScript support
- Large ecosystem
- Performance optimizations

### Why Express.js?
- Lightweight and flexible
- Excellent TypeScript support
- Large middleware ecosystem
- Easy integration with frontend

### Why Flask?
- Python AI/ML ecosystem
- Simple and lightweight
- Easy integration with AI services
- Rapid development

### Why File-based RAG + Firebase?
- **File-based RAG**: Fast, reliable, version-controlled company data
- **Firebase Integration**: Scalable user data and authentication
- **Hybrid Approach**: Best of both worlds - speed and scalability
- **Easy Migration**: Can easily switch to full database when needed
- **Development Friendly**: No complex database setup required
- **Production Ready**: Firebase handles scale automatically

## Future Enhancements

### Short Term
- **RAG System Enhancement**: Vector embeddings for improved matching
- **Advanced Caching**: Redis integration for API response caching
- **Real-time Features**: WebSocket integration for live collaboration
- **Enhanced Analytics**: Advanced user behavior tracking
- **API Rate Limiting**: Intelligent rate limiting and throttling

### Medium Term
- **Machine Learning**: Custom ML models for better search relevance
- **Advanced RAG**: Vector database integration (Pinecone, Weaviate)
- **Multi-tenant Architecture**: Support for multiple organizations
- **Advanced Company Verification**: Automated verification workflows
- **Enterprise Features**: SSO, advanced permissions, audit logs

### Long Term
- **AI Model Training**: Custom fine-tuned models for domain-specific tasks
- **Global Scale**: Multi-region deployment with CDN
- **Advanced AI Features**: Conversational AI, predictive analytics
- **Enterprise Platform**: White-label solutions, API marketplace
- **Ecosystem Integration**: Partnerships with major platforms and tools