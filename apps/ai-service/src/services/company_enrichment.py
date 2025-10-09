import aiohttp
import asyncio
import json
import requests
from typing import Dict, List, Any
import logging
from services.exa_search import ExaSearchService

logger = logging.getLogger(__name__)

class CompanyEnrichmentAgent:
    def __init__(self):
        # Use API keys from config
        from config.config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL
        self.api_key = OPENROUTER_API_KEY
        self.base_url = OPENROUTER_BASE_URL
        self.model = "openai/gpt-3.5-turbo"  # Faster model for enrichment
        # Initialize both Exa search and RAG data
        self.exa_search = ExaSearchService()
        from rag.services.data_loader import DataLoader
        self.data_loader = DataLoader()
        self.companies_data = self.data_loader.load_all_companies()
        
        # Test API connection on initialization
        self._test_connection()
    
    def _test_connection(self):
        """Test if the API connection works"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": self.model,
                "messages": [{"role": "user", "content": "test"}],
                "max_tokens": 5
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                logger.info("Company enrichment agent API connection successful")
            else:
                logger.error(f"API connection failed: {response.status_code} - {response.text}")
                
        except Exception as e:
            logger.error(f"API connection test failed: {str(e)}")
    
    def enrich_company_data(self, companies: List[Dict[str, Any]], query: str, locations: List[str] = None, web_search_enabled: bool = True) -> List[Dict[str, Any]]:
        """Enrich company data using specialized agents in parallel"""
        logger.info(f"Starting parallel enrichment for {len(companies)} companies with locations: {locations}, web_search: {web_search_enabled}")
        try:
            # Try to get existing event loop
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # If loop is running, create a task
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(asyncio.run, self._enrich_companies_async(companies, query, locations))
                    return future.result()
            else:
                return asyncio.run(self._enrich_companies_async(companies, query, locations, web_search_enabled))
        except RuntimeError:
            # No event loop, create new one
            return asyncio.run(self._enrich_companies_async(companies, query, locations, web_search_enabled))
    
    async def _enrich_companies_async(self, companies: List[Dict[str, Any]], query: str, locations: List[str] = None, web_search_enabled: bool = True) -> List[Dict[str, Any]]:
        """Async method to enrich companies in parallel"""
        # Skip enrichment for fallback companies (website: '#')
        real_companies = [c for c in companies if c.get('website') != '#']
        fallback_companies = [c for c in companies if c.get('website') == '#']
        
        if not real_companies:
            logger.info("No real companies to enrich, returning fallback data")
            return companies
        
        async with aiohttp.ClientSession() as session:
            tasks = [self._enrich_single_company(session, company, query, locations, web_search_enabled) for company in real_companies]
            enriched_companies = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Handle exceptions and ensure we return valid data
            result = []
            for i, enriched in enumerate(enriched_companies):
                if isinstance(enriched, Exception):
                    logger.error(f"Failed to enrich company {real_companies[i].get('name', 'Unknown')}: {str(enriched)}")
                    result.append(real_companies[i])  # Return original data on failure
                else:
                    result.append(enriched)
            
            # Combine enriched real companies with unchanged fallback companies
            final_result = result + fallback_companies
            logger.info(f"Enriched {len(result)} real companies, skipped {len(fallback_companies)} fallback companies")
            return final_result
    
    async def _enrich_single_company(self, session: aiohttp.ClientSession, company: Dict[str, Any], query: str, locations: List[str] = None, web_search_enabled: bool = True) -> Dict[str, Any]:
        """Enrich a single company with parallel agent calls"""
        logger.info(f"Enriching company: {company.get('name', 'Unknown')} with locations: {locations}, web_search: {web_search_enabled}")
        enriched_company = company.copy()
        
        # Run 4 enrichment tasks in parallel including LinkedIn
        tasks = [
            self._get_key_specifications_async(session, company['name'], query, locations, web_search_enabled),
            self._get_company_description_async(session, company['name'], locations, web_search_enabled),
            self._get_company_website_async(session, company['name'], web_search_enabled) if not company.get('website') or company['website'] == '#' else asyncio.sleep(0, result=company.get('website', 'https://example.com')),
            self._get_linkedin_url_async(session, company['name'], web_search_enabled)
        ]
        
        specs, about, website, linkedin_url = await asyncio.gather(*tasks)
        
        enriched_company['specifications'] = specs
        # Use the location from search interface - ensure it's properly set
        if locations and len(locations) > 0:
            enriched_company['location'] = locations[0]
        else:
            enriched_company['location'] = "Global"
        enriched_company['about'] = about
        enriched_company['linkedin_url'] = linkedin_url
        if not enriched_company.get('website') or enriched_company['website'] == '#':
            enriched_company['website'] = website
        
        logger.info(f"Successfully enriched {company['name']} with LinkedIn: {linkedin_url}")
        return enriched_company
    
    async def _get_key_specifications_async(self, session: aiohttp.ClientSession, company_name: str, query: str, locations: List[str] = None, web_search_enabled: bool = True) -> List[str]:
        """Agent 1: Generate key specifications from web search or RAG database"""
        try:
            if web_search_enabled:
                # Use web search for specifications
                search_query = f"{company_name} company products services features technology solutions"
                search_results = self.exa_search.search_web(search_query, num_results=5, locations=locations)
                
                web_context = ""
                if search_results.get("success") and search_results.get("results"):
                    real_results = [r for r in search_results["results"] if 'example.com' not in r.get('url', '') and len(r.get('text', '')) > 50]
                    
                    if not real_results:
                        logger.warning(f"No real search results found for {company_name} specifications")
                        return []
                    
                    for result in real_results[:3]:
                        web_context += f"Title: {result.get('title', '')}\n"
                        web_context += f"Content: {result.get('text', '')[:500]}...\n\n"
                
                if web_context:
                    prompt = f"""Based on the following web search results about {company_name}, extract exactly 5 key specifications, features, or capabilities that are specific to this company.

