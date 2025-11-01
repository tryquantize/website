import logging
import os
from typing import Dict, Any, List, Optional
from firecrawl import FirecrawlApp
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

class FirecrawlWebScraper:
    def __init__(self):
        self.api_key = os.getenv('FIRECRAWL_API_KEY')
        if not self.api_key:
            logger.warning("FIRECRAWL_API_KEY not found in environment variables")
            self.firecrawl = None
        else:
            self.firecrawl = FirecrawlApp(api_key=self.api_key)
        
        self.timeout = 30
        
    def scrape_company_website(self, website_url: str) -> str:
        """Scrape company website using Firecrawl"""
        if not self.firecrawl:
            logger.warning("Firecrawl not initialized, falling back to requests")
            return self._fallback_scrape_single(website_url)
        
        try:
            logger.info(f"Scraping website with Firecrawl: {website_url}")
            
            # Scrape the main page
            result = self.firecrawl.scrape_url(
                website_url,
                params={
                    'formats': ['markdown', 'html'],
                    'includeTags': ['title', 'meta', 'h1', 'h2', 'h3', 'p', 'div', 'section'],
                    'excludeTags': ['script', 'style', 'nav', 'footer', 'header'],
                    'onlyMainContent': True,
                    'timeout': 15000
                }
            )
            
            if result and 'markdown' in result:
                content = result['markdown']
                if content and len(content.strip()) > 50:
                    logger.info(f"Successfully scraped website content ({len(content)} chars)")
                    return content[:5000]  # Limit content length
            
            # Fallback to HTML content if markdown is not available
            if result and 'html' in result:
                soup = BeautifulSoup(result['html'], 'html.parser')
                text = soup.get_text()
                lines = (line.strip() for line in text.splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                content = ' '.join(chunk for chunk in chunks if chunk)
                if content and len(content.strip()) > 50:
                    return content[:5000]
            
            logger.warning("Firecrawl returned empty or insufficient content")
            return self._fallback_scrape_single(website_url)
            
        except Exception as e:
            logger.error(f"Firecrawl scraping failed for {website_url}: {str(e)}")
            return self._fallback_scrape_single(website_url)
    
    def scrape_linkedin_company(self, linkedin_url: str) -> str:
        """Scrape LinkedIn company page using Firecrawl"""
        if not self.firecrawl:
            logger.warning("Firecrawl not initialized, falling back to requests")
            return self._fallback_scrape_single(linkedin_url)
        
        try:
            logger.info(f"Scraping LinkedIn with Firecrawl: {linkedin_url}")
            
            result = self.firecrawl.scrape_url(
                linkedin_url,
                params={
                    'formats': ['markdown'],
                    'includeTags': ['h1', 'h2', 'p', 'div', 'section', 'span'],
                    'excludeTags': ['script', 'style', 'nav', 'footer', 'header'],
                    'onlyMainContent': True,
                    'timeout': 15000,
                    'waitFor': 2000  # Wait for dynamic content
                }
            )
            
            if result and 'markdown' in result:
                content = result['markdown']
                if content and len(content.strip()) > 50:
                    logger.info(f"Successfully scraped LinkedIn content ({len(content)} chars)")
                    return content[:3000]  # Limit content length
            
            logger.warning("Firecrawl returned empty LinkedIn content")
            return self._fallback_scrape_single(linkedin_url)
            
        except Exception as e:
            logger.error(f"Firecrawl LinkedIn scraping failed: {str(e)}")
            return self._fallback_scrape_single(linkedin_url)
    
    def scrape_urls(self, urls: List[str]) -> Dict[str, Any]:
        """Scrape multiple URLs using Firecrawl"""
        results = {}
        
        for url in urls:
            try:
                if 'linkedin.com' in url:
                    content = self.scrape_linkedin_company(url)
                else:
                    content = self.scrape_company_website(url)
                
                results[url] = {
                    'url': url,
                    'text': content,
                    'status': 200 if content else 0
                }
                
            except Exception as e:
                logger.error(f"Error scraping {url}: {str(e)}")
                results[url] = {
                    'url': url,
                    'text': '',
                    'status': 0,
                    'error': str(e)
                }
        
        return results
    
    def _fallback_scrape_single(self, url: str) -> str:
        """Fallback to simple requests if Firecrawl fails"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (compatible; CompanyBot/1.0)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Remove script and style elements
                for script in soup(["script", "style"]):
                    script.decompose()
                
                # Get text
                text = soup.get_text()
                lines = (line.strip() for line in text.splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                content = ' '.join(chunk for chunk in chunks if chunk)
                
                return content[:3000] if content else ""
                
        except Exception as e:
            logger.warning(f"Fallback scraping failed for {url}: {str(e)}")
            return ""