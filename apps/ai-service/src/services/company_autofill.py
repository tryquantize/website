"""
Company Auto-fill Service
Automatically fills company information from website and LinkedIn
"""
import logging
import requests
from typing import Dict, Any, Optional
import os

logger = logging.getLogger(__name__)

class CompanyAutoFillService:
    def __init__(self):
        self.firecrawl_api_key = os.getenv('FIRECRAWL_API_KEY')
        self.openrouter_api_key = os.getenv('OPENROUTER_API_KEY')
    
    def auto_fill_company(self, company_name: str, website_url: str, linkedin_url: str = '') -> Dict[str, Any]:
        """Auto-fill company details from website and LinkedIn"""
        try:
            logger.info(f"Auto-filling company: {company_name}")
            
            # Scrape website content
            website_content = self._scrape_website(website_url)
            
            # Scrape LinkedIn if provided
            linkedin_content = ''
            if linkedin_url:
                linkedin_content = self._scrape_website(linkedin_url)
            
            # Extract company information using AI
            company_info = self._extract_company_info(company_name, website_content, linkedin_content)
            
            return {
                "success": True,
                "data": company_info,
                "message": "Company information auto-filled successfully"
            }
            
        except Exception as e:
            logger.error(f"Failed to auto-fill company {company_name}: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to auto-fill company information"
            }
    
    def _scrape_website(self, url: str) -> str:
        """Scrape website content using Firecrawl with fallback"""
        try:
            if not self.firecrawl_api_key:
                logger.warning("Firecrawl API key not available, using fallback")
                return self._fallback_scrape(url)
            
            # Skip LinkedIn entirely - use fallback
            is_linkedin = 'linkedin.com' in url.lower()
            if is_linkedin:
                logger.info(f"LinkedIn URL detected, using fallback scraper: {url}")
                return self._fallback_scrape(url)
            
            headers = {
                'Authorization': f'Bearer {self.firecrawl_api_key}',
                'Content-Type': 'application/json'
            }
            
            # Clean URL to prevent protocol errors
            clean_url = self._clean_url(url)
            
            data = {
                'url': clean_url,
                'formats': ['markdown']
                # Remove onlyMainContent and timeout to match console behavior
            }
            
            response = requests.post(
                'https://api.firecrawl.dev/v1/scrape',
                headers=headers,
                json=data,
                timeout=35  # Slightly longer than Firecrawl timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                scraped_content = result.get('data', {}).get('markdown', '')
                logger.info(f"Successfully scraped {clean_url}, content length: {len(scraped_content)}")
                return scraped_content
            elif response.status_code == 408:
                logger.warning(f"Firecrawl timeout for {clean_url}, using fallback")
                return self._fallback_scrape(url)
            else:
                error_text = response.text if hasattr(response, 'text') else 'Unknown error'
                logger.error(f"Firecrawl API error for {clean_url}: {response.status_code} - {error_text}")
                return self._fallback_scrape(url)
                
        except requests.exceptions.Timeout:
            logger.warning(f"Request timeout for {url}, using fallback")
            return self._fallback_scrape(url)
        except Exception as e:
            logger.error(f"Failed to scrape {url}: {e}, using fallback")
            return self._fallback_scrape(url)
    
    def _clean_url(self, url: str) -> str:
        """Clean URL to prevent protocol errors"""
        # Remove invisible Unicode characters
        clean_url = ''.join(char for char in url if ord(char) < 127)
        
        # Ensure proper protocol
        if not clean_url.startswith(('http://', 'https://')):
            clean_url = 'https://' + clean_url.lstrip('/')
        
        return clean_url.strip()
    
    def _fallback_scrape(self, url: str) -> str:
        """Fallback scraping using requests and BeautifulSoup"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
            }
            
            clean_url = self._clean_url(url)
            response = requests.get(clean_url, headers=headers, timeout=15)
            
            if response.status_code == 200:
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Remove script and style elements
                for script in soup(["script", "style", "nav", "footer", "header"]):
                    script.decompose()
                
                # Get text content
                text = soup.get_text()
                lines = (line.strip() for line in text.splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                content = ' '.join(chunk for chunk in chunks if chunk)
                
                logger.info(f"Fallback scraping successful for {clean_url}, content length: {len(content)}")
                return content[:3000]  # Limit content length
            else:
                logger.warning(f"Fallback scraping failed for {clean_url}: {response.status_code}")
                return ""
                
        except Exception as e:
            logger.error(f"Fallback scraping failed for {url}: {e}")
            return ""
    
    def _extract_company_info(self, company_name: str, website_content: str, linkedin_content: str) -> Dict[str, Any]:
        """Extract structured company information using AI"""
        try:
            if not self.openrouter_api_key:
                logger.warning("OpenRouter API key not available")
                return self._create_basic_company_info(company_name)
            
            # Log scraped content for debugging
            logger.info(f"Website content length: {len(website_content)}")
            logger.info(f"LinkedIn content length: {len(linkedin_content)}")
            
            if website_content:
                logger.info(f"Website content preview: {website_content[:200]}...")
            if linkedin_content:
                logger.info(f"LinkedIn content preview: {linkedin_content[:200]}...")
            
            # Prepare content for AI analysis - prioritize LinkedIn for company details
            content = f"Company: {company_name}\n\n"
            
            if linkedin_content:
                content += f"LinkedIn Company Page Content:\n{linkedin_content[:2000]}\n\n"
            
            if website_content:
                content += f"Website Content:\n{website_content[:2000]}"
            
            # Enhanced AI prompt for comprehensive company data extraction
            prompt = f"""
You are an expert at extracting company information from website and LinkedIn content. Extract ALL available company details.

Look for these specific elements:
- TAGLINE: Company slogan, motto, or one-liner (often in hero sections, headers, or "About" sections)
- CATEGORY: Business type, industry, or what the company does (e.g., "AI Marketing Tools", "SaaS Platform", "Fintech")
- USP: Unique selling proposition, differentiator, or competitive advantage
- FOUNDED: Year established, started, or incorporated
- EMPLOYEES: Company size, team size, headcount (ranges like "11-50", "51-200", etc.)
- LOCATION: Headquarters, main office, or primary location
- DESCRIPTION: What the company does, their mission, or business overview

Return a JSON object with these exact fields:

{{
  "companyName": "{company_name}",
  "description": "Clear description of what the company does (2-3 sentences)",
  "category": "Specific business category/industry (e.g., 'AI Marketing Tools', 'SaaS Platform')",
  "tagline": "Company tagline, slogan, or one-liner if found",
  "uspTagline": "Unique selling proposition or differentiator if found",
  "location": "Headquarters location (City, State/Country)",
  "founded": "Founding year (just the year, e.g., '2020')",
  "employees": "Employee count or range (e.g., '11-50', '100+', '500')",
  "website": "Company website URL",
  "features": ["Key feature 1", "Key feature 2", "Key feature 3"],
  "useCases": ["Use case 1", "Use case 2", "Use case 3"],
  "pricing": "Pricing information if available",
  "industriesServed": ["Industry 1", "Industry 2"],
  "pricingModel": ["Subscription", "Usage-based", "Custom"],
  "productsServices": ["Product 1", "Product 2"],
  "topClients": ["Client 1", "Client 2"]
}}

Content to analyze:
{content}

Extract ONLY information explicitly found in the content. If a field is not found, use empty string or empty array.
"""
            
            headers = {
                'Authorization': f'Bearer {self.openrouter_api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'model': 'anthropic/claude-3.5-sonnet',
                'messages': [
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'max_tokens': 1000,
                'temperature': 0.1
            }
            
            response = requests.post(
                'https://openrouter.ai/api/v1/chat/completions',
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result['choices'][0]['message']['content']
                
                # Try to parse JSON from AI response
                import json
                try:
                    # Extract JSON from response (in case there's extra text)
                    start = ai_response.find('{')
                    end = ai_response.rfind('}') + 1
                    if start >= 0 and end > start:
                        json_str = ai_response[start:end]
                        company_info = json.loads(json_str)
                        return company_info
                except json.JSONDecodeError:
                    logger.error("Failed to parse AI response as JSON")
            
            # Fallback to basic info
            return self._create_basic_company_info(company_name)
            
        except Exception as e:
            logger.error(f"Failed to extract company info: {e}")
            return self._create_basic_company_info(company_name)
    
    def _create_basic_company_info(self, company_name: str) -> Dict[str, Any]:
        """Create basic company info structure"""
        return {
            "companyName": company_name,
            "description": f"{company_name} is a company providing innovative solutions.",
            "category": "",
            "tagline": "",
            "uspTagline": "",
            "location": "",
            "founded": "",
            "employees": "",
            "website": "",
            "features": [],
            "useCases": [],
            "pricing": "Contact for pricing",
            "industriesServed": [],
            "pricingModel": [],
            "productsServices": [],
            "topClients": []
        }