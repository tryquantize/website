import logging
from typing import Dict, Any, List, Optional
from .firecrawl_scraper import FirecrawlWebScraper
from .ai_agent import AISearchAgent
import json
import re
import requests

logger = logging.getLogger(__name__)

class CompanyAutoFillFirecrawlService:
    def __init__(self):
        self.scraper = FirecrawlWebScraper()
        self.ai_agent = AISearchAgent()
    
    def auto_fill_company(self, company_name: str, website_url: str, linkedin_url: str) -> Dict[str, Any]:
        """
        Auto-fill company details using Firecrawl for web scraping
        """
        try:
            logger.info(f"Auto-filling company: {company_name} using Firecrawl")
            
            sources_used = []
            website_content = ""
            linkedin_content = ""
            
            # Scrape website using Firecrawl
            try:
                if website_url:
                    website_content = self.scraper.scrape_company_website(website_url)
                    if website_content and len(website_content.strip()) > 50:
                        sources_used.append("website")
                        logger.info(f"Successfully scraped website content ({len(website_content)} chars)")
                    else:
                        logger.warning("Website content too short or empty")
            except Exception as e:
                logger.warning(f"Website scraping failed: {str(e)}")
            
            # Scrape LinkedIn using Firecrawl
            try:
                if linkedin_url:
                    linkedin_content = self.scraper.scrape_linkedin_company(linkedin_url)
                    if linkedin_content and len(linkedin_content.strip()) > 50:
                        sources_used.append("LinkedIn")
                        logger.info(f"Successfully scraped LinkedIn content ({len(linkedin_content)} chars)")
                    else:
                        logger.warning("LinkedIn content too short or empty")
            except Exception as e:
                logger.warning(f"LinkedIn scraping failed: {str(e)}")
            
            # If no content was scraped, return basic info
            if not website_content and not linkedin_content:
                logger.warning("No content scraped from either source, returning basic company info")
                return {
                    "success": True,
                    "data": self._create_basic_company_data(company_name, website_url, linkedin_url),
                    "message": f"Could not scrape content from provided URLs, but basic company information has been filled",
                    "sources_used": [],
                    "partial_success": True
                }
            
            # Extract company information using LLM
            company_data = self._extract_company_info(
                company_name, website_content, linkedin_content, website_url, linkedin_url
            )
            
            filled_fields = self._count_filled_fields(company_data)
            
            success_message = f"Company details auto-filled successfully from {', '.join(sources_used) if sources_used else 'available sources'}"
            if filled_fields < 5:
                success_message += f" (partial information: {filled_fields} fields filled)"
            
            return {
                "success": True,
                "data": company_data,
                "message": success_message,
                "sources_used": sources_used,
                "fields_filled": filled_fields,
                "partial_success": filled_fields < 5
            }
            
        except Exception as e:
            logger.error(f"Error auto-filling company: {str(e)}")
            try:
                basic_data = self._create_basic_company_data(company_name, website_url, linkedin_url)
                return {
                    "success": True,
                    "data": basic_data,
                    "message": f"Encountered errors during auto-fill, but basic information has been provided. Error: {str(e)}",
                    "sources_used": [],
                    "partial_success": True,
                    "error_details": str(e)
                }
            except:
                return {
                    "success": False,
                    "error": str(e),
                    "message": "Failed to auto-fill company details"
                }
    
    def _extract_company_info(self, company_name: str, website_content: str, 
                            linkedin_content: str, website_url: str, linkedin_url: str) -> Dict[str, Any]:
        """Extract structured company information using LLM"""
        
        has_website_content = website_content and len(website_content.strip()) > 50
        has_linkedin_content = linkedin_content and len(linkedin_content.strip()) > 50
        
        content_status = ""
        if has_website_content and has_linkedin_content:
            content_status = "Both website and LinkedIn content available"
        elif has_website_content:
            content_status = "Only website content available"
        elif has_linkedin_content:
            content_status = "Only LinkedIn content available"
        else:
            content_status = "Limited content available"
        
        prompt = f"""
        Extract company information from the available content for {company_name}.
        
        Content Status: {content_status}
        Website URL: {website_url}
        LinkedIn URL: {linkedin_url}
        
        Website Content:
        {website_content[:4000] if has_website_content else 'No website content available'}
        
        LinkedIn Content:
        {linkedin_content[:3000] if has_linkedin_content else 'No LinkedIn content available'}
        
        Extract and return ONLY a valid JSON object with the following structure:
        {{
            "phoneNumber": "phone number if found",
            "founded": "founding year",
            "headquarters": "headquarters location",
            "products": ["list of products/services with descriptions"],
            "description": "company description based on available content",
            "category": "main business category",
            "employees": "employee count or range",
            "industriesServed": ["list of industries they serve"],
            "pricingRanges": ["pricing ranges if found"],
            "pricingModel": ["pricing models"],
            "features": "key features and capabilities",
            "useCases": "use cases and applications",
            "companyStage": "company stage",
            "topClients": ["notable clients or partners"],
            "tagline": "company tagline or slogan from LinkedIn if found"
        }}
        
        EXTRACTION GUIDELINES:
        1. Extract information explicitly found in the provided content
        2. For descriptions, features, and use cases: write based on available content
        3. If limited content: provide basic information based on company name and URLs
        4. Focus on website content for: products, features, use cases, pricing
        5. Focus on LinkedIn content for: tagline, company slogan, mission statement, headquarters, employee count
        6. For tagline: Look for company tagline, slogan, or mission statement in LinkedIn content - this should be a short, catchy phrase that describes what the company does
        7. If no specific information found, return empty string or empty array
        8. Work with whatever content is available
        """
        
        try:
            headers = {
                "Authorization": f"Bearer {self.ai_agent.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://localhost:3001",
                "X-Title": "Company Auto-fill"
            }
            
            payload = {
                "model": self.ai_agent.model,
                "messages": [
                    {"role": "system", "content": "You are a data extraction specialist. Extract company information from available content and return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,
                "max_tokens": 1500
            }
            
            response = requests.post(
                f"{self.ai_agent.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                response_data = response.json()
                ai_response = response_data['choices'][0]['message']['content'].strip()
                
                if ai_response.startswith('```json'):
                    ai_response = ai_response.replace('```json', '').replace('```', '').strip()
                
                json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
                if json_match:
                    json_str = json_match.group()
                    extracted_data = json.loads(json_str)
                    
                    basic_data = self._create_basic_company_data(company_name, website_url, linkedin_url)
                    for key, value in extracted_data.items():
                        if value:
                            basic_data[key] = value
                    
                    return basic_data
            
            logger.warning(f"AI extraction failed, status: {response.status_code if 'response' in locals() else 'No response'}")
            return self._create_basic_company_data(company_name, website_url, linkedin_url)
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {str(e)}")
            return self._create_basic_company_data(company_name, website_url, linkedin_url)
        except requests.exceptions.Timeout:
            logger.error("AI service request timed out")
            return self._create_basic_company_data(company_name, website_url, linkedin_url)
        except Exception as e:
            logger.error(f"Error extracting company info: {str(e)}")
            return self._create_basic_company_data(company_name, website_url, linkedin_url)
    
    def _create_empty_data(self) -> Dict[str, Any]:
        """Create empty data structure"""
        return {
            "phoneNumber": "",
            "founded": "",
            "headquarters": "",
            "products": [],
            "description": "",
            "category": "",
            "employees": "",
            "industriesServed": [],
            "pricingRanges": [],
            "pricingModel": [],
            "features": "",
            "useCases": "",
            "companyStage": "",
            "topClients": [],
            "tagline": ""
        }
    
    def _create_basic_company_data(self, company_name: str, website_url: str, linkedin_url: str) -> Dict[str, Any]:
        """Create basic company data when scraping fails"""
        basic_data = self._create_empty_data()
        
        if website_url:
            domain = website_url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]
            if '.ai' in domain:
                basic_data['category'] = 'Artificial Intelligence'
            elif '.tech' in domain or 'tech' in company_name.lower():
                basic_data['category'] = 'Technology'
            elif 'software' in company_name.lower():
                basic_data['category'] = 'Software'
        
        if company_name:
            basic_data['description'] = f"{company_name} is a company. For more detailed information, please visit their website or LinkedIn page."
        
        return basic_data
    
    def _count_filled_fields(self, data: Dict[str, Any]) -> int:
        """Count how many fields have meaningful data"""
        count = 0
        for key, value in data.items():
            if key in ['phoneNumber', 'founded', 'headquarters', 'category', 'employees', 'companyStage', 'tagline']:
                if value and str(value).strip():
                    count += 1
            elif key in ['products', 'industriesServed', 'pricingRanges', 'pricingModel', 'topClients']:
                if value and len(value) > 0:
                    count += 1
            elif key in ['description', 'features', 'useCases']:
                if value and len(str(value).strip()) > 30:
                    count += 1
        return count