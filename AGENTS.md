# AGENTS.md — How to work on this codebase

Read this file fully before writing code. It is the contract for any AI agent or developer.
It exists so you do **not** have to explore the whole repo or guess conventions.

---

## 0. Golden rules (read first)

1. **Never guess.** If a file, export, endpoint or column is not shown here or in the code, open the file and check.
   The Prisma schema (`packages/database/prisma/schema.prisma`) is the source of truth for data.
2. **One entity at a time, through every layer** (§3). Do not build half of five things.
3. **Copy the reference implementation** that matches your entity (§4). Do not invent new patterns.
4. **Shared things live in packages**, never duplicated in apps (§2).
5. **Small, verifiable steps.** After each step: typecheck, test, run, update `docs/roadmap.md`.
6. **Do not change the Prisma schema** unless the step requires it. If you do, create a migration
   (`pnpm db:migrate --name <change>`) and say so explicitly.
7. **Never commit secrets.** Local defaults live in `.env.example` / `CREDENTIALS.md` only.

Current progress and the next entity to build: **`docs/roadmap.md`**. Full product scope: **`docs/scope.md`**.

---

## 1. Project map

```
apps/
  api/        NestJS 11 REST API          http://localhost:4000/api/v1   (Swagger: /api/docs)
  worker/     NestJS BullMQ worker        (emails, cron jobs)
  web/        Next.js 15 storefront       http://localhost:3000
  admin/      Next.js 15 admin panel      http://localhost:3001
  vendor/     Next.js 15 seller center    http://localhost:3002
packages/
  types/            shared interfaces, const enums, zod form schemas, helpers  (compiled to dist, CJS)
  api-client/       typed fetch functions + TanStack query keys               (consumed as TS source)
  ui/               shared React components                                   (consumed as TS source)
  database/         Prisma schema, migrations, seed, Prisma client            (compiled to dist)
  email-templates/  React Email templates + renderEmail()                     (compiled to dist)
  config/           tsconfig / eslint / tailwind presets
docs/        scope.md, roadmap.md, architecture.md
```

Stack: pnpm workspaces + Turborepo, Next.js App Router, NestJS, PostgreSQL + Prisma 6, Redis + BullMQ,
MinIO (S3), Mailpit (SMTP). **Email is the only notification channel.**

---

## 2. Where things go (decision table)

| You need… | Put it in | Example |
|---|---|---|
| A type the API returns / accepts | `packages/types/src/<domain>/<entity>.ts` | `catalog/brand.ts` → `BrandDto`, `BrandListItem`, `BrandInput` |
| A form validation schema (frontend) | `packages/types/src/schemas/<entity>.schema.ts` | `brandFormSchema`, `emptyBrandForm`, `brandToForm`, `brandFormToInput` |
| A constant list / enum | `packages/types` as `const X = [...] as const` | `ATTRIBUTE_TYPES`, `MEDIA_FOLDERS` |
| Backend request validation | `apps/api/src/modules/<module>/<entity>/dto/<entity>.dto.ts` (class-validator) | `CreateBrandDto implements BrandInput` |
| Business rules | `<entity>.service.ts` in the API | `BrandsService` |
| HTTP routes | `admin-<entity>.controller.ts` (admin) / module controller (public) | `AdminBrandsController` |
| A fetch call from any Next app | `packages/api-client/src/endpoints/<entity>.ts` | `brandsApi` |
| A cache key | `packages/api-client/src/query-keys.ts` | `queryKeys.brands.adminList` |
| A reusable UI component | `packages/ui/src/components/` + export in `index.ts` | `DataTable`, `ImageUploadField` |
| A screen | `apps/<app>/src/app/(dashboard)/<route>/page.tsx` (thin) + `apps/<app>/src/features/<entity>/*` (logic) | `features/brands/brand-list.tsx` |
| Sample data | `packages/database/prisma/seed.ts` (idempotent `upsert`) | `seedBrands()` |

Apps import the client via `@/lib/api-client` (re-exports `@ecommerce/api-client`).

---

## 3. The per-entity recipe (follow in this order)

For entity **X** (e.g. `Brand`), module **M** (e.g. `catalog`):

