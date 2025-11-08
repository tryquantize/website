"""
Firebase-based data loader for RAG service
"""
import os
import logging
from typing import Dict, List, Any
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from services.firebase_service import FirebaseService

logger = logging.getLogger(__name__)

class FirebaseDataLoader:
    def __init__(self):
        self.firebase_service = FirebaseService()
    
    def load_all_companies(self) -> Dict[str, Any]:
        """Load all companies from Firebase"""
        try:
            # Check if we should use Firebase (production) or local files (development)
            use_firebase = os.getenv('USE_FIREBASE', 'true').lower() == 'true'
            
            if use_firebase and self.firebase_service.db:
                logger.info("Loading companies from Firebase")
                return self.firebase_service.get_all_companies()
            else:
                logger.info("Firebase not available, falling back to local data")
                return self._load_local_fallback()
                
        except Exception as e:
            logger.error(f"Failed to load companies: {e}")
            return self._load_local_fallback()
    
    def _load_local_fallback(self) -> Dict[str, Any]:
        """Fallback to local data if Firebase is not available"""
        try:
            # Import the original data loader
            from data_loader import DataLoader
            local_loader = DataLoader()
            return local_loader.load_all_companies()
        except Exception as e:
            logger.error(f"Local fallback also failed: {e}")
            return {}
    
    def search_companies(self, query: str) -> List[Dict[str, Any]]:
        """Search companies using Firebase with improved matching"""
        try:
            use_firebase = os.getenv('USE_FIREBASE', 'true').lower() == 'true'
            
            if use_firebase and self.firebase_service.db:
                # Get all companies and do comprehensive text matching
                all_companies = self.firebase_service.get_all_companies()
                results = []
                query_lower = query.lower()
                query_words = [w.strip() for w in query_lower.split() if len(w.strip()) > 2]
                
                for company_id, company_data in all_companies.items():
                    company_name = company_data.get('folder_name', company_id.replace('_', ' ').title())
                    company_info = company_data.get('company_info', '')
                    features = company_data.get('features', '')
                    use_cases = company_data.get('use_cases', '')
                    
                    # Get comprehensive company information for better matching
                    products_services = company_data.get('productsServices', [])
                    industries_served = company_data.get('industriesServed', [])
                    category = company_data.get('category', '')
                    description = company_data.get('description', '')
                    
                    # Combine all searchable text including products/services
                    searchable_text = f"{company_name} {company_info} {features} {use_cases} {' '.join(products_services)} {' '.join(industries_served)} {category} {description}".lower()
                    
                    # Check for matches with comprehensive relevance scoring
                    match_score = 0
                    
                    # Company name exact match (highest priority)
                    if query_lower in company_name.lower():
                        match_score += 25
                    
                    # Products/Services match (very high priority for relevance)
                    for product in products_services:
                        if any(word in product.lower() for word in query_words):
                            match_score += 20
                    
                    # Category match (high priority)
                    if any(word in category.lower() for word in query_words):
                        match_score += 15
                    
                    # Description match (high priority)
                    if any(word in description.lower() for word in query_words):
                        match_score += 12
                    
                    # Individual word matches with context weighting
                    for word in query_words:
                        if word in company_name.lower():
                            match_score += 10
                        elif word in features.lower():
                            match_score += 8
                        elif word in use_cases.lower():
                            match_score += 6
                        elif word in company_info.lower():
                            match_score += 4
                    
                    # Semantic matches for specific queries with higher precision
                    if 'voice' in query_lower and 'ai' in query_lower:
                        voice_ai_terms = ['voice ai', 'voice agent', 'speech ai', 'conversational ai', 'voice assistant', 'voice bot']
                        for term in voice_ai_terms:
                            if term in searchable_text:
                                match_score += 25  # Very high relevance for exact matches
                        
                        # Secondary voice terms
                        voice_terms = ['voice', 'speech', 'audio', 'conversation', 'talk', 'speak', 'vocal']
                        voice_matches = sum(1 for term in voice_terms if term in searchable_text)
                        if voice_matches >= 2:  # Multiple voice-related terms
                            match_score += 15
                    
                    # Penalty for irrelevant companies
                    if any(test_word in company_name.lower() for test_word in ['test', 'firebase', 'final', 'complete']):
                        if not any(relevant_word in searchable_text for relevant_word in query_words):
                            match_score = max(0, match_score - 15)
                    
                    # Only add companies with high relevance
                    if match_score >= 15:  # Higher threshold for better precision
                        results.append({
                            'id': company_id,
                            'data': company_data,
                            'company_name': company_name,
                            'match_score': match_score
                        })
                
                # Sort by match score (highest first) and filter for quality
                results.sort(key=lambda x: x.get('match_score', 0), reverse=True)
                
                # Log search results for debugging
                logger.info(f"Search '{query}' found {len(results)} companies with scores: {[(r['company_name'], r['match_score']) for r in results[:5]]}")
                
                return results[:10]  # Return top 10 most relevant matches
            else:
                # Fallback to loading all and filtering locally
                all_companies = self.load_all_companies()
                results = []
                query_lower = query.lower()
                
                for company_id, company_data in all_companies.items():
                    company_name = company_data.get('folder_name', company_id.replace('_', ' ').title())
                    company_info = company_data.get('company_info', '')
                    
                    if (query_lower in company_name.lower() or 
                        query_lower in company_info.lower()):
                        results.append({
                            'id': company_id,
                            'data': company_data,
                            'company_name': company_name
                        })
                
                return results
                
        except Exception as e:
            logger.error(f"Failed to search companies: {e}")
            return []