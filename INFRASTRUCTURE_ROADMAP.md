# Infrastructure Implementation Roadmap

This document tracks the implementation of missing and enhanced infrastructure components across two phases.

## Branch Strategy

### Phase 1: Missing Components (`feature/missing-infrastructure-components`)
Implement the 0% complete infrastructure components that are currently missing.

### Phase 2: Component Enhancements (`feature/enhance-existing-components`)
Enhance existing components with their missing functionalities.

---

## Phase 1: Missing Components

**Branch:** `feature/missing-infrastructure-components`
**Status:** 🟡 In Progress
**Target:** Implement all 0% complete components to production-ready state

### 1. Full-Text Search with Meilisearch ❌ 0% → 🎯 100%

**Why:** Enable users to find tickets/comments by content, not just filters.

**Implementation Plan:**
- [ ] Add Meilisearch to `docker-compose.yml`
- [ ] Create `src/services/search.service.ts`
  - Index tickets on create/update
  - Index comments on create/update
  - Sync existing data on startup
- [ ] Create `src/controllers/search.controller.ts`
- [ ] Create `src/routes/search.routes.ts`
  - `GET /api/v1/search/tickets?q=keyword`
  - `GET /api/v1/search/comments?q=keyword`
- [ ] Add search to Swagger docs
- [ ] Add tests: `search.service.test.ts`

**Files to Create:**
```
src/
  services/search.service.ts
  controllers/search.controller.ts
  routes/search.routes.ts
  __tests__/
    services/search.service.test.ts
docker-compose.yml (update)
```

**Dependencies:**
- `meilisearch` npm package
- Meilisearch Docker container

**Estimated Complexity:** Medium (2-3 hours)

---

### 2. SLA Tracking & Rules Engine ❌ 0% → 🎯 100%

**Why:** Track response times, enforce SLAs, auto-escalate when breached.

**Implementation Plan:**
- [ ] Update Prisma schema with SLA fields
  ```prisma
  model Tenant {
    slaConfig Json? // { firstResponseMinutes: 60, resolutionMinutes: 480 }
  }
  
  model Ticket {
    firstResponseAt  DateTime?
    firstResponseSla Boolean @default(true)  // Met SLA?
    resolvedAt       DateTime?
    resolutionSla    Boolean @default(true)  // Met SLA?
  }
  ```
- [ ] Run migration: `npm run prisma:migrate`
- [ ] Create `src/services/sla.service.ts`
  - Calculate SLA deadlines
  - Mark tickets as breached
  - Trigger escalations
- [ ] Create `src/jobs/sla.jobs.ts`
  - Cron sweep every 5 minutes
  - Check for breached SLAs
  - Auto-escalate or notify
- [ ] Update `TicketService` to track first response
- [ ] Add SLA metrics to tenant dashboard
- [ ] Add tests: `sla.service.test.ts`

**Files to Create:**
```
prisma/
  schema.prisma (update)
  migrations/XXX_add_sla_tracking/
src/
  services/sla.service.ts
  jobs/sla.jobs.ts
  __tests__/
    services/sla.service.test.ts
```

**Dependencies:**
- `node-cron` for scheduled tasks
- Bull queue for job processing

**Estimated Complexity:** High (4-5 hours)

---

### 3. Activate Bull Job Queue System ⚠️ 40% → 🎯 100%

**Why:** Async processing for webhooks, notifications, SLA checks, and heavy operations.

**Implementation Plan:**
- [ ] Create `src/config/queue.ts`
  - Initialize Bull queues
  - Configure Redis connection
  - Export queue instances
- [ ] Create worker processes
  - `src/workers/ticket.worker.ts`
  - `src/workers/notification.worker.ts`
  - `src/workers/webhook.worker.ts`
  - `src/workers/sla.worker.ts`
- [ ] Update services to enqueue jobs instead of direct execution
  - `TicketService.createTicket()` → enqueue job
  - `WebhookService.triggerWebhooks()` → enqueue job
  - `NotificationService.createNotification()` → enqueue job
