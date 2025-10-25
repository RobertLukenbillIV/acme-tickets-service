# Tickets Service API

A scalable, multi-tenant backend API for ticket management with role-based access control, file attachments, notifications, and webhooks.

## 🎯 Purpose

This repository serves as:

1. **🎮 Live Demo API** - Hosted instance for testing and exploration
2. **📚 Reference Implementation** - Production-ready patterns and architecture
3. **🔧 Integration Template** - For multi-repo projects (see [MULTI_REPO_ARCHITECTURE.md](./MULTI_REPO_ARCHITECTURE.md))
4. **📖 Learning Resource** - Study multi-tenant SaaS architecture

**Not intended for:** Cloning and hosting your own instance. Instead, use the demo API for testing or reference the patterns in your own backend.

---

## 🚀 Quick Links

| Resource | Purpose |
|----------|---------|
| [Live Demo](https://acme-tickets-demo.vercel.app) | Try the API interactively |
| [API Documentation](https://acme-tickets-api.onrender.com/api-docs) | Swagger/OpenAPI docs |
| [API Examples](./API_EXAMPLES.md) | Code examples for all endpoints |
| [Multi-Repo Guide](./MULTI_REPO_ARCHITECTURE.md) | How to integrate in your projects |
| [Quick Reference](./.github/copilot-instructions.md) | Architecture overview for AI agents |

---

## Features

- **Multi-Tenant Architecture**: Complete tenant isolation with data segregation
- **Role-Based Access Control (RBAC)**: Support for Admin, Agent, and User roles
- **Ticket Management**: Create, update, comment, and track tickets
- **File Attachments**: Pre-signed URL uploads to S3-compatible storage
- **Notifications**: Real-time notifications for ticket events
- **Webhooks**: Customizable webhooks for external integrations
- **Observability**: Structured logging with Winston
- **Background Jobs**: Async task processing with Bull/BullMQ (ready for integration)
- **API Documentation**: Interactive OpenAPI/Swagger documentation
- **Security**: JWT authentication, rate limiting, and helmet protection

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Queue**: Redis
- **Authentication**: JWT
- **File Storage**: AWS S3
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 15+
- Redis 7+
- AWS S3 bucket (or S3-compatible storage)

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/RobertLukenbillIV/acme-service.git
cd acme-service
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/tickets_db
JWT_SECRET=your-secure-secret-key
REDIS_HOST=localhost
REDIS_PORT=6379
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=tickets-attachments
```

### 4. Set up the database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (requires PostgreSQL to be running)
npm run prisma:migrate
```

### 5. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Using Docker

### Start all services with Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Redis on port 6379
- API service on port 3000

### Run migrations in Docker

```bash
docker-compose exec api npx prisma migrate deploy
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/me` - Get current user info

### Tickets

- `POST /api/v1/tickets` - Create a new ticket
- `GET /api/v1/tickets` - List tickets (with filters)
- `GET /api/v1/tickets/:id` - Get ticket details
- `PUT /api/v1/tickets/:id` - Update ticket
- `DELETE /api/v1/tickets/:id` - Delete ticket

### Comments

- `POST /api/v1/tickets/:ticketId/comments` - Add comment to ticket
- `GET /api/v1/tickets/:ticketId/comments` - List comments
- `PUT /api/v1/tickets/:ticketId/comments/:id` - Update comment
- `DELETE /api/v1/tickets/:ticketId/comments/:id` - Delete comment

### Attachments

- `POST /api/v1/tickets/:ticketId/attachments/upload-url` - Generate pre-signed upload URL
- `POST /api/v1/tickets/:ticketId/attachments` - Register uploaded attachment
- `GET /api/v1/tickets/:ticketId/attachments` - List attachments
- `DELETE /api/v1/tickets/:ticketId/attachments/:id` - Delete attachment

### Webhooks (Admin/Agent only)

- `POST /api/v1/webhooks` - Create webhook
- `GET /api/v1/webhooks` - List webhooks
- `PUT /api/v1/webhooks/:id` - Update webhook
- `DELETE /api/v1/webhooks/:id` - Delete webhook

## API Documentation

Interactive API documentation is available at:

```
http://localhost:3000/api-docs
```

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

## Database Management

```bash
# Generate Prisma client after schema changes
npm run prisma:generate

# Create and apply migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
├── jobs/            # Background job processors
├── app.ts           # Express app setup
└── index.ts         # Server entry point
```

## Deployment

### Build for production

```bash
npm run build
```

### Start production server

```bash
npm start
```

### Environment variables for production

Ensure you set secure values for:
- `JWT_SECRET`: Use a strong random secret
- `DATABASE_URL`: Production database connection
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`: AWS credentials
- Rate limiting and other security settings

## Frontend Integration

This API is designed to work with the ACME UI frontend components available at:

**Frontend Repository**: https://github.com/RobertLukenbillIV/acme-ui

### Additional Frontend Requirements

To fully integrate with the frontend, the following features may be needed:

1. **Real-time Updates**: Consider implementing WebSocket support for real-time ticket updates
2. **Pagination**: Add pagination support to list endpoints for better performance
3. **Search & Filtering**: Enhanced search capabilities across tickets
4. **User Management**: Additional endpoints for user CRUD operations
5. **Tenant Management**: Endpoints for creating and managing tenants
6. **Dashboard Analytics**: Endpoints for ticket statistics and analytics
7. **Email Templates**: Customizable email templates for notifications
8. **Audit Logs**: Track all changes for compliance
9. **Export Functionality**: Export tickets to CSV/PDF
10. **Bulk Operations**: Batch update/delete tickets

## Security Considerations

- JWT tokens expire after 24 hours (configurable)
- Rate limiting is enabled (100 requests per 15 minutes)
- Helmet.js protects against common vulnerabilities
- CORS is configured (update for production domains)
- All passwords are hashed using bcrypt
- Database queries use Prisma's parameterized queries to prevent SQL injection
- File uploads use pre-signed URLs to avoid direct file handling

## Observability

### Logging

Logs are written to:
- Console (colorized for development)
- `logs/error.log` (error level only)
- `logs/combined.log` (all levels)

### Health Check

```bash
GET /health
```

Returns server status and timestamp.

---

## 🎮 Using the Demo API

### Live Demo Instance

**Demo Site:** https://acme-tickets-demo.vercel.app  
**API Base URL:** https://acme-tickets-api.onrender.com/api/v1  
**API Docs:** https://acme-tickets-api.onrender.com/api-docs

**Test Credentials:**
- Email: `admin@demo.com`
- Password: `SecurePass123!`
- Tenant: Demo Company

### Integration in Your Projects

Use the demo API for development/testing:

```javascript
// your-frontend/src/api/config.js
const API_URL = 'https://acme-tickets-api.onrender.com/api/v1';

// Login
const { token } = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'admin@demo.com', 
    password: 'SecurePass123!' 
  })
}).then(r => r.json());

