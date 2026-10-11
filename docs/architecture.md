# Architecture

## Request flow

```
Browser ──► Next.js app (web / admin / vendor)
              │  server components fetch with ISR, client components use TanStack Query
              ▼
           NestJS API  (/api/v1)
              │  Guards: Throttler → JwtAuth (@Public to skip) → Roles (@Roles)
              │  ValidationPipe (class-validator) → Controller → Service → PrismaService
              ▼
           PostgreSQL                       Redis
                                              ▲   BullMQ queues
                    NotificationsService ─────┘   (email, marketing, reports, imports, media, maintenance)
                                              │
                                              ▼
                                         Worker (apps/worker)
                                           EmailProcessor → renderEmail() → MailProvider (SMTP/SES/…)
                                           MaintenanceProcessor → cron jobs
```

## Package dependency graph

```
types ◄── database (no dep on types)
  ▲          ▲
  │          │
  ├── email-templates
  │          ▲
  │          │
  ├── api ───┤ (database)
  ├── worker ┘ (database, email-templates)
  ├── ui (no deps on types)
  └── web / admin / vendor (types, ui)
config ◄── everything (devDependency)
```

`types`, `database` and `email-templates` compile to `dist/` (CommonJS) so NestJS can consume them.
`ui` is consumed as TypeScript source and transpiled by Next.js (`transpilePackages`).
Turborepo builds packages before apps (`dependsOn: ["^build"]`).

## Conventions

- **Email only through `NotificationsService.sendEmail()`.** It checks the suppression list and marketing
  preferences, writes an `EmailLog`, and enqueues the job. The worker renders the React Email template and updates the log.
- **Adding an email:** add a key to `EmailTemplateKey` (packages/types), add a template + registry entry
  (packages/email-templates). TypeScript fails the build if a key has no template.
- **Multi-vendor orders:** one `Order` → many `VendorOrder` (one per vendor) → `OrderItem`. Each vendor order has its
  own status lifecycle, shipments and payout item.
- **Money:** `Decimal(12,2)` in Postgres; never use JS floats for totals (use `Prisma.Decimal`).
- **Idempotency:** `Order.idempotencyKey` and `WebhookEvent (provider, eventId)` are unique.
- **Inventory:** reserve on checkout (`StockReservation`), commit on payment, release by cron after expiry.
- **Audit:** admin and vendor mutations call `AuditService` to write `AuditLog`.

## Ports

| App           | Port                       |
| ------------- | -------------------------- |
| web           | 3000                       |
| admin         | 3001                       |
| vendor        | 3002                       |
| email preview | 3003                       |
| api           | 4000                       |
| postgres      | 5432                       |
| redis         | 6379                       |
| mailpit       | 1025 (SMTP) / 8025 (UI)    |
| minio         | 9000 (S3) / 9001 (console) |
