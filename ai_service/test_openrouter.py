#!/usr/bin/env python3
"""
Test script for OpenRouter API
"""

import requests
import os

def test_openrouter_api():
    """Test the OpenRouter API"""
    
    api_key = "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"
    
    if not api_key:
        print("❌ OPENROUTER_API_KEY not set!")
        return False
    
    print("✅ OPENROUTER_API_KEY found")
    
    try:
        # Test API with a simple request
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "openai/gpt-3.5-turbo",
            "messages": [
                {"role": "user", "content": "Hello, this is a test. Please respond with 'API working'."}
            ],
            "max_tokens": 10
        }
        
        print("🔍 Testing OpenRouter API...")
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if "choices" in result and len(result["choices"]) > 0:
                message = result["choices"][0]["message"]["content"]
                print(f"✅ OpenRouter API working! Response: {message}")
                return True
            else:
                print(f"❌ Unexpected response format: {result}")
                return False
        else:
            print(f"❌ API request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing OpenRouter API: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 Testing OpenRouter API")
    print("=" * 30)
    
    success = test_openrouter_api()
    
    if success:
        print("\n✅ OpenRouter API is working correctly!")
    else:
        print("\n❌ OpenRouter API test failed!")