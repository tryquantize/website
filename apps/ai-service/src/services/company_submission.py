import os
import json
from typing import Dict, Any
import logging
import re

logger = logging.getLogger(__name__)

class CompanySubmissionService:
    def __init__(self):
        self.rag_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'rag')
        self.companies_path = os.path.join(self.rag_path, 'companies')
        self.pending_path = os.path.join(self.rag_path, 'data', 'pending_submissions')
        
        # Ensure directories exist
        os.makedirs(self.companies_path, exist_ok=True)
        os.makedirs(self.pending_path, exist_ok=True)
    
    def submit_company(self, form_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process company submission and create RAG folder structure"""
        try:
            # Validate required fields
            required_fields = ['companyName', 'website', 'description', 'category']
            for field in required_fields:
                if not form_data.get(field, '').strip():
                    return {
                        'success': False,
                        'error': f'Missing required field: {field}'
                    }
            
            # Generate company folder name
            company_folder = self._generate_folder_name(form_data['companyName'])
            
            # Check if company already exists
            if self._company_exists(company_folder):
                return {
                    'success': False,
                    'error': 'Company already exists in our database'
                }
            
            # Create company folder and files
            self._create_company_folder(company_folder, form_data)
            
            logger.info(f"Successfully created company folder: {company_folder}")
            
            return {
                'success': True,
                'message': 'Company submitted successfully',
                'company_folder': company_folder
            }
            
        except Exception as e:
            logger.error(f"Failed to submit company: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _generate_folder_name(self, company_name: str) -> str:
        """Generate a clean folder name from company name"""
        # Convert to lowercase, remove special characters, replace spaces with underscores
        folder_name = re.sub(r'[^\w\s-]', '', company_name.lower())
        folder_name = re.sub(r'[-\s]+', '_', folder_name)
        return folder_name.strip('_')
    
    def _company_exists(self, company_folder: str) -> bool:
        """Check if company folder already exists"""
        company_path = os.path.join(self.companies_path, company_folder)
        return os.path.exists(company_path)
    
    def _create_company_folder(self, company_folder: str, form_data: Dict[str, Any]):
        """Create company folder with all required files"""
        company_path = os.path.join(self.companies_path, company_folder)
        os.makedirs(company_path, exist_ok=True)
        
        # Create links.json
        self._create_links_file(company_path, form_data)
        
        # Create company_info.txt
        self._create_company_info_file(company_path, form_data)
        
        # Create pricing.txt
        self._create_pricing_file(company_path, form_data)
        
        # Create features.txt
        self._create_features_file(company_path, form_data)
        
        # Create use_cases.txt
        self._create_use_cases_file(company_path, form_data)
    
    def _create_links_file(self, company_path: str, form_data: Dict[str, Any]):
        """Create links.json file"""
        links_data = {
            "official_pages": [],
            "reviews": [],
            "documentation": []
        }
        
        # Add main website
        if form_data.get('website'):
            links_data["official_pages"].append(form_data['website'])
        
        # Parse additional URLs
        if form_data.get('officialPages'):
            official_urls = [url.strip() for url in form_data['officialPages'].split('\n') if url.strip()]
            links_data["official_pages"].extend(official_urls)
        
        if form_data.get('reviewPages'):
            review_urls = [url.strip() for url in form_data['reviewPages'].split('\n') if url.strip()]
            links_data["reviews"].extend(review_urls)
        
        if form_data.get('documentationPages'):
            doc_urls = [url.strip() for url in form_data['documentationPages'].split('\n') if url.strip()]
            links_data["documentation"].extend(doc_urls)
        
        # Write links.json
        with open(os.path.join(company_path, 'links.json'), 'w', encoding='utf-8') as f:
            json.dump(links_data, f, indent=2, ensure_ascii=False)
    
    def _create_company_info_file(self, company_path: str, form_data: Dict[str, Any]):
        """Create company_info.txt file"""
        info_lines = [
            f"Company: {form_data.get('companyName', '')}",
            f"Founded: {form_data.get('founded', 'N/A')}",
            f"Headquarters: {form_data.get('headquarters', 'N/A')}",
            f"Products: {form_data.get('products', '')}",
            f"Description: {form_data.get('description', '')}",
            f"Website: {form_data.get('website', '')}",
            f"Category: {form_data.get('category', '')}",
            f"Employees: {form_data.get('employees', 'N/A')}"
        ]
        
        content = '\n'.join(info_lines)
        
        with open(os.path.join(company_path, 'company_info.txt'), 'w', encoding='utf-8') as f:
            f.write(content)
    
    def _create_pricing_file(self, company_path: str, form_data: Dict[str, Any]):
        """Create pricing.txt file"""
        pricing_content = form_data.get('pricing', 'Contact for pricing')
        
        with open(os.path.join(company_path, 'pricing.txt'), 'w', encoding='utf-8') as f:
            f.write(pricing_content)
    
    def _create_features_file(self, company_path: str, form_data: Dict[str, Any]):
        """Create features.txt file"""
        features_content = form_data.get('features', '- AI-powered solutions\n- Easy integration\n- Professional support')
        
        with open(os.path.join(company_path, 'features.txt'), 'w', encoding='utf-8') as f:
            f.write(features_content)
    
    def _create_use_cases_file(self, company_path: str, form_data: Dict[str, Any]):
        """Create use_cases.txt file"""
        use_cases_content = form_data.get('useCases', 'Business Applications:\n- Automation\n- Analytics\n- Customer service')
        
        with open(os.path.join(company_path, 'use_cases.txt'), 'w', encoding='utf-8') as f:
            f.write(use_cases_content)
    
    def get_pending_submissions(self) -> list:
        """Get list of pending company submissions"""
        try:
            pending_files = []
            if os.path.exists(self.pending_path):
                for file in os.listdir(self.pending_path):
                    if file.endswith('.json'):
                        pending_files.append(file)
            return pending_files
        except Exception as e:
            logger.error(f"Failed to get pending submissions: {e}")
            return []
    
    def approve_submission(self, submission_id: str) -> Dict[str, Any]:
        """Approve a pending submission and create company folder"""
        try:
            pending_file = os.path.join(self.pending_path, f"{submission_id}.json")
            
            if not os.path.exists(pending_file):
                return {'success': False, 'error': 'Submission not found'}
            
            # Load submission data
            with open(pending_file, 'r', encoding='utf-8') as f:
                form_data = json.load(f)
            
            # Create company folder
            result = self.submit_company(form_data)
            
            if result['success']:
                # Remove pending file
                os.remove(pending_file)
                logger.info(f"Approved and created company: {result['company_folder']}")
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to approve submission: {e}")
            return {'success': False, 'error': str(e)}