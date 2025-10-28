# Truck Monitoring Backend Documentation

This document covers everything needed to run, develop, test, and deploy the backend service only. It consolidates key info from the codebase so you don’t have to jump around.

Updated: 28 Oct 2025

## At a glance
- Runtime: Node.js 18+, TypeScript
- Framework: Express
- ORM: Prisma
- DB: SQLite (local) or Postgres (prod-ready)
- Auth: JWT (access + refresh)
- Storage/ML: AWS S3, Google Vision or Tesseract OCR
- Queue/Cache (optional): Redis + BullMQ
- Observability: Pino logs, Prometheus metrics, Sentry (optional)

---

## 1) Project layout (backend)
```
backend/
  src/
    app.ts                 # Express app + routes wiring
    server.ts              # App bootstrap + graceful shutdown
    index.ts               # Legacy starter (tests reference this)
    config/                # prisma, logger, metrics, sentry, sqlite helpers
    controllers/           # route handlers (auth, trips, receipts, reports, ifta, ocr)
    routes/                # express routers (auth, trips, trucks, users, maintenance, receipts, reports, ifta, ocr)
    middleware/            # authGuard, rbac, rateLimiter, errorHandler, etc.
    services/              # authService, ocrService, iftaService, s3Service, notifications, email
    anomaly/               # anomaly detection engine and rules
    queues/, events/, handlers/  # notifications & events
    utils/, types/, models/
  prisma/
    schema.prisma          # full domain schema (Users, Trips, Receipts, IFTA...)
    migrations/            # SQL migrations
    seed.ts                # optional seeding
  data/
    truck_system.db        # SQLite dev database (if used)

Important docs inside backend/:
- TESTING.md (complete testing guide)
- QUICK_START.md (anomaly demo quick start)
- README-OCR.md (OCR service details)
- NOTIFICATION_SYSTEM.md (notification subsystem)
```

---

## 2) Prerequisites
- Node.js 18 or higher
- npm 9+
- One of the following databases:
  - SQLite (dev default), or
  - PostgreSQL 14+ (recommended for staging/prod)
- Optional services depending on features you use:
  - Redis (notifications queue)
  - AWS credentials (S3 uploads, SES)
  - Google Vision credentials or use Tesseract (CPU)

---

## 3) Environment variables (.env)
Use `backend/.env.example` as the template. Required at minimum:

Required core
- DATABASE_URL
- JWT_SECRET
- JWT_REFRESH_SECRET

Useful defaults
- NODE_ENV (development|production)
- PORT (backend) — default 5000 via config
- FRONTEND_URL (for CORS)

Feature flags / integrations
- AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET
- GOOGLE_VISION_KEY (or rely on Tesseract)
- RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS
- REDIS_URL (queues)
- SENTRY_DSN, LOG_LEVEL, SERVICE_NAME, SERVICE_VERSION (observability)

Max upload
- MAX_FILE_SIZE (default 10MB)

Note: `src/config/database.ts` validates critical vars and maps config.

---

## 4) Install, generate, run
From repository root or `backend/` directory.

Install deps and generate Prisma client
```bash
npm install
npm run db:generate
```

Local dev server (hot reload)
```bash
npm run dev
```
- Starts `src/server.ts`
- Logs health URL and environment

Build and start (production mode)
```bash
npm run build
npm start
```

Mock server (if you want mocked endpoints)
```bash
npm run mock
```

Database admin (Prisma)
```bash
# open Prisma Studio
npm run db:studio

# apply SQL changes to DB
npm run migrate

# deploy migrations in prod
npm run migrate:prod

# push schema without migrations (dev only)
npm run db:push

# reset dev DB (DANGER)
npm run db:reset
```

---

## 5) Database
- Prisma datasource is configured via `DATABASE_URL`.
- `schema.prisma` includes:
  - Users, DriverProfile, Trucks, Trips
  - Receipts, Expenses, Invoices, AuditLog
  - Maintenance, Notifications (+ preferences)
  - AnomalyRecord (receipt anomaly tracking)
  - IFTA models: IFTATripSegment, IFTAFuelPurchase, IFTAQuarterlyReport, IFTAJurisdictionData, IFTAStateTaxRate

SQLite quick start (dev):
```env
DATABASE_URL="file:./data/truck_system.db"
```

