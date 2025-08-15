from exa_py import Exa
from typing import List, Dict, Any
from config import EXA_API_KEY
import logging

logger = logging.getLogger(__name__)

class ExaSearchService:
    def __init__(self):
        self.exa = Exa(api_key=EXA_API_KEY)
    
    def search_web(self, query: str, num_results: int = 5, include_domains: List[str] = None) -> Dict[str, Any]:
        """
        Search the web using Exa API for current information
        """
        try:
            # Enhance query for Indian startup ecosystem focus
            enhanced_query = f"{query} Indian startups companies India technology business"
            
            # Configure search parameters
            search_params = {
                "query": enhanced_query,
                "num_results": num_results,
                "type": "neural",  # Use neural search for better semantic matching
                "contents": {
                    "text": True,
                    "highlights": True,
                    "summary": True
                },
                "use_autoprompt": True,  # Let Exa optimize the search query
            }
            
            # Add domain filtering if specified
            if include_domains:
                search_params["include_domains"] = include_domains
            
            # Perform the search
            search_results = self.exa.search_and_contents(
                query=enhanced_query,
                num_results=num_results,
                type="neural",
                text=True,
                use_autoprompt=True,
                include_domains=include_domains if include_domains else None
            )
            
            # Format results for AI processing
            formatted_results = []
            citations = []
            
            for i, result in enumerate(search_results.results, 1):
                formatted_result = {
                    "title": result.title,
                    "url": result.url,
                    "text": result.text[:1000] if result.text else '',  # Limit text length
                    "citation_id": i
                }
                formatted_results.append(formatted_result)
                citations.append({
                    "id": i,
                    "title": result.title,
                    "url": result.url
                })
            
            return {
                "success": True,
                "results": formatted_results,
                "citations": citations,
                "query_used": enhanced_query
            }
            
        except Exception as e:
            logger.error(f"Exa search failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "results": [],
                "citations": []
            }
    
    def search_for_companies(self, query: str) -> Dict[str, Any]:
        """
        Search specifically for Indian companies and startups
        """
        company_query = f"{query} Indian companies startups India technology business funding"
        return self.search_web(
            company_query, 
            num_results=12,
            include_domains=["techcrunch.com", "yourstory.com", "inc42.com", "entrackr.com", "crunchbase.com"]
        )
    
    def search_for_products(self, query: str) -> Dict[str, Any]:
        """
        Search specifically for AI products and tools from India
        """
        product_query = f"{query} AI tools products Indian made in India software applications"
        return self.search_web(
            product_query,
            num_results=10,
            include_domains=["producthunt.com", "github.com", "techcrunch.com", "yourstory.com"]
        )
    
    def search_for_freelancers(self, query: str) -> Dict[str, Any]:
        """
        Search for freelancer information and market trends in India
        """
        freelancer_query = f"{query} freelancers India remote work skills market trends"
        return self.search_web(
            freelancer_query,
            num_results=5,
            include_domains=["upwork.com", "freelancer.com", "yourstory.com"]
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
    
    def get_citations_text(self, citations: List[Dict[str, Any]]) -> str:
        """
        Format citations for display in the response - only return citation numbers
        """
        if not citations:
            return ""
        
        # Store citations data for frontend to access
        self.current_citations = citations
        return ""  # Don't add any text, citations will be handled by frontend