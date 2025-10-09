import os
import json
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class DataLoader:
    def __init__(self):
        self.rag_path = os.path.dirname(os.path.dirname(__file__))  # rag/ directory
        self.companies_path = os.path.join(self.rag_path, 'companies')
        self.categories_path = os.path.join(self.rag_path, 'categories')
    
    def load_all_companies(self) -> Dict[str, Dict[str, Any]]:
        """Load all company data from companies/ folder"""
        companies_data = {}
        
        if not os.path.exists(self.companies_path):
            logger.warning(f"Companies path does not exist: {self.companies_path}")
            return companies_data
        
        try:
            for company_folder in os.listdir(self.companies_path):
                company_path = os.path.join(self.companies_path, company_folder)
                
                if os.path.isdir(company_path):
                    company_data = self.load_company_data(company_folder)
                    if company_data:
                        companies_data[company_folder] = company_data
                        logger.debug(f"Loaded company: {company_folder}")
            
            logger.info(f"Successfully loaded {len(companies_data)} companies")
            return companies_data
            
        except Exception as e:
            logger.error(f"Failed to load companies data: {e}")
            return {}
    
    def load_company_data(self, company_name: str) -> Dict[str, Any]:
        """Load all data for a specific company"""
        company_path = os.path.join(self.companies_path, company_name)
        
        if not os.path.exists(company_path):
            logger.warning(f"Company folder does not exist: {company_path}")
            return {}
        
        company_data = {
            'folder_name': company_name,
            'links': {},
            'company_info': '',
            'pricing': '',
            'features': '',
            'use_cases': '',
            'reviews': '',
            'integrations': '',
            'alternatives': ''
        }
        
        try:
            # Load links.json
            links_file = os.path.join(company_path, 'links.json')
            if os.path.exists(links_file):
                with open(links_file, 'r', encoding='utf-8') as f:
                    company_data['links'] = json.load(f)
            
            # Load text files
            text_files = [
                'company_info.txt', 'pricing.txt', 'features.txt', 
                'use_cases.txt', 'reviews.txt', 'integrations.txt', 'alternatives.txt'
            ]
            
            for file_name in text_files:
                file_path = os.path.join(company_path, file_name)
                if os.path.exists(file_path):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        key = file_name.replace('.txt', '')
                        company_data[key] = f.read().strip()
            
            return company_data
            
        except Exception as e:
            logger.error(f"Failed to load data for company {company_name}: {e}")
            return {}
    
    def load_all_categories(self) -> Dict[str, Dict[str, Any]]:
        """Load all category data from categories/ folder"""
        categories_data = {}
        
        if not os.path.exists(self.categories_path):
            logger.warning(f"Categories path does not exist: {self.categories_path}")
            return categories_data
        
        try:
            for category_folder in os.listdir(self.categories_path):
                category_path = os.path.join(self.categories_path, category_folder)
                
                if os.path.isdir(category_path):
                    category_data = self.load_category_data(category_folder)
                    if category_data:
                        categories_data[category_folder] = category_data
                        logger.debug(f"Loaded category: {category_folder}")
            
            logger.info(f"Successfully loaded {len(categories_data)} categories")
            return categories_data
            
        except Exception as e:
            logger.error(f"Failed to load categories data: {e}")
            return {}
    
    def load_category_data(self, category_name: str) -> Dict[str, Any]:
        """Load all data for a specific category"""
        category_path = os.path.join(self.categories_path, category_name)
        
        if not os.path.exists(category_path):
            logger.warning(f"Category folder does not exist: {category_path}")
            return {}
        
        category_data = {
            'folder_name': category_name,
            'tools_list': '',
            'comparison': '',
            'pricing_ranges': ''
        }
        
        try:
            # Load text files
            text_files = ['tools_list.txt', 'comparison.txt', 'pricing_ranges.txt']
            
            for file_name in text_files:
                file_path = os.path.join(category_path, file_name)
                if os.path.exists(file_path):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        key = file_name.replace('.txt', '')
                        category_data[key] = f.read().strip()
            
            return category_data
            
        except Exception as e:
            logger.error(f"Failed to load data for category {category_name}: {e}")
            return {}
    
    def get_company_list(self) -> List[str]:
        """Get list of all available companies"""
        if not os.path.exists(self.companies_path):
            return []
        
        try:
            return [folder for folder in os.listdir(self.companies_path) 
                   if os.path.isdir(os.path.join(self.companies_path, folder))]
        except Exception as e:
            logger.error(f"Failed to get company list: {e}")
            return []
    
    def get_category_list(self) -> List[str]:
        """Get list of all available categories"""
        if not os.path.exists(self.categories_path):
            return []
        
        try:
            return [folder for folder in os.listdir(self.categories_path) 
                   if os.path.isdir(os.path.join(self.categories_path, folder))]
        except Exception as e:
            logger.error(f"Failed to get category list: {e}")
            return []