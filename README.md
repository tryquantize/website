# Quantize Website

A professional AI-powered search platform built with React, Express, and Python Flask, featuring advanced RAG (Retrieval-Augmented Generation) search capabilities and Firebase authentication.

## 🏗️ Project Structure

```
quantize-website/
├── apps/                           # Applications
│   ├── web/                       # Frontend React application
│   │   ├── public/               # Static assets (logos, images, videos)
│   │   ├── src/                  # React source code
│   │   │   ├── components/       # Reusable UI components
│   │   │   │   ├── ui/          # Base UI components (Radix UI)
│   │   │   │   └── layout/      # Layout components
│   │   │   ├── pages/           # Page components
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   ├── contexts/        # React contexts (auth, favorites, etc.)
│   │   │   ├── services/        # API services & Firebase
│   │   │   ├── utils/           # Utility functions
│   │   │   ├── types/           # TypeScript types
│   │   │   ├── lib/             # Core libraries (auth, utils)
│   │   │   └── styles/          # CSS and animations
│   │   └── index.html
│   │
│   ├── api/                      # Backend Express API
│   │   ├── src/
│   │   │   ├── routes/          # API routes
│   │   │   ├── services/        # Business logic & storage
│   │   │   └── utils/           # Backend utilities
│   │   └── index.ts             # Server entry point
│   │
│   └── ai-service/              # Python AI service with RAG
│       ├── src/
│       │   ├── services/        # AI service modules
│       │   ├── config/          # Configuration
│       │   └── rag/             # RAG system implementation
│       │       ├── companies/   # Company data (18+ companies)
│       │       ├── services/    # RAG processing services
│       │       └── utils/       # RAG utilities
│       ├── app.py               # Flask entry point
│       ├── requirements.txt     # Python dependencies
│       └── README.md            # AI service documentation
│
├── api/                         # Legacy API endpoints (to be migrated)
│   ├── add-company.ts
│   ├── auto-fill-company.ts
│   ├── enhance-text.ts
│   └── search.ts
│
├── packages/                     # Shared packages
│   └── shared/                  # Shared TypeScript code
│       └── schemas/            # Validation schemas
│
├── tools/                       # Development tools
│   ├── scripts/                # Build and deployment scripts
│   │   ├── docker-dev.sh       # Docker development startup
│   │   ├── docker-prod.sh      # Docker production startup
│   │   └── cleanup.js          # Cleanup utility
│   │
│   └── config/                 # Configuration files
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       └── components.json     # Shadcn/ui config
│
├── scripts/                     # Deployment scripts
│   ├── deploy-render.sh        # Render deployment
│   └── test-ai-service.sh      # AI service testing
│
├── docs/                       # Comprehensive documentation
│   ├── ARCHITECTURE.md        # System architecture
│   ├── API_REFERENCE.md       # Complete API docs
│   ├── DEVELOPMENT_GUIDE.md   # Developer guide
│   ├── DOCKER_GUIDE.md        # Docker setup guide
│   ├── FIREBASE_SETUP.md      # Firebase configuration
│   ├── RESTRUCTURING_SUMMARY.md # Project improvements
│   └── deployment/            # Deployment guides
│
├── docker-compose.yml         # Docker development setup
├── Dockerfile                 # Main application container
├── package.json              # Root package.json
├── RAG_SEARCH_ARCHITECTURE.md # RAG system documentation
├── FIRECRAWL_MIGRATION.md    # Firecrawl integration guide
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- **Docker Desktop** (required)
- **Node.js** 18+ and **Yarn**
- **Python** 3.8+ (for AI service development)

### Setup

```bash
git clone <repository-url>
cd quantize-website
cp .env.example .env.local
# Edit .env.local with your API keys (see Configuration section)
yarn launch
```

### Access Points
- **Main Website**: http://localhost:3001
- **API Endpoints**: http://localhost:3001/api
- **AI Service**: http://localhost:5002 (Local) / https://quantize-ai-service.onrender.com (Production)
- **Health Check**: http://localhost:5002/health

## 📜 Available Scripts

### Main Commands (Docker-based)
- `yarn launch` - Launch all services (recommended)
- `yarn dev` - Start development server
- `yarn start` - Start containers
- `yarn build` - Build Docker containers
- `yarn clean` - Stop and clean containers
- `yarn check` - Type check TypeScript

### Additional Docker Commands
- `yarn docker:prod` - Start with Docker (production)
- `yarn docker:up` - Start containers
- `yarn docker:down` - Stop containers
- `yarn docker:logs` - View container logs

## 🔧 Configuration

### Environment Variables

Create `.env.local` with:

```bash
# AI Service APIs
OPENROUTER_API_KEY=your_openrouter_key
EXA_API_KEY=your_exa_key
FIRECRAWL_API_KEY=your_firecrawl_key
AI_SERVICE_URL=http://localhost:5002

