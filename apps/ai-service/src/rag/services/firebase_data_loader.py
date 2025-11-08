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
        """Search companies using Firebase"""
        try:
            use_firebase = os.getenv('USE_FIREBASE', 'true').lower() == 'true'
            
            if use_firebase and self.firebase_service.db:
                return self.firebase_service.search_companies(query)
            else:
                # Fallback to loading all and filtering locally
                all_companies = self.load_all_companies()
                results = []
                query_lower = query.lower()
                
                for company_id, company_data in all_companies.items():
                    company_name = company_data.get('folder_name', '')
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