### Step 1 — Shared types (`packages/types`)
1. `src/<domain>/x.ts`: `XDto` (dates as ISO **strings**), `XListItem` (adds counts), `XInput` (request body).
2. `src/schemas/x.schema.ts`: `xFormSchema` (zod), `XFormValues`, `emptyXForm`, `xToForm(dto)`, `xFormToInput(values)`.
   - Form values use `''` for "empty"; `xFormToInput` converts `''` → `null` (use `emptyToNull`).
   - Reuse `optionalSlugField`, `optionalUrlField` from `schemas/common.ts`.
3. Export both from `src/index.ts`.

### Step 2 — API (`apps/api/src/modules/M/x/`)
1. `dto/x.dto.ts`: `CreateXDto implements XInput` with class-validator + `@ApiProperty`;
   `UpdateXDto extends PartialType(CreateXDto)` (from `@nestjs/swagger`). Mirror the zod rules.
2. `x.service.ts`:
   - Inject `PrismaService` and `AuditService` (global).
   - Methods: `list()`, `get(id)`, `create(dto, actorId)`, `update(id, dto, actorId)`, `remove(id, actorId)`.
   - **Every public method has an explicit return type using `@ecommerce/types`** (never return raw Prisma objects — map with `toXDto()`).
   - Slugs/codes: `uniqueSlug()` from `common/utils/unique-slug.ts`.
   - Write `this.audit.log({ actorId, action: 'M.x.create', entityType: 'X', entityId, before, after })` on every mutation.
   - Block destructive actions that would break data with `ConflictException` and a human message
     (e.g. "has 4 products — hide it instead").
   - Multi-row changes: `this.prisma.$transaction(async (tx) => …)`.
3. `admin-x.controller.ts`: `@Controller('admin/M/xs')`, `@Roles(Role.ADMIN)`, `@ApiTags('Admin · Xs')`,
   `@CurrentUser('sub') actorId`. Delete returns 204 (`@HttpCode(HttpStatus.NO_CONTENT)`).
4. Public read endpoint (if storefront needs it): add to the module's public controller with `@Public()`.
5. Register controller + service in `M.module.ts`.
6. `x.service.spec.ts`: plain unit tests with a mocked Prisma object (see `brands.service.spec.ts`).
   Mock `findFirst` to return `null` when slug lookups happen.

### Step 3 — API client (`packages/api-client`)
1. `src/endpoints/xs.ts`: `xsApi = { adminList, get, create, update, remove, (public list) }`.
2. Add `queryKeys.xs = { all, adminList, detail(id), … }` in `query-keys.ts`.
3. Export from `src/index.ts`.

### Step 4 — UI components (`packages/ui`) — only if a NEW reusable piece is needed.

### Step 5 — Screens (`apps/admin/src/features/xs/`)
- `x-list.tsx` — `useQuery` + `DataTable` + search + `ConfirmDialog` delete (copy `brand-list.tsx`).
- `x-form.tsx` — `useForm` + `zodResolver(xFormSchema)` + `useMutation`; images via `<Controller>` + `ImageUploadField` + `mediaApi.uploadUrl(file, '<folder>')`.
- `x-editor.tsx` — loads data for create/edit, renders the form (`key={id}`).
- Pages (thin): `app/(dashboard)/<route>/page.tsx`, `/new/page.tsx`, `/[id]/page.tsx`
  (Next 15: `params` is a **Promise** → `const { id } = await params`).
- Nav links already exist in `apps/admin/src/config/navigation.ts`.

### Step 6 — Seed + docs
- Add `seedXs()` (idempotent `upsert` by unique key) and call it in `main()`.
- Update `docs/roadmap.md` (mark Done, set Next).

---

## 4. Reference implementations (copy the closest one)

| Pattern | Copy from |
|---|---|
| Simple CRUD (name, slug, image, active) | **Brand** — `modules/catalog/brands/*`, `features/brands/*` |
| Tree / parent-child, cycle prevention | **Category** — `modules/catalog/categories/*` |
| Parent with editable child list (nested array, `useFieldArray`, transactional sync) | **Attribute** — `modules/catalog/attributes/*`, `features/attributes/attribute-form.tsx` |
| File upload | **Media** — `modules/media/*`, `ImageUploadField` |
| Auth / cookies | `modules/auth/*`, `apps/admin/src/app/login/*` |
| Sending email | `NotificationsService.sendEmail({ template: EmailTemplateKey.X, to, data })` — never send directly |

---

## 5. Conventions & gotchas (all learned the hard way — do not repeat)

