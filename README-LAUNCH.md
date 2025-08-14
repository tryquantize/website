# Quantize Website Launch Guide

## Quick Start

To launch the website, simply run:

```bash
./startup.sh
```

This script will:
- Clean up any existing processes
- Install dependencies if needed
- Set up the Python virtual environment if needed
- Start both the AI service and main server
- Show you the status of both services

## Manual Launch Options

### Option 1: Using the startup script (Recommended)
```bash
./startup.sh
```

### Option 2: Using the launch script
```bash
./launch.sh
```

### Option 3: Using yarn scripts
```bash
yarn start-all
```

### Option 4: Manual step-by-step
```bash
# Clean up
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