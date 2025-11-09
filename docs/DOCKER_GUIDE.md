# 🐳 Docker Guide for Quantize Website

This guide covers how to run the Quantize Website using Docker for both development and production environments. The project features a comprehensive Docker setup with multi-service architecture including React frontend, Express API, Python AI service with RAG capabilities, and Firebase integration.

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- `.env.local` file with your API keys

## 🚀 Quick Start

### Development Mode
```bash
# Using yarn script (recommended)
yarn launch
# or
yarn docker:dev

# Or directly with Docker Compose
docker-compose up --build
```

### Production Mode
```bash
# Using yarn script (recommended)
yarn docker:prod

# Or directly with Docker Compose
docker-compose -f docker-compose.prod.yml up --build -d
```

## 📁 Docker Files Overview

- `docker-compose.yml` - Development configuration
- `docker-compose.prod.yml` - Production configuration
- `Dockerfile` - Main Node.js application
- `apps/ai-service/Dockerfile` - Python AI service
- `.dockerignore` - Files to exclude from build context
- `nginx.conf` - Nginx reverse proxy configuration

## 🛠️ Available Commands

```bash
# Development
yarn launch              # Start development environment (recommended)
yarn docker:dev          # Alternative development start
yarn docker:build        # Build all containers
yarn docker:up           # Start containers (without rebuild)
yarn docker:down         # Stop and remove containers
yarn docker:logs         # View logs from all services
yarn clean               # Stop containers and clean up

# Production
yarn docker:prod         # Start production environment

# Direct Docker Compose commands
docker-compose up --build              # Development
docker-compose down --remove-orphans   # Stop and cleanup
docker-compose logs -f                 # Follow logs
docker-compose ps                      # Check service status
```

## 🏗️ Architecture

### Services

1. **web** (Port 3001)
   - Node.js application with Express API
   - Serves React frontend with Vite
   - Handles Firebase authentication
   - API proxy to AI service
   - Real-time streaming support

2. **ai-service** (Port 5002)
   - Python Flask application
   - Advanced RAG system with 18+ companies
   - Dual-mode search (RAG + Web)
   - OpenRouter, Exa, and Firecrawl integration
   - Health checks and comprehensive logging

3. **nginx** (Port 80, Production only)
   - Reverse proxy for load balancing
   - SSL termination ready
   - Static file serving
   - Gzip compression

### Networks
- `quantize-network` - Internal Docker network for service communication

## 🔧 Configuration

### Environment Variables

Create `.env.local` with:
```bash
# AI Service APIs (Required)
OPENROUTER_API_KEY=your_openrouter_key
EXA_API_KEY=your_exa_key
FIRECRAWL_API_KEY=your_firecrawl_key
AI_SERVICE_URL=http://localhost:5002

# Firebase Authentication (Optional but recommended)
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Development Settings
NODE_ENV=development
PORT=3001
```

### Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Hot Reload | ✅ Volume mounts | ❌ Built images |
| Build Optimization | ❌ Dev build | ✅ Multi-stage build |
| Nginx Proxy | ❌ Direct access | ✅ Reverse proxy |
| Container Restart | Manual | ✅ Auto-restart |
| Health Checks | ✅ Basic | ✅ Enhanced |
| RAG Data | ✅ Volume mounted | ✅ Copied to image |
| Firebase Auth | ✅ Development | ✅ Production |
| API Integration | ✅ All APIs | ✅ All APIs |

## 🔍 Monitoring & Debugging

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web
docker-compose logs -f ai-service

# Production
docker-compose -f docker-compose.prod.yml logs -f
```

### Health Checks
```bash
# Check AI service health (comprehensive)
curl http://localhost:5002/health

# Check web service
curl http://localhost:3001

# Docker health status
docker-compose ps

# Check specific service logs
docker-compose logs ai-service
docker-compose logs web

# Test RAG search
curl -X POST http://localhost:5002/search \
  -H "Content-Type: application/json" \
  -d '{"query": "AI tools", "webSearchEnabled": false}'

# Test web search
curl -X POST http://localhost:5002/search \
  -H "Content-Type: application/json" \
  -d '{"query": "latest AI tools", "webSearchEnabled": true}'
```

### Container Shell Access
```bash
# Access web container
docker-compose exec web sh

# Access AI service container
docker-compose exec ai-service bash
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   docker-compose down
   # Kill processes on ports 3001, 5002
   lsof -ti:3001,5002 | xargs kill -9
   ```

2. **Build Failures**
   ```bash
   # Clean Docker cache
   docker system prune -a
   docker-compose build --no-cache
   ```

3. **Environment Variables Not Loading**
   - Ensure `.env.local` exists in project root
   - Check file permissions
   - Restart containers after changes

4. **AI Service Connection Issues**
   - Verify `AI_SERVICE_URL=http://ai-service:5002` in web service
   - Check network connectivity: `docker-compose exec web ping ai-service`
   - Test AI service health: `curl http://localhost:5002/health`
   - Check RAG data loading: Look for "RAG companies loaded" in health response

5. **RAG Data Issues**
   - Ensure company data exists: `ls apps/ai-service/src/rag/companies/`
   - Check file permissions: `chmod -R 644 apps/ai-service/src/rag/companies/`
   - Verify data loading in logs: `docker-compose logs ai-service | grep "companies loaded"`

6. **Firebase Authentication Issues**
   - Check all `VITE_FIREBASE_*` variables are set
   - Verify authorized domains in Firebase Console
   - Test authentication in browser console

### Performance Optimization

1. **Faster Builds**
   ```bash
   # Use BuildKit for faster builds
   export DOCKER_BUILDKIT=1
   docker-compose build
   ```

2. **Volume Optimization**
   ```bash
   # Clean unused volumes
   docker volume prune
   ```

## 🔒 Security Considerations

### Development
- API keys in `.env.local` (not committed)
- Local network isolation
- Non-root user in containers

### Production
- Environment-specific secrets
- Nginx security headers
- Container resource limits
- Regular security updates

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale web service
docker-compose up --scale web=3

# With load balancer
docker-compose -f docker-compose.prod.yml up --scale web=3
```

### Resource Limits
Add to docker-compose.yml:
```yaml
services:
  web:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

## 🚀 Deployment

### Local Production Test
```bash
yarn docker:prod
# Test at http://localhost
```

### Cloud Deployment
1. Push images to registry
2. Use production compose file
3. Configure external load balancer
4. Set up monitoring and logging

## 📊 Monitoring

### Container Stats
```bash
# Real-time container resource usage
docker stats

# Specific service stats
docker stats quantize-web quantize-ai-service
```

### Resource Usage
```bash
# Docker system resource usage
docker system df

# Clean up unused resources
docker system prune -a
```

### Container Inspection
```bash
# Process inspection
docker-compose exec web ps aux
docker-compose exec ai-service ps aux

# Container details
docker inspect quantize-web
docker inspect quantize-ai-service

# Network inspection
docker network ls
docker network inspect quantize-network
```

### Performance Testing
```bash
# Test search performance
time curl -s -X POST http://localhost:5002/search \
  -H "Content-Type: application/json" \
  -d '{"query": "AI chatbots", "webSearchEnabled": false}' | jq '.processingTime'

# Load test with multiple requests
for i in {1..10}; do
  curl -s http://localhost:5002/health > /dev/null &
done
wait

# Monitor logs during testing
docker-compose logs -f --tail=50
```

This Docker setup provides a complete containerized environment for the Quantize Website, ensuring consistency across development and production environments.