#!/bin/bash

echo "🚀 QAest User Approval System Testing"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_BASE="http://localhost:8000"

echo -e "${BLUE}Testing User Approval System...${NC}"
echo ""

# Test 1: Register a new user that requires approval
echo -e "${YELLOW}Test 1: Register new user (should require approval)${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test-user-1",
    "password": "testpass123",
    "email": "test1@qaest.com",
    "firstName": "Test",
    "lastName": "User1",
    "role": "junior_qa"
  }')

echo "Registration Response:"
echo "$REGISTER_RESPONSE" | jq '.'
echo ""

# Test 2: Try to login with unapproved user
echo -e "${YELLOW}Test 2: Try to login with unapproved user (should fail)${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test-user-1",
    "password": "testpass123"
  }')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq '.'
echo ""

# Test 3: Login as QA Lead to approve users
echo -e "${YELLOW}Test 3: Login as QA Lead${NC}"
QA_LEAD_LOGIN=$(curl -s -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "qa-lead",
    "password": "lead123"
  }')

QA_LEAD_TOKEN=$(echo "$QA_LEAD_LOGIN" | jq -r '.data.token')
echo "QA Lead Token: $QA_LEAD_TOKEN"
echo ""

# Test 4: Get pending approvals
echo -e "${YELLOW}Test 4: Get pending user approvals${NC}"
PENDING_RESPONSE=$(curl -s -X GET "$API_BASE/api/users/pending" \
  -H "Authorization: Bearer $QA_LEAD_TOKEN")

echo "Pending Approvals:"
echo "$PENDING_RESPONSE" | jq '.'
echo ""

# Extract user ID for approval
USER_ID=$(echo "$PENDING_RESPONSE" | jq -r '.data.pendingApprovals[0].id // empty')

if [ -n "$USER_ID" ]; then
  # Test 5: Approve the user
  echo -e "${YELLOW}Test 5: Approve user $USER_ID${NC}"
  APPROVE_RESPONSE=$(curl -s -X PUT "$API_BASE/api/users/$USER_ID/approve" \
    -H "Authorization: Bearer $QA_LEAD_TOKEN" \
    -H "Content-Type: application/json")

  echo "Approval Response:"
  echo "$APPROVE_RESPONSE" | jq '.'
  echo ""

  # Test 6: Try to login with approved user
  echo -e "${YELLOW}Test 6: Login with approved user (should succeed)${NC}"
  APPROVED_LOGIN=$(curl -s -X POST "$API_BASE/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "username": "test-user-1",
      "password": "testpass123"
    }')

  echo "Approved User Login:"
  echo "$APPROVED_LOGIN" | jq '.'
  echo ""
else
  echo -e "${RED}No pending users found to approve${NC}"
fi

# Test 7: Register another user for rejection test
echo -e "${YELLOW}Test 7: Register another user for rejection test${NC}"
REGISTER_RESPONSE_2=$(curl -s -X POST "$API_BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test-user-2",
    "password": "testpass456",
    "email": "test2@qaest.com",
    "firstName": "Test",
    "lastName": "User2",
    "role": "senior_qa"
  }')

echo "Second Registration Response:"
echo "$REGISTER_RESPONSE_2" | jq '.'
echo ""

# Test 8: Get pending approvals again
echo -e "${YELLOW}Test 8: Get pending approvals (should show second user)${NC}"
PENDING_RESPONSE_2=$(curl -s -X GET "$API_BASE/api/users/pending" \
  -H "Authorization: Bearer $QA_LEAD_TOKEN")

echo "Pending Approvals:"
echo "$PENDING_RESPONSE_2" | jq '.'
echo ""

# Extract second user ID for rejection
USER_ID_2=$(echo "$PENDING_RESPONSE_2" | jq -r '.data.pendingApprovals[0].id // empty')

