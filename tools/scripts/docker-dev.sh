#!/bin/bash

echo "🐳 Starting Quantize Website with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Copying from .env.example..."
    cp .env.example .env.local
    echo "📝 Please edit .env.local with your API keys before running again."
    exit 1
fi

# Clean up any existing containers
echo "🧹 Cleaning up existing containers..."
docker compose down --remove-orphans

# Build and start services
echo "🏗️  Building and starting services..."
docker compose up --build

echo "✅ Services started!"
echo "🌐 Main website: http://localhost:3001"
echo "🤖 AI service: http://localhost:5002"
echo ""
echo "Press Ctrl+C to stop all services"