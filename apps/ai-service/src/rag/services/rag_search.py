import os
import json
from typing import Dict, List, Any
from .firebase_data_loader import FirebaseDataLoader as DataLoader
from .text_matcher import TextMatcher
from .llm_enricher import LLMEnricher
import logging
from concurrent.futures import ThreadPoolExecutor
import concurrent.futures

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
        Main RAG search function with hierarchical filtering logic
        """
        try:
            logger.info(f"RAG search started for query: '{query}' with {len(self.companies_data)} companies loaded")
            
            # Detect industry from query
            industry_detected = self._detect_industry_in_query(query)
            logger.info(f"Industry detected in query: {industry_detected}")
            
            # Apply hierarchical filtering logic:
            # 1. General query (no industry, no location) -> All companies globally
            # 2. Industry-specific query (industry detected, no location) -> Companies in that industry globally  
            # 3. Location + Industry query (industry detected + location selected) -> Companies in that industry in specific location
            
            # Find matching companies from RAG data with industry context
            matching_companies = self.text_matcher.find_matching_companies(
                query, self.companies_data, selected_types, industry_detected
            )
            
            logger.info(f"Found {len(matching_companies)} matching companies with relevance threshold")
            
            # If no highly relevant matches, try with lower threshold for broader results
            if not matching_companies:
                logger.info("No highly relevant matches found, trying with relaxed criteria")
                # Temporarily lower the threshold for broader search
                original_threshold = self.text_matcher.min_score_threshold
                self.text_matcher.min_score_threshold = 1.0
                
                matching_companies = self.text_matcher.find_matching_companies(
                    query, self.companies_data, selected_types, industry_detected
                )
                
                # Restore original threshold
                self.text_matcher.min_score_threshold = original_threshold
                
                # If still no matches, return helpful message
                if not matching_companies:
                    logger.warning("No matching companies found even with relaxed criteria")
                    location_msg = f" in {', '.join(selected_locations)}" if selected_locations else ""
                    industry_msg = f" for {industry_detected}" if industry_detected else ""
                    return {
                        "query": query,
                        "aiResponse": f"I couldn't find any companies in our database that match '{query}'{industry_msg}{location_msg}. Try broader search terms or enable web search for more comprehensive results.",
                        "suggestions": self._generate_fallback_suggestions(query),
                        "companies": [],
                        "citations": [],
                        "model_used": "RAG_ONLY",
                        "web_search_used": False,
                        "rag_used": True,
                        "success": True
                    }
            
            # Parallel processing: AI response + company formatting + suggestions
            with ThreadPoolExecutor(max_workers=3) as executor:
                # Start suggestions generation early
                suggestions_future = executor.submit(self._generate_rag_suggestions, query, matching_companies)
                # Start AI response generation
                ai_future = executor.submit(self.llm_enricher.enrich_rag_data, query, matching_companies)
                
                # Start company formatting in parallel
                companies_future = executor.submit(self._format_companies_for_response, 
                                                  matching_companies, query, selected_locations)
                
                # Wait for both to complete
                companies_list = companies_future.result()
                logger.info(f"Formatted {len(companies_list)} companies for response")
                
                if companies_list:  # Only use AI response if we have companies
                    ai_response = ai_future.result()
                    logger.info("LLM enrichment completed")
                else:
                    # Cancel AI response future if no companies
                    ai_future.cancel()
                    location_msg = f" in {', '.join(selected_locations)}" if selected_locations else ""
                    ai_response = f"I couldn't find any companies in our database that match '{query}'{location_msg}. Try using broader location terms or disable location filtering for more results."
                    logger.info("No companies after filtering - using fallback message")
            
            # Get suggestions from parallel execution
            suggestions = suggestions_future.result()
            
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
        """Format company data for API response with parallel processing and location filtering"""
        logger.info(f"Formatting {len(matching_companies)} companies, selected_locations: {selected_locations}")
        
        # Parallel processing of companies
        with ThreadPoolExecutor(max_workers=10) as executor:
            future_to_company = {
                executor.submit(self._process_single_company, company_match, query, selected_locations): company_match
                for company_match in matching_companies[:15]
            }
            
            companies_list = []
            for future in concurrent.futures.as_completed(future_to_company):
                try:
                    company_obj = future.result()
                    if company_obj:  # Only add if location filtering passed
                        companies_list.append(company_obj)
                except Exception as e:
                    company_match = future_to_company[future]
                    logger.error(f"Error processing company {company_match.get('company_name', 'Unknown')}: {e}")
        
        logger.info(f"Returning {len(companies_list)} companies")
        return companies_list
    
    def _process_single_company(self, company_match: Dict[str, Any], query: str, selected_locations: List[str] = None) -> Dict[str, Any]:
        """Process a single company with parallel LLM calls"""
        # Get the actual company data from the match structure
        company_data = company_match.get('data', {})
        company_name = company_match.get('company_name', 'Unknown')
        logger.info(f"Processing company: {company_name}")
        
        # Extract location first for filtering
        location = self._extract_location(company_data)
        
        # Strict location filtering when locations are selected
        if selected_locations and len(selected_locations) > 0 and selected_locations != ['']:
            location_match = False
            company_location_lower = location.lower()
            
            for selected_location in selected_locations:
                if not selected_location or not selected_location.strip():
                    continue
                
                selected_lower = selected_location.strip().lower()
                
                # Strict location matching
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
            
            # Skip companies that don't match the selected location
            if not location_match:
                logger.info(f"Skipping {company_name} - location '{location}' doesn't match selected locations {selected_locations}")
                return None
        
        # Extract basic information
        description = self._extract_description(company_data)
        features = self._extract_features(company_data)
        pricing = self._extract_pricing(company_data)
        website = self._extract_website(company_data)
        category = self._extract_category(company_data)
        founded = self._extract_founded(company_data)
        about = self._extract_about_us(company_data)
        
        # Parallel LLM enrichment calls for this company
        with ThreadPoolExecutor(max_workers=3) as executor:
            # Submit all LLM-dependent tasks in parallel
            specs_future = executor.submit(self._extract_key_specifications, company_data, query)
            enhanced_about_future = executor.submit(self._generate_enhanced_about, company_data, company_name)
            enhanced_use_cases_future = executor.submit(self._generate_enhanced_use_cases, 
                                                       company_data, company_name, query, 
                                                       self._extract_industries_served(company_data))
            
            # Wait for all LLM calls to complete
            key_specs = specs_future.result()
            enhanced_about = enhanced_about_future.result()
            enhanced_use_cases = enhanced_use_cases_future.result()
        
        # Extract remaining fields (non-LLM dependent)
        company_stage = self._extract_company_stage(company_data)
        industries_served = self._extract_industries_served(company_data)
        pricing_ranges = self._extract_pricing_ranges(company_data)
        pricing_model = self._extract_pricing_model(company_data)
        employees = self._extract_employees(company_data)
        products_services = self._extract_products_services(company_data)
        top_clients = self._extract_top_clients(company_data)
        logo_url = self._extract_logo_url(company_data)
        phone_number = self._extract_phone_number(company_data)
        linkedin_url = self._extract_linkedin_url(company_data)
        
        # Extract new market fields
        trial_available = self._extract_trial_available(company_data)
        customer_segments = self._extract_customer_segments(company_data)
        usp_tagline = self._extract_usp_tagline(company_data)
        deployment_type = self._extract_deployment_type(company_data)
        ideal_scenarios = self._extract_ideal_scenarios(company_data)
        tagline = self._extract_tagline(company_data)
        
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
            "linkedin_url": linkedin_url,
            "trialAvailable": trial_available,
            "customerSegments": customer_segments,
            "uspTagline": usp_tagline,
            "deploymentType": deployment_type,
            "idealScenarios": ideal_scenarios,
            "tagline": tagline
        }
        
        logger.info(f"Successfully processed company {company_name}")
        return company_obj
        # This code has been moved to _process_single_company method for parallel processing
    
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
        
        # Check for corrupted character-per-line format
        if features_text and len(features_text.split('\n')) > 20:
            lines = features_text.split('\n')
            if all(len(line.strip().replace('-', '').strip()) <= 1 for line in lines[:10]):  # Check if first 10 lines are single chars
                # This is corrupted character-per-line format - reconstruct
                cleaned_chars = [line.replace('-', '').strip() for line in lines if line.strip()]
                features_text = ''.join(cleaned_chars)
                logger.info(f"Cleaned corrupted features text: {features_text[:100]}...")
                # Split the reconstructed text into meaningful features
                if '.' in features_text:
                    features = [s.strip() for s in features_text.split('.') if s.strip() and len(s.strip()) > 10]
                elif ',' in features_text:
                    features = [s.strip() for s in features_text.split(',') if s.strip() and len(s.strip()) > 10]
                else:
                    # Single long feature, break it into chunks
                    words = features_text.split()
                    if len(words) > 10:
                        chunk_size = len(words) // 3
                        features = [
                            ' '.join(words[:chunk_size]),
                            ' '.join(words[chunk_size:chunk_size*2]),
                            ' '.join(words[chunk_size*2:])
                        ]
                    else:
                        features = [features_text]
                return features[:3] if features else ["AI-powered solutions", "Easy integration", "Professional support"]
        
        # Normal processing for non-corrupted data
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
                import sys
                import os
                sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
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
    
    def _generate_enhanced_use_cases(self, company_data: Dict[str, str], company_name: str, query: str = "", industries_served: List[str] = None) -> List[str]:
        """Generate enhanced use cases from RAG data with 10-12 word limit using LLM, contextual to search query and industries served"""
        try:
            # Get company info for context
            info_text = company_data.get('company_info', '')
            features_text = company_data.get('features', '')
            use_cases_text = company_data.get('use_cases', '')
            
            # Extract industries served if not provided
            if not industries_served:
                industries_served = self._extract_industries_served(company_data)
            
            # Clean corrupted use cases text (fix character-per-line issue)
            if use_cases_text and len(use_cases_text.split('\n')) > 20:
                # Likely corrupted - reconstruct by joining characters
                lines = use_cases_text.split('\n')
                if all(len(line.strip().replace('-', '').strip()) <= 1 for line in lines[:10]):  # Check if first 10 lines are single chars
                    # This is corrupted character-per-line format
                    cleaned_chars = [line.replace('-', '').strip() for line in lines if line.strip()]
                    use_cases_text = ''.join(cleaned_chars)
                    logger.info(f"Cleaned corrupted use cases text: {use_cases_text[:100]}...")
                else:
                    # Normal format, keep as is
                    pass
            
            # Combine context for LLM with query and industry context
            context = f"Company: {company_name}\nInfo: {info_text}\nFeatures: {features_text}\nUse Cases: {use_cases_text}"
            if industries_served:
                context += f"\nIndustries Served: {', '.join(industries_served)}"
            
            # Use LLM to generate proper use cases
            import sys
            import os
            sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
            from config.config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL, AI_MODEL
            import requests
            
            # Create contextual prompt based on search query and industries
            query_context = f"\nUser Search Query: '{query}'\nIMPORTANT: Generate use cases that are relevant to '{query}' and show how {company_name} addresses this specific need." if query else ""
            industry_context = f"\nFocus on these industries: {', '.join(industries_served[:3])}" if industries_served else ""
            
            prompt = f"""Based on the following company information, generate exactly 3 industry-specific use cases that are relevant to the search query and target industries.

