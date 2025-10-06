#!/bin/bash

# Update Railway environment variables for AI service
echo "Updating Railway environment variables..."

# You need to run these commands in Railway CLI or dashboard:
echo "Set these environment variables in Railway dashboard:"
echo "OPENROUTER_API_KEY=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"
echo "EXA_API_KEY=6e2c2a03-9d1a-4724-a293-b629720fe8fe"
echo "FLASK_HOST=0.0.0.0"
echo "PORT=5002"

# If you have Railway CLI installed, uncomment these:
# railway variables set OPENROUTER_API_KEY=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
# railway variables set EXA_API_KEY=6e2c2a03-9d1a-4724-a293-b629720fe8fe
# railway variables set FLASK_HOST=0.0.0.0
# railway variables set PORT=5002

echo "After setting variables, redeploy the service in Railway dashboard"