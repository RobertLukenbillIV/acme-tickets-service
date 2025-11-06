# End-to-End Testing Guide

This guide explains how to test the JWT integration between acme-tickets-service and acme-auth-service.

## Prerequisites

Before testing, ensure:

1. **PostgreSQL is running** and accessible
2. **acme-auth-service is running** on port 8080 (or configured port)
3. **acme-tickets-service database is set up**
4. **JWT_SECRET matches** in both services

## Quick Setup

### 1. Setup Database

```bash
# Run migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# Seed test data (creates users matching acme-auth-service)
npm run prisma:seed
```

### 2. Verify Configuration

Ensure `.env` file has the correct JWT_SECRET:

```bash
# .env
JWT_SECRET=your-shared-secret-between-services
DATABASE_URL=postgresql://user:password@localhost:5432/tickets_db
```

**CRITICAL**: The `JWT_SECRET` must be identical in both:
- acme-auth-service
- acme-tickets-service

### 3. Start Services

In separate terminals:

```bash
# Terminal 1: Start acme-auth-service (if not already running)
cd /path/to/acme-auth-service
./mvnw spring-boot:run

# Terminal 2: Start acme-tickets-service
cd /path/to/acme-tickets-service
npm run dev
```

## Automated Testing

### Run Integration Test Script

```bash
npm run test:integration
```

This script will:
1. ✅ Register test users in acme-auth-service
2. ✅ Login to get JWT tokens
3. ✅ Verify authentication is required (401 without token)
4. ✅ Create ticket as USER role
5. ✅ List tickets (USER sees only own tickets)
6. ✅ Get specific ticket
7. ✅ Update own ticket
8. ✅ Test invalid token rejection
9. ✅ Get current user info

### Expected Output

```
🔐 JWT Integration Test Script
================================

Configuration:
  Auth Service: http://localhost:8080
  Tickets Service: http://localhost:3000/api/v1

📝 Test 1: Registering test users in acme-auth-service
✓ User registered successfully

🔑 Test 2: Login to get JWT tokens
✓ Login successful
Token (first 50 chars): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

JWT Claims:
{
  "sub": "user@example.com",
  "tenant_id": "00000000-0000-0000-0000-000000000001",
  "roles": ["ROLE_USER"],
  "scopes": ["tickets:read:own", "tickets:write:own"],
  "iat": 1704067200,
  "exp": 1704153600
}

🚫 Test 3: Verify authentication is required
✓ Correctly rejected unauthenticated request (401)

📝 Test 4: Create ticket as USER role
✓ Ticket created successfully
Ticket ID: 550e8400-e29b-41d4-a716-446655440000

📋 Test 5: List tickets as USER role
✓ Successfully retrieved tickets
Ticket count: 1 (USER should only see their own)
  - Test Ticket from Integration Test (created by: user@example.com)

🔍 Test 6: Get specific ticket
✓ Successfully retrieved ticket
Title: Test Ticket from Integration Test

✏️  Test 7: Update own ticket as USER
✓ Successfully updated ticket
New status: in_progress

🔒 Test 8: Test with invalid token
✓ Correctly rejected invalid token (401)

👤 Test 9: Get current user info
✓ Successfully retrieved user info
User: user@example.com (USER)

================================
✅ JWT Integration Tests Complete
================================
```

## Manual Testing

### Test USER Role

```bash
# 1. Login as USER
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}' \
  | jq -r '.accessToken')

# 2. Create a ticket
curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Test Ticket",
    "description": "Testing USER permissions",
    "priority": "medium"
  }' | jq

# 3. List tickets (should only see own tickets)
curl -X GET http://localhost:3000/api/v1/tickets \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. Try to access another user's ticket (should fail with 403)
curl -X GET http://localhost:3000/api/v1/tickets/<other-ticket-id> \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Test AGENT Role

First, create an AGENT user in acme-auth-service with role assignment, then:

```bash
# 1. Login as AGENT
AGENT_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agent@example.com","password":"SecurePass123!"}' \
  | jq -r '.accessToken')

# 2. List tickets (should see ALL tickets in tenant)
curl -X GET http://localhost:3000/api/v1/tickets \
  -H "Authorization: Bearer $AGENT_TOKEN" | jq

# 3. Update any ticket in tenant
curl -X PUT http://localhost:3000/api/v1/tickets/<any-ticket-id> \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "priority": "high"
  }' | jq
```

### Test ADMIN Role

```bash
# 1. Login as ADMIN
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"SecurePass123!"}' \
  | jq -r '.accessToken')

