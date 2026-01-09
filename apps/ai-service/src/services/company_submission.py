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
            
            # Validate that products array has at least one item
            if not form_data.get('products') or len(form_data.get('products', [])) == 0:
                return {
                    'success': False,
                    'error': 'At least one product/service is required'
                }
            
            # Validate that at least one pricing range is selected
            if not form_data.get('pricingRanges') or len(form_data.get('pricingRanges', [])) == 0:
                return {
                    'success': False,
                    'error': 'At least one pricing range is required'
                }
            
            # Validate that at least one industry is selected
            if not form_data.get('industriesServed') or len(form_data.get('industriesServed', [])) == 0:
                return {
                    'success': False,
                    'error': 'At least one industry served is required'
                }
            
            # Validate that at least one customer segment is selected
            if not form_data.get('customerSegments') or len(form_data.get('customerSegments', [])) == 0:
                return {
                    'success': False,
                    'error': 'At least one customer segment is required'
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
        
        # Create clients.txt
        self._create_clients_file(company_path, form_data)
        
        # Create market_info.txt (new file for market and deployment info)
        self._create_market_info_file(company_path, form_data)
    
    def _create_links_file(self, company_path: str, form_data: Dict[str, Any]):
        """Create links.json file"""
        links_data = {
            "official_pages": [],
            "testimonials": [],
            "linkedin": [],
            "contact": []
        }
        
        # Add main website
        if form_data.get('website'):
            links_data["official_pages"].append(form_data['website'])
        
        # Add LinkedIn page
        if form_data.get('linkedinPage'):
            links_data["linkedin"].append(form_data['linkedinPage'])
        
        # Add testimonial page
        if form_data.get('testimonialPage'):
            links_data["testimonials"].append(form_data['testimonialPage'])
        
        # Add phone number as contact info
        if form_data.get('phoneNumber'):
            links_data["contact"].append(f"Phone: {form_data['phoneNumber']}")
        
        # Write links.json
        with open(os.path.join(company_path, 'links.json'), 'w', encoding='utf-8') as f:
            json.dump(links_data, f, indent=2, ensure_ascii=False)
    
    def _create_company_info_file(self, company_path: str, form_data: Dict[str, Any]):
        """Create company_info.txt file"""
        # Format products array
        products_list = form_data.get('products', [])
        products_text = '\n'.join([f"- {product}" for product in products_list]) if products_list else 'N/A'
        
        # Format founders array
        founders_list = form_data.get('founders', [])
        founders_text = '\n'.join([f"- {founder.get('name', 'N/A')} (Email: {founder.get('email', 'N/A')}, Phone: {founder.get('phone', 'N/A')})" for founder in founders_list]) if founders_list else 'N/A'
        
        info_lines = [
            f"Company: {form_data.get('companyName', '')}",
            f"Founded: {form_data.get('founded', 'N/A')}",
            f"Headquarters: {form_data.get('headquarters', 'N/A')}",
            f"Description: {form_data.get('description', '')}",
            f"Website: {form_data.get('website', '')}",
            f"LinkedIn: {form_data.get('linkedinPage', 'N/A')}",
            f"Phone: {form_data.get('phoneNumber', 'N/A')}",
            f"Category: {form_data.get('category', '')}",
            f"Employees: {form_data.get('employees', 'N/A')}",
            f"Company Stage: {form_data.get('companyStage', 'N/A')}",
            f"Industries Served: {', '.join(form_data.get('industriesServed', []))}",
            f"Pricing Ranges: {', '.join(form_data.get('pricingRanges', ['Contact for pricing']))}",
            f"Pricing Models: {', '.join(form_data.get('pricingModel', []))}",
            f"Top Clients: {', '.join(form_data.get('topClients', []))}",
            f"Tagline: {form_data.get('tagline', 'N/A')}",
            f"USP/Differentiator: {form_data.get('uspTagline', 'N/A')}",
            f"Customer Segments: {', '.join(form_data.get('customerSegments', []))}",
            f"Deployment Types: {', '.join(form_data.get('deploymentType', []))}",
            f"Ideal For: {', '.join(form_data.get('idealScenarios', []))}",
            f"Trial Available: {'Yes' if form_data.get('trialAvailable', False) else 'No'}",
            f"VC Event Interest: {'Yes' if form_data.get('vcEventInterested', False) else 'No'}",
            "",
            "Products/Services:",
            products_text,
            "",
            "Founders:",
            founders_text
        ]
        
        content = '\n'.join(info_lines)
        
        with open(os.path.join(company_path, 'company_info.txt'), 'w', encoding='utf-8') as f:
            f.write(content)
    
    def _create_pricing_file(self, company_path: str, form_data: Dict[str, Any]):
        """Create pricing.txt file"""
        pricing_ranges = form_data.get('pricingRanges', ['Contact for pricing'])
        pricing_models = form_data.get('pricingModel', [])
        
        pricing_content = f"Pricing Ranges: {', '.join(pricing_ranges)}\n"
        if pricing_models:
            pricing_content += f"Pricing Models: {', '.join(pricing_models)}\n"
        pricing_content += "\nFor detailed pricing information, please contact the company directly."
        
        with open(os.path.join(company_path, 'pricing.txt'), 'w', encoding='utf-8') as f:
            f.write(pricing_content)
    
    def _create_features_file(self, company_path: str, form_data: Dict[str, Any]):
        """Create features.txt file"""
        features_text = form_data.get('features', '')
        if features_text:
            # Split features text into lines and format as bullet points
            features_lines = [line.strip() for line in features_text.split('\n') if line.strip()]
            if features_lines:
                features_content = '\n'.join([f"- {line}" if not line.startswith('-') else line for line in features_lines])
            else:
                features_content = features_text
        else:
            features_content = '- AI-powered solutions\n- Easy integration\n- Professional support'
        
        with open(os.path.join(company_path, 'features.txt'), 'w', encoding='utf-8') as f:
            f.write(features_content)
    
    def _create_use_cases_file(self, company_path: str, form_data: Dict[str, Any]):
        """Create use_cases.txt file"""
        use_cases_text = form_data.get('useCases', '')
        if use_cases_text:
            # Split use cases text into lines and format as bullet points
            use_cases_lines = [line.strip() for line in use_cases_text.split('\n') if line.strip()]
            if use_cases_lines:
                use_cases_content = '\n'.join([f"- {line}" if not line.startswith('-') else line for line in use_cases_lines])
            else:
                use_cases_content = use_cases_text
        else:
            use_cases_content = 'Business Applications:\n- Automation\n- Analytics\n- Customer service'
        
        with open(os.path.join(company_path, 'use_cases.txt'), 'w', encoding='utf-8') as f:
            f.write(use_cases_content)
    
    def _create_clients_file(self, company_path: str, form_data: Dict[str, Any]):
        """Create clients.txt file"""
        clients_list = form_data.get('topClients', [])
        if clients_list:
            clients_content = '\n'.join([f"- {client}" for client in clients_list])
        else:
            clients_content = 'No clients listed'
        
        with open(os.path.join(company_path, 'clients.txt'), 'w', encoding='utf-8') as f:
            f.write(clients_content)
    
    def _create_market_info_file(self, company_path: str, form_data: Dict[str, Any]):
        """Create market_info.txt file with new market and deployment information"""
        market_lines = []
        
        # Customer Segments
        customer_segments = form_data.get('customerSegments', [])
        if customer_segments:
            market_lines.append(f"Customer Segments: {', '.join(customer_segments)}")
        
        # Deployment Types
        deployment_types = form_data.get('deploymentType', [])
        if deployment_types:
            market_lines.append(f"Deployment Options: {', '.join(deployment_types)}")
        
        # Ideal Scenarios
        ideal_scenarios = form_data.get('idealScenarios', [])
        if ideal_scenarios:
            market_lines.append(f"Ideal Customer Types: {', '.join(ideal_scenarios)}")
        
        # Trial Availability
        trial_available = form_data.get('trialAvailable', False)
        market_lines.append(f"Free Trial/Demo Available: {'Yes' if trial_available else 'No'}")
        
        # USP/Differentiator
        usp_tagline = form_data.get('uspTagline', '')
        if usp_tagline:
            market_lines.append(f"Unique Selling Proposition: {usp_tagline}")
        
        # Company Tagline
        tagline = form_data.get('tagline', '')
        if tagline:
            market_lines.append(f"Company Tagline: {tagline}")
        
        market_content = '\n'.join(market_lines) if market_lines else 'No additional market information provided.'
        
        with open(os.path.join(company_path, 'market_info.txt'), 'w', encoding='utf-8') as f:
            f.write(market_content)
    
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