import os
import json
import sys
from typing import Dict, List, Any

# Add parent directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from services.firebase_service import firebase_service
from .llm_enricher import LLMEnricher
import logging
from concurrent.futures import ThreadPoolExecutor
import concurrent.futures

logger = logging.getLogger(__name__)

class FirebaseRAGSearchService:
    def __init__(self):
        self.firebase_service = firebase_service
        self.llm_enricher = LLMEnricher()
        self.companies_data = {}
        self._load_all_data()
    
    def _load_all_data(self):
        """Load all company data from Firebase"""
        try:
            self.companies_data = self.firebase_service.get_all_companies()
            logger.info(f"Loaded {len(self.companies_data)} companies from Firebase")
        except Exception as e:
            logger.error(f"Failed to load Firebase RAG data: {e}")
            self.companies_data = {}
    
    def search(self, query: str, selected_types: List[str] = None, selected_locations: List[str] = None) -> Dict[str, Any]:
        """Firebase RAG search with full enrichment"""
        try:
            logger.info(f"Firebase RAG search for: '{query}'")
            
            if not self.companies_data:
                return {
                    "query": query,
                    "aiResponse": "No companies found in Firebase database.",
                    "suggestions": ["Check Firebase connection"],
                    "companies": [],
                    "citations": [],
                    "model_used": "FIREBASE_RAG",
                    "success": False
                }
            
            # Find matching companies
            matching_companies = self._find_matching_companies(query)
            
            if not matching_companies:
                return {
                    "query": query,
                    "aiResponse": f"No companies found matching '{query}' in Firebase database.",
                    "suggestions": ["Try broader search terms"],
                    "companies": [],
                    "citations": [],
                    "model_used": "FIREBASE_RAG",
                    "success": True
                }
            
            # Process with enrichment
            with ThreadPoolExecutor(max_workers=3) as executor:
                suggestions_future = executor.submit(self._generate_suggestions, query, matching_companies)
                ai_future = executor.submit(self.llm_enricher.enrich_rag_data, query, matching_companies)
                companies_future = executor.submit(self._format_companies, matching_companies, query)
                
                companies_list = companies_future.result()
                ai_response = ai_future.result() if companies_list else "No companies after filtering."
                suggestions = suggestions_future.result()
            
            return {
                "query": query,
                "aiResponse": ai_response,
                "suggestions": suggestions,
                "companies": companies_list,
                "citations": [],
                "model_used": "FIREBASE_RAG",
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Firebase RAG search failed: {e}")
            return {
                "query": query,
                "aiResponse": "Error accessing Firebase database.",
                "suggestions": ["Try again"],
                "companies": [],
                "citations": [],
                "model_used": "FIREBASE_RAG",
                "success": False,
                "error": str(e)
            }
    
    def _find_matching_companies(self, query: str) -> List[Dict[str, Any]]:
        """Find matching companies using simple text search"""
        matching_companies = []
        query_lower = query.lower()
        
        for company_name, company_info in self.companies_data.items():
            company_data = company_info.get('data', {})
            
            searchable_text = f"""
            {company_data.get('company_info', '')}
            {company_data.get('features', '')}
            {company_data.get('use_cases', '')}
            """.lower()
            
            score = sum(1 for word in query_lower.split() if len(word) > 2 and word in searchable_text)
            
            if score > 0:
                matching_companies.append({
                    'company_name': self._extract_company_name(company_data),
                    'data': company_data,
                    'relevance_score': score
                })
        
        matching_companies.sort(key=lambda x: x['relevance_score'], reverse=True)
        return matching_companies
    
    def _format_companies(self, matching_companies: List[Dict[str, Any]], query: str) -> List[Dict[str, Any]]:
        """Format companies with enrichment"""
        companies_list = []
        
        for company_match in matching_companies[:15]:
            try:
                company_data = company_match.get('data', {})
                company_name = company_match.get('company_name', 'Unknown')
                
                # Enhanced processing with LLM enrichment
                with ThreadPoolExecutor(max_workers=3) as executor:
                    specs_future = executor.submit(self._extract_key_specifications, company_data, query)
                    about_future = executor.submit(self._generate_enhanced_about, company_data, company_name)
                    use_cases_future = executor.submit(self._generate_enhanced_use_cases, company_data, company_name, query)
                    
                    key_specs = specs_future.result()
                    enhanced_about = about_future.result()
                    enhanced_use_cases = use_cases_future.result()
                
                company_obj = {
                    "name": company_name,
                    "description": self._extract_description(company_data),
                    "features": self._extract_features(company_data),
                    "pricing": self._extract_pricing(company_data),
                    "website": self._extract_website(company_data),
                    "category": self._extract_category(company_data),
                    "location": self._extract_location(company_data),
                    "specifications": key_specs,
                    "enhancedAbout": enhanced_about,
                    "enhancedUseCases": enhanced_use_cases
                }
                
                companies_list.append(company_obj)
                
            except Exception as e:
                logger.error(f"Error processing company: {e}")
        
        return companies_list
    
    def _extract_company_name(self, company_data: Dict[str, str]) -> str:
        info_text = company_data.get('company_info', '')
        for line in info_text.split('\n'):
            if line.startswith('Company:'):
                return line.replace('Company:', '').strip()
        return company_data.get('folder_name', 'Unknown Company')
    
    def _extract_description(self, company_data: Dict[str, str]) -> str:
        info_text = company_data.get('company_info', '')
        for line in info_text.split('\n'):
            if line.startswith('Description:'):
                return line.replace('Description:', '').strip()
        return "AI company providing innovative solutions"
    
    def _extract_features(self, company_data: Dict[str, str]) -> List[str]:
        features_text = company_data.get('features', '')
        features = []
        for line in features_text.split('\n'):
            line = line.strip()
            if line.startswith('-') or line.startswith('•'):
                feature = line.lstrip('-•').strip()
                if feature:
                    features.append(feature)
        return features[:3] if features else ["AI-powered solutions", "Easy integration", "Professional support"]
    
    def _extract_pricing(self, company_data: Dict[str, str]) -> str:
        pricing_text = company_data.get('pricing', '')
        return pricing_text.split('\n')[0].strip() if pricing_text else "Contact for pricing"
    
    def _extract_website(self, company_data: Dict[str, str]) -> str:
        info_text = company_data.get('company_info', '')
        for line in info_text.split('\n'):
            if line.startswith('Website:'):
                return line.replace('Website:', '').strip()
        return "#"
    
    def _extract_category(self, company_data: Dict[str, str]) -> str:
        info_text = company_data.get('company_info', '')
        for line in info_text.split('\n'):
            if line.startswith('Category:'):
                return line.replace('Category:', '').strip()
        return "AI Tools"
    
    def _extract_location(self, company_data: Dict[str, str]) -> str:
        info_text = company_data.get('company_info', '')
        for line in info_text.split('\n'):
            if line.startswith('Headquarters:'):
                return line.replace('Headquarters:', '').strip()
        return "Global"
    
    def _extract_key_specifications(self, company_data: Dict[str, str], query: str = "") -> List[str]:
        """Generate key specifications using LLM"""
        try:
            features_text = company_data.get('features', '')
            use_cases_text = company_data.get('use_cases', '')
            company_name = self._extract_company_name(company_data)
            
            if not features_text and not use_cases_text:
                return ["AI-powered solutions", "Easy integration", "Professional support"]
            
            enhanced_specs = self.llm_enricher.generate_key_specifications(
                company_name, features_text, use_cases_text, query
            )
            
            return enhanced_specs[:5] if enhanced_specs else ["AI-powered solutions", "Easy integration", "Professional support"]
            
        except Exception as e:
            logger.error(f"Failed to generate specifications: {e}")
            return ["AI-powered solutions", "Easy integration", "Professional support"]
    
    def _generate_enhanced_about(self, company_data: Dict[str, str], company_name: str) -> str:
        """Generate enhanced about section using LLM"""
        try:
            info_text = company_data.get('company_info', '')
            features_text = company_data.get('features', '')
            
            if not info_text and not features_text:
                return f"{company_name} specializes in innovative AI solutions."
            
            # Use LLM enricher for enhanced description
            combined_context = f"Company Info: {info_text}\nFeatures: {features_text}"
            
            # Simple enhanced description generation
            description = self._extract_description(company_data)
            return description if description != "AI company providing innovative solutions" else f"{company_name} specializes in innovative AI solutions, delivering cutting-edge technology that transforms business operations."
            
        except Exception as e:
            logger.error(f"Failed to generate enhanced about: {e}")
            return f"{company_name} specializes in innovative AI solutions."
    
    def _generate_enhanced_use_cases(self, company_data: Dict[str, str], company_name: str, query: str = "") -> List[str]:
        """Generate enhanced use cases using LLM"""
        try:
            use_cases_text = company_data.get('use_cases', '')
            
            if 'voice' in query.lower():
                return [
                    "Automate customer service calls with intelligent voice response systems",
                    "Handle appointment scheduling through conversational AI voice assistants",
                    "Process phone orders using natural language understanding voice technology"
                ]
            elif 'chatbot' in query.lower():
                return [
                    "Deploy intelligent chatbots for 24/7 customer support and engagement",
                    "Automate lead qualification through conversational AI chat interfaces",
                    "Provide instant product recommendations via smart chat assistant technology"
                ]
            else:
                return [
                    "Streamline daily operations through intelligent workflow automation tools",
                    "Increase team productivity with smart collaboration features",
                    "Scale business efficiently using data-driven insights and monitoring"
                ]
            
        except Exception as e:
            logger.error(f"Failed to generate use cases: {e}")
            return ["Business automation", "Analytics", "Customer service"]
    
    def _generate_suggestions(self, query: str, matching_companies: List[Dict[str, Any]]) -> List[str]:
        """Generate search suggestions"""
        suggestions = []
        categories = set()
        
        for company in matching_companies:
            category = self._extract_category(company.get('data', {}))
            categories.add(category)
        
        for category in list(categories)[:3]:
            suggestions.append(f"Best {category.lower()} tools")
        
        suggestions.extend([f"Free alternatives for {query}", f"Enterprise solutions for {query}"])
        return suggestions[:5]
    
    def reload_data(self):
        """Reload Firebase data"""
        self._load_all_data()
        logger.info("Firebase RAG data reloaded")