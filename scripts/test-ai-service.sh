#!/bin/bash

# Test AI Service Deployment
# This script tests both local and production AI service endpoints

echo "🧪 Testing AI Service Endpoints"
echo "==============================="

# Test production endpoint
echo ""
echo "🌐 Testing Production (Render):"
echo "URL: https://quantize-ai-service.onrender.com/health"
echo "Response:"
curl -s -w "\nStatus: %{http_code}\n" https://quantize-ai-service.onrender.com/health || echo "❌ Production endpoint failed"

echo ""
echo "---"

# Test local endpoint (if running)
echo ""
echo "🏠 Testing Local Development:"
echo "URL: http://localhost:5002/health"
echo "Response:"
curl -s -w "\nStatus: %{http_code}\n" http://localhost:5002/health 2>/dev/null || echo "❌ Local endpoint not available (this is normal if not running locally)"

echo ""
echo "---"

# Test search endpoint
echo ""
echo "🔍 Testing Search Endpoint (Production):"
echo "URL: https://quantize-ai-service.onrender.com/test"
echo "Response:"
curl -s -w "\nStatus: %{http_code}\n" https://quantize-ai-service.onrender.com/test || echo "❌ Search test failed"

echo ""
echo "✅ Test completed!"
echo ""
echo "💡 If production tests fail:"
echo "   1. Check if the service is deployed on Render"
echo "   2. Verify environment variables are set"
echo "   3. Check Render logs for errors"