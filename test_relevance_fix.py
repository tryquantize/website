#!/usr/bin/env python3

import sys
import os

# Add the ai-service src directory to path
ai_service_path = os.path.join(os.path.dirname(__file__), 'apps', 'ai-service', 'src')
sys.path.insert(0, ai_service_path)

from rag.services.text_matcher import TextMatcher
from rag.services.data_loader import DataLoader

def test_relevance_matching():
    """Test the improved relevance matching"""
    
    # Initialize components
    data_loader = DataLoader()
    text_matcher = TextMatcher()
    
    # Load company data
    companies_data = data_loader.load_all_companies()
    print(f"Loaded {len(companies_data)} companies")
    
    # Test queries
    test_queries = [
        "image generation tools",
        "chatbot platforms", 
        "AI writing assistants",
        "machine learning platforms",
        "business automation",
        "OpenAI",
        "very specific non-existent query about quantum computing blockchain"
    ]
    
    for query in test_queries:
        print(f"\n{'='*50}")
        print(f"Testing query: '{query}'")
        print(f"{'='*50}")
        
        matches = text_matcher.find_matching_companies(query, companies_data)
        
        print(f"Found {len(matches)} relevant matches:")
        
        for i, match in enumerate(matches[:5]):  # Show top 5
            company_name = match['company_name']
            score = match['score']
            
            # Get company description for context
            company_info = match['data'].get('company_info', '')
            description = ""
            for line in company_info.split('\n'):
                if line.startswith('Description:'):
                    description = line.replace('Description:', '').strip()
                    break
            
            print(f"{i+1}. {company_name} (Score: {score:.1f})")
            print(f"   Description: {description}")
        
        if not matches:
            print("No relevant matches found - this is good for irrelevant queries!")

if __name__ == "__main__":
    test_relevance_matching()