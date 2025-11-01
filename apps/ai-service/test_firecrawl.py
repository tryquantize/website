#!/usr/bin/env python3
"""
Test script for Firecrawl integration
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from services.firecrawl_scraper import FirecrawlWebScraper
from services.company_autofill_firecrawl import CompanyAutoFillFirecrawlService
import json

def test_firecrawl_scraper():
    """Test the Firecrawl scraper directly"""
    print("Testing Firecrawl scraper...")
    
    scraper = FirecrawlWebScraper()
    
    # Test website scraping
    test_url = "https://openai.com"
    print(f"Scraping {test_url}...")
    
    content = scraper.scrape_company_website(test_url)
    print(f"Content length: {len(content)} characters")
    print(f"First 200 chars: {content[:200]}...")
    
    return len(content) > 0

def test_company_autofill():
    """Test the complete company autofill service"""
    print("\nTesting company autofill service...")
    
    service = CompanyAutoFillFirecrawlService()
    
    # Test with a real company
    result = service.auto_fill_company(
        company_name="OpenAI",
        website_url="https://openai.com",
        linkedin_url=""
    )
    
    print(f"Autofill result:")
    print(json.dumps(result, indent=2))
    
    return result.get('success', False)

if __name__ == "__main__":
    print("Firecrawl Integration Test")
    print("=" * 40)
    
    # Check if API key is available
    api_key = os.getenv('FIRECRAWL_API_KEY')
    if not api_key:
        print("⚠️  FIRECRAWL_API_KEY not found in environment variables")
        print("The scraper will fall back to requests-based scraping")
        print()
    else:
        print("✅ FIRECRAWL_API_KEY found")
        print()
    
    try:
        # Test scraper
        scraper_success = test_firecrawl_scraper()
        print(f"Scraper test: {'✅ PASSED' if scraper_success else '❌ FAILED'}")
        
        # Test autofill service
        autofill_success = test_company_autofill()
        print(f"Autofill test: {'✅ PASSED' if autofill_success else '❌ FAILED'}")
        
        if scraper_success and autofill_success:
            print("\n🎉 All tests passed! Firecrawl integration is working.")
        else:
            print("\n⚠️  Some tests failed. Check the logs above.")
            
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()