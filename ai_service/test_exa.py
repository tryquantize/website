#!/usr/bin/env python3
"""
Test script for Exa integration
Run this after setting your EXA_API_KEY to verify the setup works
"""

import os
from exa_search import ExaSearchService

def test_exa_integration():
    """Test the Exa search integration"""
    
    # Check if API key is set
    api_key = os.getenv("EXA_API_KEY")
    if not api_key or api_key == "YOUR_EXA_API_KEY_HERE":
        print("❌ EXA_API_KEY not set!")
        print("Please set your Exa API key in config.py or as an environment variable")
        return False
    
    print("✅ EXA_API_KEY found")
    
    try:
        # Initialize Exa search service
        exa_service = ExaSearchService()
        print("✅ Exa service initialized")
        
        # Test basic search
        print("\n🔍 Testing basic web search...")
        results = exa_service.search_web("AI startups India", num_results=3)
        
        if results.get("success"):
            print(f"✅ Web search successful! Found {len(results.get('results', []))} results")
            print(f"✅ Citations available: {len(results.get('citations', []))}")
            
            # Show first result
            if results.get("results"):
                first_result = results["results"][0]
                print(f"\nFirst result:")
                print(f"  Title: {first_result.get('title', 'N/A')}")
                print(f"  URL: {first_result.get('url', 'N/A')}")
                print(f"  Text: {first_result.get('text', 'N/A')[:100]}...")
        else:
            print(f"❌ Web search failed: {results.get('error', 'Unknown error')}")
            return False
        
        # Test company search
        print("\n🏢 Testing company search...")
        company_results = exa_service.search_for_companies("machine learning")
        
        if company_results.get("success"):
            print(f"✅ Company search successful! Found {len(company_results.get('results', []))} results")
        else:
            print(f"❌ Company search failed: {company_results.get('error', 'Unknown error')}")
        
        print("\n🎉 All tests passed! Exa integration is working correctly.")
        return True
        
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Exa Integration for Quantize")
    print("=" * 50)
    
    success = test_exa_integration()
    
    if success:
        print("\n✅ Setup complete! Your AI system now has internet access with citations.")
        print("🚀 Ready to provide web-grounded responses!")
    else:
        print("\n❌ Setup incomplete. Please check your API key and try again.")