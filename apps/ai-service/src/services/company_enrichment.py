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
        self.exa_search = ExaSearchService()
        
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
    
    def enrich_company_data(self, companies: List[Dict[str, Any]], query: str, locations: List[str] = None) -> List[Dict[str, Any]]:
        """Enrich company data using specialized agents in parallel"""
        logger.info(f"Starting parallel enrichment for {len(companies)} companies with locations: {locations}")
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
                return asyncio.run(self._enrich_companies_async(companies, query, locations))
        except RuntimeError:
            # No event loop, create new one
            return asyncio.run(self._enrich_companies_async(companies, query, locations))
    
    async def _enrich_companies_async(self, companies: List[Dict[str, Any]], query: str, locations: List[str] = None) -> List[Dict[str, Any]]:
        """Async method to enrich companies in parallel"""
        # Skip enrichment for fallback companies (website: '#')
        real_companies = [c for c in companies if c.get('website') != '#']
        fallback_companies = [c for c in companies if c.get('website') == '#']
        
        if not real_companies:
            logger.info("No real companies to enrich, returning fallback data")
            return companies
        
        async with aiohttp.ClientSession() as session:
            tasks = [self._enrich_single_company(session, company, query, locations) for company in real_companies]
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
    
    async def _enrich_single_company(self, session: aiohttp.ClientSession, company: Dict[str, Any], query: str, locations: List[str] = None) -> Dict[str, Any]:
        """Enrich a single company with parallel agent calls"""
        logger.info(f"Enriching company: {company.get('name', 'Unknown')} with locations: {locations}")
        enriched_company = company.copy()
        
        # Run 3 enrichment tasks in parallel (removed location agent)
        tasks = [
            self._get_key_specifications_async(session, company['name'], query, locations),
            self._get_company_description_async(session, company['name'], locations),
            self._get_company_website_async(session, company['name']) if not company.get('website') or company['website'] == '#' else asyncio.sleep(0, result=company.get('website', 'https://example.com'))
        ]
        
        specs, about, website = await asyncio.gather(*tasks)
        
        enriched_company['specifications'] = specs
        # Use the location from search interface instead of researching it
        enriched_company['location'] = locations[0] if locations and len(locations) > 0 else ""
        enriched_company['about'] = about
        if not enriched_company.get('website') or enriched_company['website'] == '#':
            enriched_company['website'] = website
        
        logger.info(f"Successfully enriched {company['name']}")
        return enriched_company
    
    async def _get_key_specifications_async(self, session: aiohttp.ClientSession, company_name: str, query: str, locations: List[str] = None) -> List[str]:
        """Agent 1: Generate 5 key specifications for the company using web search"""
        try:
            # Search for company-specific information with better query
            search_query = f"{company_name} company products services features technology solutions"
            search_results = self.exa_search.search_web(search_query, num_results=5, locations=locations)
            
            web_context = ""
            if search_results.get("success") and search_results.get("results"):
                # Filter out fallback results (check for example.com or generic content)
                real_results = [r for r in search_results["results"] if 'example.com' not in r.get('url', '') and len(r.get('text', '')) > 50]
                
                if not real_results:
                    logger.warning(f"No real search results found for {company_name} specifications")
                    return []
                
                for result in real_results[:3]:  # Use top 3 real results
                    web_context += f"Title: {result.get('title', '')}\n"
                    web_context += f"Content: {result.get('text', '')[:500]}...\n\n"
            
            if web_context:
                prompt = f"""Based on the following web search results about {company_name}, extract exactly 5 key specifications, features, or capabilities that are specific to this company.

Web Search Results:
{web_context}

Analyze the content and extract 5 specific technical specifications, product features, or business capabilities that are unique to {company_name}. Each specification should be 3-8 words and based ONLY on the actual information found in the search results. If you cannot find 5 specific features, return fewer rather than making them up. Return only the specifications, one per line, no bullets or numbers."""
                
                response = await self._make_agent_request_async(session, prompt)
                if not response:
                    # Fallback to sync request
                    response = self._make_sync_request(prompt)
                
                if response:
                    specs = [s.strip() for s in response.split('\n') if s.strip() and len(s.strip()) > 2]
                    # Only return if we have real specifications
                    if specs and len(specs) >= 2:
                        return specs[:5]
            
            logger.warning(f"Could not generate real specifications for {company_name}")
            return []
            
        except Exception as e:
            logger.error(f"Specifications agent failed: {str(e)}")
            return []
    

    

    
    async def _get_company_website_async(self, session: aiohttp.ClientSession, company_name: str) -> str:
        """Agent 3: Get company website"""
        try:
            prompt = f"What is the official website URL for {company_name}? Return ONLY the URL starting with https://. No other text."
            response = await self._make_agent_request_async(session, prompt)
            if response:
                url = response.strip().split('\n')[0].strip()
                if url.startswith('https://') and len(url) < 100:
                    return url
        except Exception as e:
            logger.error(f"Website agent failed: {str(e)}")
        
        return "https://example.com"
    
    async def _get_company_description_async(self, session: aiohttp.ClientSession, company_name: str, locations: List[str] = None) -> List[str]:
        """Agent 4: Get 2 bullet point company description using web search"""
        try:
            # Search for company information
            search_query = f"{company_name} company about services products what does do"
            search_results = self.exa_search.search_web(search_query, num_results=3, locations=locations)
            
            web_context = ""
            if search_results.get("success") and search_results.get("results"):
                # Filter out fallback results
                real_results = [r for r in search_results["results"] if 'example.com' not in r.get('url', '') and len(r.get('text', '')) > 50]
                
                if not real_results:
                    logger.warning(f"No real search results found for {company_name} description")
                    return []
                
                for result in real_results[:2]:  # Use top 2 real results
                    web_context += f"Content: {result.get('text', '')[:400]}...\n"
            
            if web_context:
                prompt = f"""Based on the following information about {company_name}, write exactly 2 bullet points describing what they do.

Web Search Results:
{web_context}

Each bullet point should be 8-15 words describing their main services/products based ONLY on the actual information found. If you cannot find enough information for 2 bullet points, return fewer rather than making them up. Return only the bullet points, one per line, no bullets or formatting."""
                
                response = await self._make_agent_request_async(session, prompt)
                if not response:
                    # Fallback to sync request
                    response = self._make_sync_request(prompt)
                
                if response:
                    lines = [line.strip() for line in response.split('\n') if line.strip() and len(line.strip()) > 10]
                    if lines and len(lines) >= 1:
                        return lines[:2]
            
            logger.warning(f"Could not generate real description for {company_name}")
            return []
            
        except Exception as e:
            logger.error(f"Description agent failed: {str(e)}")
            return []
    

    

    
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
    
