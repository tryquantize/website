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
                    
                    # Combine all searchable text
                    searchable_text = f"{company_name} {company_info} {features} {use_cases}".lower()
                    
                    # Check for matches with stricter relevance
                    match_score = 0
                    
                    # Company name exact match (highest priority)
                    if query_lower in company_name.lower():
                        match_score += 20
                    
                    # Exact query match in content
                    if query_lower in searchable_text:
                        match_score += 15
                    
                    # Individual word matches with context weighting
                    for word in query_words:
                        if word in company_name.lower():
                            match_score += 10  # Higher score for name matches
                        elif word in company_info.lower():
                            match_score += 5   # Medium score for description matches
                        elif word in features.lower():
                            match_score += 4   # Good score for feature matches
                        elif word in use_cases.lower():
                            match_score += 3   # Lower score for use case matches
                    
                    # Semantic matches for specific queries
                    if 'voice' in query_lower:
                        voice_terms = ['voice', 'speech', 'audio', 'conversation', 'talk', 'speak', 'vocal', 'sound']
                        for term in voice_terms:
                            if term in searchable_text:
                                match_score += 8  # High relevance for voice-related terms
                    
                    if 'chatbot' in query_lower or 'chat' in query_lower:
                        chat_terms = ['chat', 'conversation', 'messaging', 'bot', 'assistant', 'dialogue']
                        for term in chat_terms:
                            if term in searchable_text:
                                match_score += 8
                    
                    # Penalty for generic test companies unless specifically relevant
                    if any(test_word in company_name.lower() for test_word in ['test', 'firebase', 'final']):
                        if not any(relevant_word in searchable_text for relevant_word in query_words):
                            match_score = max(0, match_score - 10)
                    
                    # Only add companies with meaningful relevance
                    if match_score >= 8:  # Increased threshold for better relevance
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
                
                return results[:15]  # Return top 15 most relevant matches
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