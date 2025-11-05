# 🐳 Docker Guide for Quantize Website

This guide covers how to run the Quantize Website using Docker for both development and production environments.

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- `.env.local` file with your API keys

## 🚀 Quick Start

### Development Mode
```bash
# Using yarn script (recommended)
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
yarn docker:dev          # Start development environment
yarn docker:build        # Build all containers
yarn docker:up           # Start containers (without rebuild)
yarn docker:down         # Stop and remove containers
yarn docker:logs         # View logs from all services

# Production
yarn docker:prod         # Start production environment

# Direct Docker Compose commands
docker-compose up --build              # Development
docker-compose -f docker-compose.prod.yml up -d  # Production
```

## 🏗️ Architecture

### Services

1. **web** (Port 3001)
   - Node.js application with Express API
   - Serves React frontend
   - Handles authentication and API routing

2. **ai-service** (Port 5002)
   - Python Flask application
   - AI-powered search and enrichment
   - Health checks enabled

3. **nginx** (Port 80, Production only)
   - Reverse proxy for load balancing
   - SSL termination ready
   - Static file serving

### Networks
- `quantize-network` - Internal Docker network for service communication

## 🔧 Configuration

### Environment Variables

Create `.env.local` with:
```bash
# AI Service
OPENROUTER_API_KEY=your_openrouter_key
EXA_API_KEY=your_exa_key

# Firebase (optional)
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

### Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Hot Reload | ✅ Volume mounts | ❌ Built images |
| Build Optimization | ❌ Dev build | ✅ Multi-stage build |
| Nginx Proxy | ❌ Direct access | ✅ Reverse proxy |
| Container Restart | Manual | ✅ Auto-restart |
| Health Checks | ✅ Basic | ✅ Enhanced |

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
# Check service health
curl http://localhost:5002/health
curl http://localhost:3001/api/health

# Docker health status
docker-compose ps
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
docker stats
```

### Resource Usage
```bash
docker system df
```

### Container Inspection
```bash
docker-compose exec web ps aux
docker-compose exec ai-service ps aux
```

This Docker setup provides a complete containerized environment for the Quantize Website, ensuring consistency across development and production environments.