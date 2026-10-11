# Local Development: URLs & Credentials

> **Local development only.** These are the default values from `.env.example` and `docker-compose.yml`.
> Never use them in staging or production.

Start everything first:

```bash
pnpm infra:up   # Postgres, Redis, Mailpit, MinIO (Docker)
pnpm dev        # web, admin, vendor, api, worker
```

---

## Applications

| App | URL | Login |
|---|---|---|
| Storefront (customers) | http://localhost:3000 | Register a new account (login screens are not built yet) |
| Admin panel | http://localhost:3001/login | `admin@example.com` / `Admin@12345` |
| Seller center (vendors) | http://localhost:3002/login | `vendor@example.com` / `Vendor@12345` (approved) |
| API base URL | http://localhost:4000/api/v1 | JWT (cookie or `Authorization: Bearer <token>`) |
| API docs (Swagger) | http://localhost:4000/api/docs | Use `POST /auth/login`, then **Authorize** with the `accessToken` |
| API health check | http://localhost:4000/health | none |

### Seeded accounts

| Role | Email | Password | Where to change |
|---|---|---|---|
| Super Admin | `admin@example.com` | `Admin@12345` | `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `.env`, then `pnpm db:seed` |
| Vendor (approved) — Demo Electronics | `vendor@example.com` | `Vendor@12345` | `seedVendors()` in `packages/database/prisma/seed.ts` |
| Vendor (pending review) — Pending Fashion | `pending@example.com` | `Vendor@12345` | same |

Create a test customer via Swagger: `POST /api/v1/auth/register`
```json
{ "email": "customer@example.com", "password": "Customer@123", "firstName": "Test", "lastName": "Customer" }
```

---

## Infrastructure (Docker)

### PostgreSQL

| Field | Value |
|---|---|
| Host | `localhost` |
| Port | `5432` |
| Database | `ecommerce` |
| Username | `ecommerce` |
| Password | `ecommerce` |
| Connection string | `postgresql://ecommerce:ecommerce@localhost:5432/ecommerce?schema=public` |

Use with DBeaver, pgAdmin, TablePlus, or:
```bash
docker exec -it ecommerce-postgres psql -U ecommerce -d ecommerce
```

### Prisma Studio (database browser)

| Field | Value |
|---|---|
| URL | http://localhost:5555 |
| Start | `pnpm db:studio` |
| Login | none |

### Redis (cache + job queues)

| Field | Value |
|---|---|
| Host | `localhost` |
| Port | `6379` |
| Password | none |
| URL | `redis://localhost:6379` |

```bash
docker exec -it ecommerce-redis redis-cli
```

### Mailpit (local email inbox)

Every email the platform sends (welcome, order confirmation…) lands here; nothing reaches real inboxes.

| Field | Value |
|---|---|
| Inbox (web UI) | http://localhost:8025 |
| SMTP host | `localhost` |
| SMTP port | `1025` |
| SMTP username / password | none |

### MinIO (S3-compatible file storage)

| Field | Value |
|---|---|
| Console (web UI) | http://localhost:9001 |
| S3 API endpoint | http://localhost:9000 |
| Username (access key) | `minioadmin` |
| Password (secret key) | `minioadmin` |
| Bucket | `ecommerce-media` (created automatically with a public-read policy when the API starts) |

### Email template preview

| Field | Value |
|---|---|
| URL | http://localhost:3003 |
| Start | `pnpm email:preview` |

---

## Secrets in `.env`

| Variable | Default | Purpose |
|---|---|---|
| `JWT_ACCESS_SECRET` | `change-me-access-secret-min-32-characters` | Signs login tokens (min 32 chars) |
| `JWT_ACCESS_TTL_SECONDS` | `900` | Access token lifetime (15 min) |
| `JWT_REFRESH_TTL_DAYS` | `30` | Refresh token lifetime |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | empty | Google sign-in (not wired yet) |
| `PAYMENT_*` | empty | Payment gateway (open question in scope) |

---

## Ports at a glance

| Port | Service |
|---|---|
| 3000 | Storefront |
| 3001 | Admin |
| 3002 | Seller center |
| 3003 | Email preview |
| 4000 | API |
| 5432 | PostgreSQL |
| 5555 | Prisma Studio |
| 6379 | Redis |
| 1025 / 8025 | Mailpit SMTP / inbox |
| 9000 / 9001 | MinIO S3 / console |