# 2. Delete a ticket (only ADMIN can delete)
curl -X DELETE http://localhost:3000/api/v1/tickets/<ticket-id> \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Should return 204 No Content on success
```

## Test Scenarios

### Scenario 1: Role-Based Access Control

**Objective**: Verify USER can only access own tickets

1. Create ticket as user1@example.com
2. Login as user2@example.com
3. Try to access user1's ticket
4. **Expected**: 403 Forbidden error

```bash
# Step 1: Create ticket as user1
USER1_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"SecurePass123!"}' \
  | jq -r '.accessToken')

TICKET_ID=$(curl -s -X POST http://localhost:3000/api/v1/tickets \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Private Ticket","description":"Test","priority":"medium"}' \
  | jq -r '.id')

# Step 2 & 3: Try to access as user2
USER2_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@example.com","password":"SecurePass123!"}' \
  | jq -r '.accessToken')

curl -X GET http://localhost:3000/api/v1/tickets/$TICKET_ID \
  -H "Authorization: Bearer $USER2_TOKEN" | jq

# Expected response:
# {
#   "code": "FORBIDDEN",
#   "message": "Access denied to this ticket",
#   "timestamp": "2024-01-01T12:00:00.000Z"
# }
```

### Scenario 2: Tenant Isolation

**Objective**: Verify users in different tenants cannot access each other's data

1. Create user in tenant A
2. Create user in tenant B
3. Create ticket in tenant A
4. Login as tenant B user
5. Try to access tenant A ticket
6. **Expected**: Not found or access denied

### Scenario 3: Token Expiration

**Objective**: Verify expired tokens are rejected

1. Get a token
2. Wait for token to expire (or manually create expired token)
3. Try to use expired token
4. **Expected**: 401 with "Token expired" message

### Scenario 4: Scope Validation

**Objective**: Verify scopes are respected

1. Login as USER (has `tickets:read:own`, `tickets:write:own`)
2. Verify can read/write own tickets
3. Verify cannot delete tickets (lacks `tickets:delete:any`)
4. **Expected**: 403 when trying to delete

## Debugging

### View JWT Claims

Decode a JWT token to inspect claims:

```bash
# Using command line
echo $TOKEN | cut -d. -f2 | base64 -d | jq

# Expected output:
{
  "sub": "user@example.com",
  "tenant_id": "00000000-0000-0000-0000-000000000001",
  "roles": ["ROLE_USER"],
  "scopes": ["tickets:read:own", "tickets:write:own"],
  "iat": 1704067200,
  "exp": 1704153600
}
```

Or use [jwt.io](https://jwt.io) web interface.

### Enable Debug Logging

```bash
# In .env file
LOG_LEVEL=debug

# Restart service
npm run dev
```

Look for log entries:
- JWT verification results
- User lookup queries
- Tenant validation
- Role mapping

### Common Issues

**Problem**: "Invalid token" error
- **Cause**: JWT_SECRET mismatch
- **Solution**: Verify both services use same secret

**Problem**: "User not found" error
- **Cause**: User doesn't exist in tickets service database
- **Solution**: Run `npm run prisma:seed` to create test users

**Problem**: "Tenant mismatch" error
- **Cause**: Token tenant_id doesn't match database
- **Solution**: Ensure tenant exists and IDs match

**Problem**: 401 on all requests
- **Cause**: acme-auth-service not running or wrong URL
- **Solution**: Verify auth service is running on port 8080

## Verification Checklist

- [ ] JWT_SECRET matches in both services
- [ ] Database is migrated and seeded
- [ ] acme-auth-service is running
- [ ] acme-tickets-service is running
- [ ] Can login and get token
- [ ] Token contains correct claims (sub, tenant_id, roles, scopes)
- [ ] USER role can create tickets
- [ ] USER role can only see own tickets
- [ ] AGENT role can see all tickets in tenant
- [ ] ADMIN role can delete tickets
- [ ] Invalid tokens are rejected (401)
- [ ] Missing tokens are rejected (401)
- [ ] Access control is enforced (403 for unauthorized actions)
- [ ] Tenant isolation works

## API Documentation

View full API documentation with authentication details:

```
http://localhost:3000/api-docs
```

The Swagger UI includes:
- JWT authentication scheme
- Role and scope descriptions
- Example requests with Bearer tokens
- Error response formats

## Next Steps

After successful testing:

1. **Create CI/CD tests** using the integration test script
2. **Add unit tests** for auth middleware
3. **Test edge cases** (expired tokens, malformed JWTs)
4. **Load testing** with authenticated requests
5. **Security audit** of JWT handling

## Related Documentation

- [ACME_AUTH_INTEGRATION.md](./ACME_AUTH_INTEGRATION.md) - Detailed integration guide
- [API_EXAMPLES.md](./API_EXAMPLES.md) - API usage examples
- [README.md](./README.md) - General service documentation