# Firebase Authentication (Optional)
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Development
NODE_ENV=development
PORT=3001
```

### API Keys Setup

1. **OpenRouter API**: Get from [openrouter.ai](https://openrouter.ai) - For AI model access
2. **Exa API**: Get from [exa.ai](https://exa.ai) - For web search functionality
3. **Firecrawl API**: Get from [firecrawl.dev](https://firecrawl.dev) - For web scraping
4. **Firebase**: Follow [Firebase Setup Guide](docs/FIREBASE_SETUP.md) for authentication

## 🏛️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS + Radix UI + Shadcn/ui
- **State Management**: Zustand + React Context
- **Authentication**: Firebase Auth with Google OAuth
- **Routing**: Wouter
- **Build Tool**: Vite
- **Animations**: Framer Motion + GSAP

### Backend (Express + TypeScript)
- **Framework**: Express.js with TypeScript
- **Storage**: In-memory storage (development) + Firebase (production)
- **Authentication**: Firebase Admin SDK
- **API**: RESTful endpoints with Zod validation
- **Proxy**: AI service integration

### AI Service (Python + Flask)
- **Framework**: Flask with comprehensive error handling
- **RAG System**: Custom implementation with 18+ companies
- **AI Models**: OpenRouter (GPT-4o Mini, Gemini 2.0, etc.)
- **Web Search**: Exa API for real-time data
- **Web Scraping**: Firecrawl API for company data
- **Deployment**: Render (Production) / Docker (Development)
- **Features**: Dual-mode search (RAG + Web), company enrichment, text enhancement

## 🔌 API Endpoints

### Core Search
- `POST /api/search` - AI-powered search with RAG and web modes
- `GET /api/research/stream` - Real-time search streaming (SSE)

### Authentication (Firebase)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- Firebase Auth handles Google OAuth automatically

### AI Service Integration
- `POST /api/add-company` - Add company to RAG database
- `POST /api/auto-fill-company` - Auto-fill company data with Firecrawl
- `POST /api/enhance-text` - AI text enhancement
- `POST /api/ai-service/compare` - Compare companies

### Tools Management
- `GET /api/tools` - Get AI tools with filtering
- `GET /api/tools/:id` - Get specific tool
- `POST /api/tools` - Create new tool
- `PATCH /api/tools/:id` - Update tool
- `DELETE /api/tools/:id` - Delete tool

### Admin
- `GET /api/admin/pending-tools` - Get pending tools
- `POST /api/admin/tools/:id/approve` - Approve tool
- `POST /api/admin/tools/:id/reject` - Reject tool

### Health & Monitoring
- `GET /health` - AI service health check
- Analytics tracking for all search operations

## 🚀 Deployment

### Development
```bash
# Start all services with Docker
yarn launch

# Alternative: Individual services
yarn dev                    # Frontend + API only
cd apps/ai-service && python app.py  # AI service separately
```

### Production
```bash
# Docker production build
yarn docker:prod

