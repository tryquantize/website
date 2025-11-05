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

### Option 1: Docker (Recommended)

**Prerequisites:** Docker Desktop

```bash
git clone <repository-url>
cd quantize-website
cp .env.example .env.local
# Edit .env.local with your API keys
yarn docker:dev
```

### Option 2: Local Development

**Prerequisites:** Node.js 18+, Python 3.8+, Yarn

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

### Access Points
- **Main Website**: http://localhost:3001
- **AI Service**: http://localhost:5002

## 📜 Available Scripts

### Local Development
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn launch` - Launch all services (recommended)
- `yarn clean` - Clean build artifacts
- `yarn check` - Type check TypeScript

### Docker Commands
- `yarn docker:dev` - Start with Docker (development)
- `yarn docker:prod` - Start with Docker (production)
- `yarn docker:build` - Build Docker containers
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

### Production Build
```bash
yarn build
yarn start
```

### Local Development Only
This application is configured to run entirely on your local machine. See `docs/deployment/` for setup guides.

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

1. **Port already in use**: The startup script automatically kills existing processes
2. **Dependencies missing**: Run `yarn install` and set up Python environment
3. **API keys not working**: Check `.env.local` configuration
4. **Build failures**: Run `yarn clean` and try again

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