# Quantize - AI Tool Discovery Platform

A modern platform for discovering and exploring AI tools from Indian companies and startups, featuring AI-powered search and comprehensive tool listings.

## 🏗️ Project Architecture

This is a monorepo structure organized into packages for better maintainability and scalability:

# 🔍 Quantize - AI Tool Discovery Platform

> **Discover, explore, and connect with the best AI tools from Indian companies and startups.**

A modern, high-performance platform built with Next.js 15 that makes AI tool discovery effortless through intelligent search and comprehensive listings.

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🤖 **AI-Powered Search** - Intelligent tool discovery with natural language queries
- 🚀 **Lightning Fast** - Built with Next.js 15 and Turbopack for optimal performance
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- 🔐 **Secure Authentication** - Firebase Auth integration
- 📊 **Analytics Dashboard** - Track tool performance and user engagement
- 🐳 **Docker Ready** - One-command deployment with Docker Compose

## 🏗️ Architecture

```
quantize/
├── packages/
│   ├── web/           # Next.js 15 App (Frontend + Backend)
│   ├── ai-service/    # Python Flask AI Service
│   └── shared/        # Shared TypeScript schemas
├── docker-compose.yml
└── package.json       # Monorepo scripts
```

### 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 18, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Drizzle ORM |
| **AI Service** | Python, Flask, OpenRouter API, Exa Search |
| **Database** | PostgreSQL (Neon) |
| **Auth** | Firebase Authentication |
| **DevOps** | Docker, Docker Compose, pnpm |

## 🚀 Quick Start

### Prerequisites

Make sure you have one of the following setups:

**Option A: Docker (Recommended)**
- Docker & Docker Compose
- API Keys (OpenRouter, Exa, Firebase)

**Option B: Local Development**
- Node.js 20+
- Python 3.10+
- pnpm (or npm/yarn)

### 🐳 Docker Setup (Recommended)

1. **Clone & Setup**
   ```bash
   git clone https://github.com/tryquantize/website.git
   cd website
   ```

2. **Environment Configuration**
   ```bash
   # Create environment file for AI service
   cp packages/ai-service/.env.example packages/ai-service/.env
   
   # Edit with your API keys
   nano packages/ai-service/.env
   ```

   Add your API keys:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   EXA_API_KEY=your_exa_api_key_here
   FLASK_HOST=0.0.0.0
   FLASK_PORT=5002
   FLASK_DEBUG=true
   ```

3. **Launch Application**
   ```bash
   # Start all services
   npm run docker:up
   
   # Or build and start
   npm run docker:build
   ```

4. **Access Your App**
   - 🌐 **Website**: http://localhost:3000
   - 🤖 **AI Service**: http://localhost:5002
   - 📊 **Admin Panel**: http://localhost:3000/admin

### 💻 Local Development

1. **Install Dependencies**
   ```bash
   # Install Node.js dependencies
   cd packages/web
   pnpm install
   
   # Setup Python environment
   cd ../ai-service
   python3 -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Configure Environment**
   ```bash
   # Setup AI service environment
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start Development Servers**
   ```bash
   # Terminal 1: Next.js Development Server
   cd packages/web
   pnpm dev
   
   # Terminal 2: AI Service
   cd packages/ai-service
   source venv/bin/activate
   python app.py
   ```

4. **Development URLs**
   - 🌐 **Next.js App**: http://localhost:3001
   - 🤖 **AI Service**: http://localhost:5002

## 📋 Available Scripts

### Monorepo Commands
```bash
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm run start        # Start production server
npm run docker:up    # Start Docker services
npm run docker:down  # Stop Docker services
npm run docker:build # Build and start Docker services
```

### Package-Specific Commands
```bash
# Web package (Next.js)
cd packages/web
pnpm dev            # Development server with hot reload
pnpm build          # Production build
pnpm start          # Start production server
pnpm check          # TypeScript type checking

