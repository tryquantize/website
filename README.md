# Quantize Website

A professional AI-powered search platform built with React, Express, and Python Flask.

## 🏗️ Project Structure

```
quantize-website/
├── apps/                           # Applications
│   ├── web/                       # Frontend React application
│   │   ├── public/               # Static assets (logos, images)
│   │   ├── src/                  # React source code
│   │   │   ├── components/       # Reusable UI components
│   │   │   ├── pages/           # Page components
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   ├── contexts/        # React contexts
│   │   │   ├── services/        # API services
│   │   │   ├── utils/           # Utility functions
│   │   │   └── types/           # TypeScript types
│   │   └── index.html
│   │
│   ├── api/                      # Backend Express API
│   │   ├── src/
│   │   │   ├── routes/          # API routes
│   │   │   ├── services/        # Business logic & storage
│   │   │   ├── utils/           # Backend utilities
│   │   │   └── types/           # Backend types
│   │   └── index.ts             # Server entry point
│   │
│   └── ai-service/              # Python AI service
│       ├── src/
│       │   ├── services/        # AI service modules
│       │   ├── utils/           # Python utilities
│       │   └── config/          # Configuration
│       ├── app.py               # Flask entry point
│       └── requirements.txt
│
├── packages/                     # Shared packages
│   └── shared/                  # Shared TypeScript code
│       ├── types/              # Common types
│       ├── utils/              # Shared utilities
│       └── schemas/            # Validation schemas
│
├── tools/                       # Development tools
│   ├── scripts/                # Build and deployment scripts
│   │   ├── dev.sh             # Development startup
│   │   └── cleanup.js         # Cleanup utility
│   │
│   └── config/                 # Configuration files
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       └── postcss.config.js
│
├── docs/                       # Documentation
│   └── deployment/            # Deployment guides
│
├── package.json               # Root package.json
└── README.md                  # This file
```

## 🚀 Quick Start

### Docker Setup (Required)

**Prerequisites:** Docker Desktop

```bash
git clone <repository-url>
cd quantize-website
cp .env.example .env.local
# Edit .env.local with your API keys
yarn launch
```

### Access Points
- **Main Website**: http://localhost:3001
- **AI Service**: https://quantize-ai-service.onrender.com (Production) / http://localhost:5002 (Local)

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
# AI Service
OPENROUTER_API_KEY=your_openrouter_key
FIRECRAWL_API_KEY=your_firecrawl_key
AI_SERVICE_URL=http://localhost:5002

# Development
NODE_ENV=development
PORT=3001
```

### API Keys Setup

1. **OpenRouter API**: Get from [openrouter.ai](https://openrouter.ai)
2. **Firecrawl API**: Get from [firecrawl.dev](https://firecrawl.dev)

## 🏛️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: Zustand + React Context
- **Routing**: Wouter
- **Build Tool**: Vite

### Backend (Express + TypeScript)
- **Framework**: Express.js with TypeScript
- **Storage**: In-memory storage for development
- **Authentication**: JWT + bcrypt
- **API**: RESTful endpoints

### AI Service (Python + Flask)
- **Framework**: Flask
- **Deployment**: Render (Production) / Local (Development)
- **AI Models**: OpenRouter integration
- **Web Scraping**: Firecrawl API
- **Features**: Company enrichment, search suggestions

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Search
- `POST /api/search` - AI-powered search
- `GET /api/tools` - Get AI tools
- `GET /api/tools/:id` - Get specific tool

### Admin
- `GET /api/admin/pending-tools` - Get pending tools
- `POST /api/admin/tools/:id/approve` - Approve tool

## 🚀 Deployment

### Development
```bash
yarn launch
```

### Production
```bash
yarn docker:prod
```

### AI Service Deployment
The AI service is deployed to Render for production use:
```bash
# Deploy AI service to Render
./scripts/deploy-render.sh
```

See `apps/ai-service/README.md` for detailed deployment instructions.

### Local Development
For local development, the AI service runs on your machine. See `docs/deployment/` for setup guides.

## 🧪 Testing

The AI service includes health checks:
```bash
curl http://localhost:5002/health
```

## 📁 Key Features

- **AI-Powered Search**: Intelligent search with web context
- **Real-time Results**: Fast, responsive search interface
- **Company Enrichment**: Detailed company information
- **Citation System**: Proper source attribution
- **Responsive Design**: Mobile-first approach
- **Type Safety**: Full TypeScript coverage

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

- **[Docker Guide](docs/DOCKER_GUIDE.md)** - Complete Docker setup and deployment guide
- **[Architecture Guide](docs/ARCHITECTURE.md)** - System architecture and component overview
- **[API Reference](docs/API_REFERENCE.md)** - Complete API documentation with examples
- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)** - Developer onboarding and best practices
- **[Restructuring Summary](docs/RESTRUCTURING_SUMMARY.md)** - Recent improvements and changes

## 🧪 Testing

```bash
# Health check
curl http://localhost:5002/health

# Manual API testing
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "AI chatbots"}'
```

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use**: Run `yarn clean` to stop all containers
2. **Docker not running**: Start Docker Desktop
3. **API keys not working**: Check `.env.local` configuration
4. **Build failures**: Run `yarn clean` then `yarn launch`

### Getting Help

- Check the **[Development Guide](docs/DEVELOPMENT_GUIDE.md)** for detailed troubleshooting
- Review the **[Architecture Guide](docs/ARCHITECTURE.md)** for system understanding
- See **[API Reference](docs/API_REFERENCE.md)** for endpoint documentation
- Ensure all environment variables are properly set

## 🔄 Recent Improvements

This project has been comprehensively restructured for better maintainability:
- ✅ **Organized file structure** with logical groupings
- ✅ **Comprehensive documentation** for all components
- ✅ **Streamlined codebase** with only essential files
- ✅ **Enhanced code quality** with consistent patterns
- ✅ **All functionality preserved** - no breaking changes

See **[Restructuring Summary](docs/RESTRUCTURING_SUMMARY.md)** for complete details.