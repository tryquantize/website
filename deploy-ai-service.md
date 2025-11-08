# Deploy AI Service to Render

## Quick Deployment Guide

### 1. Render Setup
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Set **Root Directory**: `apps/ai-service`

### 2. Service Configuration
```
Name: quantize-ai-service
Environment: Python 3
Build Command: pip install -r requirements.txt
Start Command: python app.py
```

### 3. Environment Variables
Add these in Render dashboard:
```
OPENROUTER_API_KEY=<your_key_from_github_secrets>
FIRECRAWL_API_KEY=<your_key_from_github_secrets>
FIREBASE_SERVICE_ACCOUNT=<your_firebase_service_account_json>
USE_FIREBASE=true
FLASK_HOST=0.0.0.0
FLASK_PORT=10000
FLASK_DEBUG=False
```

### 4. Deploy
Click "Create Web Service" - Render will auto-deploy.

### 5. Update Frontend
Your AI service will be available at:
`https://quantize-ai-service.onrender.com`

The frontend is already configured to use this URL.

### 6. Test Deployment
```bash
curl https://quantize-ai-service.onrender.com/health
```

## Files Modified
- ✅ `apps/ai-service/render.yaml` - Render config
- ✅ `apps/ai-service/README.md` - Deployment docs
- ✅ `apps/ai-service/src/config/config.py` - Environment variables
- ✅ `apps/ai-service/app.py` - CORS for production
- ✅ `.env.example` - Updated AI service URL
- ✅ `.env.local` - Updated AI service URL

## Next Steps
1. Deploy to Render using the steps above
2. Test the health endpoint
3. Test a search request from your frontend
4. Your website will be fully functional with cloud-hosted AI service!