# AI Service
cd packages/ai-service
python app.py       # Start Flask development server
```

## 🔧 Configuration

### Required API Keys

1. **OpenRouter API Key**
   - Get from: https://openrouter.ai/
   - Used for: AI-powered search responses

2. **Exa API Key**
   - Get from: https://exa.ai/
   - Used for: Web search capabilities

3. **Firebase Project**
   - Setup: https://console.firebase.google.com/
   - Used for: User authentication

### Environment Files

**AI Service** (`packages/ai-service/.env`):
```env
OPENROUTER_API_KEY=sk-or-v1-xxxxx
EXA_API_KEY=xxxxx
FLASK_HOST=0.0.0.0
FLASK_PORT=5002
FLASK_DEBUG=true
```

**Next.js App** (`packages/web/.env.local`):
```env
# Firebase configuration (optional)
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
```

## 📚 API Documentation

### Next.js API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tools` | GET | Get all approved tools |
| `/api/search` | POST | Search tools |
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/admin/tools` | GET | Admin: Get all tools |

### AI Service Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/search` | POST | AI-powered search |
| `/health` | GET | Service health check |

## 🚢 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export OPENROUTER_API_KEY=your_key
   export EXA_API_KEY=your_key
   ```

2. **Docker Production**
   ```bash
   # Use production compose file
   docker-compose -f docker-compose.yml up -d
   ```

3. **Manual Deployment**
   ```bash
   # Build Next.js app
   cd packages/web
   pnpm build
   pnpm start
   
   # Start AI service
   cd packages/ai-service
   python app.py
   ```

### Platform Deployment

- **Vercel**: Deploy the `packages/web` directory
- **Railway**: Use provided Dockerfile
- **AWS/GCP**: Use Docker Compose setup

## 🧪 Testing

```bash
# Type checking
cd packages/web && pnpm check

# Build test (ensures production build works)
npm run build

# Docker health check
docker-compose exec web curl http://localhost:3000/api/health
docker-compose exec ai-service curl http://localhost:5002/health
```

## 🛠️ Development Guide

### Project Structure

```
packages/web/
├── app/              # Next.js 15 App Router
│   ├── (routes)/     # Page routes
│   ├── api/          # API endpoints
│   └── globals.css   # Global styles
├── components/       # React components
├── lib/              # Utilities and configurations
├── shared/           # Shared schemas (copied from packages/shared)
└── public/           # Static assets

packages/ai-service/
├── app.py           # Flask application
├── ai_agent.py      # AI logic
├── exa_search.py    # Search functionality
└── requirements.txt # Python dependencies
```

### Adding New Features

1. **New Page**: Add to `packages/web/app/`
2. **New API**: Add to `packages/web/app/api/`
3. **New Component**: Add to `packages/web/components/`
4. **AI Feature**: Modify `packages/ai-service/`

### Database Schema

The app uses Drizzle ORM with PostgreSQL. Schema is defined in `packages/shared/schema.ts` and copied to `packages/web/shared/schema.ts`.

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes and test**:
   ```bash
   npm run build  # Ensure build works
   npm run docker:build  # Test Docker setup
   ```
4. **Commit changes**: `git commit -m 'Add amazing feature'`
5. **Push and create PR**: `git push origin feature/amazing-feature`

### Code Style

- TypeScript for type safety
- ESLint + Prettier for code formatting
- Tailwind CSS for styling
- Component-based architecture

## 🐛 Troubleshooting

### Common Issues

**Docker Build Fails**
```bash
# Clean Docker cache
docker system prune -a
docker-compose build --no-cache
```

**Port Already in Use**
```bash
# Check what's using the port
lsof -i :3000
lsof -i :5002

# Kill the process or change ports in docker-compose.yml
```

**AI Service Not Responding**
```bash
# Check logs
docker-compose logs ai-service

# Verify environment variables
docker-compose exec ai-service env | grep API_KEY
```

### Performance Tips

- Use `pnpm` instead of npm for faster installs
- Enable Docker BuildKit for faster builds
- Use Next.js production build for best performance

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **OpenRouter** - AI API access
- **Exa** - Search capabilities  
- **Vercel** - Hosting and deployment
- **Community** - Open source contributors

---

### Technology Stack

- **Web**: Next.js + React + TypeScript + TailwindCSS
- **AI Service**: Python + Flask + OpenRouter API + Exa Search
- **Database**: PostgreSQL (via Neon)
- **Authentication**: Firebase Auth
- **Deployment**: Docker + Docker Compose

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended for easiest setup)
- **OR** Node.js 20+ and Python 3.10+ for local development
- API Keys:
  - OpenRouter API key (for AI features)
  - Exa API key (for web search)

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/tryquantize/website.git
   cd website
   ```

2. **Set up environment variables**
   Create a `.env` file in the root of the project and add your API keys:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key
   EXA_API_KEY=your_exa_api_key
   ```

3. **Run with Docker Compose**
   ```bash
   # Production mode
   docker-compose up -d
   
   # Development mode (with hot-reloading)
   docker-compose -f docker-compose.dev.yml up
   ```

4. **Access the application**
   - **Main Website**: http://localhost:3000
   - **AI Service**: http://localhost:5002

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   # Install Node.js dependencies
   pnpm install
   
   # Set up Python environment for AI service
   cd packages/ai-service
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cd ../..
   ```

2. **Configure environment**
   Create a `.env` file in the root of the project and add your API keys (as shown in the Docker setup).

3. **Start services**
   ```bash
   # Terminal 1: Start AI service
   cd packages/ai-service
   source venv/bin/activate
   python app.py
   
   # Terminal 2: Start development server
   cd packages/web
   pnpm dev
   ```

4. **Access the application**
   - **Main Website**: http://localhost:3000
   - **AI Service**: http://localhost:5002

## 📦 Package Structure

### packages/web
Next.js application that serves both the frontend and backend of the Quantize platform.

**Key Features:**
- Server-Side Rendering (SSR) with React Server Components
- API Routes for backend logic
- User authentication with Firebase
- Component-based UI with TailwindCSS

### packages/ai-service
Python Flask service that provides AI-powered search functionality using GPT-4o Mini via OpenRouter and Exa search API.

**Key Features:**
- AI-powered search responses
- Related search suggestions
- Real-time web information integration
- Health check endpoint

### packages/shared
Shared TypeScript schemas and types used across the `web` and `ai-service` packages.

## 🛠️ Development

### Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type checking
pnpm check
```

### Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Rebuild specific service
docker-compose build [service-name]

# Development mode with hot-reloading
docker-compose -f docker-compose.dev.yml up
```

## 🧪 Testing

The project uses the existing test infrastructure. Run tests with:

```bash
# Run all tests (if available)
pnpm test

# Type checking
pnpm check
```

## 📚 Documentation

For more detailed documentation, see:
- [Web Application Documentation](packages/web/README.md)
- [AI Service Documentation](packages/ai-service/README.md)

## 🔧 Configuration

### Environment Variables

**AI Service** (`packages/ai-service/.env`):
```env
OPENROUTER_API_KEY=your_openrouter_api_key
EXA_API_KEY=your_exa_api_key
FLASK_HOST=0.0.0.0
FLASK_PORT=5002
FLASK_DEBUG=false
```

**Docker Compose** (`.env` in root):
```env
OPENROUTER_API_KEY=your_openrouter_api_key
EXA_API_KEY=your_exa_api_key
```

## 🚢 Deployment

### Using Docker

1. Set up environment variables
2. Build and deploy with Docker Compose:
   ```bash
   docker-compose up -d
   ```

### Manual Deployment

1. Build the web app: `pnpm --filter web build`
2. Start the web app: `pnpm --filter web start`
3. Ensure AI service is running on port 5002

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT

## 🙏 Acknowledgments

- OpenRouter for AI capabilities
- Exa for search functionality
- All contributors to this project