Web Search Results:
{web_context}

Analyze the content and extract 5 specific technical specifications, product features, or business capabilities that are unique to {company_name}. Each specification should be 3-8 words and based ONLY on the actual information found in the search results. If you cannot find 5 specific features, return fewer rather than making them up. Return only the specifications, one per line, no bullets or numbers."""
                    
                    response = await self._make_agent_request_async(session, prompt)
                    if not response:
                        response = self._make_sync_request(prompt)
                    
                    if response:
                        specs = [s.strip() for s in response.split('\n') if s.strip() and len(s.strip()) > 2]
                        if specs and len(specs) >= 2:
                            return specs[:5]
                
                logger.warning(f"Could not generate real specifications for {company_name}")
                return []
            else:
                # Use RAG database for specifications
                company_data = self._find_company_in_rag(company_name)
                
                if not company_data:
                    logger.warning(f"Company {company_name} not found in RAG database")
                    return []
                
                specs = []
                
                # Get features from RAG data
                features_text = company_data.get('features', '')
                for line in features_text.split('\n'):
                    line = line.strip()
                    if line.startswith('-') or line.startswith('•'):
                        feature = line.lstrip('-•').strip()
                        if feature and len(feature) > 5:
                            specs.append(feature)
                
                # Get additional info from company_info
                info_text = company_data.get('company_info', '')
                for line in info_text.split('\n'):
                    if line.startswith('Products:'):
                        products = line.replace('Products:', '').strip()
                        if products:
                            specs.append(f"Products: {products}")
                    elif line.startswith('Category:'):
                        category = line.replace('Category:', '').strip()
                        if category:
                            specs.append(f"Category: {category}")
                
                return specs[:5] if specs else []
            
        except Exception as e:
            logger.error(f"Specifications agent failed: {str(e)}")
            return []
    

    

    
    async def _get_company_website_async(self, session: aiohttp.ClientSession, company_name: str, web_search_enabled: bool = True) -> str:
        """Agent 3: Get company website from web search or RAG database"""
        try:
            if web_search_enabled:
                # Use AI to generate website URL
                prompt = f"What is the official website URL for {company_name}? Return ONLY the URL starting with https://. No other text."
                response = await self._make_agent_request_async(session, prompt)
                if response:
                    url = response.strip().split('\n')[0].strip()
                    if url.startswith('https://') and len(url) < 100:
                        return url
            else:
                # Use RAG database for website
                company_data = self._find_company_in_rag(company_name)
                
                if company_data:
                    info_text = company_data.get('company_info', '')
                    for line in info_text.split('\n'):
                        if line.startswith('Website:'):
                            website = line.replace('Website:', '').strip()
                            if website and website.startswith('http'):
                                return website
            
            return "https://example.com"
            
        except Exception as e:
            logger.error(f"Website agent failed: {str(e)}")
            return "https://example.com"
    
    async def _get_company_description_async(self, session: aiohttp.ClientSession, company_name: str, locations: List[str] = None, web_search_enabled: bool = True) -> List[str]:
        """Agent 4: Get company description from web search or RAG database"""
        try:
            if web_search_enabled:
                # Use web search for description
                search_query = f"{company_name} company about services products what does do"
                search_results = self.exa_search.search_web(search_query, num_results=3, locations=locations)
                
                web_context = ""
                if search_results.get("success") and search_results.get("results"):
                    real_results = [r for r in search_results["results"] if 'example.com' not in r.get('url', '') and len(r.get('text', '')) > 50]
                    
                    if not real_results:
                        logger.warning(f"No real search results found for {company_name} description")
                        return []
                    
                    for result in real_results[:2]:
                        web_context += f"Content: {result.get('text', '')[:400]}...\n"
                
                if web_context:
                    prompt = f"""Based on the following information about {company_name}, write exactly 2 bullet points describing what they do.

