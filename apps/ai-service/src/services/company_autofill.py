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
        """Scrape website content using Firecrawl"""
        try:
            if not self.firecrawl_api_key:
                logger.warning("Firecrawl API key not available")
                return ""
            
            headers = {
                'Authorization': f'Bearer {self.firecrawl_api_key}',
                'Content-Type': 'application/json'
            }
            
            # Special handling for LinkedIn URLs
            is_linkedin = 'linkedin.com' in url.lower()
            
            data = {
                'url': url,
                'formats': ['markdown'],
                'onlyMainContent': True
            }
            
            # For LinkedIn, try to get more content
            if is_linkedin:
                data['onlyMainContent'] = False
                data['includeTags'] = ['div', 'section', 'span', 'p', 'h1', 'h2', 'h3']
            
            response = requests.post(
                'https://api.firecrawl.dev/v1/scrape',
                headers=headers,
                json=data,
                timeout=45  # Longer timeout for LinkedIn
            )
            
            if response.status_code == 200:
                result = response.json()
                scraped_content = result.get('data', {}).get('markdown', '')
                logger.info(f"Successfully scraped {url}, content length: {len(scraped_content)}")
                
                # If LinkedIn scraping returned very little content, log it
                if is_linkedin and len(scraped_content) < 100:
                    logger.warning(f"LinkedIn scraping returned minimal content: {scraped_content[:100]}")
                
                return scraped_content
            else:
                error_text = response.text if hasattr(response, 'text') else 'Unknown error'
                logger.error(f"Firecrawl API error for {url}: {response.status_code} - {error_text}")
                return ""
                
        except Exception as e:
            logger.error(f"Failed to scrape {url}: {e}")
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
            
            # Enhanced AI prompt for better LinkedIn extraction
            prompt = f"""
You are an expert at extracting company information from website and LinkedIn content. Analyze the provided content and extract detailed company information.

Pay special attention to:
- LinkedIn pages often have company size (employees), headquarters location, and founding year
- Look for "employees", "company size", "headquarters", "founded", "established" keywords
- Extract specific numbers and locations, not generic terms
- For employee count, look for ranges like "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5001-10000", "10000+"
- For location, look for city and country/state information

Return a JSON object with these exact fields:

{{
  "companyName": "{company_name}",
  "description": "Detailed company description from the content (2-3 sentences)",
  "category": "Specific business category/industry from content",
  "location": "Exact headquarters location (City, State/Country)",
  "founded": "Exact founding year if found, otherwise 'N/A'",
  "employees": "Exact employee count or range if found, otherwise 'N/A'",
  "website": "Company website URL from content",
  "features": ["Specific feature 1", "Specific feature 2", "Specific feature 3"],
  "useCases": ["Specific use case 1", "Specific use case 2", "Specific use case 3"],
  "pricing": "Specific pricing information if available, otherwise 'Contact for pricing'",
  "industriesServed": ["Industry 1", "Industry 2"],
  "pricingModel": ["Subscription", "Usage-based", "Custom"],
  "productsServices": ["Product/Service 1", "Product/Service 2"],
  "topClients": ["Client 1", "Client 2"]
}}

Content to analyze:
{content}

Extract ONLY factual information found in the content. Do not make assumptions or add generic information.
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
            "description": f"{company_name} is an AI-powered company providing innovative solutions.",
            "category": "AI Tools",
            "location": "Global",
            "founded": "N/A",
            "employees": "N/A",
            "website": "",
            "features": ["AI-powered solutions", "Innovative technology", "User-friendly interface"],
            "useCases": ["Business automation", "Data analysis", "Process optimization"],
            "pricing": "Contact for pricing",
            "industriesServed": ["Technology", "Business"],
            "pricingModel": ["Subscription"],
            "productsServices": ["AI Solutions"],
            "topClients": []
        }