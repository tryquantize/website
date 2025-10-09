#!/usr/bin/env python3
"""
Test script for the updated company submission form
"""

import requests
import json
import sys
import os

# Test data with the new form structure
test_company_data = {
    "companyName": "TestAI Corp",
    "website": "https://testai.com",
    "linkedinPage": "https://linkedin.com/company/testai",
    "phoneNumber": "+1 (555) 123-4567",
    "founded": "2023",
    "headquarters": "San Francisco, CA",
    "products": [
        "AI Writing Assistant with advanced grammar checking and tone adjustment",
        "Computer Vision API for retail object detection and inventory management",
        "Natural Language Processing SDK for customer service automation"
    ],
    "description": "TestAI Corp is a cutting-edge artificial intelligence company focused on developing practical AI solutions for businesses. We specialize in natural language processing, computer vision, and automated customer service solutions that help companies improve efficiency and customer satisfaction.",
    "category": "AI Platform",
    "employees": "50-100",
    "pricingRanges": ["$1,000-$2,500", "$2,500-$5,000", "Contact for pricing"],
    "features": [
        "Real-time processing with 99.9% uptime guarantee",
        "Multi-language support for 50+ languages including RTL languages",
        "Enterprise-grade security with SOC 2 Type II compliance",
        "RESTful API with comprehensive documentation and SDKs",
        "24/7 customer support with dedicated account managers"
    ],
    "useCases": [
        "E-commerce product description generation for 10,000+ SKUs with SEO optimization",
        "Customer service automation reducing response time by 80% and improving satisfaction",
        "Medical image analysis for radiology departments with FDA-approved accuracy",
        "Financial document processing for banks and insurance companies",
        "Content moderation for social media platforms handling millions of posts daily"
    ],
    "testimonialPage": "https://testai.com/testimonials"
}

def test_company_submission():
    """Test the company submission endpoint"""
    
    # AI Service URL
    ai_service_url = "http://localhost:5002"
    
    print("Testing company submission with new form structure...")
    print(f"Company: {test_company_data['companyName']}")
    print(f"Products: {len(test_company_data['products'])} items")
    print(f"Features: {len(test_company_data['features'])} items")
    print(f"Use Cases: {len(test_company_data['useCases'])} items")
    print()
    
    try:
        # Test the AI service directly
        response = requests.post(
            f"{ai_service_url}/add-company",
            json=test_company_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ Company submission successful!")
                print(f"Company folder created: {result.get('company_folder')}")
                
                # Check if files were created
                company_folder = result.get('company_folder')
                if company_folder:
                    rag_path = os.path.join(
                        os.path.dirname(__file__),
                        "apps/ai-service/src/rag/companies",
                        company_folder
                    )
                    
                    expected_files = [
                        "company_info.txt",
                        "features.txt", 
                        "use_cases.txt",
                        "pricing.txt",
                        "links.json"
                    ]
                    
                    print("\nChecking created files:")
                    for file in expected_files:
                        file_path = os.path.join(rag_path, file)
                        if os.path.exists(file_path):
                            print(f"✅ {file} created")
                            
                            # Show content preview
                            with open(file_path, 'r', encoding='utf-8') as f:
                                content = f.read()
                                preview = content[:200] + "..." if len(content) > 200 else content
                                print(f"   Preview: {preview}")
                        else:
                            print(f"❌ {file} missing")
                    
                return True
            else:
                print(f"❌ Submission failed: {result.get('error')}")
                return False
        else:
            print(f"❌ HTTP Error {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to AI service. Make sure it's running on localhost:5002")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_text_enhancement():
    """Test the text enhancement endpoint"""
    
    ai_service_url = "http://localhost:5002"
    
    print("\nTesting text enhancement...")
    
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
    
    try:
        for i, test_case in enumerate(test_cases, 1):
            print(f"\nTest {i}: Enhancing {test_case['type']} - '{test_case['text']}'")
            
            response = requests.post(
                f"{ai_service_url}/enhance-text",
                json=test_case,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"✅ Original: {result.get('originalText')}")
                    print(f"✅ Enhanced: {result.get('enhancedText')}")
                else:
                    print(f"❌ Enhancement failed: {result.get('error')}")
                    return False
            else:
                print(f"❌ HTTP Error {response.status_code}: {response.text}")
                return False
        
        print("\n✅ All text enhancement tests passed!")
        return True
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to AI service for text enhancement")
        return False
    except Exception as e:
        print(f"❌ Text enhancement error: {str(e)}")
        return False

def test_api_endpoint():
    """Test the Express API endpoint"""
    
    api_url = "http://localhost:3001"
    
    print("\nTesting Express API endpoint...")
    
    try:
        response = requests.post(
            f"{api_url}/api/add-company",
            json=test_company_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ API endpoint working correctly!")
                return True
            else:
                print(f"❌ API failed: {result.get('error')}")
                return False
        else:
            print(f"❌ API HTTP Error {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API. Make sure it's running on localhost:3001")
        return False
    except Exception as e:
        print(f"❌ API Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Updated Company Submission Form")
    print("=" * 50)
    
    # Test AI service directly
    ai_success = test_company_submission()
    
    # Test text enhancement
    enhancement_success = test_text_enhancement()
    
    # Test API endpoint
    api_success = test_api_endpoint()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"AI Service: {'✅ PASS' if ai_success else '❌ FAIL'}")
    print(f"Text Enhancement: {'✅ PASS' if enhancement_success else '❌ FAIL'}")
    print(f"API Endpoint: {'✅ PASS' if api_success else '❌ FAIL'}")
    
    if ai_success and enhancement_success:
        print("\n🎉 Core functionality tests passed! The updated form is working correctly.")
        if not api_success:
            print("⚠️  API endpoint test failed (server may not be running)")
        sys.exit(0)
    else:
        print("\n⚠️  Some core tests failed. Check the output above for details.")
        sys.exit(1)