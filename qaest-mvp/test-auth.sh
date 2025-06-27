#!/bin/bash

echo "🧪 Testing QAest Authentication & Persistence"
echo "=============================================="

BASE_URL="http://localhost:8000"

echo ""
echo "1. Testing Health Check..."
curl -s "$BASE_URL/health" | jq '.'

echo ""
echo "2. Testing Login with demo-user..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "demo-user", "password": "password123"}')

echo "$LOGIN_RESPONSE" | jq '.'

# Extract token for subsequent requests
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')

echo ""
echo "3. Testing Get Test Cases..."
curl -s "$BASE_URL/api/test-cases" | jq '.'

echo ""
echo "4. Testing Create New Test Case..."
curl -s -X POST "$BASE_URL/api/test-cases" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "API Test Case",
    "description": "This test case was created via API",
    "priority": "high",
    "category": "API Testing",
    "createdBy": "demo-user"
  }' | jq '.'

echo ""
echo "5. Testing Get Test Cases Again (should show new test case)..."
curl -s "$BASE_URL/api/test-cases" | jq '.data.totalCount'

echo ""
echo "✅ Authentication and Persistence Test Complete!"
echo ""
echo "🔐 Login Credentials Available:"
echo "- demo-user / password123 (Senior QA)"
echo "- qa-lead / lead123 (QA Lead)"  
echo "- junior-qa / junior123 (Junior QA)" 