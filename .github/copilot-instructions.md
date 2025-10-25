## Quick orientation for AI coding agents

This repository is a TypeScript Express API implementing a multi-tenant tickets service backed by PostgreSQL (Prisma). The guidance below highlights project conventions, important files, and precise developer workflows so an AI agent can be immediately productive.

- Entry points
  - `src/index.ts` — server bootstrap; connects `prisma` and starts the HTTP server.
  - `src/app.ts` — Express app: middleware, Swagger config (`/api-docs`), rate limiting, and route mounting.

- Architectural pattern (controller → service → prisma)
  - `src/routes/*.ts` register route groups (see `src/routes/index.ts`).
  - Controllers are thin and live in `src/controllers/` (e.g., `ticket.controller.ts`) — they extract request data and call services.
  - Business logic lives in `src/services/` (e.g., `ticket.service.ts`) and uses the `prisma` client from `src/config/database.ts`.
  - Always enforce tenant scoping in services (most service methods accept `tenantId` and use it in queries).

- Important config and infra points
  - `prisma/schema.prisma` — canonical data model (Tenant, User, Ticket, etc.). Run `npm run prisma:generate` after edits.
  - Environment values are defined/read in `src/config/env.ts`. Key vars: `DATABASE_URL`, `JWT_SECRET`, `REDIS_*`, `S3_BUCKET_NAME`, `API_PREFIX`.
  - S3 presigned uploads are used for attachments (see attachment service/routes).
  - Redis + Bull are prepared for background jobs (jobs live in `src/jobs/`).

- Auth, RBAC and tenant access
  - Authentication & authorization middleware: `src/middleware/auth.ts`. Use `authenticate` to require JWT and `authorize(...roles)` to enforce RBAC.
  - Routes and services rely on `AuthRequest` (augmented request with `user`) — controllers read `req.user` and pass `tenantId` to services.
  - When adding endpoints, ensure service-level tenant checks (do not rely on routes alone).

- Error handling & logging
  - Central error handler: `src/middleware/errorHandler.ts` (services throw `AppError` for HTTP errors).
  - Structured logging via `src/utils/logger.ts` (Winston). Use logger.* instead of console.*.

- Tests & linting
  - Tests: Jest + ts-jest. Tests live under `src/**/__tests__` (see `jest.config.js`). Run `npm test` and `npm run test:coverage`.
  - Linting: `npm run lint` and `npm run lint:fix`. Formatting: `npm run format`.

- Common developer commands (copyable)
  - Install: `npm install`
  - Dev: `npm run dev` (nodemon + ts-node)
  - Build: `npm run build` → output `dist/`
  - Start (prod): `npm run start`
  - Prisma: `npm run prisma:generate`, `npm run prisma:migrate`, `npm run prisma:studio`
  - Docker: `docker-compose up -d` (starts Postgres, Redis, API)

- Code-change patterns to follow (concrete examples)
  - New route: add a route file in `src/routes/` and register it in `src/routes/index.ts`.
  - New controller: add a class in `src/controllers/`, keep logic thin, call a service (example: `TicketController.createTicket` calls `TicketService.createTicket`).
  - New service: add to `src/services/`, use `prisma` from `src/config/database.ts`, include tenant filters in `where` clauses. Create Activity records for ticket changes where appropriate (see `TicketService`).
  - Secure endpoints: use `authenticate` + `authorize(...)` in the route file. Example pattern in routes:

    router.post('/', authenticate, authorize(UserRole.AGENT, UserRole.ADMIN), controller.createTicket.bind(controller));

- Integration & observability
  - Swagger docs: configured in `src/app.ts`, scanning `./src/routes/*.ts` for JSDoc. API docs available at `/api-docs` in dev.
  - Health check: `GET /health`.
  - Prisma emits warnings/errors to logger — check logs when debugging DB issues.

- Small but important gotchas
  - Tenant scoping is enforced in services — do not return cross-tenant data.
  - Use `prisma.findFirst({ where: { id, tenantId }})` when fetching resource by id.
  - When changing the Prisma schema run `prisma:generate` and migrations if needed.

If any section is unclear or you'd like more examples (route templates, service templates, or a short PR checklist), tell me which area to expand and I'll update this file.
