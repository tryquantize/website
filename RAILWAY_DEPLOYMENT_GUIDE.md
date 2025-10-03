# Railway AI Service Deployment Guide

## Prerequisites

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Get API Keys:**
   - OpenRouter API Key from https://openrouter.ai/
   - Exa API Key from https://exa.ai/

## Deployment Steps

### Step 1: Login to Railway
```bash
railway login
```

### Step 2: Navigate to AI Service Directory
```bash
cd ai_service
```

### Step 3: Initialize Railway Project
```bash
railway init
```
- Choose "Create new project"
- Give it a name like "quantize-ai-service"

### Step 4: Set Environment Variables
```bash
railway variables set OPENROUTER_API_KEY=your_openrouter_key_here
railway variables set EXA_API_KEY=your_exa_key_here
railway variables set FLASK_DEBUG=False
```

### Step 5: Deploy
```bash
railway up
```

### Step 6: Get Your Service URL
```bash
railway status
```
Copy the domain URL (something like: https://quantize-ai-service-production.up.railway.app)

## After Deployment

1. Test your service:
   ```bash
   curl https://your-railway-url.railway.app/health
   ```

2. Update the frontend to use your Railway URL instead of localhost:5002

## Files Created for Railway

- `railway.json` - Railway configuration
- `Procfile` - Process definition
- `runtime.txt` - Python version
- `deploy.sh` - Deployment script

## Environment Variables Needed

- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `EXA_API_KEY` - Your Exa search API key
- `FLASK_DEBUG` - Set to False for production
- `PORT` - Automatically set by Railway

## Troubleshooting

1. **Deployment fails:** Check logs with `railway logs`
2. **Service not responding:** Verify environment variables are set
3. **API errors:** Check your API keys are valid and have credits

## Next Steps

After successful deployment:
1. Update frontend configuration to use Railway URL
2. Test the AI functionality
3. Monitor usage and costs