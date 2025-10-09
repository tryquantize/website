#!/usr/bin/env python3
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

sys.path.append(os.path.join(os.path.dirname(__file__), 'apps/ai-service/src'))

from services.text_enhancement import TextEnhancementService

def test_enhancement():
    print("🧪 Testing Text Enhancement Service with GPT-4o mini")
    print("=" * 60)
    
    service = TextEnhancementService()
    
    test_cases = [
        {
            "text": "AI writing tool",
            "type": "product",
            "context": {
                "companyName": "TestAI Corp",
                "category": "AI Platform",
                "description": "AI company focused on writing tools"
            }
        },
        {
            "text": "Fast processing",
            "type": "feature",
            "context": {
                "companyName": "TestAI Corp",
                "category": "AI Platform"
            }
        },
        {
            "text": "Content creation",
            "type": "useCase",
            "context": {
                "companyName": "TestAI Corp",
                "category": "AI Platform"
            }
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest {i}: Enhancing {test_case['type']}")
        print(f"Original: '{test_case['text']}'")
        
        result = service.enhance_text(
            test_case['text'], 
            test_case['type'], 
            test_case['context']
        )
        
        if result['success']:
            print(f"✅ Enhanced: '{result['enhancedText']}'")
        else:
            print(f"❌ Failed: {result['error']}")
            return False
    
    print("\n🎉 All enhancement tests passed!")
    return True

if __name__ == "__main__":
    success = test_enhancement()
    sys.exit(0 if success else 1)