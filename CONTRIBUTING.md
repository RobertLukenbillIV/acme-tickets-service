# Contributing to Tickets Service API

Thank you for your interest in contributing to the Tickets Service API! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/acme-tickets-service.git
   cd acme-tickets-service
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Set Up Database**
   ```bash
   # Start PostgreSQL and Redis (or use Docker Compose)
   docker-compose up -d postgres redis
   
   # Run migrations
   npm run prisma:migrate
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── config/          # Configuration files and database setup
├── controllers/     # Request handlers
├── middleware/      # Express middleware (auth, validation, errors)
├── routes/          # API route definitions
├── services/        # Business logic layer
├── utils/           # Utility functions and helpers
├── types/           # TypeScript type definitions
├── jobs/            # Background job processors
├── app.ts           # Express application setup
└── index.ts         # Server entry point
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Update types as needed

### 3. Write Tests

- Add unit tests for new services
- Add integration tests for new endpoints
- Ensure all tests pass

```bash
npm test
```

### 4. Lint Your Code

```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

### 5. Format Your Code

```bash
npm run format
```

### 6. Build the Project

```bash
npm run build
```

### 7. Commit Your Changes

Follow conventional commit format:

```bash
git commit -m "feat: add user role management endpoint"
git commit -m "fix: resolve ticket assignment bug"
git commit -m "docs: update API examples"
```

Commit types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 8. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Define interfaces for complex objects
- Use meaningful variable and function names
- Avoid `any` type when possible
- Use async/await over promises

### Services

- Keep services focused on business logic
- Handle errors appropriately
- Use transactions for multi-step database operations
- Log important operations

Example:
```typescript
export class TicketService {
  async createTicket(data: CreateTicketDto) {
    try {
      const ticket = await prisma.ticket.create({
        data,
      });
      
      logger.info(`Ticket created: ${ticket.id}`);
      return ticket;
    } catch (error) {
      logger.error('Failed to create ticket:', error);
      throw new AppError(500, 'Failed to create ticket');
    }
  }
}
```

### Controllers

- Keep controllers thin
- Delegate business logic to services
- Handle request/response properly
- Use proper HTTP status codes

Example:
```typescript
async createTicket(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const ticket = await ticketService.createTicket(req.body);
    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
}
```

### Routes

- Use express-validator for input validation
- Apply appropriate middleware
- Group related routes together

Example:
```typescript
router.post(
  '/',
  authenticate,
  [
    body('title').notEmpty(),
    body('description').notEmpty(),
    validate,
  ],
  controller.create.bind(controller)
);
```

## Testing Guidelines

### Unit Tests

Test individual functions and services in isolation:

```typescript
describe('TicketService', () => {
  let service: TicketService;
  
  beforeEach(() => {
    service = new TicketService();
    jest.clearAllMocks();
  });
  
  it('should create a ticket', async () => {
    const data = { title: 'Test', description: 'Test' };
    const result = await service.createTicket(data);
    expect(result).toBeDefined();
  });
});
```

### Integration Tests

Test API endpoints end-to-end:

```typescript
describe('POST /api/v1/tickets', () => {
  it('should create a ticket', async () => {
    const response = await request(app)
      .post('/api/v1/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test', description: 'Test' })
      .expect(201);
      
    expect(response.body).toHaveProperty('id');
  });
});
```

## Database Migrations

When making schema changes:

1. Update `prisma/schema.prisma`
2. Generate migration:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```
3. Commit both schema and migration files

## Security Considerations

- Never commit secrets or API keys
- Validate and sanitize all inputs
- Use parameterized queries (Prisma handles this)
- Implement proper authentication and authorization
- Follow OWASP security guidelines
- Use HTTPS in production
- Implement rate limiting
- Hash passwords with bcrypt
- Use JWT with expiration

## Documentation

- Update README.md for major changes
- Update API_EXAMPLES.md for new endpoints
- Add JSDoc comments for complex functions
- Update OpenAPI/Swagger annotations

## Pull Request Process

1. **Update Documentation**: Ensure all relevant docs are updated
2. **Add Tests**: All new features must have tests
3. **Pass CI Checks**: Ensure build, lint, and tests pass
4. **Request Review**: Tag maintainers for review
5. **Address Feedback**: Make requested changes
6. **Squash Commits**: Clean up commit history if needed

## Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests passing

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

## Getting Help

- Check existing issues and documentation
- Ask questions in GitHub Discussions
- Join our community chat (if available)

## License

By contributing, you agree that your contributions will be licensed under the ISC License.

Thank you for contributing!