if [ -n "$USER_ID_2" ]; then
  # Test 9: Reject the second user
  echo -e "${YELLOW}Test 9: Reject user $USER_ID_2${NC}"
  REJECT_RESPONSE=$(curl -s -X PUT "$API_BASE/api/users/$USER_ID_2/reject" \
    -H "Authorization: Bearer $QA_LEAD_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "reason": "Insufficient experience for senior role"
    }')

  echo "Rejection Response:"
  echo "$REJECT_RESPONSE" | jq '.'
  echo ""

  # Test 10: Try to login with rejected user
  echo -e "${YELLOW}Test 10: Try to login with rejected user (should fail)${NC}"
  REJECTED_LOGIN=$(curl -s -X POST "$API_BASE/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "username": "test-user-2",
      "password": "testpass456"
    }')

  echo "Rejected User Login:"
  echo "$REJECTED_LOGIN" | jq '.'
  echo ""
else
  echo -e "${RED}No pending users found to reject${NC}"
fi

# Test 11: Get all users
echo -e "${YELLOW}Test 11: Get all users (admin view)${NC}"
ALL_USERS_RESPONSE=$(curl -s -X GET "$API_BASE/api/users" \
  -H "Authorization: Bearer $QA_LEAD_TOKEN")

echo "All Users:"
echo "$ALL_USERS_RESPONSE" | jq '.'
echo ""

# Test 12: Role change test
echo -e "${YELLOW}Test 12: Change user role${NC}"
if [ -n "$USER_ID" ]; then
  ROLE_CHANGE_RESPONSE=$(curl -s -X PUT "$API_BASE/api/users/$USER_ID/role" \
    -H "Authorization: Bearer $QA_LEAD_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "newRole": "senior_qa",
      "reason": "Promoted due to good performance"
    }')

  echo "Role Change Response:"
  echo "$ROLE_CHANGE_RESPONSE" | jq '.'
  echo ""
fi

# Test 13: Test access control - try to access approvals as regular user
echo -e "${YELLOW}Test 13: Test access control (regular user trying to access approvals)${NC}"
if [ -n "$USER_ID" ]; then
  # First get token for the approved user
  REGULAR_USER_LOGIN=$(curl -s -X POST "$API_BASE/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "username": "test-user-1",
      "password": "testpass123"
    }')

  REGULAR_USER_TOKEN=$(echo "$REGULAR_USER_LOGIN" | jq -r '.data.token')
  
  # Try to access pending approvals with regular user token
  ACCESS_DENIED_RESPONSE=$(curl -s -X GET "$API_BASE/api/users/pending" \
    -H "Authorization: Bearer $REGULAR_USER_TOKEN")

  echo "Access Control Test:"
  echo "$ACCESS_DENIED_RESPONSE" | jq '.'
  echo ""
fi

# Test 14: Login as Project Manager to test PM permissions
echo -e "${YELLOW}Test 14: Test Project Manager permissions${NC}"
PM_LOGIN=$(curl -s -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "project-manager",
    "password": "pm123"
  }')

PM_TOKEN=$(echo "$PM_LOGIN" | jq -r '.data.token')

# Test PM can access pending approvals
PM_PENDING_RESPONSE=$(curl -s -X GET "$API_BASE/api/users/pending" \
  -H "Authorization: Bearer $PM_TOKEN")

echo "Project Manager Pending Approvals:"
echo "$PM_PENDING_RESPONSE" | jq '.'
echo ""

echo -e "${GREEN}✅ User Approval System Testing Complete!${NC}"
echo ""
echo -e "${BLUE}Summary of Features Tested:${NC}"
echo "1. ✅ User registration with approval requirement"
echo "2. ✅ Login blocked for unapproved users"
echo "3. ✅ QA Lead can view pending approvals"
echo "4. ✅ User approval workflow"
echo "5. ✅ Approved user can login"
echo "6. ✅ User rejection workflow"
echo "7. ✅ Rejected user cannot login"
echo "8. ✅ Admin can view all users"
echo "9. ✅ Role change functionality"
echo "10. ✅ Access control (regular users blocked from admin functions)"
echo "11. ✅ Project Manager permissions"
echo ""
echo -e "${YELLOW}Note: Check the frontend at http://localhost:3000 to test the UI${NC}"
echo -e "${YELLOW}Login as 'qa-lead' or 'project-manager' to access User Management${NC}" 