{context}{query_context}{industry_context}

Generate 3 practical use cases that show how {company_name} can be used in real business scenarios. Each use case must be EXACTLY 10-12 words long and focus on specific industry applications that relate to the search query{' and target the mentioned industries' if industries_served else ''}.

Return only the 3 use cases, one per line, no bullets or numbers."""
            
            headers = {
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": AI_MODEL,
                "messages": [
                    {"role": "system", "content": "Generate concise, industry-specific use cases that are exactly 10-12 words each and relevant to the search context."},
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
        
        # Fallback to contextual use cases based on query and industries
        return self._generate_contextual_fallback_use_cases(company_data, company_name, query, industries_served)
    
    def _generate_contextual_fallback_use_cases(self, company_data: Dict[str, str], company_name: str, query: str = "", industries_served: List[str] = None) -> List[str]:
        """Generate fallback use cases that are contextual to search query and industries served"""
        category = self._extract_category(company_data)
        query_lower = query.lower() if query else ""
        
        # Industry-specific use cases based on industries served
        if industries_served:
            industry_cases = []
            for industry in industries_served[:3]:
                industry_lower = industry.lower()
                if 'healthcare' in industry_lower or 'medical' in industry_lower:
                    industry_cases.append("Streamline patient data management and automate healthcare workflow processes")
                elif 'finance' in industry_lower or 'banking' in industry_lower:
                    industry_cases.append("Automate financial reporting and enhance fraud detection with AI analytics")
                elif 'retail' in industry_lower or 'ecommerce' in industry_lower:
                    industry_cases.append("Personalize customer shopping experience and optimize inventory management systems")
                elif 'education' in industry_lower:
                    industry_cases.append("Create personalized learning paths and automate student assessment processes")
                elif 'manufacturing' in industry_lower:
                    industry_cases.append("Optimize production schedules and predict equipment maintenance needs accurately")
                elif 'real estate' in industry_lower:
                    industry_cases.append("Automate property valuation and enhance client communication with AI assistants")
                else:
                    industry_cases.append(f"Streamline {industry_lower} operations with intelligent automation and data insights")
            
            if len(industry_cases) >= 3:
                return industry_cases[:3]
        
        # Query-specific use cases
        if 'voice' in query_lower or 'voice' in company_name.lower() or 'voice' in category.lower():
            return [
                "Automate customer service calls with intelligent voice response systems",
                "Handle appointment scheduling through conversational AI voice assistants",
                "Process phone orders using natural language understanding voice technology"
            ]
        elif 'chatbot' in query_lower or 'chat' in query_lower:
            return [
                "Deploy intelligent chatbots for 24/7 customer support and engagement",
                "Automate lead qualification through conversational AI chat interfaces",
                "Provide instant product recommendations via smart chat assistant technology"
            ]
        elif 'analytics' in query_lower or 'data' in query_lower:
            return [
                "Transform raw business data into actionable insights and predictive analytics",
                "Automate reporting workflows and generate real-time performance dashboards",
                "Identify market trends and customer patterns through advanced data analysis"
            ]
        elif 'automation' in query_lower or 'workflow' in query_lower:
            return [
                "Streamline repetitive business processes with intelligent workflow automation tools",
                "Reduce manual data entry through smart document processing and extraction",
                "Optimize task scheduling and resource allocation with AI-powered automation"
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
    
    def _extract_trial_available(self, company_data: Dict[str, str]) -> bool:
        """Extract trial availability from market_info.txt"""
        market_info = company_data.get('market_info', '')
        for line in market_info.split('\n'):
            if 'Free Trial/Demo Available:' in line:
                return 'Yes' in line
        return False
    
    def _extract_customer_segments(self, company_data: Dict[str, str]) -> List[str]:
        """Extract customer segments from market_info.txt"""
        market_info = company_data.get('market_info', '')
        for line in market_info.split('\n'):
            if line.startswith('Customer Segments:'):
                segments_str = line.replace('Customer Segments:', '').strip()
                return [segment.strip() for segment in segments_str.split(',') if segment.strip()]
        return []
    
    def _extract_usp_tagline(self, company_data: Dict[str, str]) -> str:
        """Extract USP tagline from market_info.txt"""
        market_info = company_data.get('market_info', '')
        for line in market_info.split('\n'):
            if line.startswith('Unique Selling Proposition:'):
                return line.replace('Unique Selling Proposition:', '').strip()
        return ""
    
    def _extract_deployment_type(self, company_data: Dict[str, str]) -> List[str]:
        """Extract deployment types from market_info.txt"""
        market_info = company_data.get('market_info', '')
        for line in market_info.split('\n'):
            if line.startswith('Deployment Options:'):
                types_str = line.replace('Deployment Options:', '').strip()
                return [type_item.strip() for type_item in types_str.split(',') if type_item.strip()]
        return []
    
    def _extract_ideal_scenarios(self, company_data: Dict[str, str]) -> List[str]:
        """Extract ideal scenarios from market_info.txt"""
        market_info = company_data.get('market_info', '')
        for line in market_info.split('\n'):
            if line.startswith('Ideal Customer Types:'):
                scenarios_str = line.replace('Ideal Customer Types:', '').strip()
                return [scenario.strip() for scenario in scenarios_str.split(',') if scenario.strip()]
        return []
    
    def _extract_tagline(self, company_data: Dict[str, str]) -> str:
        """Extract company tagline from market_info.txt or company_info.txt"""
        # First check market_info.txt
        market_info = company_data.get('market_info', '')
        for line in market_info.split('\n'):
            if line.startswith('Company Tagline:'):
                return line.replace('Company Tagline:', '').strip()
        
        # Then check company_info.txt
        info_text = company_data.get('company_info', '')
        for line in info_text.split('\n'):
            if line.startswith('Tagline:'):
                return line.replace('Tagline:', '').strip()
        
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
    
    def _detect_industry_in_query(self, query: str) -> str:
        """
        Detect industry-specific terms in the search query (same logic as AI agent)
        """
        query_lower = query.lower()
        
        # Industry keyword mapping
        industry_keywords = {
            'healthcare': ['healthcare', 'medical', 'health', 'hospital', 'clinic', 'patient', 'doctor', 'nurse', 'pharmaceutical', 'medicine'],
            'finance': ['finance', 'financial', 'banking', 'fintech', 'investment', 'trading', 'payment', 'insurance', 'accounting', 'tax'],
            'education': ['education', 'learning', 'school', 'university', 'student', 'teacher', 'training', 'course', 'academic'],
            'ecommerce': ['ecommerce', 'e-commerce', 'retail', 'shopping', 'store', 'marketplace', 'sales', 'customer'],
            'marketing': ['marketing', 'advertising', 'social media', 'content', 'seo', 'campaign', 'brand', 'promotion'],
            'real estate': ['real estate', 'property', 'housing', 'rental', 'mortgage', 'construction', 'architecture'],
            'logistics': ['logistics', 'supply chain', 'shipping', 'delivery', 'transportation', 'warehouse', 'inventory'],
            'legal': ['legal', 'law', 'lawyer', 'attorney', 'compliance', 'contract', 'litigation'],
            'hr': ['hr', 'human resources', 'recruitment', 'hiring', 'employee', 'workforce', 'talent'],
            'manufacturing': ['manufacturing', 'production', 'factory', 'industrial', 'automation', 'quality control'],
            'travel': ['travel', 'tourism', 'hotel', 'booking', 'flight', 'vacation', 'hospitality'],
            'gaming': ['gaming', 'game', 'entertainment', 'mobile game', 'video game', 'esports'],
            'agriculture': ['agriculture', 'farming', 'crop', 'livestock', 'food production', 'agtech'],
            'aerospace': ['aerospace', 'space', 'satellite', 'aviation', 'aircraft', 'rocket', 'orbital', 'flight', 'infrastructure']
        }
        
        # Check for industry keywords in query (prioritize exact matches)
        for industry, keywords in industry_keywords.items():
            for keyword in keywords:
                if keyword in query_lower:
                    logger.info(f"Industry detected: {industry} (keyword: {keyword})")
                    return industry
        
        # Check for "for [industry]" pattern
        for industry, keywords in industry_keywords.items():
            for keyword in keywords:
                if f"for {keyword}" in query_lower:
                    logger.info(f"Industry detected: {industry} (pattern: for {keyword})")
                    return industry
        

        
        return None
    
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