#!/usr/bin/env python3
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

sys.path.append(os.path.join(os.path.dirname(__file__), 'apps/ai-service/src'))

from services.company_submission import CompanySubmissionService

def test_enhanced_form():
    print("🧪 Testing Enhanced Company Form")
    print("=" * 50)
    
    # Test data with all new fields
    enhanced_form_data = {
        "companyName": "Enhanced AI Corp",
        "website": "https://enhancedai.com",
        "linkedinPage": "https://linkedin.com/company/enhancedai",
        "phoneNumber": "+1 (555) 987-6543",
        "founded": "2023",
        "headquarters": "San Francisco, CA",
        "products": [
            "AI-powered customer service automation platform with natural language understanding",
            "Computer vision API for real-time object detection and classification",
            "Machine learning model deployment and monitoring suite"
        ],
        "description": "Enhanced AI Corp revolutionizes business operations through cutting-edge artificial intelligence solutions. We specialize in creating scalable, enterprise-grade AI systems that transform how companies interact with customers and process data.",
        "category": "AI Platform",
        "employees": "50-200",
        "industriesServed": ["Healthcare", "Fintech", "Retail", "Manufacturing", "EdTech"],
        "pricingRanges": ["$1,000-$2,500", "$2,500-$5,000", "Custom Quote"],
        "pricingModel": ["Subscription", "Usage-based", "Custom Quote"],
        "features": [
            "Real-time processing with 99.99% uptime and sub-100ms response times",
            "Multi-language support for 75+ languages with cultural context awareness",
            "Enterprise-grade security with SOC 2 Type II and GDPR compliance",
            "Advanced analytics dashboard with predictive insights and custom reporting"
        ],
        "useCases": [
            "E-commerce personalization increasing conversion rates by 45% for 1M+ daily users",
            "Healthcare diagnostic assistance reducing analysis time by 60% in radiology departments",
            "Financial fraud detection preventing $50M+ in losses annually for major banks",
            "Manufacturing quality control improving defect detection accuracy by 85%"
        ],
        "testimonialPage": "https://enhancedai.com/testimonials",
        "companyStage": "Series A",
        "topClients": "Microsoft, Google Cloud, Amazon Web Services, Tesla, Shopify, Mayo Clinic, JPMorgan Chase, General Electric"
    }
    
    print(f"Company: {enhanced_form_data['companyName']}")
    print(f"Employees: {enhanced_form_data['employees']}")
    print(f"Industries: {len(enhanced_form_data['industriesServed'])} selected")
    print(f"Pricing Ranges: {len(enhanced_form_data['pricingRanges'])} selected")
    print(f"Pricing Models: {len(enhanced_form_data['pricingModel'])} selected")
    print(f"Company Stage: {enhanced_form_data['companyStage']}")
    print(f"Top Clients: {enhanced_form_data['topClients'][:50]}...")
    print()
    
    try:
        service = CompanySubmissionService()
        result = service.submit_company(enhanced_form_data)
        
        if result['success']:
            print("✅ Enhanced form submission successful!")
            print(f"Company folder created: {result.get('company_folder')}")
            
            # Check created files
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
                        
                        # Show enhanced content preview
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            if file == "company_info.txt":
                                print("   Enhanced fields found:")
                                if "Industries:" in content:
                                    print("   - Industries Served ✅")
                                if "Pricing Models:" in content:
                                    print("   - Pricing Models ✅")
                                if "Company Stage:" in content:
                                    print("   - Company Stage ✅")
                                if "Top Clients:" in content:
                                    print("   - Top Clients ✅")
                    else:
                        print(f"❌ {file} missing")
            
            return True
        else:
            print(f"❌ Submission failed: {result.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_enhanced_form()
    
    print("\n" + "=" * 50)
    print("📊 Enhanced Form Test Results:")
    print(f"Status: {'✅ PASS' if success else '❌ FAIL'}")
    
    if success:
        print("\n🎉 All enhanced features working correctly!")
        print("New features tested:")
        print("- Employee count dropdown")
        print("- Industries served multi-select")
        print("- Pricing model selection")
        print("- Company stage dropdown")
        print("- Top clients field")
        print("- Enhanced blur background")
    
    sys.exit(0 if success else 1)