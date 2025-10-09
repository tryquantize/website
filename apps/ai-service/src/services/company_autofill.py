import logging
from typing import Dict, Any, List, Optional
from .exa_search import ExaSearchService
from .ai_agent import AISearchAgent
import json
import re
import requests

logger = logging.getLogger(__name__)

class CompanyAutoFillService:
    def __init__(self):
        self.exa_service = ExaSearchService()
        self.ai_agent = AISearchAgent()
    
    def auto_fill_company(self, company_name: str, website_url: str, linkedin_url: str) -> Dict[str, Any]:
        """
        Auto-fill company details using website and LinkedIn scraping
        Gracefully handles partial failures and returns available information
        """
        try:
            logger.info(f"Auto-filling company: {company_name}")
            
            # Track which sources were successful
            sources_used = []
            website_content = ""
            linkedin_content = ""
            
            # Try to scrape website with individual error handling
            try:
                if website_url:
                    website_content = self._scrape_url(website_url)
                    if website_content and len(website_content.strip()) > 50:
                        sources_used.append("website")
                        logger.info(f"Successfully scraped website content ({len(website_content)} chars)")
                    else:
                        logger.warning("Website content too short or empty")
            except Exception as e:
                logger.warning(f"Website scraping failed: {str(e)}")
            
            # Try to scrape LinkedIn with individual error handling
            try:
                if linkedin_url:
                    linkedin_content = self._scrape_url(linkedin_url)
                    if linkedin_content and len(linkedin_content.strip()) > 50:
                        sources_used.append("LinkedIn")
                        logger.info(f"Successfully scraped LinkedIn content ({len(linkedin_content)} chars)")
                    else:
                        logger.warning("LinkedIn content too short or empty")
            except Exception as e:
                logger.warning(f"LinkedIn scraping failed: {str(e)}")
            
            # If no content was scraped from either source, return partial success with basic info
            if not website_content and not linkedin_content:
                logger.warning("No content scraped from either source, returning basic company info")
                return {
                    "success": True,
                    "data": self._create_basic_company_data(company_name, website_url, linkedin_url),
                    "message": f"Could not scrape content from provided URLs, but basic company information has been filled",
                    "sources_used": [],
                    "partial_success": True
                }
            
            # Extract company information using LLM with available content
            company_data = self._extract_company_info(
                company_name, website_content, linkedin_content, website_url, linkedin_url
            )
            
            # Count how many fields have meaningful data
            filled_fields = self._count_filled_fields(company_data)
            
            # Always return success if we have any data, even if minimal
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
            # Even on error, try to return basic information
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
    
    def _scrape_url(self, url: str) -> str:
        """Scrape content from a URL using Exa with multiple search strategies and fallbacks"""
        try:
            # Extract domain and company name from URL
            if '//' in url:
                domain = url.split('/')[2]
            else:
                domain = url.split('/')[0]
            
            company_name = domain.replace('www.', '').replace('.com', '').replace('.ai', '').replace('.org', '').replace('.io', '').replace('.net', '')
            
            # Use multiple search strategies with fallbacks
            search_strategies = []
            
            if 'linkedin.com' in url:
                # For LinkedIn, search for company information
                linkedin_company = url.split('/')[-1] if not url.endswith('/') else url.split('/')[-2]
                search_strategies = [
                    # Primary LinkedIn searches
                    {
                        "queries": [
                            f"{linkedin_company} company LinkedIn about employees headquarters founded",
                            f"{linkedin_company} LinkedIn company profile information"
                        ],
                        "priority": "high"
                    },
                    # Fallback general searches
                    {
                        "queries": [
                            f"{company_name} company information funding employees",
                            f"{company_name} startup company about"
                        ],
                        "priority": "medium"
                    }
                ]
            else:
                # For regular websites, use multiple search strategies
                search_strategies = [
                    # Primary website searches
                    {
                        "queries": [
                            f"{domain} company about products services mission",
                            f"site:{domain} about company products"
                        ],
                        "priority": "high"
                    },
                    # Secondary company searches
                    {
                        "queries": [
                            f"{company_name} company information products features",
                            f"{company_name} startup technology company"
                        ],
                        "priority": "medium"
                    },
                    # Fallback broad searches
                    {
                        "queries": [
                            f"{company_name} company",
                            f"{company_name} business"
                        ],
                        "priority": "low"
                    }
                ]
            
            combined_text = ""
            successful_queries = 0
            
            # Try search strategies in order of priority
            for strategy in search_strategies:
                if successful_queries >= 2:  # Stop if we have enough content
                    break
                    
                for query in strategy["queries"]:
                    try:
                        logger.info(f"Trying search query: {query}")
                        search_result = self.exa_service.search_web(
                            query=query,
                            num_results=2 if strategy["priority"] == "high" else 1
                        )
                        
                        if search_result.get('success') and search_result.get('results'):
                            query_text = ""
                            for result in search_result['results']:
                                text = result.get('text', '')
                                if text and len(text) > 50:  # Lower threshold for acceptance
                                    query_text += f"Source: {result.get('title', 'Unknown')}\n{text}\n\n"
                            
                            if query_text:
                                combined_text += query_text
                                successful_queries += 1
                                logger.info(f"Successfully got content from query: {query[:50]}...")
                                break  # Move to next strategy
                                
                    except Exception as e:
                        logger.warning(f"Search query failed: {query} - {str(e)}")
                        continue
            
            # If we still don't have content, try one more broad search
            if not combined_text and company_name:
                try:
                    logger.info(f"Trying final broad search for: {company_name}")
                    search_result = self.exa_service.search_web(
                        query=company_name,
                        num_results=3
                    )
                    
                    if search_result.get('success') and search_result.get('results'):
                        for result in search_result['results']:
                            text = result.get('text', '')
                            if text and len(text) > 30:  # Very low threshold for final attempt
                                combined_text += f"Source: {result.get('title', 'Unknown')}\n{text}\n\n"
                except Exception as e:
                    logger.warning(f"Final broad search failed: {str(e)}")
            
            final_content = combined_text[:6000]  # Increased limit for better context
            logger.info(f"Scraping completed. Content length: {len(final_content)} chars, Successful queries: {successful_queries}")
            return final_content
            
        except Exception as e:
            logger.error(f"Error scraping {url}: {str(e)}")
            return ""
    
    def _extract_company_info(self, company_name: str, website_content: str, 
                            linkedin_content: str, website_url: str, linkedin_url: str) -> Dict[str, Any]:
        """Extract structured company information using LLM with graceful handling of partial content"""
        
        # Determine what content is available
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
            "founded": "founding year (extract from LinkedIn About section or website)",
            "headquarters": "headquarters location (extract from LinkedIn company info or website)",
            "products": ["list of products/services with descriptions if found"],
            "description": "company description based on available content (write what you can extract, even if brief)",
            "category": "main business category if identifiable",
            "employees": "employee count or range (extract from LinkedIn company size)",
            "industriesServed": ["list of industries they serve if mentioned"],
            "pricingRanges": ["pricing ranges if found"],
            "pricingModel": ["pricing models like subscription, usage-based etc if found"],
            "features": "key features and capabilities based on available content",
            "useCases": "use cases and applications based on available content",
            "companyStage": "company stage like Series A, Public, etc if mentioned",
            "topClients": ["notable clients or partners if mentioned"]
        }}
        
        EXTRACTION GUIDELINES:
        1. Extract ANY information that is explicitly found in the provided content
        2. For descriptions, features, and use cases: write based on available content, even if brief
        3. If very limited content: provide basic information based on company name and URLs
        4. Focus on LinkedIn for: headquarters, employee count, founding year, company stage
        5. Focus on website for: products, features, use cases, pricing
        6. If no specific information is found, return empty string or empty array for that field
        7. DO NOT make up information, but DO extract and summarize what is available
        8. Even with limited content, try to infer basic category from company name or URL domain
        
        IMPORTANT: Work with whatever content is available. Even partial information is valuable.
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
                    {"role": "system", "content": "You are a data extraction specialist. Extract company information from available content and return only valid JSON. Work with whatever content is provided, even if limited. Extract and summarize what you can find."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,
                "max_tokens": 1500
            }
            
            import requests
            response = requests.post(
                f"{self.ai_agent.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                response_data = response.json()
                ai_response = response_data['choices'][0]['message']['content'].strip()
                
                # Clean the response
                if ai_response.startswith('```json'):
                    ai_response = ai_response.replace('```json', '').replace('```', '').strip()
                
                # Extract JSON from response
                json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
                if json_match:
                    json_str = json_match.group()
                    extracted_data = json.loads(json_str)
                    
                    # Merge with basic data to ensure all fields are present
                    basic_data = self._create_basic_company_data(company_name, website_url, linkedin_url)
                    for key, value in extracted_data.items():
                        if value:  # Only override if extracted value is not empty
                            basic_data[key] = value
                    
                    return basic_data
            
            logger.warning(f"AI extraction failed, status: {response.status_code if 'response' in locals() else 'No response'}")
            # Return basic data with company name inference
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
        """Create empty data structure - no fallbacks"""
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
            "topClients": []
        }
    
    def _create_basic_company_data(self, company_name: str, website_url: str, linkedin_url: str) -> Dict[str, Any]:
        """Create basic company data when scraping fails but we still have URLs"""
        basic_data = self._create_empty_data()
        
        # Try to infer basic information from URLs and company name
        if website_url:
            # Extract domain for basic category inference
            domain = website_url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]
            if '.ai' in domain:
                basic_data['category'] = 'Artificial Intelligence'
            elif '.tech' in domain or 'tech' in company_name.lower():
                basic_data['category'] = 'Technology'
            elif 'software' in company_name.lower():
                basic_data['category'] = 'Software'
        
        # Basic description if we have company name
        if company_name:
            basic_data['description'] = f"{company_name} is a company. For more detailed information, please visit their website or LinkedIn page."
        
        return basic_data
    
    def _count_filled_fields(self, data: Dict[str, Any]) -> int:
        """Count how many fields have meaningful data"""
        count = 0
        for key, value in data.items():
            if key in ['phoneNumber', 'founded', 'headquarters', 'category', 'employees', 'companyStage']:
                if value and str(value).strip():
                    count += 1
            elif key in ['products', 'industriesServed', 'pricingRanges', 'pricingModel', 'topClients']:
                if value and len(value) > 0:
                    count += 1
            elif key in ['description', 'features', 'useCases']:
                if value and len(str(value).strip()) > 30:
                    count += 1
        return count