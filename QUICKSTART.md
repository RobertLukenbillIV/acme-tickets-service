# Quick Start Guide

Get the Tickets Service API up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- Git installed

## Option 1: Docker Compose (Recommended)

This is the fastest way to get started. Everything runs in containers.

### 1. Clone the repository

```bash
git clone https://github.com/RobertLukenbillIV/acme-tickets-service.git
cd acme-tickets-service
```

### 2. Start all services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database on port 5432
- Redis on port 6379
- API service on port 3000

### 3. Run database migrations

```bash
docker-compose exec api npx prisma migrate deploy
```

### 4. Verify it's running

```bash
curl http://localhost:3000/health
```

You should see: `{"status":"ok","timestamp":"..."}`

### 5. View API documentation

Open your browser to: http://localhost:3000/api-docs

## Option 2: Local Development

Run the API locally with external database.

### 1. Clone and install

```bash
git clone https://github.com/RobertLukenbillIV/acme-tickets-service.git
cd acme-tickets-service
npm install
```

### 2. Start PostgreSQL and Redis

```bash
docker-compose up -d postgres redis
```

Or use your own PostgreSQL and Redis instances.

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your database connection:

```env
DATABASE_URL=postgresql://ticketsuser:ticketspass@localhost:5432/tickets_db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-key-change-in-production
```

### 4. Set up database

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Start the development server

```bash
npm run dev
```

The API will be available at http://localhost:3000

## Your First API Request

### 1. Create a Tenant

```bash
curl -X POST http://localhost:3000/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Company",
    "slug": "my-company"
  }'
```

Save the `id` from the response - you'll need it for user registration.

### 2. Register a User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "firstName": "Admin",
    "lastName": "User",
    "tenantId": "TENANT_ID_FROM_STEP_1"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!"
  }'
```

Save the `token` from the response.

### 4. Create Your First Ticket

```bash
curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "My First Ticket",
    "description": "Testing the tickets service!",
    "priority": "MEDIUM"
  }'
```

### 5. List All Tickets

```bash
curl -X GET http://localhost:3000/api/v1/tickets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Development Workflow

### Run tests

```bash
npm test
```

### Run linter

```bash
npm run lint
```

### Format code

```bash
npm run format
```

### Build for production

```bash
npm run build
npm start
```

## Database Management

### Open Prisma Studio (Database GUI)

```bash
npm run prisma:studio
```

Then open http://localhost:5555 in your browser.

### Create a new migration

```bash
npm run prisma:migrate
```

### Reset the database (⚠️ Deletes all data)

```bash
npx prisma migrate reset
```

## Troubleshooting

### Port already in use

If port 3000 is already in use, change it in `.env`:

```env
PORT=3001
```

### Database connection failed

Ensure PostgreSQL is running:

```bash
docker-compose ps
```

If not running:

```bash
docker-compose up -d postgres
```

### Redis connection failed

Ensure Redis is running:

```bash
docker-compose ps
```

### Can't authenticate

Check that:
1. You're using the token from the login response
2. The token format is: `Bearer YOUR_TOKEN`
3. The token hasn't expired (default: 24 hours)

### Prisma Client not found

Generate it:

```bash
npm run prisma:generate
```

## Next Steps

1. **Read the full documentation**: Check out [README.md](README.md)
2. **Explore API examples**: See [API_EXAMPLES.md](API_EXAMPLES.md)
3. **Set up webhooks**: Configure webhooks for your application
4. **Customize**: Modify the code to fit your needs
5. **Deploy**: Deploy to your production environment

## Getting Help

- Check [API_EXAMPLES.md](API_EXAMPLES.md) for detailed API usage
- Read [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Open an issue on GitHub for bugs or questions

## Common Use Cases

### Create a Support Ticket System

1. Register users with different roles (USER, AGENT, ADMIN)
2. Users create tickets
3. Agents assign themselves and update status
4. Enable webhooks to notify external systems

### Track Internal Issues

1. Create one tenant per team
2. Team members create and manage tickets
3. Use priorities to track urgency
4. Add comments for collaboration

### Customer Service Platform

1. Multi-tenant setup for multiple clients
2. Role-based access for staff and customers
3. File attachments for screenshots/logs
4. Webhook integration with CRM systems

Happy coding! 🚀