// Create ticket
await fetch(`${API_URL}/tickets`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Issue from my app',
    description: 'Testing integration',
    priority: 'MEDIUM'
  })
});
```

**See [MULTI_REPO_ARCHITECTURE.md](./MULTI_REPO_ARCHITECTURE.md) for complete integration patterns.**

---

## 📚 Documentation

- **[API_EXAMPLES.md](./API_EXAMPLES.md)** - Complete API usage examples
- **[QUICKSTART.md](./QUICKSTART.md)** - Quick setup guide
- **[MULTI_REPO_ARCHITECTURE.md](./MULTI_REPO_ARCHITECTURE.md)** - Multi-repo integration patterns
- **[.github/copilot-instructions.md](./.github/copilot-instructions.md)** - Architecture quick reference
- **[RENDER_NEON_DEPLOYMENT.md](./RENDER_NEON_DEPLOYMENT.md)** - Deploy demo to production
- **[demo-site/](./demo-site/)** - Interactive frontend demo

---

## 🏗️ Architecture for Your Projects

This repo demonstrates patterns you can use in your own multi-repo projects:

```
your-project/
├── your-backend-api/          ← Reference this repo's patterns
├── your-frontend/             ← Consume the demo API or your own
├── your-admin-dashboard/      ← Another consumer
└── shared-components/         ← Shared UI (like acme-ui repo)
```

**Learn more:** [MULTI_REPO_ARCHITECTURE.md](./MULTI_REPO_ARCHITECTURE.md)

---

## Contributing

Contributions welcome! This is a reference implementation, so focus on:
- 📚 Improving documentation
- 🐛 Fixing demo bugs
- ✨ Enhancing demo UI
- 📖 Adding more examples
- 🏗️ Better architecture patterns

## License

ISC

## Support

- 🐛 **Issues:** Open a GitHub issue
- 📖 **Documentation:** Check the docs in this repo
- 🎮 **Try it:** Use the live demo
- 💬 **Questions:** See [API_EXAMPLES.md](./API_EXAMPLES.md) or [Swagger docs](https://acme-tickets-api.onrender.com/api-docs)