Web Search Results:
{web_context}

Each bullet point should be 8-15 words describing their main services/products based ONLY on the actual information found. If you cannot find enough information for 2 bullet points, return fewer rather than making them up. Return only the bullet points, one per line, no bullets or formatting."""
                    
                    response = await self._make_agent_request_async(session, prompt)
                    if not response:
                        response = self._make_sync_request(prompt)
                    
                    if response:
                        lines = [line.strip() for line in response.split('\n') if line.strip() and len(line.strip()) > 10]
                        if lines and len(lines) >= 1:
                            return lines[:2]
                
                logger.warning(f"Could not generate real description for {company_name}")
                return []
            else:
                # Use RAG database for description
                company_data = self._find_company_in_rag(company_name)
                
                if not company_data:
                    logger.warning(f"Company {company_name} not found in RAG database")
                    return []
                
                descriptions = []
                
                # Get description from company_info
                info_text = company_data.get('company_info', '')
                for line in info_text.split('\n'):
                    if line.startswith('Description:'):
                        desc = line.replace('Description:', '').strip()
                        if desc:
                            descriptions.append(desc)
                
                # Get additional context from use_cases if available
                use_cases_text = company_data.get('use_cases', '')
                if use_cases_text:
                    first_use_case = use_cases_text.split('\n')[0].strip()
                    if first_use_case and first_use_case not in descriptions:
                        descriptions.append(first_use_case)
                
                return descriptions[:2] if descriptions else []
            
        except Exception as e:
            logger.error(f"Description agent failed: {str(e)}")
            return []
    
    async def _get_linkedin_url_async(self, session: aiohttp.ClientSession, company_name: str, web_search_enabled: bool = True) -> str:
        """Agent 5: Get LinkedIn URL from web search or generate from company name"""
        try:
            if web_search_enabled:
                # Search for company LinkedIn page
                search_query = f"{company_name} company linkedin profile page site:linkedin.com"
                search_results = self.exa_search.search_web(search_query, num_results=3)
                
                # First try to find LinkedIn URL directly from search results
                if search_results.get("success") and search_results.get("results"):
                    for result in search_results["results"]:
                        url = result.get('url', '')
                        if 'linkedin.com/company/' in url and 'example.com' not in url:
                            logger.info(f"Found LinkedIn URL from search: {url}")
                            return url
                
                # If no direct LinkedIn URL found, use AI to generate likely URL
                prompt = f"""What is the most likely LinkedIn company page URL for {company_name}? 
                
