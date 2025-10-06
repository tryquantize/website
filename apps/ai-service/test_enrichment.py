#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from services.company_enrichment import CompanyEnrichmentAgent
import json

# Test the enrichment agent
def test_enrichment():
    print("Testing Company Enrichment Agent...")
    
    # Create test companies
    test_companies = [
        {
            "name": "OpenAI",
            "description": "AI research company",
            "features": ["GPT Models", "API Access", "Research"],
            "pricing": "$20/month",
            "website": "https://openai.com",
            "category": "AI Research"
        },
        {
            "name": "Anthropic",
            "description": "AI safety company",
            "features": ["Claude AI", "Constitutional AI", "Safety"],
            "pricing": "Contact for pricing",
            "website": "https://anthropic.com",
            "category": "AI Safety"
        }
    ]
    
    # Initialize enrichment agent
    agent = CompanyEnrichmentAgent()
    
    # Test enrichment
    enriched = agent.enrich_company_data(test_companies, "AI chatbots")
    
    print("\nEnrichment Results:")
    for company in enriched:
        print(f"\n--- {company['name']} ---")
        print(f"Location: {company.get('location', 'N/A')}")
        print(f"Specifications: {company.get('specifications', [])}")
        print(f"About: {company.get('about', [])}")
        print(f"Rating: {company.get('rating', {})}")
        print(f"Website: {company.get('website', 'N/A')}")

if __name__ == "__main__":
    test_enrichment()