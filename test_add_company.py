#!/usr/bin/env python3

import requests
import json

def test_add_company():
    """Test the add-company endpoint"""
    
    url = "http://localhost:5002/add-company"
    data = {
        "companyName": "Test Company",
        "website": "https://test.com",
        "linkedinPage": "https://linkedin.com/company/test",
        "phoneNumber": "",
        "founded": "",
        "headquarters": "",
        "products": [],
        "description": "Test description",
        "category": "AI",
        "employees": "",
        "industriesServed": [],
        "pricingRanges": [],
        "pricingModel": [],
        "features": "",
        "useCases": "",
        "testimonialPage": "",
        "companyStage": "",
        "topClients": []
    }
    
    print("🧪 Testing Add Company Endpoint")
    print("=" * 40)
    
    try:
        response = requests.post(url, json=data, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_add_company()