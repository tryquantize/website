#!/bin/bash

echo "🔧 Setting up Quantize Website for Local Development"
echo "=================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "❌ Yarn is not installed. Please install Yarn first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
yarn install

# Set up Python virtual environment for AI service
echo "🐍 Setting up Python environment for AI service..."
cd apps/ai-service

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Created Python virtual environment"
fi

source venv/bin/activate
pip install -r requirements.txt
echo "✅ Installed Python dependencies"

cd ../..

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# AI Service Configuration (Local Development)
AI_SERVICE_URL=http://localhost:5002

# OpenRouter API Key (get from https://openrouter.ai)
OPENROUTER_API_KEY=your_openrouter_key_here

# Exa API Key (get from https://exa.ai)
EXA_API_KEY=your_exa_key_here

# Development
NODE_ENV=development
PORT=3001
EOF
    echo "✅ Created .env.local file"
    echo "⚠️  Please update .env.local with your actual API keys"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your OpenRouter and Exa API keys"
echo "2. Run 'yarn launch' to start the application"
echo ""
echo "The application will be available at:"
echo "- Main Website: http://localhost:3001"
echo "- AI Service: http://localhost:5002"