### Technology Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **AI Service**: Python + Flask + OpenRouter API + Exa Search
- **Database**: PostgreSQL (via Neon)
- **Authentication**: Firebase Auth
- **Deployment**: Docker + Docker Compose

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended for easiest setup)
- **OR** Node.js 20+ and Python 3.10+ for local development
- API Keys:
  - OpenRouter API key (for AI features)
  - Exa API key (for web search)

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/tryquantize/website.git
   cd website
   ```

2. **Set up environment variables**
   ```bash
   # Create .env file in packages/ai-service/
   cp packages/ai-service/.env.example packages/ai-service/.env
   # Edit .env and add your API keys
   ```

3. **Run with Docker Compose**
   ```bash
   # Production mode
   docker-compose up -d
   
   # Development mode (with hot-reloading)
   docker-compose -f docker-compose.dev.yml up
   ```

4. **Access the application**
   - **Main Website**: http://localhost:80 (production) or http://localhost:3001 (development)
   - **API Server**: http://localhost:3001
   - **AI Service**: http://localhost:5002

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   # Install Node.js dependencies
   yarn install
   
   # Set up Python environment for AI service
   cd packages/ai-service
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cd ../..
   ```

2. **Configure environment**
   ```bash
   cp packages/ai-service/.env.example packages/ai-service/.env
   # Edit packages/ai-service/.env and add your API keys
   ```

3. **Start services**
   ```bash
   # Terminal 1: Start AI service
   cd packages/ai-service
   source venv/bin/activate
   python app.py
   
   # Terminal 2: Start development server (includes frontend)
   cd ../..
   yarn dev
   ```

4. **Access the application**
   - **Main Website**: http://localhost:3001
   - **AI Service**: http://localhost:5002

## 📦 Package Structure

### packages/ai-service
Python Flask service that provides AI-powered search functionality using GPT-4o Mini via OpenRouter and Exa search API.

**Key Features:**
- AI-powered search responses
- Related search suggestions
- Real-time web information integration
- Health check endpoint

**API Endpoints:**
- `POST /search` - AI-powered search
- `GET /health` - Health check

### packages/client
React frontend application with modern UI components and authentication.

**Key Features:**
- AI tool discovery and search
- User authentication with Firebase
- Responsive design with TailwindCSS
- Interactive UI components
- Favorites and analytics

### packages/server
Node.js Express backend API handling authentication, tools, and analytics.

**Key Features:**
- RESTful API endpoints
- User authentication
- Tool CRUD operations
- Admin panel for tool approval
- Analytics tracking

### packages/shared
Shared TypeScript schemas and types used across client and server.

## 🛠️ Development

### Available Scripts

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Type checking
yarn check

# Set up Python environment
yarn ai:install
```

### Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Rebuild specific service
docker-compose build [service-name]

# Development mode with hot-reloading
docker-compose -f docker-compose.dev.yml up
```

## 🧪 Testing

The project uses the existing test infrastructure. Run tests with:

```bash
# Run all tests (if available)
yarn test

# Type checking
yarn check
```

## 📚 Documentation

For more detailed documentation, see:
- [Server API Documentation](packages/server/README.md)
- [Client Component Guide](packages/client/README.md)
- [AI Service Documentation](packages/ai-service/README.md)

## 🔧 Configuration

### Environment Variables

**AI Service** (`packages/ai-service/.env`):
```env
OPENROUTER_API_KEY=your_openrouter_api_key
EXA_API_KEY=your_exa_api_key
FLASK_HOST=0.0.0.0
FLASK_PORT=5002
FLASK_DEBUG=false
```

**Docker Compose** (`.env` in root):
```env
OPENROUTER_API_KEY=your_openrouter_api_key
EXA_API_KEY=your_exa_api_key
```

## 🚢 Deployment

### Using Docker

1. Set up environment variables
2. Build and deploy with Docker Compose:
   ```bash
   docker-compose up -d
   ```

### Manual Deployment

1. Build the client: `yarn build`
2. Start the server: `yarn start`
3. Ensure AI service is running on port 5002

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT

## 🙏 Acknowledgments

- OpenRouter for AI capabilities
- Exa for search functionality
- All contributors to this project