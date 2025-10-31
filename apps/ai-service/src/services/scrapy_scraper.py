import scrapy
import requests
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
from twisted.internet import reactor
from multiprocessing import Process, Queue
import logging
from typing import Dict, Any, List
from urllib.parse import urljoin, urlparse
import time

logger = logging.getLogger(__name__)

class CompanySpider(scrapy.Spider):
    name = 'company_spider'
    
    def __init__(self, urls=None, result_queue=None, *args, **kwargs):
        super(CompanySpider, self).__init__(*args, **kwargs)
        self.start_urls = urls or []
        self.result_queue = result_queue
        self.scraped_data = {}
        
    def parse(self, response):
        url = response.url
        
        # Extract text content
        text_content = self.extract_text_content(response)
        
        # Store result
        self.scraped_data[url] = {
            'url': url,
            'title': response.css('title::text').get() or '',
            'text': text_content,
            'status': response.status
        }
        
        # For company websites, also try to scrape about/company pages
        if self.is_main_domain(url):
            about_links = self.find_about_links(response)
            for link in about_links[:3]:  # Limit to 3 additional pages
                yield response.follow(link, self.parse_about_page)
    
    def parse_about_page(self, response):
        url = response.url
        text_content = self.extract_text_content(response)
        
        self.scraped_data[url] = {
            'url': url,
            'title': response.css('title::text').get() or '',
            'text': text_content,
            'status': response.status,
            'page_type': 'about'
        }
    
    def extract_text_content(self, response):
        # Remove script and style elements
        text_elements = response.css('p, h1, h2, h3, h4, h5, h6, li, div.content, div.about, section').getall()
        
        # Extract text and clean it
        text_content = []
        for element in text_elements:
            text = scrapy.Selector(text=element).css('::text').getall()
            clean_text = ' '.join([t.strip() for t in text if t.strip()])
            if clean_text and len(clean_text) > 20:
                text_content.append(clean_text)
        
        return ' '.join(text_content)[:3000]  # Limit content length
    
    def find_about_links(self, response):
        # Look for about/company related links
        about_selectors = [
            'a[href*="about"]',
            'a[href*="company"]',
            'a[href*="team"]',
            'a[href*="mission"]',
            'a:contains("About")',
            'a:contains("Company")',
            'a:contains("About Us")'
        ]
        
        links = []
        for selector in about_selectors:
            found_links = response.css(selector + '::attr(href)').getall()
            for link in found_links:
                full_url = urljoin(response.url, link)
                if self.is_valid_about_url(full_url):
                    links.append(full_url)
        
        return list(set(links))  # Remove duplicates
    
    def is_main_domain(self, url):
        return not any(path in url.lower() for path in ['/about', '/company', '/team'])
    
    def is_valid_about_url(self, url):
        parsed = urlparse(url)
        return (parsed.scheme in ['http', 'https'] and 
                not url.endswith(('.pdf', '.jpg', '.png', '.gif')) and
                len(parsed.path) > 1)
    
    def closed(self, reason):
        if self.result_queue:
            self.result_queue.put(self.scraped_data)

class ScrapyWebScraper:
    def __init__(self):
        self.timeout = 30
        
    def scrape_urls(self, urls: List[str]) -> Dict[str, Any]:
        """Scrape multiple URLs using Scrapy"""
        try:
            # Use multiprocessing to avoid reactor issues
            result_queue = Queue()
            process = Process(target=self._run_spider, args=(urls, result_queue))
            process.start()
            process.join(timeout=self.timeout)
            
            if process.is_alive():
                process.terminate()
                process.join()
                logger.warning("Scrapy process timed out")
                return self._fallback_scrape(urls)
            
            if not result_queue.empty():
                return result_queue.get()
            else:
                logger.warning("No results from Scrapy")
                return self._fallback_scrape(urls)
                
        except Exception as e:
            logger.error(f"Scrapy scraping failed: {str(e)}")
            return self._fallback_scrape(urls)
    
    def _run_spider(self, urls: List[str], result_queue: Queue):
        """Run spider in separate process"""
        try:
            settings = get_project_settings()
            settings.update({
                'USER_AGENT': 'Mozilla/5.0 (compatible; CompanyBot/1.0)',
                'ROBOTSTXT_OBEY': False,
                'DOWNLOAD_TIMEOUT': 15,
                'RETRY_TIMES': 1,
                'CONCURRENT_REQUESTS': 2,
                'DOWNLOAD_DELAY': 1,
                'LOG_LEVEL': 'ERROR'
            })
            
            process = CrawlerProcess(settings)
            process.crawl(CompanySpider, urls=urls, result_queue=result_queue)
            process.start()
            
        except Exception as e:
            logger.error(f"Spider process error: {str(e)}")
            result_queue.put({})
    
    def _fallback_scrape(self, urls: List[str]) -> Dict[str, Any]:
        """Fallback to simple requests if Scrapy fails"""
        results = {}
        
        for url in urls:
            try:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (compatible; CompanyBot/1.0)',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
                
                response = requests.get(url, headers=headers, timeout=10)
                if response.status_code == 200:
                    # Simple text extraction
                    from bs4 import BeautifulSoup
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Remove script and style elements
                    for script in soup(["script", "style"]):
                        script.decompose()
                    
                    # Get text
                    text = soup.get_text()
                    lines = (line.strip() for line in text.splitlines())
                    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                    text = ' '.join(chunk for chunk in chunks if chunk)
                    
                    results[url] = {
                        'url': url,
                        'title': soup.title.string if soup.title else '',
                        'text': text[:3000],
                        'status': response.status_code
                    }
                    
            except Exception as e:
                logger.warning(f"Fallback scraping failed for {url}: {str(e)}")
                results[url] = {
                    'url': url,
                    'title': '',
                    'text': '',
                    'status': 0,
                    'error': str(e)
                }
        
        return results
    
