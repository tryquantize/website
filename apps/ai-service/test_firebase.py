#!/usr/bin/env python3
"""
Test Firebase connection for debugging
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from services.firebase_service import FirebaseService

def test_firebase():
    print("🔥 Testing Firebase Connection...")
    
    # Test Firebase service
    firebase_service = FirebaseService()
    
    print(f"Firebase DB initialized: {firebase_service.db is not None}")
    
    if firebase_service.db:
        print("✅ Firebase connection successful")
        
        # Test getting companies
        print("\n📊 Testing company retrieval...")
        companies = firebase_service.get_all_companies()
        print(f"Companies found: {len(companies)}")
        
        if companies:
            print("Company names:")
            for company_id, company_data in list(companies.items())[:3]:
                print(f"  - {company_data.get('folder_name', 'Unknown')}")
        else:
            print("❌ No companies found in Firebase")
            
    else:
        print("❌ Firebase connection failed")
        print("Check environment variables:")
        print(f"  - USE_FIREBASE: {os.getenv('USE_FIREBASE')}")
        print(f"  - FIREBASE_SERVICE_ACCOUNT: {'Set' if os.getenv('FIREBASE_SERVICE_ACCOUNT') else 'Not set'}")

if __name__ == "__main__":
    test_firebase()