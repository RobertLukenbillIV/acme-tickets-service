# API Usage Examples

This document provides practical examples of how to use the Tickets Service API.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 1. Tenant Management

### Create a Tenant (Admin only)

```bash
curl -X POST http://localhost:3000/api/v1/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Acme Corporation",
    "slug": "acme-corp",
    "settings": {
      "timezone": "America/New_York",
      "notifications_enabled": true
    }
  }'
```

### Get All Tenants (Admin only)

```bash
curl -X GET http://localhost:3000/api/v1/tenants \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 2. User Authentication

### Register a New User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "tenantId": "tenant-uuid-here"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123!"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "tenantId": "tenant-uuid"
  }
}
```

### Get Current User Info

```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 3. Ticket Management

### Create a Ticket

```bash
curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Login button not working",
    "description": "When I click the login button, nothing happens. I tried on Chrome and Firefox.",
    "priority": "HIGH",
    "metadata": {
      "browser": "Chrome 119",
      "os": "Windows 11"
    }
  }'
```

### List All Tickets

```bash
curl -X GET http://localhost:3000/api/v1/tickets \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter Tickets by Status

```bash
curl -X GET "http://localhost:3000/api/v1/tickets?status=OPEN&priority=HIGH" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Ticket Details

```bash
curl -X GET http://localhost:3000/api/v1/tickets/ticket-uuid \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update a Ticket

```bash
curl -X PUT http://localhost:3000/api/v1/tickets/ticket-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "IN_PROGRESS",
    "priority": "URGENT",
    "assignedToId": "agent-uuid"
  }'
```

### Delete a Ticket

```bash
curl -X DELETE http://localhost:3000/api/v1/tickets/ticket-uuid \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 4. Comments

### Add a Comment to a Ticket

```bash
curl -X POST http://localhost:3000/api/v1/tickets/ticket-uuid/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "I have investigated this issue and found the root cause.",
    "isInternal": false
  }'
```

### Get All Comments for a Ticket

```bash
curl -X GET http://localhost:3000/api/v1/tickets/ticket-uuid/comments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update a Comment

```bash
curl -X PUT http://localhost:3000/api/v1/tickets/ticket-uuid/comments/comment-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "Updated comment content"
  }'
```

### Delete a Comment

```bash
curl -X DELETE http://localhost:3000/api/v1/tickets/ticket-uuid/comments/comment-uuid \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 5. File Attachments

### Step 1: Generate Pre-signed Upload URL

```bash
curl -X POST http://localhost:3000/api/v1/tickets/ticket-uuid/attachments/upload-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "filename": "screenshot.png",
    "mimeType": "image/png"
  }'
```

Response:
```json
{
  "uploadUrl": "https://s3.amazonaws.com/bucket/presigned-url...",
  "key": "ticket-uuid/1234567890-screenshot.png",
  "fileUrl": "https://bucket.s3.region.amazonaws.com/ticket-uuid/1234567890-screenshot.png"
}
```

### Step 2: Upload File to S3 Using Pre-signed URL

```bash
curl -X PUT "PRESIGNED_UPLOAD_URL" \
  -H "Content-Type: image/png" \
  --data-binary @screenshot.png
```

### Step 3: Register the Attachment

```bash
curl -X POST http://localhost:3000/api/v1/tickets/ticket-uuid/attachments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "filename": "screenshot.png",
    "fileUrl": "https://bucket.s3.region.amazonaws.com/ticket-uuid/1234567890-screenshot.png",
    "fileSize": 245678,
    "mimeType": "image/png"
  }'
```

### List Attachments for a Ticket

```bash
curl -X GET http://localhost:3000/api/v1/tickets/ticket-uuid/attachments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Delete an Attachment

```bash
curl -X DELETE http://localhost:3000/api/v1/tickets/ticket-uuid/attachments/attachment-uuid \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 6. Webhooks (Admin/Agent only)

### Create a Webhook

```bash
curl -X POST http://localhost:3000/api/v1/webhooks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "url": "https://your-app.com/webhook-endpoint",
    "events": ["TICKET_CREATED", "TICKET_UPDATED", "COMMENT_ADDED"],
    "secret": "your-webhook-secret-key"
  }'
```

### List All Webhooks

```bash
curl -X GET http://localhost:3000/api/v1/webhooks \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Update a Webhook

```bash
curl -X PUT http://localhost:3000/api/v1/webhooks/webhook-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "isActive": false
  }'
```

### Delete a Webhook

```bash
curl -X DELETE http://localhost:3000/api/v1/webhooks/webhook-uuid \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 7. Notifications

### Get User Notifications

```bash
curl -X GET http://localhost:3000/api/v1/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Only Unread Notifications

```bash
curl -X GET "http://localhost:3000/api/v1/notifications?unreadOnly=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mark a Notification as Read

```bash
curl -X PUT http://localhost:3000/api/v1/notifications/notification-uuid/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mark All Notifications as Read

```bash
curl -X PUT http://localhost:3000/api/v1/notifications/read-all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Delete a Notification

```bash
curl -X DELETE http://localhost:3000/api/v1/notifications/notification-uuid \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Webhook Payload Examples

When events occur, your webhook endpoint will receive POST requests with these payloads:

### Ticket Created

```json
{
  "event": "TICKET_CREATED",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "ticketId": "ticket-uuid",
    "title": "Login button not working",
    "createdBy": "user-uuid"
  }
}
```

### Ticket Updated

```json
{
  "event": "TICKET_UPDATED",
  "timestamp": "2024-01-15T11:00:00Z",
  "data": {
    "ticketId": "ticket-uuid",
    "title": "Login button not working",
    "changes": {
      "status": "IN_PROGRESS",
      "priority": "HIGH"
    }
  }
}
```

### Comment Added

```json
{
  "event": "COMMENT_ADDED",
  "timestamp": "2024-01-15T11:15:00Z",
  "data": {
    "ticketId": "ticket-uuid",
    "commentId": "comment-uuid",
    "authorId": "user-uuid"
  }
}
```

## Webhook Signature Verification

Webhooks include an `X-Webhook-Signature` header for verification:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
    
  return signature === expectedSignature;
}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found

```json
{
  "error": "Ticket not found"
}
```

### 429 Too Many Requests

```json
{
  "error": "Too many requests from this IP, please try again later"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## Testing with Postman

1. Import the OpenAPI specification from `/api-docs`
2. Set up environment variables:
   - `baseUrl`: `http://localhost:3000/api/v1`
   - `token`: Your JWT token after login
3. Use the Collection Runner to test multiple endpoints

## Testing with JavaScript/TypeScript

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Login
const login = async () => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email: 'user@example.com',
    password: 'password123'
  });
  return response.data.token;
};

// Create a ticket
const createTicket = async (token: string) => {
  const response = await axios.post(
    `${API_BASE_URL}/tickets`,
    {
      title: 'API Issue',
      description: 'Testing the API',
      priority: 'HIGH'
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

// Usage
(async () => {
  const token = await login();
  const ticket = await createTicket(token);
  console.log('Created ticket:', ticket);
})();
```