Return ONLY the URL in this exact format: https://linkedin.com/company/[company-slug]
The company slug should be the company name in lowercase with spaces replaced by hyphens and special characters removed.
For example: "Tech Solutions Inc" becomes "tech-solutions-inc"
Return only the URL, no other text."""
                
                response = await self._make_agent_request_async(session, prompt)
                if not response:
                    response = self._make_sync_request(prompt)
                
                if response:
                    url = response.strip().split('\n')[0].strip()
                    if url.startswith('https://linkedin.com/company/') and len(url) < 100:
                        logger.info(f"Generated LinkedIn URL: {url}")
                        return url
            
            # Fallback: generate URL based on company name (used for both web and RAG modes)
            company_slug = company_name.lower().replace(' ', '-').replace('&', 'and')
            import re
            company_slug = re.sub(r'[^a-z0-9-]', '', company_slug)
            fallback_url = f"https://linkedin.com/company/{company_slug}"
            logger.info(f"Using fallback LinkedIn URL: {fallback_url}")
            return fallback_url
            
        except Exception as e:
            logger.error(f"LinkedIn agent failed: {str(e)}")
            # Generate fallback URL
            company_slug = company_name.lower().replace(' ', '-').replace('&', 'and')
            import re
            company_slug = re.sub(r'[^a-z0-9-]', '', company_slug)
            return f"https://linkedin.com/company/{company_slug}"
    

    

    
    async def _make_agent_request_async(self, session: aiohttp.ClientSession, prompt: str) -> str:
        """Make an async request to the AI model for agent tasks"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://localhost:3001",
                "X-Title": "Company Enrichment Agent"
            }
            
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": "You are a precise research assistant. Follow instructions exactly and return only what is requested."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,
                "max_tokens": 150
            }
            
            timeout = aiohttp.ClientTimeout(total=15, connect=5)
            
            async with session.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=timeout,
                ssl=False
            ) as response:
                if response.status == 200:
                    response_data = await response.json()
                    if 'choices' in response_data and len(response_data['choices']) > 0:
                        content = response_data['choices'][0]['message']['content']
                        return content.strip()
                    else:
                        logger.error(f"Invalid response format: {response_data}")
                else:
                    text = await response.text()
                    logger.error(f"Agent request failed: {response.status} - {text}")
                    
        except asyncio.TimeoutError:
            logger.error(f"Agent request timed out")
        except aiohttp.ClientError as e:
            logger.error(f"Agent request client error: {str(e)}")
        except Exception as e:
            logger.error(f"Agent request exception: {str(e)}")
        
        return None
    
    def _make_sync_request(self, prompt: str) -> str:
        """Synchronous fallback request to the AI model"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": "You are a precise research assistant. Follow instructions exactly and return only what is requested."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,
                "max_tokens": 150
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                response_data = response.json()
                if 'choices' in response_data and len(response_data['choices']) > 0:
                    content = response_data['choices'][0]['message']['content']
                    return content.strip()
            else:
                logger.error(f"Sync request failed: {response.status_code} - {response.text}")
                
        except Exception as e:
            logger.error(f"Sync request exception: {str(e)}")
        
        return None
    
    def _find_company_in_rag(self, company_name: str) -> Dict[str, Any]:
        """Find company data in RAG database by name"""
        try:
            # Search through loaded companies data
            for company_key, company_data in self.companies_data.items():
                # Check if company name matches (case insensitive)
                if company_name.lower() in company_key.lower():
                    return company_data.get('data', {})
                
                # Also check in company_info for exact name match
                info_text = company_data.get('data', {}).get('company_info', '')
                for line in info_text.split('\n'):
                    if line.startswith('Company:'):
                        rag_company_name = line.replace('Company:', '').strip()
                        if company_name.lower() == rag_company_name.lower():
                            return company_data.get('data', {})
            
            return None
            
        except Exception as e:
            logger.error(f"Error finding company in RAG: {str(e)}")
            return None
    
