#!/bin/bash

echo "Testing Analytics API endpoints..."

# Test 1: Get companies
echo "1. Testing GET /api/analytics/companies"
curl -s -X GET http://localhost:3001/api/analytics/companies | jq '.' || echo "Failed to get companies"

# Test 2: Increment views for a test company
echo -e "\n2. Testing POST /api/analytics/increment/test_company/views"
curl -s -X POST http://localhost:3001/api/analytics/increment/test_company/views | jq '.' || echo "Failed to increment views"

# Test 3: Increment clicks for a test company
echo -e "\n3. Testing POST /api/analytics/increment/test_company/clicks"
curl -s -X POST http://localhost:3001/api/analytics/increment/test_company/clicks | jq '.' || echo "Failed to increment clicks"

# Test 4: Increment favourites for a test company
echo -e "\n4. Testing POST /api/analytics/increment/test_company/favourites"
curl -s -X POST http://localhost:3001/api/analytics/increment/test_company/favourites | jq '.' || echo "Failed to increment favourites"

# Test 5: Get specific company data
echo -e "\n5. Testing GET /api/analytics/company/test_company"
curl -s -X GET http://localhost:3001/api/analytics/company/test_company | jq '.' || echo "Failed to get company data"

echo -e "\nAnalytics API testing complete!"