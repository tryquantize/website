#!/bin/bash

# Deploy AI Service to Render - Setup Script
# This script helps prepare the AI service for Render deployment

echo "🚀 Preparing AI Service for Render Deployment"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "apps/ai-service/app.py" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure verified"

# Check if render.yaml exists
if [ ! -f "apps/ai-service/render.yaml" ]; then
    echo "❌ Error: render.yaml not found in apps/ai-service/"
    exit 1
fi

echo "✅ Render configuration found"

# Check environment variables
echo ""
echo "📋 Environment Configuration Check:"
echo "-----------------------------------"

if grep -q "AI_SERVICE_URL=https://quantize-ai-service.onrender.com" .env.local; then
    echo "✅ AI_SERVICE_URL configured for Render"
else
    echo "⚠️  AI_SERVICE_URL not configured for Render"
    echo "   Current value: $(grep AI_SERVICE_URL .env.local || echo 'Not found')"
fi

echo ""
echo "🔧 Next Steps:"
echo "1. Go to https://dashboard.render.com"
echo "2. Click 'New' → 'Web Service'"
echo "3. Connect your GitHub repository"
echo "4. Set Root Directory: apps/ai-service"
echo "5. Configure as shown in apps/ai-service/README.md"
echo "6. Add environment variables from GitHub Secrets:"
echo "   - OPENROUTER_API_KEY"
echo "   - FIRECRAWL_API_KEY"
echo "   - FIREBASE_SERVICE_ACCOUNT (JSON string)"
echo "   - USE_FIREBASE=true"
echo "   - FLASK_HOST=0.0.0.0"
echo "   - FLASK_PORT=10000"
echo "   - FLASK_DEBUG=False"
echo ""
echo "📖 Full deployment guide: apps/ai-service/README.md"
echo "🌐 After deployment, test: https://quantize-ai-service.onrender.com/health"