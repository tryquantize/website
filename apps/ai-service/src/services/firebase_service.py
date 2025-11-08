"""
Firebase service for AI service to access company data from Firestore
"""
import os
import json
import logging
from typing import Dict, List, Any, Optional
import firebase_admin
from firebase_admin import credentials, firestore

logger = logging.getLogger(__name__)

class FirebaseService:
    def __init__(self):
        self.db = None
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if Firebase is already initialized
            if not firebase_admin._apps:
                # Get service account from environment variable
                service_account_json = os.getenv('FIREBASE_SERVICE_ACCOUNT')
                
                if service_account_json:
                    # Parse JSON string
                    service_account = json.loads(service_account_json)
                    cred = credentials.Certificate(service_account)
                    firebase_admin.initialize_app(cred)
                else:
                    logger.error("FIREBASE_SERVICE_ACCOUNT environment variable not found")
                    return
            
            # Get Firestore client
            self.db = firestore.client()
            logger.info("Firebase initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            self.db = None
    
    def get_all_companies(self) -> Dict[str, Any]:
        """Get all companies from Firestore"""
        try:
            if not self.db:
                logger.error("Firebase not initialized")
                return {}
            
            companies_data = {}
            
            # Get all companies from the 'companies' collection
            companies_ref = self.db.collection('companies')
            companies = companies_ref.stream()
            
            for company_doc in companies:
                company_id = company_doc.id
                company_data = company_doc.to_dict()
                
                # Convert Firestore data to RAG format, passing doc_id for fallback
                companies_data[company_id] = self._convert_firestore_to_rag_format(company_data, company_id)
            
            logger.info(f"Retrieved {len(companies_data)} companies from Firebase")
            return companies_data
            
        except Exception as e:
            logger.error(f"Failed to get companies from Firebase: {e}")
            return {}
    
    def _convert_firestore_to_rag_format(self, firestore_data: Dict[str, Any], doc_id: str = '') -> Dict[str, str]:
        """Convert Firestore company data to RAG format - pass through all existing fields"""
        try:
            # Pass through all the existing Firebase fields directly
            company_name = (
                firestore_data.get('companyName', '') or 
                firestore_data.get('name', '') or 
                doc_id.replace('_', ' ').title() or 
                'Unknown'
            )
            
            # Return all Firebase fields as-is for direct access
            result = {
                'folder_name': company_name,
                'original_company_name': company_name,
                'doc_id': doc_id
            }
            
            # Add all Firebase fields directly
            for key, value in firestore_data.items():
                if value is not None:  # Only include non-null values
                    result[key] = value
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to convert Firestore data: {e}")
            fallback_name = doc_id.replace('_', ' ').title() if doc_id else 'Unknown'
            return {
                'folder_name': fallback_name,
                'original_company_name': fallback_name,
                'name': fallback_name
            }
    
    def search_companies(self, query: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Search companies in Firestore"""
        try:
            if not self.db:
                logger.error("Firebase not initialized")
                return []
            
            companies_ref = self.db.collection('companies')
            
            # Simple text search - in production, you might want to use more advanced search
            companies = companies_ref.limit(limit).stream()
            
            results = []
            query_lower = query.lower()
            
            for company_doc in companies:
                company_data = company_doc.to_dict()
                
                # Simple relevance check
                company_name = company_data.get('companyName', '').lower()
                description = company_data.get('description', '').lower()
                category = company_data.get('category', '').lower()
                
                if (query_lower in company_name or 
                    query_lower in description or 
                    query_lower in category):
                    
                    # Convert data and extract proper company name
                    converted_data = self._convert_firestore_to_rag_format(company_data, company_doc.id)
                    actual_company_name = converted_data.get('folder_name', company_doc.id.replace('_', ' ').title())
                    
                    results.append({
                        'id': company_doc.id,
                        'data': converted_data,
                        'company_name': actual_company_name
                    })
            
            logger.info(f"Found {len(results)} companies matching query: {query}")
            return results
            
        except Exception as e:
            logger.error(f"Failed to search companies: {e}")
            return []
    
    def add_company(self, company_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add a new company to Firestore"""
        try:
            if not self.db:
                return {"success": False, "error": "Firebase not initialized"}
            
            companies_ref = self.db.collection('companies')
            
            # Add timestamp
            company_data['createdAt'] = firestore.SERVER_TIMESTAMP
            company_data['updatedAt'] = firestore.SERVER_TIMESTAMP
            
            # Add the company
            doc_ref = companies_ref.add(company_data)
            
            logger.info(f"Added company {company_data.get('companyName')} to Firebase")
            
            return {
                "success": True,
                "id": doc_ref[1].id,
                "message": "Company added successfully"
            }
            
        except Exception as e:
            logger.error(f"Failed to add company to Firebase: {e}")
            return {
                "success": False,
                "error": str(e)
            }