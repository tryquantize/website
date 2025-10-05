#!/bin/bash

echo "🚀 Deploying AI Service to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway login

# Create new project or link existing one
echo "📦 Setting up Railway project..."
railway link

# Set environment variables
echo "🔧 Setting up environment variables..."
echo "Please set your API keys in Railway dashboard:"
echo "- OPENROUTER_API_KEY"
echo "- EXA_API_KEY"

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Your AI service will be available at the Railway-provided URL"