# Build for static deployment
yarn build
```

### AI Service Deployment
The AI service is deployed to Render for production:
```bash
# Deploy to Render
./scripts/deploy-render.sh

# Test deployment
./scripts/test-ai-service.sh
```

### Deployment Options
- **Vercel**: Frontend deployment (configured)
- **Render**: AI service deployment (configured)
- **Docker**: Full-stack containerized deployment
- **Local**: Development environment

See [Docker Guide](docs/DOCKER_GUIDE.md) and [Deployment Documentation](docs/deployment/) for detailed instructions.

## 🧪 Testing

### Health Checks
```bash
# AI service health
curl http://localhost:5002/health

# API health
curl http://localhost:3001/api/health
```

### Manual Testing
```bash
# Test RAG search
curl -X POST http://localhost:5002/search \
  -H "Content-Type: application/json" \
  -d '{"query": "AI chatbots", "webSearchEnabled": false}'

# Test web search
curl -X POST http://localhost:5002/search \
  -H "Content-Type: application/json" \
  -d '{"query": "latest AI tools", "webSearchEnabled": true}'

# Test company autofill
curl -X POST http://localhost:5002/auto-fill-company \
  -H "Content-Type: application/json" \
  -d '{"companyName": "OpenAI", "website": "https://openai.com"}'
```

### Test Scripts
```bash
# AI service comprehensive test
cd apps/ai-service && python test_firecrawl.py

# Firebase integration test
cd apps/ai-service && python test_firebase.py
```

## 📁 Key Features

### 🔍 Advanced Search Capabilities
- **Dual-Mode Search**: RAG-only mode (curated data) + Web search mode (real-time)
- **18+ Pre-loaded Companies**: Comprehensive company database with structured data
- **Intelligent Matching**: Advanced text matching with relevance scoring
- **Real-time Streaming**: Server-sent events for live search updates
- **Smart Suggestions**: AI-generated related search recommendations

### 🤖 AI-Powered Features
- **Multiple AI Models**: GPT-4o Mini, Gemini 2.0 Flash, Qwen2.5, Llama 3.1
- **Company Enrichment**: Automatic data enhancement with web scraping
- **Text Enhancement**: AI-powered content improvement
- **Citation System**: Proper source attribution with web links
- **Fallback Mechanisms**: Graceful degradation when APIs fail

### 🔐 Authentication & User Management
- **Firebase Authentication**: Google OAuth + Email/Password
- **User Favorites**: Save and manage favorite companies
- **Personalized Experience**: User-specific search history and preferences
- **Onboarding Flow**: Guided user setup process

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Radix UI + Shadcn/ui components
- **Smooth Animations**: Framer Motion + GSAP animations
- **Dark/Light Mode**: Theme switching support
- **Interactive Elements**: Hover effects, loading states, transitions

### 🛠️ Developer Experience
- **Full TypeScript**: End-to-end type safety
- **Docker Support**: Containerized development and production
- **Hot Reload**: Instant development feedback
- **Comprehensive Documentation**: Detailed guides and API references
- **Testing Framework**: Structured testing setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

### Core Documentation
- **[Architecture Guide](docs/ARCHITECTURE.md)** - Complete system architecture and data flow
- **[API Reference](docs/API_REFERENCE.md)** - Full API documentation with examples
- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)** - Developer onboarding and best practices
- **[Docker Guide](docs/DOCKER_GUIDE.md)** - Container setup and deployment

### Setup Guides
- **[Firebase Setup](docs/FIREBASE_SETUP.md)** - Authentication configuration
- **[RAG Search Architecture](RAG_SEARCH_ARCHITECTURE.md)** - Search system technical details
- **[Firecrawl Migration](FIRECRAWL_MIGRATION.md)** - Web scraping integration

### Project Information
- **[Restructuring Summary](docs/RESTRUCTURING_SUMMARY.md)** - Recent improvements and changes
- **[AI Service Cleanup](apps/ai-service/CLEANUP_SUMMARY.md)** - Code optimization details
- **[Deployment Guides](docs/deployment/)** - Various deployment options

### Quick References
- **[Test Documentation](test_new_features.md)** - Feature testing guide
- **[Deployment Checklist](docs/deployment/DEPLOYMENT_CHECKLIST.md)** - Production deployment steps



## 🆘 Troubleshooting

### Common Issues

1. **Port conflicts**: 
   ```bash
   yarn clean  # Stop all containers
   lsof -ti:3001,5002 | xargs kill -9  # Kill processes on ports
   ```

2. **Docker issues**: 
   ```bash
   docker system prune -a  # Clean Docker cache
   yarn docker:build --no-cache  # Rebuild containers
   ```

3. **API key errors**: 
   - Verify all keys in `.env.local`
   - Check API key validity and quotas
   - Restart services after updating keys

4. **AI service connection**: 
   ```bash
   curl http://localhost:5002/health  # Check AI service
   docker-compose logs ai-service     # Check logs
   ```

5. **Firebase authentication**: 
   - Follow [Firebase Setup Guide](docs/FIREBASE_SETUP.md)
   - Check authorized domains in Firebase Console
   - Verify environment variables start with `VITE_`

6. **RAG data not loading**: 
   - Check file permissions in `apps/ai-service/src/rag/companies/`
   - Verify file encoding (UTF-8)
   - Restart AI service after data changes

### Debug Commands

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f web
docker-compose logs -f ai-service

# Test individual components
yarn check  # TypeScript compilation
python apps/ai-service/app.py  # AI service directly
```

