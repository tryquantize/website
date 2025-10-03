#!/usr/bin/env python3
"""
Local AI Service Test Script
Run this to test the AI service locally before deploying to Railway
"""

import requests
import json
import sys

def test_health_endpoint():
    """Test the health endpoint"""
    try:
        response = requests.get('http://localhost:5002/health')
        if response.status_code == 200:
            print("✅ Health endpoint working")
            return True
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
        return False

def test_search_endpoint():
    """Test the search endpoint"""
    try:
        payload = {
            "query": "AI chatbot for customer service",
            "context": {},
            "selectedModel": "GPT-4o Mini",
            "selectedTypes": ["company"]
        }
        
        response = requests.post('http://localhost:5002/search', json=payload)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ Search endpoint working")
                print(f"   - AI Response: {result.get('aiResponse', '')[:100]}...")
                print(f"   - Companies found: {len(result.get('companies', []))}")
                print(f"   - Suggestions: {len(result.get('suggestions', []))}")
                return True
            else:
                print(f"❌ Search failed: {result.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ Search endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Search endpoint error: {e}")
        return False

def main():
    print("🧪 Testing AI Service Locally...")
    print("=" * 50)
    
    # Test health endpoint
    health_ok = test_health_endpoint()
    
    # Test search endpoint
    search_ok = test_search_endpoint()
    
    print("=" * 50)
    if health_ok and search_ok:
        print("🎉 All tests passed! Ready for Railway deployment.")
        sys.exit(0)
    else:
        print("❌ Some tests failed. Check your configuration and API keys.")
        sys.exit(1)

if __name__ == "__main__":
    main()