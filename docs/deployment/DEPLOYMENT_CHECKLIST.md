# Local AI Service Setup Checklist

## ✅ What's Already Done

- [x] AI service code is ready (`apps/ai-service/` directory)
- [x] Backend configured to use local AI service
- [x] Frontend configuration prepared for local development
- [x] Development scripts created

## 🔧 Local Setup Steps

### Step 1: Get API Keys
- [ ] Get OpenRouter API key from https://openrouter.ai/
- [ ] Get Exa API key from https://exa.ai/

### Step 2: Set Up Python Environment
```bash
cd apps/ai-service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
Create `.env.local` in the root directory:
```bash
OPENROUTER_API_KEY=your_openrouter_key_here
EXA_API_KEY=your_exa_key_here
AI_SERVICE_URL=http://localhost:5002
```

### Step 4: Test AI Service
```bash
cd apps/ai-service
source venv/bin/activate
python test_enrichment.py
```

### Step 5: Launch Application
```bash
# From root directory
yarn launch
```

### Step 6: Verify Integration
- [ ] Test search functionality on http://localhost:3001
- [ ] Verify AI responses are working
- [ ] Check AI service health at http://localhost:5002/health

## 🚀 Available Services

- **Main Website**: http://localhost:3001
- **AI Service**: http://localhost:5002
- **AI Health Check**: http://localhost:5002/health

## 🔍 Troubleshooting

1. **AI service not starting**: Check Python environment and dependencies
2. **Service not responding**: Verify ports 3001 and 5002 are available
3. **API errors**: Check API keys in environment variables
4. **Search not working**: Check AI service is running on port 5002

## 📊 Expected Results

After successful setup:
- AI-powered search responses
- Company/product recommendations
- Smart suggestions
- Fallback to traditional search if AI fails
- All services running locally