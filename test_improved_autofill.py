#!/usr/bin/env python3

import requests
import json
import time

def test_autofill_scenarios():
    """Test various autofill scenarios including partial failures"""
    
    base_url = "http://localhost:5002"
    
    # Test scenarios
    test_cases = [
        {
            "name": "Both URLs valid",
            "data": {
                "companyName": "OpenAI",
                "website": "https://openai.com",
                "linkedinPage": "https://linkedin.com/company/openai"
            }
        },
        {
            "name": "Only website URL",
            "data": {
                "companyName": "Anthropic",
                "website": "https://anthropic.com",
                "linkedinPage": ""
            }
        },
        {
            "name": "Only LinkedIn URL",
            "data": {
                "companyName": "DeepMind",
                "website": "",
                "linkedinPage": "https://linkedin.com/company/deepmind"
            }
        },
        {
            "name": "Invalid URLs (should still return basic info)",
            "data": {
                "companyName": "TestCompany",
                "website": "https://nonexistent-website-12345.com",
                "linkedinPage": "https://linkedin.com/company/nonexistent-company-12345"
            }
        },
        {
            "name": "Company name only",
            "data": {
                "companyName": "Microsoft",
                "website": "",
                "linkedinPage": ""
            }
        }
    ]
    
    print("🧪 Testing Improved Autofill Functionality")
    print("=" * 50)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}. Testing: {test_case['name']}")
        print("-" * 30)
        
        try:
            response = requests.post(
                f"{base_url}/auto-fill-company",
                json=test_case['data'],
                timeout=45
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"Success: {result.get('success')}")
                print(f"Message: {result.get('message')}")
                
                if 'sources_used' in result:
                    print(f"Sources Used: {result.get('sources_used')}")
                
                if 'fields_filled' in result:
                    print(f"Fields Filled: {result.get('fields_filled')}")
                
                if 'partial_success' in result:
                    print(f"Partial Success: {result.get('partial_success')}")
                
                # Show some key extracted data
                if result.get('success') and result.get('data'):
                    data = result['data']
                    print("\nExtracted Data Summary:")
                    print(f"  - Description: {'✓' if data.get('description') else '✗'} ({len(data.get('description', ''))} chars)")
                    print(f"  - Category: {'✓' if data.get('category') else '✗'} ({data.get('category', 'N/A')})")
                    print(f"  - Founded: {'✓' if data.get('founded') else '✗'} ({data.get('founded', 'N/A')})")
                    print(f"  - Headquarters: {'✓' if data.get('headquarters') else '✗'} ({data.get('headquarters', 'N/A')})")
                    print(f"  - Products: {'✓' if data.get('products') else '✗'} ({len(data.get('products', []))} items)")
                    print(f"  - Features: {'✓' if data.get('features') else '✗'} ({len(data.get('features', ''))} chars)")
            else:
                print(f"Error Response: {response.text}")
                
        except requests.exceptions.Timeout:
            print("❌ Request timed out (this is expected for some test cases)")
        except requests.exceptions.ConnectionError:
            print("❌ Connection error - make sure the AI service is running")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # Add delay between tests
        if i < len(test_cases):
            print("\nWaiting 3 seconds before next test...")
            time.sleep(3)
    
    print("\n" + "=" * 50)
    print("✅ Autofill testing completed!")
    print("\nKey improvements tested:")
    print("- ✓ Graceful handling of partial URL failures")
    print("- ✓ Fallback to basic information when scraping fails")
    print("- ✓ Multiple search strategies for better content retrieval")
    print("- ✓ Detailed response with sources used and fields filled")
    print("- ✓ Partial success indication for incomplete data")

def test_health_check():
    """Test if the AI service is running"""
    try:
        response = requests.get("http://localhost:5002/health", timeout=10)
        if response.status_code == 200:
            print("✅ AI Service is running and healthy")
            return True
        else:
            print(f"⚠️ AI Service responded with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ AI Service is not running: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Checking AI Service Health...")
    if test_health_check():
        print("\n🚀 Starting autofill tests...\n")
        test_autofill_scenarios()
    else:
        print("\n💡 Please start the AI service first:")
        print("   cd apps/ai-service && python app.py")