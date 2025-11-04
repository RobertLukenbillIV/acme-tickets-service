## Quick orientation for AI coding agents (concise)

This is a TypeScript Express API implementing a multi-tenant tickets service using Prisma + PostgreSQL. Below are the minimal, high-value facts an AI agent needs to be productive immediately.

- Entry points
  - `src/index.ts` — bootstraps logging, Prisma, and starts the HTTP server.
  - `src/app.ts` — configures Express (middleware, Swagger at `/api-docs`), rate-limiter, and mounts routes from `src/routes`.

- Architectural pattern
  - Controller → Service → Prisma. Routes wire controllers (thin). Controllers call services (business logic). Services use the shared Prisma client at `src/config/database.ts`.
  - Files to inspect for examples: `src/routes/ticket.routes.ts`, `src/controllers/ticket.controller.ts`, `src/services/ticket.service.ts`.

- Tenant scoping (critical)
  - All reads/writes must be tenant-scoped at the service layer. Typical pattern: `prisma.findFirst({ where: { id, tenantId } })` or include `tenantId` in `where` for updates/deletes. Do not rely on route middleware alone.

- Auth & request shape
  - Auth middleware: `src/middleware/auth.ts`. Use `authenticate` to require JWT and `authorize(...)` to enforce roles.
  - Controllers expect an augmented `AuthRequest` (`req.user`) — pass `req.user.tenantId` into services.

- Important config & env
  - Prisma model: `prisma/schema.prisma`. After schema edits run `npm run prisma:generate` and migrations (`npm run prisma:migrate`).
  - Environment variables live in `src/config/env.ts`. Key names: `DATABASE_URL`, `JWT_SECRET`, `REDIS_*`, `S3_BUCKET_NAME`, `API_PREFIX`.

- Scripts (from `package.json`) — useful commands
  - `npm run dev` — dev server (nodemon + ts-node)
  - `npm run build` → `dist/` (tsc)
  - `npm start` — run built app
  - `npm test`, `npm run test:coverage` — Jest tests
  - `npm run lint` / `npm run lint:fix` / `npm run format`
  - `npm run prisma:generate`, `npm run prisma:migrate`, `npm run prisma:studio`

- Integration points & infra
  - Attachments: S3 presigned upload flow (see `attachment.service.ts`/`attachment.routes.ts`).
  - Background jobs: Redis + Bull used in `src/jobs/` and `notification.service.ts`.
  - Swagger docs: auto-generated from JSDoc in `src/routes/*.ts` and available at `/api-docs` in dev.

- Patterns & small examples
  - Add a route: create `src/routes/your.resource.routes.ts` and register in `src/routes/index.ts`.
  - Add controller: `src/controllers/YourController` should be thin; extract data and call a service.
  - Add service: `src/services/your.service.ts` — always pass `tenantId` into Prisma `where` clauses and create Activity records where applicable (see `ticket.service.ts`).

- Observability & errors
  - Central error handler: `src/middleware/errorHandler.ts`. Services throw `AppError` for HTTP responses.
  - Logging: use `src/utils/logger.ts` (Winston) instead of console.

- Quick validation tips before PR
  - Unit tests: `npm test` (Jest). See `src/**/__tests__` for patterns.
  - Lint and format: `npm run lint` and `npm run format`.
  - Prisma changes: run `npm run prisma:generate` and include migrations if schema changed.

If something here is unclear or you want more examples (route/controller/service templates, integration tests, or a PR checklist), tell me which area to expand and I'll iterate.