Postgres example:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/truck_monitoring"
```

---

## 6) API surface (summary)
Mounted in `src/app.ts` under `/api/*` plus `/health`:

- GET `/health` — service health
- `/api/auth` — register, login, refresh, logout, profile, verify, forgot/reset, cleanup-tokens
- `/api/trucks` — CRUD stubs (extend as needed)
- `/api/trips` — create, list/filter/paginate, dashboard stats, etc.
- `/api/users` — list/get
- `/api/maintenance` — basic endpoints
- `/api/receipts` — presign upload, CRUD, pagination/filtering
- `/api/receipts/verification` — receipt verification flow
- `/api/ocr` — process, health, test, categories, batch
- `/api/reports` — dashboard-overview, expenses-summary, expense-details, export CSV, categories
- `/api/ifta` — current-quarter, reports/quarterly, export, compliance-status, dashboard/summary, state-tax-rates, trip segments, fuel purchases, calculator

See also:
- `docs/API.md` for high-level lists
- Controllers in `src/controllers/*` for exact request/response shapes
- Routes in `src/routes/*` for paths, guards, and access rules

Auth & RBAC
- JWT-based (`authGuard`, `adminGuard`, `roleGuard`)
- Refresh tokens persisted (`RefreshToken` model)

Rate limiting
- Global middleware `rateLimiter` with `RATE_LIMIT_*` envs

---

## 7) Storage & OCR
S3 uploads
- `s3Service.ts` generates presigned URLs for frontends to upload receipts.
- `ReceiptController` ties uploaded files to DB records.

OCR options
- Google Vision through `OCRService` (requires `GOOGLE_VISION_KEY`)
- Tesseract fallback for local/dev (`tesseract.js`)
- Endpoints in `src/routes/ocrRoutes.ts`
- Detailed usage in `backend/README-OCR.md`

---

## 8) IFTA module
- Endpoints: `src/routes/iftaRoutes.ts`
- Controller: `src/controllers/iftaController.ts`
- Services: `src/services/iftaService.ts`, `sqliteIftaService.ts`
- Schema entities: segments, fuel purchases, quarterly reports, state tax rates
- Exports and quick calculators available for compliance workflows

---

## 9) Notifications
- Docs: `backend/NOTIFICATION_SYSTEM.md`
- Providers: SendGrid, AWS SES
- Queue: BullMQ + Redis (optional)
- Models: `Notification`, `NotificationPreference`
- Events: `RECEIPT_APPROVED`, `RECEIPT_REJECTED`, `TRIP_ASSIGNED`, `ANOMALY_DETECTED`, etc.

---

## 10) Observability
- Logging: Pino via `src/config/logger.ts` and `requestLogger` middleware
- Metrics: Prometheus via `src/config/metrics.ts` (exposes `/metrics`)
- Sentry: optional via `src/config/sentry.ts` and `observability.ts`

Enable by setting:
```env
SENTRY_DSN=
LOG_LEVEL=info
SERVICE_NAME=truck-monitoring-backend
SERVICE_VERSION=1.0.0
```

Call `initializeObservability(app)` early if not already wired.

---

## 11) Testing
Commands (`backend/TESTING.md` has full details):
```bash
npm test                 # all tests
npm run test:unit        # src/** tests
npm run test:integration # tests/integration
npm run test:e2e         # Playwright
npm run test:coverage    # coverage report
```
Fixtures & setup
- `tests/` and `src/__tests__/`
- `tests/setup.ts`, `tests/env.setup.ts`

---

## 12) Docker (optional)
Local compose exists at `backend/docker-compose.yml`.
Top-level `docker-compose.yml` also orchestrates services.

Typical flow:
1) Set `.env` values
2) Build backend image
3) Run DB + backend service

Refer to repo `DEPLOYMENT.md` and `deployment/*` for ECS/DO app specs.

---

## 13) Common tasks
- Create admin user: use AuthController register or a seed script
- Rotate JWT secrets: update env, invalidate refresh tokens
- Export expense reports: `/api/reports/export/csv`
- Get dashboard numbers: `/api/reports/dashboard-overview`
- Run anomaly demo: `npm run anomaly-demo`

---

## 14) Troubleshooting
- Missing envs: check `validateConfig()` logs; ensure `.env` loaded
- DB connection: verify `DATABASE_URL`, run `npm run migrate`, try `db:studio`
- S3 upload errors: verify bucket name/region and IAM creds
- OCR failures: ensure Vision key or allow Tesseract; check file type/size
- 401/403: check JWT header `Authorization: Bearer <token>` and roles
- 429: rate limit exceeded — tune `RATE_LIMIT_*`
- Metrics/Sentry not showing: confirm env vars and that `/metrics` is reachable

---

## 15) Reference links
- Prisma schema: `backend/prisma/schema.prisma`
- Routes: `backend/src/routes/`
- Controllers: `backend/src/controllers/`
- Services: `backend/src/services/`
- Middleware: `backend/src/middleware/`
- Observability setup: `backend/src/config/observability.ts`
- OCR docs: `backend/README-OCR.md`
- Notifications: `backend/NOTIFICATION_SYSTEM.md`
- API index: `docs/API.md`

If you need anything else added here, open an issue or ping in chat.
