#!/bin/bash

echo "🐳 Starting Quantize Website in Production Mode..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found. Please create it with production environment variables."
    exit 1
fi

# Clean up any existing containers
echo "🧹 Cleaning up existing containers..."
docker compose -f docker-compose.prod.yml down --remove-orphans

# Build and start services in production mode
echo "🏗️  Building and starting production services..."
docker compose -f docker-compose.prod.yml up --build -d

echo "✅ Production services started!"
echo "🌐 Website: http://localhost (via Nginx)"
echo "🌐 Direct access: http://localhost:3001"
echo "🤖 AI service: http://localhost:5002"
echo ""
echo "Use 'docker-compose -f docker-compose.prod.yml logs -f' to view logs"
echo "Use 'docker-compose -f docker-compose.prod.yml down' to stop services"