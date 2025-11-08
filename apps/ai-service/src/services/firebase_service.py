import os
import json
import logging
from typing import Dict, List, Any, Optional
import firebase_admin
from firebase_admin import credentials, firestore
from concurrent.futures import ThreadPoolExecutor
import concurrent.futures
import time

logger = logging.getLogger(__name__)

class FirebaseService:
    def __init__(self):
        self.db = None
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            if not firebase_admin._apps:
                service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')
                project_id = os.getenv('FIREBASE_PROJECT_ID')
                
                if service_account_path and os.path.exists(service_account_path):
                    cred = credentials.Certificate(service_account_path)
                    firebase_admin.initialize_app(cred, {'projectId': project_id})
                else:
                    cred = credentials.ApplicationDefault()
                    firebase_admin.initialize_app(cred, {'projectId': project_id})
                
                logger.info("Firebase Admin SDK initialized successfully")
            
            self.db = firestore.client()
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            raise
    
    def save_company_data(self, company_name: str, company_data: Dict[str, Any]) -> bool:
        """Save company data to Firestore"""
        try:
            firestore_data = {
                'company_name': company_name,
                'folder_name': company_data.get('folder_name', company_name),
                'company_info': company_data.get('company_info', ''),
                'features': company_data.get('features', ''),
                'pricing': company_data.get('pricing', ''),
                'use_cases': company_data.get('use_cases', ''),
                'clients': company_data.get('clients', ''),
                'market_info': company_data.get('market_info', ''),
                'links': company_data.get('links', {}),
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'active'
            }
            
            doc_ref = self.db.collection('companies').document(company_name.lower().replace(' ', '_'))
            doc_ref.set(firestore_data)
            
            logger.info(f"Successfully saved company data for {company_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to save company data for {company_name}: {e}")
            return False
    
    def get_all_companies(self) -> Dict[str, Dict[str, Any]]:
        """Get all company data from Firestore"""
        try:
            companies_data = {}
            companies_ref = self.db.collection('companies')
            query = companies_ref.where('status', '==', 'active')
            docs = query.stream()
            
            for doc in docs:
                data = doc.to_dict()
                company_name = data.get('folder_name', doc.id)
                companies_data[company_name] = {'data': data}
            
            logger.info(f"Retrieved {len(companies_data)} companies from Firestore")
            return companies_data
            
        except Exception as e:
            logger.error(f"Failed to get companies from Firestore: {e}")
            return {}
    
    def get_company_data(self, company_name: str) -> Optional[Dict[str, Any]]:
        """Get specific company data from Firestore"""
        try:
            doc_id = company_name.lower().replace(' ', '_')
            doc_ref = self.db.collection('companies').document(doc_id)
            doc = doc_ref.get()
            
            if doc.exists:
                return doc.to_dict()
            else:
                logger.warning(f"Company {company_name} not found in Firestore")
                return None
                
        except Exception as e:
            logger.error(f"Failed to get company data for {company_name}: {e}")
            return None

# Global instance
firebase_service = FirebaseService()