- [ ] Add retry policies (3 attempts, exponential backoff)
- [ ] Add job monitoring dashboard (optional: Bull Board)
- [ ] Add worker startup in `package.json`:
  ```json
  "start:worker": "ts-node src/workers/index.ts"
  ```
- [ ] Update Docker Compose with separate worker service
- [ ] Add tests: `queue.test.ts`

**Files to Create:**
```
src/
  config/queue.ts
  workers/
    index.ts
    ticket.worker.ts
    notification.worker.ts
    webhook.worker.ts
    sla.worker.ts
  __tests__/
    config/queue.test.ts
docker-compose.yml (update with worker service)
package.json (update scripts)
```

**Dependencies:**
- `bull` npm package (already in package.json)
- `@bull-board/express` for monitoring (optional)

**Estimated Complexity:** High (4-6 hours)

---

## Phase 2: Component Enhancements

**Branch:** `feature/enhance-existing-components`
**Status:** ⏸️ Pending (starts after Phase 1 merges)
**Target:** Fill gaps in existing 40-90% complete components

### 1. Expand Audit Logging ✅ 80% → 🎯 100%

**Current State:** Only tickets have activity logs.

**Enhancements Needed:**
- [ ] Create universal `AuditLog` model in Prisma
  ```prisma
  model AuditLog {
    id          String   @id @default(cuid())
    tenantId    String
    userId      String
    action      String   // CREATE, UPDATE, DELETE, LOGIN, etc.
    entityType  String   // Ticket, User, Webhook, Tenant, etc.
    entityId    String?
    changes     Json?    // Before/after diff
    ipAddress   String?
    userAgent   String?
    createdAt   DateTime @default(now())
    
    tenant      Tenant   @relation(fields: [tenantId], references: [id])
    user        User     @relation(fields: [userId], references: [id])
  }
  ```
- [ ] Create `src/middleware/audit.ts` to capture all requests
- [ ] Create `src/services/audit.service.ts` with query API
- [ ] Create `src/routes/audit.routes.ts`
  - `GET /api/v1/audit?entityType=Ticket&entityId=xxx`
  - `GET /api/v1/audit?userId=xxx&startDate=...&endDate=...`
- [ ] Add pagination to audit queries
- [ ] Add tests: `audit.service.test.ts`

**Estimated Complexity:** Medium (3-4 hours)

---

### 2. Add Distributed Tracing & Metrics ✅ 85% → 🎯 100%

**Current State:** Logging is good, but missing tracing and metrics.

**Enhancements Needed:**
- [ ] Install OpenTelemetry SDK
  ```bash
  npm install @opentelemetry/api @opentelemetry/sdk-node \
    @opentelemetry/auto-instrumentations-node \
    @opentelemetry/exporter-trace-otlp-http
  ```
- [ ] Create `src/config/telemetry.ts`
  - Initialize OpenTelemetry
  - Configure Jaeger exporter (or Zipkin)
  - Auto-instrument Express, Prisma, Redis
- [ ] Add custom spans for critical operations
- [ ] Create `src/middleware/tracing.ts` for request tracing
- [ ] Add Prometheus metrics
  - Install `prom-client`
  - Create `/metrics` endpoint
  - Track: request count, duration, errors, queue depth
- [ ] Enhance health check endpoint
  ```typescript
  GET /health → {
    status: "ok",
    timestamp: "...",
    database: "connected",
    redis: "connected",
    queue: "active"
  }
  ```
- [ ] Add Grafana dashboard config (optional)
- [ ] Update Docker Compose with Jaeger + Prometheus

**Estimated Complexity:** High (5-6 hours)

---

### 3. Add Webhook Retry & Dead-Letter Queue ✅ 70% → 🎯 100%

**Current State:** Single-attempt delivery only.

