import requests
from bs4 import BeautifulSoup
import json
import os
from typing import Dict, List, Any
import logging
import time

logger = logging.getLogger(__name__)

class WebScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.cache_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'scraped_cache')
        os.makedirs(self.cache_dir, exist_ok=True)
    
    def scrape_company_links(self, company_name: str, links_data: Dict[str, List[str]]) -> Dict[str, str]:
        """Scrape all links for a company and return structured content"""
        scraped_content = {
            'official_pages': '',
            'reviews': '',
            'documentation': '',
            'scraped_at': time.time()
        }
        
        for category, urls in links_data.items():
            if not isinstance(urls, list):
                continue
                
            category_content = []
            
            for url in urls:
                try:
                    content = self._scrape_single_url(url)
                    if content:
                        category_content.append(f"Source: {url}\n{content}\n")
                        logger.info(f"Successfully scraped: {url}")
                    
                    # Rate limiting
                    time.sleep(1)
                    
                except Exception as e:
                    logger.error(f"Failed to scrape {url}: {e}")
                    continue
            
            scraped_content[category] = '\n'.join(category_content)
        
        # Cache the scraped content
        self._cache_scraped_content(company_name, scraped_content)
        
        return scraped_content
    
    def _scrape_single_url(self, url: str) -> str:
        """Scrape content from a single URL"""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove unwanted elements
            for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside']):
                element.decompose()
            
            # Extract main content
            main_content = soup.find('main') or soup.find('article') or soup.find('div', class_='content') or soup.body
            
            if main_content:
                text = main_content.get_text(separator=' ', strip=True)
            else:
                text = soup.get_text(separator=' ', strip=True)
            
            # Clean up text
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            clean_text = ' '.join(lines)
            
            # Limit content length
            return clean_text[:3000] if len(clean_text) > 3000 else clean_text
            
        except Exception as e:
            logger.error(f"Error scraping {url}: {e}")
            return ""
    
    def _cache_scraped_content(self, company_name: str, content: Dict[str, Any]):
        """Cache scraped content to disk"""
        try:
            cache_file = os.path.join(self.cache_dir, f"{company_name}_scraped.json")
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(content, f, indent=2, ensure_ascii=False)
            logger.debug(f"Cached scraped content for {company_name}")
        except Exception as e:
            logger.error(f"Failed to cache content for {company_name}: {e}")
    
    def load_cached_content(self, company_name: str) -> Dict[str, Any]:
        """Load cached scraped content"""
        try:
            cache_file = os.path.join(self.cache_dir, f"{company_name}_scraped.json")
            if os.path.exists(cache_file):
                with open(cache_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load cached content for {company_name}: {e}")
        
        return {}
    
    def is_cache_valid(self, company_name: str, max_age_hours: int = 24) -> bool:
        """Check if cached content is still valid"""
        cached_content = self.load_cached_content(company_name)
        
        if not cached_content or 'scraped_at' not in cached_content:
            return False
        
        scraped_at = cached_content['scraped_at']
        max_age_seconds = max_age_hours * 3600
        
        return (time.time() - scraped_at) < max_age_seconds
    
    def scrape_all_companies(self, force_refresh: bool = False):
        """Scrape all companies that have links.json files"""
        companies_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'companies')
        
        if not os.path.exists(companies_dir):
            logger.warning("Companies directory not found")
            return
        
        for company_folder in os.listdir(companies_dir):
            company_path = os.path.join(companies_dir, company_folder)
            links_file = os.path.join(company_path, 'links.json')
            
            if not os.path.isdir(company_path) or not os.path.exists(links_file):
                continue
            
            # Skip if cache is valid and not forcing refresh
            if not force_refresh and self.is_cache_valid(company_folder):
                logger.info(f"Using cached content for {company_folder}")
                continue
            
            try:
                with open(links_file, 'r', encoding='utf-8') as f:
                    links_data = json.load(f)
                
                logger.info(f"Scraping {company_folder}...")
                self.scrape_company_links(company_folder, links_data)
                
                # Rate limiting between companies
                time.sleep(2)
                
            except Exception as e:
                logger.error(f"Failed to process {company_folder}: {e}")
    
    def get_scraped_content_for_company(self, company_name: str) -> str:
        """Get all scraped content for a company as a single string"""
        cached_content = self.load_cached_content(company_name)
        
        if not cached_content:
            return ""
        
        all_content = []
        
        for category, content in cached_content.items():
            if category != 'scraped_at' and content:
                all_content.append(f"{category.upper()}:\n{content}\n")
        
        return '\n'.join(all_content)
    
    def clear_cache(self, company_name: str = None):
        """Clear cached content for a specific company or all companies"""
        try:
            if company_name:
                cache_file = os.path.join(self.cache_dir, f"{company_name}_scraped.json")
                if os.path.exists(cache_file):
                    os.remove(cache_file)
                    logger.info(f"Cleared cache for {company_name}")
            else:
                for file in os.listdir(self.cache_dir):
                    if file.endswith('_scraped.json'):
                        os.remove(os.path.join(self.cache_dir, file))
                logger.info("Cleared all scraped content cache")
        except Exception as e:
            logger.error(f"Failed to clear cache: {e}")