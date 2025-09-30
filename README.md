# Quantize - AI Tool Discovery Platform

A modern platform for discovering and exploring AI tools from Indian companies and startups, featuring AI-powered search and comprehensive tool listings.

## 🏗️ Project Architecture

This is a monorepo structure organized into packages for better maintainability and scalability:

```
.
├── packages/
│   ├── ai-service/     # Python Flask service for AI-powered search
│   ├── client/         # React frontend application
│   ├── server/         # Node.js Express backend API
│   └── shared/         # Shared TypeScript schemas and types
├── docker-compose.yml  # Production Docker orchestration
├── docker-compose.dev.yml # Development with hot-reloading
└── README.md
```

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