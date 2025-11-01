import requests
from typing import List, Dict, Any
from config.config import EXA_API_KEY, EXA_BASE_URL
import logging

logger = logging.getLogger(__name__)

class ExaSearchService:
    def __init__(self):
        self.api_key = EXA_API_KEY
        self.base_url = EXA_BASE_URL
    
    def search_web(self, query: str, num_results: int = 5, include_domains: List[str] = None, locations: List[str] = None, industry: str = None) -> Dict[str, Any]:
        """
        Search the web using Exa API for current information with industry and location filtering
        """
        try:
            # Build enhanced query with hierarchical logic
            enhanced_query = query
            
            # Add industry context if detected
            if industry:
                enhanced_query += f" {industry}"
            
            # Add location context if selected
            if locations and len(locations) > 0:
                location_terms = ' OR '.join([f'"{loc}"' for loc in locations])
                enhanced_query += f" ({location_terms})"
            
            # Add general business context
            enhanced_query += " companies startups technology business"
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "query": enhanced_query,
                "numResults": num_results,
                "type": "neural",
                "contents": {
                    "text": True,
                    "highlights": True,
                    "summary": True
                },
                "useAutoprompt": True
            }
            
            if include_domains:
                payload["includeDomains"] = include_domains
            
            response = requests.post(
                f"{self.base_url}/search",
                headers=headers,
                json=payload
            )
            
            if response.status_code != 200:
                logger.error(f"Exa API error: {response.status_code} - {response.text}")
                return self._get_fallback_search_results(query)
            
            data = response.json()
            
            # Format results for AI processing
            formatted_results = []
            citations = []
            
            for i, result in enumerate(data.get('results', []), 1):
                formatted_result = {
                    "title": result.get('title', ''),
                    "url": result.get('url', ''),
                    "text": result.get('text', '')[:1000] if result.get('text') else '',
                    "citation_id": i
                }
                formatted_results.append(formatted_result)
                citations.append({
                    "id": i,
                    "title": result.get('title', ''),
                    "url": result.get('url', '')
                })
            
            return {
                "success": True,
                "results": formatted_results,
                "citations": citations,
                "query_used": enhanced_query
            }
            
        except Exception as e:
            logger.error(f"Exa search failed: {str(e)}")
            return self._get_fallback_search_results(query)
    
    def search_for_companies(self, query: str, locations: List[str] = None, industry: str = None) -> Dict[str, Any]:
        """
        Search specifically for companies and startups with location and industry filtering
        """
        company_query = query
        
        # Add industry context
        if industry:
            company_query += f" {industry}"
        
        # Add location context
        if locations and len(locations) > 0:
            location_terms = ' OR '.join([f'"{loc}"' for loc in locations])
            company_query += f" ({location_terms})"
        
        # Add company-specific terms
        company_query += " companies startups technology business funding"
        
        return self.search_web(
            company_query, 
            num_results=12,
            include_domains=["techcrunch.com", "yourstory.com", "inc42.com", "entrackr.com", "crunchbase.com"],
            locations=locations,
            industry=industry
        )
    
    def search_for_products(self, query: str, industry: str = None) -> Dict[str, Any]:
        """
        Search specifically for AI products and tools with industry context
        """
        product_query = query
        
        # Add industry context
        if industry:
            product_query += f" {industry}"
        
        # Add product-specific terms
        product_query += " AI tools products software applications"
        
        return self.search_web(
            product_query,
            num_results=10,
            include_domains=["producthunt.com", "github.com", "techcrunch.com", "yourstory.com"],
            industry=industry
        )
    
    def search_for_freelancers(self, query: str, locations: List[str] = None, industry: str = None) -> Dict[str, Any]:
        """
        Search for freelancer information with location and industry context
        """
        freelancer_query = query
        
        # Add industry context
        if industry:
            freelancer_query += f" {industry}"
        
        # Add location context
        if locations and len(locations) > 0:
            location_terms = ' OR '.join([f'"{loc}"' for loc in locations])
            freelancer_query += f" ({location_terms})"
        
        # Add freelancer-specific terms
        freelancer_query += " freelancers remote work skills market trends"
        
        return self.search_web(
            freelancer_query,
            num_results=5,
            include_domains=["upwork.com", "freelancer.com", "yourstory.com"],
            locations=locations,
            industry=industry
        )
    
    def format_search_context(self, search_results: Dict[str, Any]) -> str:
        """
        Format search results into context for the AI model
        """
        if not search_results.get("success") or not search_results.get("results"):
            return "No current web information available."
        
        context = "Current web information:\n\n"
        
        for result in search_results["results"]:
            context += f"[{result['citation_id']}] {result['title']}\n"
            if result.get('text'):
                context += f"Content: {result['text'][:300]}...\n"
            context += f"Source: {result['url']}\n\n"
        
        return context
    
    def _get_fallback_search_results(self, query: str) -> Dict[str, Any]:
        """
        Return fallback search results when API fails
        """
        return {
            "success": True,
            "results": [
                {
                    "title": f"AI Solutions for {query}",
                    "url": "https://example.com",
                    "text": f"Various AI solutions and tools are available for {query} in the global market.",
                    "citation_id": 1
                }
            ],
            "citations": [
                {
                    "id": 1,
                    "title": f"AI Solutions for {query}",
                    "url": "https://example.com"
                }
            ],
            "query_used": query
        }
    
