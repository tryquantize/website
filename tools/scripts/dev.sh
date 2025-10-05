#!/bin/bash

echo "🚀 Launching Quantize Website..."

# Kill any existing processes on the ports we need
echo "🧹 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5002 | xargs kill -9 2>/dev/null || true

# Clean up build artifacts
echo "🧹 Running cleanup..."
node tools/scripts/cleanup.js

# Start AI service in background
echo "🤖 Starting AI service on port 5002..."
cd apps/ai-service
source venv/bin/activate
export OPENROUTER_API_KEY="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"
export EXA_API_KEY="6e2c2a03-9d1a-4724-a293-b629720fe8fe"
python app.py &
AI_PID=$!
cd ../..

# Wait a moment for AI service to start
sleep 3

# Start main server
echo "🌐 Starting main server on port 3001..."
export NODE_ENV=development && yarn tsx apps/api/index.ts &
SERVER_PID=$!

echo "✅ Services started!"
echo "🌐 Main website: http://localhost:3001"
echo "🤖 AI service: http://localhost:5002"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $AI_PID 2>/dev/null || true
    kill $SERVER_PID 2>/dev/null || true
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait