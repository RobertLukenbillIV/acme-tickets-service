# 🎯 Project Architecture: Multi-Repo Approach

## Overview

The ACME Tickets Service is designed as a **reference implementation** and **demo backend** for a multi-repository project architecture. This repository serves as:

1. **API Template** - A complete, production-ready ticket management API
2. **Architecture Reference** - Demonstrates multi-tenant SaaS patterns
3. **Demo Instance** - Live API for testing and exploration
4. **Learning Resource** - Well-documented code and patterns

## 🏗️ Multi-Repo Project Structure

```
acme-project/
├── acme-tickets-service/          ← THIS REPO (Backend API)
│   ├── Demo: Hosted on Render + Neon
│   ├── Purpose: Tickets & support management
│   └── Used by: Multiple frontend repos
│
├── acme-ui/                        ← Frontend Components Repo
│   ├── Shared React components for tickets UI
│   ├── Can consume this API
│   └── Reusable across projects
│
├── acme-customer-portal/          ← Customer-Facing App
│   ├── Next.js/React app
│   ├── Integrates with tickets-service API
│   └── Uses components from acme-ui
│
├── acme-admin-dashboard/          ← Internal Admin Tools
│   ├── React/Vue admin panel
│   ├── Integrates with tickets-service API
│   └── Manages tickets, users, webhooks
│
└── acme-mobile-app/               ← Mobile Application
    ├── React Native app
    ├── Connects to tickets-service API
    └── Native ticket creation/viewing
```

## 🔗 How This Repo Fits In

### As a Demo Instance

**Hosted Demo:**
- **Frontend:** https://acme-tickets-demo.vercel.app
- **API:** https://acme-tickets-api.onrender.com
- **Docs:** https://acme-tickets-api.onrender.com/api-docs

**Purpose:**
- ✅ Live API for developers to test against
- ✅ Interactive demo of capabilities
- ✅ API documentation and examples
- ✅ Reference for integration patterns

### As a Template

**Developers can:**
1. **Study the architecture** - Multi-tenant patterns, RBAC, etc.
2. **Copy patterns** - Controllers, services, middleware
3. **Reference API design** - Endpoint structure, authentication
4. **Learn Prisma usage** - Schema design, queries, migrations
5. **Understand testing** - Jest setup, integration tests

**Developers should NOT:**
- ❌ Clone this repo for their own ticket system
- ❌ Fork and modify for production use
- ❌ Deploy their own instance

### As an API Service

**Integration Options:**

#### Option 1: Use the Demo API (Development/Prototyping)
```javascript
// In your frontend repo
const API_URL = 'https://acme-tickets-api.onrender.com/api/v1';

// Create a ticket
fetch(`${API_URL}/tickets`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ title: 'Bug report', description: '...' })
});
```

#### Option 2: Reference the Patterns (Production)
```javascript
// Create your own backend in a separate repo
// But use the same API structure and patterns

// your-backend-api/
// ├── src/
// │   ├── controllers/    ← Same pattern as this repo
// │   ├── services/       ← Same pattern as this repo
// │   ├── middleware/     ← Copy authentication patterns
// │   └── routes/         ← Similar endpoint structure
```

## 📚 Documentation for Developers

### For Frontend Developers

**Using the Demo API:**
1. Read [API_EXAMPLES.md](./API_EXAMPLES.md) - All endpoint examples
2. Visit [Swagger Docs](https://acme-tickets-api.onrender.com/api-docs) - Interactive API docs
3. Use the [demo site](https://acme-tickets-demo.vercel.app) - See it in action
4. Check [.github/copilot-instructions.md](./.github/copilot-instructions.md) - Quick reference

**Integration checklist:**
- [ ] Get demo API URL and test credentials
- [ ] Review available endpoints
- [ ] Understand authentication flow (JWT)
- [ ] Test with the interactive demo
- [ ] Implement in your frontend repo

### For Backend Developers

**Learning from this repo:**
1. **Multi-tenant architecture** - See how tenant isolation works
2. **RBAC implementation** - Role-based access control patterns
3. **Prisma usage** - Schema design and query patterns
4. **API structure** - Controller → Service → Database pattern
5. **Testing strategy** - Jest setup and examples

**What to copy:**
- ✅ Authentication middleware patterns
- ✅ Service layer architecture
- ✅ Error handling approach
- ✅ Logging setup (Winston)
- ✅ Prisma schema patterns
- ✅ Docker configuration

**What to customize:**
- 🔧 Your own business logic
- 🔧 Additional endpoints
- 🔧 Different database schema
- 🔧 Custom authentication providers
- 🔧 Your own webhooks/integrations

### For DevOps/Infrastructure

**Deployment patterns demonstrated:**
- ✅ Docker containerization
- ✅ Multi-service setup (API + DB + Redis)
- ✅ Environment configuration
- ✅ Database migrations (Prisma)
- ✅ Health checks
- ✅ Logging and observability

**Reference files:**
- `Dockerfile` - Production-ready container
- `docker-compose.yml` - Local development setup
- `render.yaml` - Render deployment config
- `.env.example` - Environment variables template

## 🎓 Learning Resources

### Repository Contents

| Resource | Purpose |
|----------|---------|
| [README.md](./README.md) | Project overview and setup |
| [API_EXAMPLES.md](./API_EXAMPLES.md) | Complete API endpoint examples |
| [QUICKSTART.md](./QUICKSTART.md) | Quick setup guide |
| [.github/copilot-instructions.md](./.github/copilot-instructions.md) | Architecture quick reference |
| [demo-site/](./demo-site/) | Interactive frontend demo |
| [src/](./src/) | Full source code with patterns |

### Key Patterns to Study

1. **Multi-tenant data isolation** (`src/services/*.service.ts`)
   - All queries filter by `tenantId`
   - Tenant enforcement in middleware

2. **Role-based access control** (`src/middleware/auth.ts`)
   - JWT token structure
   - Role checking middleware
   - Permission enforcement

3. **Activity logging** (`src/services/ticket.service.ts`)
   - Automatic activity tracking
   - Audit trail patterns

4. **Webhook system** (`src/services/webhook.service.ts`)
   - Event-driven architecture
   - Webhook delivery tracking

5. **File attachments** (`src/services/attachment.service.ts`)
   - S3 pre-signed URLs
   - Secure file upload flow

## 🚀 Using This API in Your Projects

### Scenario 1: Building a Customer Portal

```typescript
// your-customer-portal/src/api/tickets.ts
import { TicketsAPI } from './api-client';

const api = new TicketsAPI({
  baseURL: process.env.TICKETS_API_URL, // Demo or your own
  token: user.token
});

// Use the same endpoints
const tickets = await api.getTickets({ status: 'OPEN' });
const ticket = await api.createTicket({ title, description });
```

### Scenario 2: Building an Admin Dashboard

```typescript
// your-admin-dashboard/src/services/webhook-manager.ts

// Use the webhook patterns from this repo
class WebhookManager {
  // Same structure as src/services/webhook.service.ts
  async createWebhook(url: string, events: string[]) {
    // Your implementation
  }
}
```

### Scenario 3: Building a Mobile App

```typescript
// your-mobile-app/src/api/auth.ts

// Use the same authentication flow
async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  const { token, user } = await response.json();
  // Store token, use for authenticated requests
}
```

## 🔐 API Access & Credentials

### Demo Instance

**For testing and development:**
- **API Base URL:** `https://acme-tickets-api.onrender.com/api/v1`
- **Demo Tenant:** Demo Company
- **Test Credentials:**
  - Email: `admin@demo.com`
  - Password: `SecurePass123!`

**Limitations:**
- ⚠️ Demo data may be reset periodically
- ⚠️ Rate limited (100 requests per 15 minutes)
- ⚠️ Not for production use
- ⚠️ File uploads limited to 10MB

### Production Use

For production, you should:
1. **Deploy your own instance** (using this repo as a template)
2. **Modify for your needs** (business logic, schema, etc.)
3. **Set up your own infrastructure** (database, hosting, etc.)
4. **Implement your own authentication** (or use the patterns here)

## 📖 Related Repositories

| Repository | Purpose | Integration |
|------------|---------|-------------|
| [acme-ui](https://github.com/RobertLukenbillIV/acme-ui) | Shared UI components | Consumes this API |
| Your frontend repo | Customer-facing app | Calls this API |
| Your admin repo | Internal tools | Manages via this API |
| Your mobile repo | Native app | Mobile client for this API |

## 🤝 Contributing

This is a reference implementation. Contributions should focus on:
- ✅ Improving documentation
- ✅ Adding more examples
- ✅ Fixing bugs in demo
- ✅ Enhancing demo UI
- ✅ Better architecture patterns

Not for:
- ❌ Feature requests specific to your use case
- ❌ Custom business logic
- ❌ Non-generic functionality

## 📞 Support

**For questions about:**
- 🔍 API usage → Check [API_EXAMPLES.md](./API_EXAMPLES.md)
- 🏗️ Architecture → Read [.github/copilot-instructions.md](./.github/copilot-instructions.md)
- 🐛 Demo issues → Open an issue
- 🎓 Learning → Study the source code

---

**Summary:** This repo is a **reference template and demo API**, not a product to clone. Use it to learn, reference patterns, and integrate with via the demo API or build your own following these patterns.
