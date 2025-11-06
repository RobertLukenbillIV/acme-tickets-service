#!/bin/bash

# Test JWT Integration with acme-auth-service
# This script tests the complete authentication flow

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AUTH_SERVICE_URL="${AUTH_SERVICE_URL:-http://localhost:8080}"
TICKETS_SERVICE_URL="${TICKETS_SERVICE_URL:-http://localhost:3000}"
API_PREFIX="/api/v1"

echo -e "${BLUE}🔐 JWT Integration Test Script${NC}"
echo -e "${BLUE}================================${NC}\n"

echo -e "${YELLOW}Configuration:${NC}"
echo -e "  Auth Service: ${AUTH_SERVICE_URL}"
echo -e "  Tickets Service: ${TICKETS_SERVICE_URL}${API_PREFIX}\n"

# Test 1: Register users in acme-auth-service
echo -e "${BLUE}📝 Test 1: Registering test users in acme-auth-service${NC}"

echo -e "${YELLOW}Registering regular user...${NC}"
SIGNUP_RESPONSE=$(curl -s -X POST "${AUTH_SERVICE_URL}/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }' || echo '{"error": "Failed to connect"}')

if echo "$SIGNUP_RESPONSE" | jq -e '.accessToken' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ User registered successfully${NC}"
else
  echo -e "${YELLOW}⚠ User may already exist or auth service not running: $(echo $SIGNUP_RESPONSE | jq -r '.message // .error // "Unknown error"')${NC}"
fi

# Test 2: Login and get JWT tokens
echo -e "\n${BLUE}🔑 Test 2: Login to get JWT tokens${NC}"

echo -e "${YELLOW}Logging in as user@example.com...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${AUTH_SERVICE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }')

if echo "$LOGIN_RESPONSE" | jq -e '.accessToken' > /dev/null 2>&1; then
  USER_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
  echo -e "${GREEN}✓ Login successful${NC}"
  echo -e "${YELLOW}Token (first 50 chars): ${USER_TOKEN:0:50}...${NC}"
  
  # Decode JWT to show claims
  echo -e "\n${YELLOW}JWT Claims:${NC}"
  echo "$USER_TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null | jq '.' || echo "Could not decode JWT"
else
  echo -e "${RED}✗ Login failed: $(echo $LOGIN_RESPONSE | jq -r '.message // "Unknown error"')${NC}"
  echo -e "${RED}Please ensure acme-auth-service is running and users exist${NC}"
  exit 1
fi

# Test 3: Test without authentication
echo -e "\n${BLUE}🚫 Test 3: Verify authentication is required${NC}"

echo -e "${YELLOW}Attempting to access tickets without token...${NC}"
NO_AUTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  "${TICKETS_SERVICE_URL}${API_PREFIX}/tickets")

if [ "$NO_AUTH_RESPONSE" = "401" ]; then
  echo -e "${GREEN}✓ Correctly rejected unauthenticated request (401)${NC}"
else
  echo -e "${RED}✗ Expected 401, got: $NO_AUTH_RESPONSE${NC}"
fi

# Test 4: Create a ticket as USER
echo -e "\n${BLUE}📝 Test 4: Create ticket as USER role${NC}"

echo -e "${YELLOW}Creating ticket...${NC}"
CREATE_RESPONSE=$(curl -s -X POST "${TICKETS_SERVICE_URL}${API_PREFIX}/tickets" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Ticket from Integration Test",
    "description": "Testing JWT authentication",
    "priority": "medium"
  }')

if echo "$CREATE_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  TICKET_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')
  echo -e "${GREEN}✓ Ticket created successfully${NC}"
  echo -e "${YELLOW}Ticket ID: $TICKET_ID${NC}"
else
  echo -e "${RED}✗ Failed to create ticket: $(echo $CREATE_RESPONSE | jq -r '.message // "Unknown error"')${NC}"
  echo -e "${RED}Response: $CREATE_RESPONSE${NC}"
fi

# Test 5: List tickets as USER (should only see own tickets)
echo -e "\n${BLUE}📋 Test 5: List tickets as USER role${NC}"

echo -e "${YELLOW}Fetching tickets...${NC}"
LIST_RESPONSE=$(curl -s "${TICKETS_SERVICE_URL}${API_PREFIX}/tickets" \
  -H "Authorization: Bearer $USER_TOKEN")

