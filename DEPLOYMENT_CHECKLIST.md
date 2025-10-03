# AI Service Deployment Checklist

## ✅ What's Already Done

- [x] AI service code is ready (`ai_service/` directory)
- [x] Railway deployment files created
- [x] Backend updated to use Railway AI service URL
- [x] Frontend configuration prepared
- [x] Deployment guide created
- [x] Test script created

## 🔧 What You Need to Do

### Step 1: Get API Keys
- [ ] Get OpenRouter API key from https://openrouter.ai/
- [ ] Get Exa API key from https://exa.ai/

### Step 2: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 3: Test Locally (Optional)
```bash
cd ai_service
# Set your API keys in .env file first
python test_local.py
```

### Step 4: Deploy to Railway
```bash
cd ai_service
railway login
railway init
# Set environment variables:
railway variables set OPENROUTER_API_KEY=your_key_here
railway variables set EXA_API_KEY=your_key_here
railway variables set FLASK_DEBUG=False
railway up
```

### Step 5: Get Railway URL
```bash
railway status
# Copy the domain URL (e.g., https://quantize-ai-service-production.up.railway.app)
```

### Step 6: Update Backend Environment
Set this environment variable in your main app deployment:
```
AI_SERVICE_URL=https://your-railway-url.railway.app
```

### Step 7: Test Integration
- [ ] Test search functionality on your website
- [ ] Verify AI responses are working
- [ ] Check fallback to traditional search if AI fails

## 🚀 Files Created for Deployment

- `ai_service/railway.json` - Railway configuration
- `ai_service/Procfile` - Process definition
- `ai_service/runtime.txt` - Python version
- `ai_service/deploy.sh` - Deployment script
- `ai_service/test_local.py` - Local testing script
- `RAILWAY_DEPLOYMENT_GUIDE.md` - Detailed guide
- `client/src/config/ai-service.ts` - Frontend config

## 🔍 Troubleshooting

1. **Deployment fails**: Check `railway logs`
2. **Service not responding**: Verify environment variables
3. **API errors**: Check API keys and credits
4. **Search not working**: Check AI_SERVICE_URL in main app

## 📊 Expected Results

After successful deployment:
- AI-powered search responses
- Company/product recommendations
- Smart suggestions
- Fallback to traditional search if AI fails
- No impact on existing functionality