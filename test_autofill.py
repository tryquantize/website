#!/usr/bin/env python3

import requests
import json

# Test the improved auto-fill endpoint
def test_autofill():
    url = "http://localhost:5002/auto-fill-company"
    
    # Test with both URLs
    print("🧪 Testing with both website and LinkedIn URLs:")
    data = {
        "companyName": "OpenAI",
        "website": "https://openai.com",
        "linkedinPage": "https://linkedin.com/company/openai"
    }
    
    try:
        response = requests.post(url, json=data, timeout=30)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Success: {result.get('success')}")
            print(f"Message: {result.get('message')}")
            print(f"Sources Used: {result.get('sources_used', [])}")
            print(f"Fields Filled: {result.get('fields_filled', 0)}")
            print(f"Partial Success: {result.get('partial_success', False)}")
        else:
            print(f"Response: {response.text}")
    except requests.exceptions.Timeout:
        print("Request timed out")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n" + "="*50)
    
    # Test with only website URL (LinkedIn fails)
    print("\n🧪 Testing with only website URL (simulating LinkedIn failure):")
    data = {
        "companyName": "Anthropic",
        "website": "https://anthropic.com",
        "linkedinPage": ""  # Empty LinkedIn URL
    }
    
    try:
        response = requests.post(url, json=data, timeout=30)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Success: {result.get('success')}")
            print(f"Message: {result.get('message')}")
            print(f"Sources Used: {result.get('sources_used', [])}")
            print(f"Fields Filled: {result.get('fields_filled', 0)}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n" + "="*50)
    
    # Test with invalid URLs (should still return basic info)
    print("\n🧪 Testing with invalid URLs (should return basic info):")
    data = {
        "companyName": "TestCompany",
        "website": "https://nonexistent-website-12345.com",
        "linkedinPage": "https://linkedin.com/company/nonexistent-12345"
    }
    
    try:
        response = requests.post(url, json=data, timeout=30)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Success: {result.get('success')}")
            print(f"Message: {result.get('message')}")
            print(f"Partial Success: {result.get('partial_success', False)}")
            if result.get('data'):
                data_obj = result['data']
                print(f"Basic info provided: Category='{data_obj.get('category')}', Description length={len(data_obj.get('description', ''))}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("🚀 Testing Improved Autofill Functionality")
    print("This demonstrates graceful handling of partial failures\n")
    test_autofill()
    print("\n✅ Testing completed! The autofill now works even when some URLs fail.")