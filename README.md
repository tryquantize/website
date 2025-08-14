# Quantize Website Launch Guide

## Quick Start

To launch the website, simply run:

```bash
./launch.sh
```

This script will:
- Clean up any existing processes on ports 3001 and 5002
- Run cleanup script to remove build artifacts
- Start the AI service in background
- Start the main development server
- Display URLs for both services

## Manual Launch Options

### Option 1: Using the launch script (Recommended)
```bash
./launch.sh
```

### Option 2: Using yarn dev command
```bash
yarn dev
```

### Option 3: Manual step-by-step
```bash
# Clean up existing processes
lsof -ti:3001 | xargs kill -9
lsof -ti:5002 | xargs kill -9

# Run cleanup
node cleanup.js

# Start AI service
cd ai_service
source venv/bin/activate
python app.py &
cd ..

# Start main server
export NODE_ENV=development && yarn tsx server/index.ts
```

## Accessing the Website

- **Main Website**: http://localhost:3001
- **AI Service**: http://localhost:5002

## Stopping Services

Press `Ctrl+C` in the terminal where you ran `./launch.sh`, or manually kill processes:

```bash
# Kill both services
lsof -ti:3001 | xargs kill -9
lsof -ti:5002 | xargs kill -9
```

## Viewing Logs

```bash
# Main server logs
tail -f server.log

# AI service logs
tail -f ai_service.log
```

## Troubleshooting

1. **Port already in use**: The startup script automatically kills existing processes
2. **Dependencies missing**: Run `yarn setup` to install all dependencies
3. **Python environment issues**: Delete `ai_service/venv` and run the startup script again
4. **Logo not showing**: Ensure files exist in `client/public/` directory

## Logo Files

The logo files should be in `client/public/`:
- `quantizenobg.png` - Main logo
- `applogo.png` - App logo
- `forest.png` - Background image

These are automatically served by the development server.