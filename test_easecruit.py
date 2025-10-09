#!/usr/bin/env python3

import requests
import json

def test_nextquark():
    """Test autofill with NextQuark company"""
    
    url = "http://localhost:5002/auto-fill-company"
    data = {
        "companyName": "nextquark",
        "website": "https://nextquark.in/",
        "linkedinPage": "https://www.linkedin.com/company/nextquark/"
    }
    
    print("🧪 Testing NextQuark Autofill")
    print("=" * 40)
    print(f"Company: {data['companyName']}")
    print(f"Website: {data['website']}")
    print(f"LinkedIn: {data['linkedinPage']}")
    print("-" * 40)
    
    try:
        response = requests.post(url, json=data, timeout=60)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success: {result.get('success')}")
            print(f"Message: {result.get('message')}")
            print(f"Sources Used: {result.get('sources_used', [])}")
            print(f"Fields Filled: {result.get('fields_filled', 0)}")
            print(f"Partial Success: {result.get('partial_success', False)}")
            
            if result.get('data'):
                data_obj = result['data']
                print("\n📊 Extracted Data:")
                print(f"Category: {data_obj.get('category', 'N/A')}")
                print(f"Founded: {data_obj.get('founded', 'N/A')}")
                print(f"Headquarters: {data_obj.get('headquarters', 'N/A')}")
                print(f"Employees: {data_obj.get('employees', 'N/A')}")
                print(f"Description: {data_obj.get('description', 'N/A')[:100]}...")
                print(f"Products: {len(data_obj.get('products', []))} items")
                print(f"Features: {len(data_obj.get('features', ''))} chars")
        else:
            print(f"Error: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_nextquark()