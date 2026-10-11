# E-Commerce Platform (Monorepo)

Multi-vendor e-commerce platform built with **Next.js**, **NestJS**, **PostgreSQL** and **Prisma**.
Email is the only notification channel. Full scope: [`docs/scope.md`](docs/scope.md).

## Stack

| Layer          | Tech                                                                                   |
| -------------- | -------------------------------------------------------------------------------------- |
| Monorepo       | Turborepo + pnpm workspaces                                                            |
| Frontends      | Next.js 15 (App Router), React 19, Tailwind CSS, TanStack Query, React Hook Form + Zod |
| API            | NestJS 11 (modular), REST + Swagger, class-validator, JWT                              |
| Database       | PostgreSQL 16 + Prisma 6 (`pg_trgm` for fuzzy search)                                  |
| Queues / cache | Redis + BullMQ (separate worker process)                                               |
| Email          | React Email templates, provider-agnostic sender (SMTP → Mailpit locally)               |
| Storage        | S3-compatible (MinIO locally)                                                          |
| Testing        | Jest, Supertest, Playwright                                                            |
| DevOps         | Docker, GitHub Actions                                                                 |

## Structure

```
apps/
  web/              Next.js storefront (customers)               → http://localhost:3000
  admin/            Next.js admin panel                          → http://localhost:3001
  vendor/           Next.js seller center                        → http://localhost:3002
  api/              NestJS REST API                              → http://localhost:4000/api/v1  (docs: /api/docs)
  worker/           NestJS BullMQ worker (emails, cron jobs)
packages/
  config/           shared tsconfig, ESLint, Tailwind preset
  types/            shared enums, email keys, queue names, API contracts
  ui/               shared React components (Button, Card, AppShell, …)
  database/         Prisma schema, migrations, seed, Prisma client
  email-templates/  React Email templates + renderEmail()             → preview http://localhost:3003
docker/             Dockerfiles + Postgres init
docs/               scope document, architecture notes
```

## Prerequisites

- Node.js 22+
- pnpm 9+ (`corepack enable` then `corepack prepare pnpm@9.15.4 --activate`)
- Docker Desktop (for Postgres, Redis, Mailpit, MinIO)

## Getting started

```bash
# 1. Install dependencies
pnpm install

# 2. Environment
cp .env.example .env          # Git Bash / macOS / Linux
# PowerShell: Copy-Item .env.example .env   |   CMD: copy .env.example .env

# 3. Start infrastructure (Postgres, Redis, Mailpit, MinIO)
pnpm infra:up

# 4. Database: create the first migration, then seed roles/admin/settings
pnpm db:migrate --name init
pnpm db:seed

# 5. Run everything (web, admin, vendor, api, worker)
pnpm dev
```

Commit the generated `pnpm-lock.yaml` and `packages/database/prisma/migrations/` after step 4. CI and Docker builds
use `--frozen-lockfile`.

Seeded super admin: `admin@example.com` / `Admin@12345` (change via `SEED_ADMIN_*` in `.env`).

| Service               | URL                                          |
| --------------------- | -------------------------------------------- |
| Storefront            | http://localhost:3000                        |
| Admin                 | http://localhost:3001                        |
| Seller center         | http://localhost:3002                        |
| API + Swagger         | http://localhost:4000/api/docs               |
| Mailpit (email inbox) | http://localhost:8025                        |
| MinIO console         | http://localhost:9001                        |
| Prisma Studio         | `pnpm db:studio`                             |
| Email preview         | `pnpm email:preview` → http://localhost:3003 |

## Scripts

| Command                                                 | What it does                                               |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| `pnpm dev`                                              | Run every app in watch mode                                |
| `pnpm dev:web` / `dev:admin` / `dev:vendor` / `dev:api` | Run one app (plus its dependencies)                        |
| `pnpm build`                                            | Build everything                                           |
| `pnpm lint` / `pnpm typecheck` / `pnpm test`            | Quality checks                                             |
| `pnpm db:migrate`                                       | Create & apply a migration from `schema.prisma`            |
| `pnpm db:seed`                                          | Seed roles, permissions, super admin, currencies, settings |
| `pnpm db:studio`                                        | Open Prisma Studio                                         |
| `pnpm infra:up` / `infra:down`                          | Start / stop local Docker services                         |
| `pnpm format`                                           | Prettier across the repo                                   |

## Backend modules

Every domain in scope section 2.3 has a NestJS module under `apps/api/src/modules/`:

`auth` · `users` · `rbac` · `vendors` · `catalog` · `inventory` · `search` · `cart` · `checkout` · `pricing` ·
`promotions` · `orders` · `payments` · `shipping` · `returns` · `reviews` · `wishlist` · `loyalty` ·
`recommendations` · `cms` · `media` · `notifications` · `marketing` · `support` · `payouts` · `analytics` · `seo` ·
`settings` · `audit` · `jobs`

**Working end to end now:** register/login/refresh/logout, `GET /users/me`, product listing/detail, category
tree, brands, search autocomplete, email queue → worker → Mailpit, health check.
Every other module exposes `GET /<module>/status`, and its service file lists the scope items it still has to deliver.

## Frontend screens

Every screen in scope sections 3–5 exists as a route in its app. Each one shows a scaffold card listing the
features it needs, so the team can pick up any page and build it.

## Docker

```bash
docker build -f docker/Dockerfile.node --build-arg APP=api    -t ecommerce-api .
docker build -f docker/Dockerfile.node --build-arg APP=worker -t ecommerce-worker .
docker build -f docker/Dockerfile.next --build-arg APP=web    -t ecommerce-web .
```

More detail: [`docs/architecture.md`](docs/architecture.md).
# ecommerce-platform
