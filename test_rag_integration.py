#!/usr/bin/env python3
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

sys.path.append(os.path.join(os.path.dirname(__file__), 'apps/ai-service/src'))

from rag.services.rag_search import RAGSearchService

def test_rag_integration():
    print("🧪 Testing RAG Integration with Enhanced Use Cases")
    print("=" * 60)
    
    rag_service = RAGSearchService()
    
    # Test search that should return Kartar AI
    query = "AI security solutions"
    
    print(f"Search Query: '{query}'")
    print()
    
    try:
        result = rag_service.search(query)
        
        if result['success'] and result['companies']:
            print(f"✅ Found {len(result['companies'])} companies")
            
            # Check first company for enhanced use cases
            first_company = result['companies'][0]
            print(f"\nFirst Company: {first_company['name']}")
            
            if 'enhancedUseCases' in first_company:
                print("✅ Enhanced Use Cases found:")
                for i, use_case in enumerate(first_company['enhancedUseCases'], 1):
                    word_count = len(use_case.split())
                    print(f"  {i}. {use_case} ({word_count} words)")
            else:
                print("❌ Enhanced Use Cases missing")
                return False
            
            # Check other enhanced fields
            enhanced_fields = ['enhancedAbout', 'phoneNumber', 'linkedin_url', 'companyStage', 'industriesServed']
            for field in enhanced_fields:
                if field in first_company and first_company[field]:
                    print(f"✅ {field}: {str(first_company[field])[:50]}...")
                else:
                    print(f"⚠️  {field}: Not available")
            
            return True
        else:
            print("❌ No companies found or search failed")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_rag_integration()
    
    print("\n" + "=" * 60)
    print(f"RAG Integration Test: {'✅ PASS' if success else '❌ FAIL'}")
    
    sys.exit(0 if success else 1)