**API**
- Every route needs a JWT unless `@Public()`. Roles via `@Roles(...)`; `SUPER_ADMIN` passes all checks.
- Responses are wrapped as `{ success, data }` by a global interceptor; the api-client unwraps it.
- Login sets HttpOnly cookies `access_token` / `refresh_token`; frontends call with `credentials: 'include'`.
- **Explicit return types** on services/controllers. Inferred Prisma types caused `TS2742` errors.
- Money = Prisma `Decimal`, never JS float math.
- `apps/api` & `apps/worker` tsconfig: `incremental: false` and `declaration: false` — **keep them**.
  (Incremental + Nest's `deleteOutDir` produced a `dist` missing files → "Cannot find module './config/env'".)
- Uploads: file type is detected from bytes (`detect-image.ts`), never trust the filename/MIME.
- Query DTOs extend `PaginationQueryDto`, which has a `skip` getter. `{ ...dto }` loses getters, so internal helpers
  must accept a plain type (e.g. `Pick<Dto, 'page' | 'limit' | …>`), not the DTO class.

**Frontend**
- Server page files stay thin; client logic lives in `features/*` with `'use client'`.
- `useSearchParams()` must be inside `<Suspense>`.
- In `useFieldArray`, do not name a field `id` (RHF reserves it) — use `valueId` etc.
- Number inputs: `register('x', { valueAsNumber: true })` + `z.number()`.
- New workspace package used by Next → add it to `transpilePackages` in each `next.config.ts`.

**Environment (Windows + Git Bash)**
- Use `cp .env.example .env` (not `copy`).
- `.npmrc` has `public-hoist-pattern[]=*prisma*` — needed so apps resolve Prisma types. Keep it.
- `docker/postgres/init.sql` must NOT create extensions — Prisma migrations do (otherwise "Drift detected").
- After adding dependencies run `pnpm install` (answer **Y** if it asks to reinstall `node_modules`).
- pnpm build-script allowlist lives in `pnpm-workspace.yaml` (`onlyBuiltDependencies`), not `package.json`.

---

## 6. Commands

```bash
pnpm infra:up                 # Postgres, Redis, Mailpit, MinIO
pnpm dev                      # all apps (or dev:admin / dev:api / dev:web / dev:vendor)
pnpm db:migrate --name <x>    # after schema changes
pnpm db:seed                  # idempotent sample data
pnpm db:studio                # browse DB
pnpm typecheck && pnpm test && pnpm lint
pnpm --filter @ecommerce/api test        # API unit tests only
```
URLs and logins: `CREDENTIALS.md`. Admin: `admin@example.com` / `Admin@12345`.

---

## 7. Definition of done (per entity)

- [ ] Types + zod schema in `packages/types`, exported
- [ ] API DTOs mirror the zod rules; service has typed returns, audit logs, conflict rules
- [ ] Controller registered; visible in Swagger
- [ ] Unit tests for the business rules pass
- [ ] `xsApi` + `queryKeys.xs` in `packages/api-client`
- [ ] Admin list / create / edit / delete work in the browser
- [ ] Seed data added; `pnpm db:seed` runs twice without errors
- [ ] `pnpm typecheck` passes
- [ ] `docs/roadmap.md` updated

---

## 8. How the previous agent worked (optional workflow)

The first agent could not run `pnpm` against this machine directly, so it worked like this — you may
use the same discipline even when editing files directly:

1. **Plan the entity** from `docs/roadmap.md` + `schema.prisma` (list exact fields, rules, endpoints).
2. **Write all files for one step from a generator script** (a Python script that writes new files and
   patches existing ones by *exact string replacement*, failing loudly if the target text is not found).
   This makes edits reproducible and prevents silently editing the wrong place.
3. **Format + syntax-check** every touched file (`prettier --write`, TypeScript syntactic diagnostics).
4. **Deliver only the changed files**, then verify on the machine that earlier fixes were not overwritten.
5. **User runs** `pnpm install` (if deps changed) → `pnpm db:seed` → `pnpm dev`, and reports errors.
6. Fix errors at the root cause (never by disabling type checks), then update `docs/roadmap.md`.

If you can run commands yourself, replace steps 3–5 with: `pnpm typecheck`, `pnpm test`, open the screen.

---

## 9. Prompt template for the next agent

> Read `AGENTS.md` and `docs/roadmap.md`. Build the next entity marked **Next** following §3 exactly,
> copying the closest reference from §4. Do not modify unrelated files. When done, list the files you
> changed, the commands I must run, and update the roadmap.