### Getting Help

- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)** - Comprehensive setup and troubleshooting
- **[Architecture Guide](docs/ARCHITECTURE.md)** - System understanding
- **[API Reference](docs/API_REFERENCE.md)** - Endpoint documentation
- **[Docker Guide](docs/DOCKER_GUIDE.md)** - Container setup and debugging
- **[RAG Architecture](RAG_SEARCH_ARCHITECTURE.md)** - Search system details

## 🔄 Recent Improvements

### Major Updates (January 2025)

#### 🔍 Advanced RAG Search System
- **Dual-mode search**: RAG-only + Web search modes
- **18+ company database**: Pre-loaded with structured data
- **Intelligent text matching**: Advanced relevance scoring
- **Real-time streaming**: Server-sent events for live updates

#### 🔧 Technical Enhancements
- **Firecrawl Migration**: Replaced Scrapy with Firecrawl for better web scraping
- **Firebase Integration**: Complete authentication system with Google OAuth
- **Docker Optimization**: Improved containerization for development and production
- **Code Cleanup**: Removed unused code, improved maintainability

#### 📚 Documentation Overhaul
- **Comprehensive guides**: Architecture, API, Development, Docker, Firebase
- **RAG system documentation**: Complete technical specifications
- **Migration guides**: Firecrawl integration and cleanup summaries
- **Deployment guides**: Multiple deployment options documented

#### 🎨 UI/UX Improvements
- **Modern component library**: Radix UI + Shadcn/ui integration
- **Enhanced animations**: Framer Motion + GSAP implementations
- **Responsive design**: Mobile-first approach with improved accessibility
- **User experience**: Onboarding flow, favorites system, personalization

### Project Restructuring
- ✅ **Organized file structure** with logical groupings
- ✅ **Comprehensive documentation** for all components (15,000+ words)
- ✅ **Streamlined codebase** with cleaned dependencies
- ✅ **Enhanced code quality** with consistent patterns
- ✅ **All functionality preserved** - zero breaking changes
- ✅ **Production-ready** with enterprise-level organization

See **[Restructuring Summary](docs/RESTRUCTURING_SUMMARY.md)** for complete details.