#!/usr/bin/env python3
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

sys.path.append(os.path.join(os.path.dirname(__file__), 'apps/ai-service/src'))

from rag.services.llm_enricher import LLMEnricher

def test_use_cases_generation():
    print("🧪 Testing Enhanced Use Cases Generation")
    print("=" * 60)
    
    enricher = LLMEnricher()
    
    # Test with Kartar AI data
    company_name = "Kartar AI"
    use_cases_text = """- "Comprehensive LLM Security and Vulnerability Solutions for AI Enterprises"

In an era where AI-driven technologies are integral to operational success, Kartar AI addresses the pressing challenges of security and vulnerabilities faced by AI-based companies. Our tailored solutions not only safeguard sensitive data but also enhance model performance by reducing the risk of adversarial attacks and data breaches. By implementing our robust security frameworks, businesses can expect to reduce their vulnerability exposure by up to 40%, ensuring compliance with industry standards while fostering trust and confidence among stakeholders."""
    
    industries_served = ["Fintech", "Retail", "E-commerce", "SaaS", "Real Estate"]
    
    print(f"Company: {company_name}")
    print(f"Industries: {', '.join(industries_served)}")
    print(f"Use Cases Data: {use_cases_text[:100]}...")
    print()
    
    try:
        enhanced_use_cases = enricher.generate_enhanced_use_cases(
            company_name, use_cases_text, industries_served
        )
        
        print("✅ Enhanced Use Cases Generated:")
        for i, use_case in enumerate(enhanced_use_cases, 1):
            word_count = len(use_case.split())
            print(f"{i}. {use_case} ({word_count} words)")
        
        print(f"\n📊 Generated {len(enhanced_use_cases)} use cases")
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_use_cases_generation()
    
    print("\n" + "=" * 60)
    print(f"Test Result: {'✅ PASS' if success else '❌ FAIL'}")
    
    sys.exit(0 if success else 1)