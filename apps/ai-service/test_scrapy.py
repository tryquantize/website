#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from services.scrapy_scraper import ScrapyWebScraper

def test_scrapy_scraping():
    print("Testing Scrapy scraping...")
    
    scraper = ScrapyWebScraper()
    
    # Test with a simple website
    test_urls = [
        "https://openai.com",
        "https://anthropic.com"
    ]
    
    print(f"Scraping URLs: {test_urls}")
    
    try:
        results = scraper.scrape_urls(test_urls)
        
        print(f"\nResults received: {len(results)} URLs")
        
        for url, data in results.items():
            print(f"\n--- {url} ---")
            print(f"Status: {data.get('status', 'Unknown')}")
            print(f"Title: {data.get('title', 'No title')[:100]}...")
            print(f"Text length: {len(data.get('text', ''))}")
            print(f"Text preview: {data.get('text', '')[:200]}...")
            
            if data.get('error'):
                print(f"Error: {data['error']}")
        
        # Test company website scraping
        print("\n" + "="*50)
        print("Testing company website scraping...")
        
        website_content = scraper.scrape_company_website("https://openai.com")
        print(f"Website content length: {len(website_content)}")
        print(f"Content preview: {website_content[:300]}...")
        
        return len(results) > 0
        
    except Exception as e:
        print(f"Error during scraping: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_scrapy_scraping()
    print(f"\nTest {'PASSED' if success else 'FAILED'}")