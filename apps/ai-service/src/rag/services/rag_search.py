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
            
            logger.info(f"Found {len(matching_companies)} matching companies with relevance threshold")
            
            # If no highly relevant matches, try with lower threshold for broader results
            if not matching_companies:
                logger.info("No highly relevant matches found, trying with relaxed criteria")
                # Temporarily lower the threshold for broader search
                original_threshold = self.text_matcher.min_score_threshold
                self.text_matcher.min_score_threshold = 2.0
                
                matching_companies = self.text_matcher.find_matching_companies(
                    query, self.companies_data, selected_types
                )
                
                # Restore original threshold
                self.text_matcher.min_score_threshold = original_threshold
                
                # If still no matches, return helpful message
                if not matching_companies:
                    logger.warning("No matching companies found even with relaxed criteria")
                    return {
                        "query": query,
                        "aiResponse": f"I couldn't find any companies in our database that specifically match '{query}'. This might be because your search is very specific or the companies you're looking for aren't in our current database. Try using broader terms or enable web search for more comprehensive results.",
                        "suggestions": self._generate_fallback_suggestions(query),
                        "companies": [],
                        "citations": [],
                        "model_used": "RAG_ONLY",
                        "web_search_used": False,
                        "rag_used": True,
                        "success": True
                    }
            
            # Extract structured company data
            companies_list = self._format_companies_for_response(matching_companies, query)
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
    
    def _format_companies_for_response(self, matching_companies: List[Dict[str, Any]], query: str = "") -> List[Dict[str, Any]]:
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
            
            # Add all enhanced form fields
            location = self._extract_location(company_data)
            founded = self._extract_founded(company_data)
            about = self._extract_about_us(company_data)
            key_specs = self._extract_key_specifications(company_data, query)
            
            # New enhanced fields
            company_stage = self._extract_company_stage(company_data)
            industries_served = self._extract_industries_served(company_data)
            pricing_ranges = self._extract_pricing_ranges(company_data)
            pricing_model = self._extract_pricing_model(company_data)
            employees = self._extract_employees(company_data)
            products_services = self._extract_products_services(company_data)
            top_clients = self._extract_top_clients(company_data)
            logo_url = self._extract_logo_url(company_data)
            enhanced_about = self._generate_enhanced_about(company_data, company_name)
            enhanced_use_cases = self._generate_enhanced_use_cases(company_data, company_name)
            phone_number = self._extract_phone_number(company_data)
            linkedin_url = self._extract_linkedin_url(company_data)
            
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
                "specifications": key_specs,
                "companyStage": company_stage,
                "industriesServed": industries_served,
                "pricingRanges": pricing_ranges,
                "pricingModel": pricing_model,
                "employees": employees,
                "productsServices": products_services,
                "topClients": top_clients,
                "logoUrl": logo_url,
                "enhancedAbout": enhanced_about,
                "phoneNumber": phone_number,
                "linkedin_url": linkedin_url
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
        
        # Split by lines and look for bullet points or numbered items
        for line in features_text.split('\n'):
            line = line.strip()
            if line.startswith('-') or line.startswith('•') or line.startswith('*'):
                feature = line.lstrip('-•*').strip()
                if feature and len(feature) > 5:  # Ensure it's a meaningful feature
                    features.append(feature)
            elif line and not line.startswith('Features:') and len(line) > 10:
                # If it's a standalone line that looks like a feature
                features.append(line)
        
        # If no bullet points found, try to split by sentences or periods
        if not features and features_text:
            sentences = [s.strip() for s in features_text.replace('Features:', '').split('.') if s.strip() and len(s.strip()) > 10]
            features = sentences[:3]
        
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
    
    def _extract_key_specifications(self, company_data: Dict[str, str], query: str = "") -> List[str]:
        """Extract and enhance key specifications using LLM from features and use cases, tailored to search query"""
        try:
            # Get raw data
            features_text = company_data.get('features', '')
            use_cases_text = company_data.get('use_cases', '')
            company_name = self._extract_company_name(company_data)
            
            # If no data available, return fallback
            if not features_text and not use_cases_text:
                return ["AI-powered solutions", "Easy integration", "Professional support", "Scalable architecture", "24/7 support"]
            
            # Use LLM enricher to generate enhanced specifications with query context
            enhanced_specs = self.llm_enricher.generate_key_specifications(
                company_name, features_text, use_cases_text, query
            )
            
            return enhanced_specs[:5] if enhanced_specs else [
                "AI-powered solutions", "Easy integration", "Professional support", 
                "Scalable architecture", "24/7 support"
            ]
            
        except Exception as e:
            logger.error(f"Failed to generate key specifications: {e}")
            return ["AI-powered solutions", "Easy integration", "Professional support", "Scalable architecture", "24/7 support"]
    
    def _extract_company_stage(self, company_data: Dict[str, str]) -> str:
        """Extract company stage from RAG data"""
        info_text = company_data.get('company_info', '')
        for line in info_text.split('\n'):
            if line.startswith('Company Stage:'):
                return line.replace('Company Stage:', '').strip()
        return "N/A"
    
    def _extract_industries_served(self, company_data: Dict[str, str]) -> List[str]:
        """Extract industries served from RAG data"""
        info_text = company_data.get('company_info', '')
        for line in info_text.split('\n'):
            if line.startswith('Industries Served:'):
                industries_str = line.replace('Industries Served:', '').strip()
                return [industry.strip() for industry in industries_str.split(',') if industry.strip()]
        return []
    
    def _extract_pricing_ranges(self, company_data: Dict[str, str]) -> List[str]:
        """Extract pricing ranges from RAG data"""
        info_text = company_data.get('company_info', '')
        for line in info_text.split('\n'):
            if line.startswith('Pricing Ranges:'):
                ranges_str = line.replace('Pricing Ranges:', '').strip()
                if ranges_str:
                    return [ranges_str]  # Return as single item to avoid splitting on commas within price ranges
        return []
    
    def _extract_pricing_model(self, company_data: Dict[str, str]) -> List[str]:
        """Extract pricing model from RAG data"""
        pricing_text = company_data.get('pricing', '')
        for line in pricing_text.split('\n'):
            if line.startswith('Pricing Models:'):
                models_str = line.replace('Pricing Models:', '').strip()
                return [model.strip() for model in models_str.split(',') if model.strip()]
        return []
    
    def _extract_employees(self, company_data: Dict[str, str]) -> str:
        """Extract employee count from RAG data"""
        info_text = company_data.get('company_info', '')
        for line in info_text.split('\n'):
            if line.startswith('Employees:'):
                return line.replace('Employees:', '').strip()
        return "N/A"
    
    def _extract_products_services(self, company_data: Dict[str, str]) -> List[str]:
        """Extract products/services from RAG data"""
        products = []
        info_text = company_data.get('company_info', '')
        
        # Look for Products/Services section
        lines = info_text.split('\n')
        in_products_section = False
        
        for line in lines:
            if line.startswith('Products/Services:'):
                in_products_section = True
                continue
            elif in_products_section:
                if line.startswith('-') or line.startswith('•'):
                    product = line.lstrip('-•').strip()
                    if product:
                        products.append(product)
                elif line.strip() == '' or ':' in line:
                    break
        
        return products
    
    def _extract_top_clients(self, company_data: Dict[str, str]) -> List[str]:
        """Extract top clients from RAG data"""
        clients = []
        
        # Check if clients.txt file exists in the data
        clients_text = company_data.get('clients', '')
        if clients_text:
            for line in clients_text.split('\n'):
                line = line.strip()
                if line.startswith('-') or line.startswith('•'):
                    client = line.lstrip('-•').strip()
                    if client and client != 'No clients listed':
                        clients.append(client)
        
        # Also check company_info for Top Clients field
        info_text = company_data.get('company_info', '')
        for line in info_text.split('\n'):
            if line.startswith('Top Clients:'):
                clients_str = line.replace('Top Clients:', '').strip()
                if clients_str and clients_str != 'N/A':
                    clients.extend([client.strip() for client in clients_str.split(',') if client.strip()])
                break
        
        return clients
    
    def _extract_logo_url(self, company_data: Dict[str, str]) -> str:
        """Extract logo URL from RAG data (placeholder for now)"""
        # For now, return a placeholder. In the future, this could be stored in links.json
        return ""
    
    def _generate_enhanced_about(self, company_data: Dict[str, str], company_name: str) -> str:
        """Generate enhanced about paragraph using LLM"""
        try:
            company_info = company_data.get('company_info', '')
            features = company_data.get('features', '')
            use_cases = company_data.get('use_cases', '')
            
            # Use LLM enricher to generate enhanced about paragraph
            enhanced_about = self.llm_enricher.generate_enhanced_about(
                company_name, company_info, features, use_cases
            )
            
            return enhanced_about
            
        except Exception as e:
            logger.error(f"Failed to generate enhanced about: {e}")
            return f"{company_name} specializes in innovative AI solutions, focusing on delivering cutting-edge technology that transforms business operations. With a commitment to excellence and customer success, they provide tailored solutions that address specific industry challenges while maintaining the highest standards of quality and reliability."
    
    def _extract_phone_number(self, company_data: Dict[str, str]) -> str:
        """Extract phone number from RAG data"""
        info_text = company_data.get('company_info', '')
        for line in info_text.split('\n'):
            if line.startswith('Phone:'):
                return line.replace('Phone:', '').strip()
        return ""
    
    def _extract_linkedin_url(self, company_data: Dict[str, str]) -> str:
        """Extract LinkedIn URL from RAG data"""
        info_text = company_data.get('company_info', '')
        for line in info_text.split('\n'):
            if line.startswith('LinkedIn:'):
                return line.replace('LinkedIn:', '').strip()
        return ""
    
    def _generate_enhanced_use_cases(self, company_data: Dict[str, str], company_name: str) -> List[str]:
        """Generate enhanced use cases using LLM from use cases and industries data"""
        try:
            use_cases_text = company_data.get('use_cases', '')
            industries_served = self._extract_industries_served(company_data)
            
            # Use LLM enricher to generate enhanced use cases
            enhanced_use_cases = self.llm_enricher.generate_enhanced_use_cases(
                company_name, use_cases_text, industries_served
            )
            
            return enhanced_use_cases
            
        except Exception as e:
            logger.error(f"Failed to generate enhanced use cases: {e}")
            return [
                "Business process automation and optimization solutions",
                "Data analytics and insights for decision making",
                "Customer experience enhancement through AI integration"
            ]
    
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
    
    def _generate_fallback_suggestions(self, query: str) -> List[str]:
        """Generate helpful suggestions when no matches are found"""
        # Extract key terms from the query to generate relevant suggestions
        query_lower = query.lower()
        
        suggestions = []
        
        # Add suggestions based on query content
        if any(term in query_lower for term in ['image', 'photo', 'picture', 'visual']):
            suggestions.extend(["AI image generators", "Visual AI tools", "Image editing platforms"])
        elif any(term in query_lower for term in ['text', 'writing', 'content', 'copy']):
            suggestions.extend(["AI writing tools", "Content generation", "Text automation"])
        elif any(term in query_lower for term in ['chat', 'conversation', 'talk']):
            suggestions.extend(["AI chatbots", "Conversational AI", "Customer service AI"])
        elif any(term in query_lower for term in ['data', 'analytics', 'analysis']):
            suggestions.extend(["Data analytics platforms", "AI analytics tools", "Business intelligence"])
        else:
            # Generic AI-related suggestions
            suggestions.extend(["AI platforms", "Machine learning tools", "Automation software"])
        
        # Add some general suggestions
        suggestions.extend(["Browse all companies", "Popular AI tools"])
        
        return suggestions[:5]
    
    def get_company_details(self, company_name: str) -> Dict[str, Any]:
        """Get detailed company information for comparison"""
        try:
            # Normalize company name
            normalized_name = company_name.lower().replace(' ', '_').replace('.', '')
            
            # Find company in loaded data
            company_data = self.companies_data.get(normalized_name)
            if not company_data:
                return {}
            
            # Extract comprehensive details
            return {
                'company_info': company_data.get('company_info', ''),
                'features_detailed': company_data.get('features', ''),
                'use_cases': company_data.get('use_cases', ''),
                'pricing_details': company_data.get('pricing', ''),
                'clients': company_data.get('clients', ''),
                'links': company_data.get('links', {})
            }
            
        except Exception as e:
            logger.error(f"Failed to get company details for {company_name}: {e}")
            return {}
    
    def reload_data(self):
        """Reload all RAG data (useful for updates)"""
        self._load_all_data()
        logger.info("RAG data reloaded successfully")