# Quantize Website Architecture

## Overview

The Quantize Website is a modern, AI-powered search platform built with a microservices architecture. It consists of three main applications working together to provide intelligent search capabilities for AI tools and companies.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   AI Service    │
│   (React)       │◄──►│   (Express)     │◄──►│   (Flask)       │
│   Port: 3001    │    │   Port: 3001    │    │   Port: 5002    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Assets │    │   Memory Store  │    │   RAG Database  │
│   (Vite Build)  │    │   (In-Memory)   │    │   (File-based)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
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
- Real-time search interface
- Company comparison tools
- User authentication and favorites

**Directory Structure:**
```
apps/web/src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   └── layout/         # Layout components (header, footer)
├── pages/              # Page components and routes
├── hooks/              # Custom React hooks
├── contexts/           # React context providers
├── services/           # API service functions
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
- RESTful API endpoints
- User authentication
- Tool management (CRUD operations)
- Search functionality with AI service integration
- Admin panel for tool approval
- Analytics and usage tracking

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
- OpenRouter for AI model access
- Exa API for web search
- Custom RAG (Retrieval-Augmented Generation) system

**Key Features:**
- AI-powered search with context
- Company information enrichment
- Web scraping and data extraction
- Text enhancement and suggestions
- Company comparison analysis
- RAG-based knowledge retrieval

**Service Endpoints:**
```
Core Services:
GET  /health              # Health check
POST /search              # AI search with web context
POST /suggestions         # Generate search suggestions
POST /extract-companies   # Extract company info from text
POST /compare             # Compare multiple companies

Company Management:
POST /add-company         # Add company to RAG database
POST /auto-fill-company   # Auto-fill company details
POST /enhance-text        # Enhance text content
```

## Data Flow

### Search Request Flow

1. **User Input**: User enters search query in frontend
2. **API Request**: Frontend sends POST to `/api/search`
3. **AI Processing**: Backend forwards request to AI service
4. **RAG Retrieval**: AI service searches RAG database
5. **Web Search**: AI service performs web search via Exa API
6. **AI Generation**: OpenRouter generates contextual response
7. **Response Assembly**: AI service combines results with citations
8. **Fallback**: If AI service fails, backend returns traditional search
9. **Frontend Display**: Results displayed with citations and suggestions

### Company Addition Flow

1. **Form Submission**: User submits company form
2. **Auto-fill**: AI service scrapes website and LinkedIn
3. **Enhancement**: AI enhances descriptions and features
4. **RAG Storage**: Company data stored in RAG database
5. **Confirmation**: Success response returned to user

## Security Considerations

### Authentication
- Password hashing with bcryptjs
- JWT tokens for session management
- Input validation with Zod schemas

### API Security
- CORS configuration for local development
- Request rate limiting (planned)
- Input sanitization and validation
- Error handling without information leakage

### AI Service Security
- API key management through environment variables
- Request timeout handling
- Graceful degradation when services fail
- No sensitive data in logs

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
- RAG database indexing for fast retrieval
- Request caching for repeated queries
- Async processing for long-running tasks
- Connection reuse for external APIs

## Deployment Architecture

### Development
```
Local Machine:
├── Frontend (Vite Dev Server) - :3001
├── Backend API (Express) - :3001/api
└── AI Service (Flask) - :5002
```

### Production (Planned)
```
Cloud Infrastructure:
├── Frontend (Static CDN)
├── Backend API (Container/Serverless)
├── AI Service (Container)
├── Database (PostgreSQL/MongoDB)
└── File Storage (S3/Similar)
```

## Monitoring and Logging

### Current Implementation
- Console logging for development
- Request/response logging in API
- Error tracking in AI service
- Health check endpoints

### Planned Improvements
- Structured logging with correlation IDs
- Performance metrics collection
- Error reporting service integration
- Usage analytics dashboard

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

### Why In-Memory Storage?
- Fast development iteration
- No database setup required
- Easy to switch to persistent storage
- Suitable for MVP/prototype

## Future Enhancements

### Short Term
- Database integration (PostgreSQL)
- User authentication improvements
- Enhanced error handling
- Performance monitoring

### Medium Term
- Real-time features with WebSockets
- Advanced search filters
- Company verification system
- API rate limiting

### Long Term
- Multi-tenant architecture
- Advanced analytics dashboard
- Machine learning model training
- Enterprise features