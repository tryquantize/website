# Quick Start Guide

Get up and running with Quantize in under 5 minutes!

## Prerequisites

Choose one of these options:

### Option 1: Docker (Easiest)
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

### Option 2: Local Development
- [Node.js 20+](https://nodejs.org/)
- [Python 3.10+](https://www.python.org/)
- [Yarn](https://yarnpkg.com/) (or use `npm`)

## 🚀 5-Minute Setup

### With Docker (Recommended)

1. **Clone and enter directory:**
   ```bash
   git clone https://github.com/tryquantize/website.git
   cd website
   ```

2. **Set up environment:**
   ```bash
   cp packages/ai-service/.env.example packages/ai-service/.env
   # Edit packages/ai-service/.env and add your API keys
   ```

3. **Start everything:**
   ```bash
   docker-compose up
   ```

4. **Access the app:**
   - Website: http://localhost:80
   - API: http://localhost:3001
   - AI Service: http://localhost:5002

**That's it! 🎉**

### Without Docker

1. **Clone and enter directory:**
   ```bash
   git clone https://github.com/tryquantize/website.git
   cd website
   ```

2. **Install Node dependencies:**
   ```bash
   yarn install
   ```

3. **Set up AI service:**
   ```bash
   cd packages/ai-service
   python3 -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env and add your API keys
   cd ../..
   ```

4. **Start in two terminals:**
   
   Terminal 1 - Start AI service:
   ```bash
   cd packages/ai-service
   source venv/bin/activate
   python app.py
   ```
   
   Terminal 2 - Start dev server:
   ```bash
   yarn dev
   ```

5. **Access the app:**
   - Website: http://localhost:3001
   - AI Service: http://localhost:5002

## 📋 Next Steps

### Configure API Keys

Edit `packages/ai-service/.env`:
```env
OPENROUTER_API_KEY=your_openrouter_key_here
EXA_API_KEY=your_exa_key_here
```

Get your API keys:
- [OpenRouter API Key](https://openrouter.ai/)
- [Exa API Key](https://exa.ai/)

### Explore the App

1. **Search for AI Tools:**
   - Visit http://localhost:3001
   - Try searching: "AI tools for content creation"

2. **View Tool Listings:**
   - Browse curated AI tools
   - Filter by category, pricing, features

3. **User Features:**
   - Sign up/Login with Google
   - Save favorites
   - Submit your own AI tool

### Development Workflow

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Run type checking
yarn check

# Start with Docker (development mode with hot-reload)
docker-compose -f docker-compose.dev.yml up
```

## 🏗️ Project Structure

```
packages/
├── ai-service/    # Python Flask AI search service
├── client/        # React frontend
├── server/        # Node.js Express API
└── shared/        # Shared TypeScript types
```

## 📚 Learn More

- [Full README](README.md) - Complete documentation
- [Migration Guide](MIGRATION.md) - Upgrading from old structure
- [Server API Docs](packages/server/README.md) - Backend API reference
- [Client Docs](packages/client/README.md) - Frontend component guide
- [AI Service Docs](packages/ai-service/README.md) - AI service details

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill processes on port 3001 or 5002
lsof -ti:3001 | xargs kill -9
lsof -ti:5002 | xargs kill -9
```

### Dependencies not installing
```bash
# Clear cache and reinstall
rm -rf node_modules yarn.lock
yarn install
```

### Docker containers won't start
```bash
# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Python virtual environment issues
```bash
# Recreate virtual environment
rm -rf packages/ai-service/venv
cd packages/ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 💡 Tips

1. **Use Docker for consistent environment** across team members
2. **Check health endpoints** to verify services:
   - http://localhost:5002/health (AI service)
   - http://localhost:3001/api/health (API server)
3. **Enable hot-reload in development** with `docker-compose.dev.yml`
4. **Read package READMEs** for detailed component documentation

## 🤝 Getting Help

- 📖 Check the [documentation](README.md)
- 🐛 [Report an issue](https://github.com/tryquantize/website/issues)
- 💬 Ask questions in discussions

## ✨ What's Next?

1. ⭐ Star the repository
2. 🔧 Make your first contribution
3. 📱 Deploy to production
4. 🎨 Customize for your needs

Happy coding! 🚀