**Enhancements Needed:**
- [ ] Update `WebhookService.triggerWebhooks()` to use queue
- [ ] Implement exponential backoff (1min, 5min, 15min, 1hr)
- [ ] Add max retry limit (5 attempts)
- [ ] Create dead-letter queue for failed webhooks
- [ ] Add webhook delivery status endpoint:
  - `GET /api/v1/webhooks/:id/deliveries`
- [ ] Add retry button in webhook management UI
- [ ] Track delivery metrics (success rate, avg latency)

**Estimated Complexity:** Medium (2-3 hours)

---

### 4. Add Pagination ⚠️ 50% → 🎯 100%

**Current State:** No pagination, all results returned.

**Enhancements Needed:**
- [ ] Create pagination helper in `src/utils/pagination.ts`
- [ ] Update all list endpoints:
  - `GET /tickets?page=1&limit=20`
  - `GET /comments?page=1&limit=20`
  - `GET /notifications?page=1&limit=20`
  - `GET /audit?page=1&limit=50`
- [ ] Return pagination metadata:
  ```json
  {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
  ```
- [ ] Add cursor-based pagination for real-time feeds (optional)
- [ ] Update Swagger docs with pagination params

**Estimated Complexity:** Medium (2-3 hours)

---

### 5. Add Email Notifications ⚠️ 40% → 🎯 100%

**Current State:** SMTP config exists but no sending.

**Enhancements Needed:**
- [ ] Install `nodemailer`
- [ ] Create `src/services/email.service.ts`
- [ ] Create email templates:
  - `src/templates/ticket-assigned.html`
  - `src/templates/comment-added.html`
  - `src/templates/sla-breach.html`
- [ ] Update `NotificationService` to send emails
- [ ] Add email preferences to user settings
- [ ] Queue email jobs via Bull
- [ ] Add retry logic for failed emails
- [ ] Add email delivery tracking

**Estimated Complexity:** Medium-High (4-5 hours)

---

### 6. Add Repository Pattern ⚠️ 50% → 🎯 100%

**Current State:** Services use Prisma directly.

**Enhancements Needed:**
- [ ] Create base repository: `src/repositories/base.repository.ts`
- [ ] Create entity repositories:
  - `src/repositories/ticket.repository.ts`
  - `src/repositories/user.repository.ts`
  - `src/repositories/comment.repository.ts`
- [ ] Add Unit-of-Work pattern for transactions
- [ ] Refactor services to use repositories
- [ ] Update tests to mock repositories instead of Prisma

**Estimated Complexity:** High (6-8 hours)
**Note:** This is a significant refactor. Consider carefully if needed.

---

## Summary

### Phase 1: Missing Components
- **Total Tasks:** 3 major components
- **Estimated Time:** 10-14 hours
- **Outcome:** All 0% components → 100%

### Phase 2: Component Enhancements
- **Total Tasks:** 6 enhancement areas
- **Estimated Time:** 22-29 hours
- **Outcome:** All partial components → 100%

### Priority Order

**High Priority (Do First):**
1. ✅ Activate Bull Job Queue (Phase 1) - Foundation for everything
2. ✅ Add SLA Tracking (Phase 1) - Customer-facing value
3. ✅ Add Pagination (Phase 2) - Critical for scale
4. ✅ Expand Audit Logging (Phase 2) - Security/compliance

**Medium Priority:**
5. ✅ Add Full-Text Search (Phase 1) - UX improvement
6. ✅ Webhook Retry Logic (Phase 2) - Reliability
7. ✅ Email Notifications (Phase 2) - User engagement

**Lower Priority (Optional):**
8. ⚠️ Distributed Tracing (Phase 2) - Nice for production monitoring
9. ⚠️ Repository Pattern (Phase 2) - Architectural purity (big refactor)

---

## Next Steps

1. **Implement Phase 1** on `feature/missing-infrastructure-components`
2. **Open PR** and merge to `main`
3. **Create Phase 2 branch:** `feature/enhance-existing-components`
4. **Implement enhancements** following priority order
5. **Open PR** and merge to `main`

---

**Last Updated:** October 25, 2025
**Status:** Phase 1 branch created, ready to start implementation
