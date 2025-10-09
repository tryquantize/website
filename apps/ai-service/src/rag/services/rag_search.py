import os
import json
from typing import Dict, List, Any
from .data_loader import DataLoader
from .text_matcher import TextMatcher
from .llm_enricher import LLMEnricher
import logging

logger = logging.getLogger(__name__)

class RAGSearchService:
    def __init__(self):
        self.data_loader = DataLoader()
        self.text_matcher = TextMatcher()
        self.llm_enricher = LLMEnricher()
        self.companies_data = {}
        self.categories_data = {}
        self._load_all_data()
    
    def _load_all_data(self):
        """Load all company and category data on initialization"""
        try:
            self.companies_data = self.data_loader.load_all_companies()
            self.categories_data = self.data_loader.load_all_categories()
            logger.info(f"Loaded {len(self.companies_data)} companies and {len(self.categories_data)} categories")
        except Exception as e:
            logger.error(f"Failed to load RAG data: {e}")
    
    def search(self, query: str, selected_types: List[str] = None, selected_locations: List[str] = None) -> Dict[str, Any]:
        """
        Main RAG search function - returns only data from RAG, no LLM generation
        """
        try:
            logger.info(f"RAG search started for query: '{query}' with {len(self.companies_data)} companies loaded")
            
            # Find matching companies from RAG data
            matching_companies = self.text_matcher.find_matching_companies(
                query, self.companies_data, selected_types
            )
            
            logger.info(f"Found {len(matching_companies)} matching companies")
            
            if not matching_companies:
                logger.warning("No matching companies found, returning empty result")
                return {
                    "query": query,
                    "aiResponse": "I couldn't find any companies in our database that match your specific query. Please try a different search term or browse our available companies.",
                    "suggestions": ["AI tools", "Machine learning platforms", "Automation software", "AI writing tools", "AI image generators"],
                    "companies": [],
                    "citations": [],
                    "model_used": "RAG_ONLY",
                    "web_search_used": False,
                    "rag_used": True,
                    "success": True
                }
            
            # Extract structured company data
            companies_list = self._format_companies_for_response(matching_companies)
            logger.info(f"Formatted {len(companies_list)} companies for response")
            
            # Use LLM only to enrich/format the existing RAG data
            ai_response = self.llm_enricher.enrich_rag_data(query, matching_companies)
            logger.info("LLM enrichment completed")
            
            # Generate suggestions based on available RAG data
            suggestions = self._generate_rag_suggestions(query, matching_companies)
            
            return {
                "query": query,
                "aiResponse": ai_response,
                "suggestions": suggestions,
                "companies": companies_list,
                "citations": [],  # No web citations for RAG
                "model_used": "RAG_ONLY",
                "web_search_used": False,
                "rag_used": True,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"RAG search failed: {str(e)}", exc_info=True)
            return {
                "query": query,
                "aiResponse": "I'm having trouble accessing our company database right now. Please try again in a moment or enable web search for current results.",
                "suggestions": ["Try web search", "AI platforms", "Machine learning tools", "Business automation", "AI writing assistants"],
                "companies": [],
                "citations": [],
                "model_used": "RAG_ONLY",
                "web_search_used": False,
                "rag_used": False,
                "success": False,
                "error": str(e)
            }
    
    def _format_companies_for_response(self, matching_companies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Format company data for API response with proper enrichment"""
        companies_list = []
        
        for company_match in matching_companies[:15]:  # Limit to 15 companies
            # Get the actual company data from the match structure
            company_data = company_match.get('data', {})
            company_name = company_match.get('company_name', 'Unknown')
            
            # Extract key information from RAG data
            description = self._extract_description(company_data)
            features = self._extract_features(company_data)
            pricing = self._extract_pricing(company_data)
            website = self._extract_website(company_data)
            category = self._extract_category(company_data)
            
            # Add enrichment fields that were missing
            location = self._extract_location(company_data)
            founded = self._extract_founded(company_data)
            about = self._extract_about_us(company_data)
            key_specs = self._extract_key_specifications(company_data)
            
            companies_list.append({
                "name": company_name,
                "description": description,
                "features": features,
                "pricing": pricing,
                "website": website,
                "category": category,
                "location": location,
                "founded": founded,
                "about": about,
                "specifications": key_specs
            })
        
        return companies_list
    
    def _extract_company_name(self, company_data: Dict[str, str]) -> str:
        """Extract company name from RAG data"""
        info_text = company_data.get('company_info', '')
        for line in info_text.split('\n'):
            if line.startswith('Company:'):
                return line.replace('Company:', '').strip()
        return company_data.get('folder_name', 'Unknown Company')
    
    def _extract_description(self, company_data: Dict[str, str]) -> str:
        """Extract company description from RAG data"""
        info_text = company_data.get('company_info', '')
        for line in info_text.split('\n'):
            if line.startswith('Description:'):
                return line.replace('Description:', '').strip()
        return "AI company providing innovative solutions"
    
    def _extract_features(self, company_data: Dict[str, str]) -> List[str]:
        """Extract features from RAG data"""
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
        """Extract pricing from RAG data"""
        pricing_text = company_data.get('pricing', '')
        if pricing_text:
            # Get first pricing line
            first_line = pricing_text.split('\n')[0].strip()
            return first_line if first_line else "Contact for pricing"
        return "Contact for pricing"
    
    def _extract_website(self, company_data: Dict[str, str]) -> str:
        """Extract website from RAG data"""
        info_text = company_data.get('company_info', '')
        for line in info_text.split('\n'):
            if line.startswith('Website:'):
                return line.replace('Website:', '').strip()
        return "#"
    
    def _extract_category(self, company_data: Dict[str, str]) -> str:
        """Extract category from RAG data"""
        info_text = company_data.get('company_info', '')
        for line in info_text.split('\n'):
            if line.startswith('Category:'):
                return line.replace('Category:', '').strip()
        return "AI Tools"
    
    def _extract_location(self, company_data: Dict[str, str]) -> str:
        """Extract location/headquarters from RAG data"""
        info_text = company_data.get('company_info', '')
        for line in info_text.split('\n'):
            if line.startswith('Headquarters:'):
                return line.replace('Headquarters:', '').strip()
        return "Global"
    
    def _extract_founded(self, company_data: Dict[str, str]) -> str:
        """Extract founded year from RAG data"""
        info_text = company_data.get('company_info', '')
        for line in info_text.split('\n'):
            if line.startswith('Founded:'):
                return line.replace('Founded:', '').strip()
        return "N/A"
    
    def _extract_about_us(self, company_data: Dict[str, str]) -> List[str]:
        """Extract detailed about us information as bullet points"""
        about_points = []
        
        # Get description
        description = self._extract_description(company_data)
        if description and description != "AI company providing innovative solutions":
            about_points.append(description)
        
        # Get products info
        info_text = company_data.get('company_info', '')
        for line in info_text.split('\n'):
            if line.startswith('Products:'):
                products = line.replace('Products:', '').strip()
                if products:
                    about_points.append(f"Main products include {products}")
                break
        
        # Get employees info if available
        for line in info_text.split('\n'):
            if line.startswith('Employees:'):
                employees = line.replace('Employees:', '').strip()
                if employees:
                    about_points.append(f"Team size: {employees}")
                break
        
        return about_points[:2] if about_points else ["AI company providing innovative solutions"]
    
    def _extract_key_specifications(self, company_data: Dict[str, str]) -> List[str]:
        """Extract key specifications from features and company info"""
        specs = []
        
        # Get top features as specs
        features = self._extract_features(company_data)
        specs.extend(features[:3])
        
        # Add category as spec
        category = self._extract_category(company_data)
        if category != "AI Tools":
            specs.append(f"Category: {category}")
        
        # Add location as spec if not Global
        location = self._extract_location(company_data)
        if location != "Global":
            specs.append(f"Based in {location}")
        
        return specs[:5] if specs else ["AI-powered solutions", "Easy integration", "Professional support"]
    
    def _generate_rag_suggestions(self, query: str, matching_companies: List[Dict[str, Any]]) -> List[str]:
        """Generate suggestions based on available RAG data"""
        suggestions = []
        
        # Extract categories from matching companies
        categories = set()
        for company in matching_companies:
            category = self._extract_category(company.get('data', {}))
            categories.add(category)
        
        # Generate category-based suggestions
        for category in list(categories)[:3]:
            suggestions.append(f"Best {category.lower()} tools")
            suggestions.append(f"Affordable {category.lower()} alternatives")
        
        # Add generic suggestions
        suggestions.extend([
            f"Free alternatives for {query}",
            f"Enterprise solutions for {query}",
            f"Getting started with {query}"
        ])
        
        return suggestions[:5]  # Return top 5 suggestions
    
    def reload_data(self):
        """Reload all RAG data (useful for updates)"""
        self._load_all_data()
        logger.info("RAG data reloaded successfully")