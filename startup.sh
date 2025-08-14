#!/bin/bash

echo "🚀 Quantize Website Startup Script"
echo "=================================="

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5002 | xargs kill -9 2>/dev/null || true

# Clean build artifacts
echo "🧹 Running cleanup..."
node cleanup.js

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    yarn install
fi

# Check if AI service virtual environment exists
if [ ! -d "ai_service/venv" ]; then
    echo "🐍 Setting up Python virtual environment..."
    cd ai_service
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Start AI service
echo "🤖 Starting AI service on port 5002..."
cd ai_service
nohup bash -c 'source venv/bin/activate && python app.py' > ../ai_service.log 2>&1 &
AI_PID=$!
cd ..

# Wait for AI service to start
sleep 3

# Start main server
echo "🌐 Starting main server on port 3001..."
nohup bash -c 'export NODE_ENV=development && yarn tsx server/index.ts' > server.log 2>&1 &
SERVER_PID=$!

# Wait a moment for server to start
sleep 5

# Check if services are running
echo "🔍 Checking services..."
if lsof -i :5002 > /dev/null 2>&1; then
    echo "✅ AI service is running on port 5002"
else
    echo "❌ AI service failed to start"
fi

if lsof -i :3001 > /dev/null 2>&1; then
    echo "✅ Main server is running on port 3001"
else
    echo "❌ Main server failed to start"
fi

echo ""
echo "🌐 Website: http://localhost:3001"
echo "🤖 AI Service: http://localhost:5002"
echo ""
echo "📋 To stop services:"
echo "   lsof -ti:3001 | xargs kill -9"
echo "   lsof -ti:5002 | xargs kill -9"
echo ""
echo "📋 To view logs:"
echo "   tail -f server.log"
echo "   tail -f ai_service.log"