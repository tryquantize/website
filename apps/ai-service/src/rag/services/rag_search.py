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
        self._load_all_data()
    
    def _load_all_data(self):
        """Load all company data on initialization"""
        try:
            self.companies_data = self.data_loader.load_all_companies()
            logger.info(f"Loaded {len(self.companies_data)} companies")
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
                    location_msg = f" in {', '.join(selected_locations)}" if selected_locations else ""
                    return {
                        "query": query,
                        "aiResponse": f"I couldn't find any companies in our database that match '{query}'{location_msg}. Try broader search terms or enable web search for more comprehensive results.",
                        "suggestions": self._generate_fallback_suggestions(query),
                        "companies": [],
                        "citations": [],
                        "model_used": "RAG_ONLY",
                        "web_search_used": False,
                        "rag_used": True,
                        "success": True
                    }
            
            # Extract structured company data with location filtering
            companies_list = self._format_companies_for_response(matching_companies, query, selected_locations)
            logger.info(f"Formatted {len(companies_list)} companies for response")
            
            # Use LLM only to enrich/format the existing RAG data
            if companies_list:  # Only enrich if we have companies to show
                ai_response = self.llm_enricher.enrich_rag_data(query, matching_companies)
                logger.info("LLM enrichment completed")
            else:
                # No companies after location filtering
                location_msg = f" in {', '.join(selected_locations)}" if selected_locations else ""
                ai_response = f"I couldn't find any companies in our database that match '{query}'{location_msg}. Try using broader location terms or disable location filtering for more results."
                logger.info("No companies after filtering - using fallback message")
            
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
    
    def _format_companies_for_response(self, matching_companies: List[Dict[str, Any]], query: str = "", selected_locations: List[str] = None) -> List[Dict[str, Any]]:
        """Format company data for API response with proper enrichment and location filtering"""
        companies_list = []
        logger.info(f"Formatting {len(matching_companies)} companies, selected_locations: {selected_locations}")
        
        for company_match in matching_companies[:15]:  # Limit to 15 companies
            # Get the actual company data from the match structure
            company_data = company_match.get('data', {})
            company_name = company_match.get('company_name', 'Unknown')
            logger.info(f"Processing company: {company_name}, data keys: {list(company_data.keys())}")
            
            # Extract location first for filtering
            location = self._extract_location(company_data)
            logger.info(f"Company {company_name} location: '{location}'")
            
            # Filter by location if specified (only filter if locations are actually selected)
            if selected_locations and len(selected_locations) > 0 and selected_locations != ['']:
                location_match = False
                company_location_lower = location.lower()
                
                for selected_location in selected_locations:
                    if not selected_location or not selected_location.strip():
                        continue
                    
                    selected_lower = selected_location.strip().lower()
                    
                    # Flexible location matching
                    if (selected_lower in company_location_lower or 
                        company_location_lower in selected_lower or
                        # Bay Area matching
                        (any(bay_city in selected_lower for bay_city in ['san francisco', 'sf']) and 
                         any(bay_city in company_location_lower for bay_city in ['san francisco', 'san mateo', 'mountain view', 'palo alto', 'california', 'ca'])) or
                        # USA matching
                        (selected_lower in ['usa', 'united states'] and 
                         any(us_indicator in company_location_lower for us_indicator in ['usa', 'united states', 'california', 'ca', 'ny', 'texas', 'tx']))):
                        location_match = True
                        break
                
                if not location_match:
                    logger.info(f"Skipping {company_name} - location '{location}' doesn't match {selected_locations}")
                    continue  # Skip this company if location doesn't match
            
            # Extract key information from RAG data
            description = self._extract_description(company_data)
            features = self._extract_features(company_data)
            pricing = self._extract_pricing(company_data)
            website = self._extract_website(company_data)
            category = self._extract_category(company_data)
            
            # Add all enhanced form fields
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
            
            company_obj = {
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
                "enhancedUseCases": enhanced_use_cases,
                "phoneNumber": phone_number,
                "linkedin_url": linkedin_url
            }
            companies_list.append(company_obj)
            logger.info(f"Added company {company_name} to results")
        
        logger.info(f"Returning {len(companies_list)} companies")
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
        try:
            # Get raw data from RAG
            info_text = company_data.get('company_info', '')
            features_text = company_data.get('features', '')
            use_cases_text = company_data.get('use_cases', '')
            
            # Combine all available data
            combined_context = f"Company Info: {info_text}\nFeatures: {features_text}\nUse Cases: {use_cases_text}"
            
            if combined_context.strip():
                # Use LLM to generate enhanced description
                from config.config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL, AI_MODEL
                import requests
                
                prompt = f"""Based on the following company information about {company_name}, write a comprehensive company description.

Company Data:
{combined_context}

Write a detailed description that is EXACTLY 150 words describing what {company_name} does, their services/products, and their unique value proposition. Focus on their capabilities and what makes them stand out. Return only the description text, no formatting."""
                
                headers = {
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "model": AI_MODEL,
                    "messages": [
                        {"role": "system", "content": "You are a professional business writer. Write clear, engaging company descriptions."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 200
                }
                
                response = requests.post(
                    f"{OPENROUTER_BASE_URL}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=10
                )
                
                if response.status_code == 200:
                    response_data = response.json()
                    enhanced_description = response_data['choices'][0]['message']['content'].strip()
                    if len(enhanced_description) > 50:
                        return enhanced_description
            
            # Fallback to original description
            description = self._extract_description(company_data)
            return description if description != "AI company providing innovative solutions" else f"{company_name} specializes in innovative AI solutions, delivering cutting-edge technology that transforms business operations."
            
        except Exception as e:
            logger.error(f"Failed to generate enhanced about for {company_name}: {e}")
            description = self._extract_description(company_data)
            return description if description != "AI company providing innovative solutions" else f"{company_name} specializes in innovative AI solutions, delivering cutting-edge technology that transforms business operations."
    
    def _generate_enhanced_use_cases(self, company_data: Dict[str, str], company_name: str) -> List[str]:
        """Generate enhanced use cases from RAG data with 10-12 word limit using LLM"""
        try:
            # Get company info for context
            info_text = company_data.get('company_info', '')
            features_text = company_data.get('features', '')
            use_cases_text = company_data.get('use_cases', '')
            
            # Clean corrupted use cases text (fix character-per-line issue)
            if use_cases_text and len(use_cases_text.split('\n')) > 20:
                # Likely corrupted - reconstruct
                cleaned_text = ''.join([line.replace('-', '').strip() for line in use_cases_text.split('\n')])
                use_cases_text = cleaned_text
            
            # Combine context for LLM
            context = f"Company: {company_name}\nInfo: {info_text}\nFeatures: {features_text}\nUse Cases: {use_cases_text}"
            
            # Use LLM to generate proper use cases
            from config.config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL, AI_MODEL
            import requests
            
            prompt = f"""Based on the following company information, generate exactly 3 industry-specific use cases.

{context}

Generate 3 practical use cases that show how {company_name} can be used in real business scenarios. Each use case must be EXACTLY 10-12 words long and focus on specific industry applications.

Return only the 3 use cases, one per line, no bullets or numbers."""
            
            headers = {
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": AI_MODEL,
                "messages": [
                    {"role": "system", "content": "Generate concise, industry-specific use cases that are exactly 10-12 words each."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 150
            }
            
            response = requests.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers=headers,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                response_data = response.json()
                use_cases_text = response_data['choices'][0]['message']['content'].strip()
                use_cases = [s.strip() for s in use_cases_text.split('\n') if s.strip()]
                
                # Validate word count
                valid_cases = []
                for case in use_cases:
                    word_count = len(case.split())
                    if 10 <= word_count <= 12:
                        valid_cases.append(case)
                
                if len(valid_cases) >= 3:
                    return valid_cases[:3]
            
        except Exception as e:
            logger.error(f"Failed to generate use cases for {company_name}: {e}")
        
        # Fallback to category-based use cases
        category = self._extract_category(company_data)
        if 'voice' in company_name.lower() or 'voice' in category.lower():
            return [
                "Automate customer service calls with intelligent voice response systems",
                "Handle appointment scheduling through conversational AI voice assistants",
                "Process phone orders using natural language understanding voice technology"
            ]
        elif 'AI' in category or 'Machine Learning' in category:
            return [
                "Automate repetitive business processes using advanced artificial intelligence algorithms",
                "Enhance customer experience through personalized AI-driven recommendations and support",
                "Improve decision making with real-time data insights and predictive analytics"
            ]
        else:
            return [
                "Streamline daily operations through intelligent workflow automation and optimization tools",
                "Increase team productivity with smart collaboration features and automated task management",
                "Scale business efficiently using data-driven insights and performance monitoring dashboards"
            ]
    
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
    

    
    def reload_data(self):
        """Reload all RAG data (useful for updates)"""
        self._load_all_data()
        logger.info("RAG data reloaded successfully")