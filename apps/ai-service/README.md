# AI Service - Render Deployment

This AI service can be deployed to Render for production use.

## Render Deployment

### Prerequisites
- Render account
- GitHub repository with the AI service code
- API keys (OpenRouter, Firecrawl)

### Deployment Steps

1. **Connect Repository to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the `apps/ai-service` directory as the root

2. **Configure Service**
   - **Name**: `quantize-ai-service`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`

3. **Set Environment Variables**
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key
   FIRECRAWL_API_KEY=your_firecrawl_api_key
   FIREBASE_SERVICE_ACCOUNT=your_firebase_service_account_json
   USE_FIREBASE=true
   FLASK_HOST=0.0.0.0
   FLASK_PORT=10000
   FLASK_DEBUG=False
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy

### Service URL
After deployment, your AI service will be available at:
`https://quantize-ai-service.onrender.com`

### Health Check
Test the deployment:
```bash
curl https://quantize-ai-service.onrender.com/health
```

## Local Development

For local development, use:
```bash
python app.py
```

The service will run on `http://localhost:5002`