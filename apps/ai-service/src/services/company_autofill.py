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
            
            data = {
                'url': url,
                'formats': ['markdown'],
                'onlyMainContent': True
            }
            
            response = requests.post(
                'https://api.firecrawl.dev/v1/scrape',
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('data', {}).get('markdown', '')
            else:
                logger.error(f"Firecrawl API error: {response.status_code}")
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
            
            # Prepare content for AI analysis
            content = f"Company: {company_name}\n\nWebsite Content:\n{website_content[:3000]}"
            if linkedin_content:
                content += f"\n\nLinkedIn Content:\n{linkedin_content[:1000]}"
            
            # AI prompt for extraction
            prompt = f"""
Extract structured information about this company from the provided content. Return a JSON object with these fields:

{{
  "companyName": "{company_name}",
  "description": "Brief company description (1-2 sentences)",
  "category": "Main business category/industry",
  "location": "Company headquarters location",
  "founded": "Year founded (if available)",
  "employees": "Employee count or range (if available)",
  "website": "Company website URL",
  "features": ["Key feature 1", "Key feature 2", "Key feature 3"],
  "useCases": ["Use case 1", "Use case 2", "Use case 3"],
  "pricing": "Pricing information or 'Contact for pricing'",
  "industriesServed": ["Industry 1", "Industry 2"],
  "pricingModel": ["Subscription", "One-time", "Custom"],
  "productsServices": ["Product/Service 1", "Product/Service 2"],
  "topClients": ["Client 1", "Client 2"] (if mentioned)
}}

Content to analyze:
{content}
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