if echo "$LIST_RESPONSE" | jq -e '.[0].id' > /dev/null 2>&1; then
  TICKET_COUNT=$(echo "$LIST_RESPONSE" | jq 'length')
  echo -e "${GREEN}✓ Successfully retrieved tickets${NC}"
  echo -e "${YELLOW}Ticket count: $TICKET_COUNT (USER should only see their own)${NC}"
  echo "$LIST_RESPONSE" | jq -r '.[] | "  - \(.title) (created by: \(.createdBy.email))"'
else
  echo -e "${YELLOW}⚠ No tickets found or error: $(echo $LIST_RESPONSE | jq -r '.message // "Empty array"')${NC}"
fi

# Test 6: Get specific ticket
if [ ! -z "$TICKET_ID" ]; then
  echo -e "\n${BLUE}🔍 Test 6: Get specific ticket${NC}"
  
  echo -e "${YELLOW}Fetching ticket $TICKET_ID...${NC}"
  GET_RESPONSE=$(curl -s "${TICKETS_SERVICE_URL}${API_PREFIX}/tickets/$TICKET_ID" \
    -H "Authorization: Bearer $USER_TOKEN")
  
  if echo "$GET_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Successfully retrieved ticket${NC}"
    echo -e "${YELLOW}Title: $(echo $GET_RESPONSE | jq -r '.title')${NC}"
  else
    echo -e "${RED}✗ Failed to get ticket: $(echo $GET_RESPONSE | jq -r '.message')${NC}"
  fi
fi

# Test 7: Update own ticket
if [ ! -z "$TICKET_ID" ]; then
  echo -e "\n${BLUE}✏️  Test 7: Update own ticket as USER${NC}"
  
  echo -e "${YELLOW}Updating ticket $TICKET_ID...${NC}"
  UPDATE_RESPONSE=$(curl -s -X PUT "${TICKETS_SERVICE_URL}${API_PREFIX}/tickets/$TICKET_ID" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Updated Test Ticket",
      "status": "in_progress"
    }')
  
  if echo "$UPDATE_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Successfully updated ticket${NC}"
    echo -e "${YELLOW}New status: $(echo $UPDATE_RESPONSE | jq -r '.status')${NC}"
  else
    echo -e "${RED}✗ Failed to update ticket: $(echo $UPDATE_RESPONSE | jq -r '.message')${NC}"
  fi
fi

# Test 8: Test invalid token
echo -e "\n${BLUE}🔒 Test 8: Test with invalid token${NC}"

echo -e "${YELLOW}Attempting request with invalid token...${NC}"
INVALID_TOKEN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  "${TICKETS_SERVICE_URL}${API_PREFIX}/tickets" \
  -H "Authorization: Bearer invalid.token.here")

if [ "$INVALID_TOKEN_RESPONSE" = "401" ]; then
  echo -e "${GREEN}✓ Correctly rejected invalid token (401)${NC}"
else
  echo -e "${RED}✗ Expected 401, got: $INVALID_TOKEN_RESPONSE${NC}"
fi

# Test 9: Get current user info
echo -e "\n${BLUE}👤 Test 9: Get current user info${NC}"

echo -e "${YELLOW}Fetching /auth/me endpoint...${NC}"
ME_RESPONSE=$(curl -s "${TICKETS_SERVICE_URL}${API_PREFIX}/auth/me" \
  -H "Authorization: Bearer $USER_TOKEN")

if echo "$ME_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Successfully retrieved user info${NC}"
  echo -e "${YELLOW}User: $(echo $ME_RESPONSE | jq -r '.email') ($(echo $ME_RESPONSE | jq -r '.role'))${NC}"
else
  echo -e "${RED}✗ Failed to get user info: $(echo $ME_RESPONSE | jq -r '.message // "Unknown error"')${NC}"
fi

# Summary
echo -e "\n${BLUE}================================${NC}"
echo -e "${GREEN}✅ JWT Integration Tests Complete${NC}"
echo -e "${BLUE}================================${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Test with AGENT role user"
echo -e "  2. Test with ADMIN role user"
echo -e "  3. Verify role-based access controls"
echo -e "  4. Check tenant isolation"
echo -e "\n${YELLOW}View API documentation at:${NC}"
echo -e "  ${TICKETS_SERVICE_URL}/api-docs\n"
