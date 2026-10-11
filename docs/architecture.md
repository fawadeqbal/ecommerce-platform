# Architecture

## Request flow

```
Browser ──► Next.js app (web / admin / vendor)
              │  storefront server components fetch with ISR / no-store; client components use TanStack Query
              │  all client calls go through packages/api-client (credentials: 'include')
              ▼
           NestJS API  (/api/v1)
              │  Guards: Throttler → JwtAuth (@Public skips the check but still attaches a valid user) → Roles (@Roles)
              │  ValidationPipe (class-validator) → Controller → Service → PrismaService
              │  Response interceptor wraps everything as { success, data }
              ▼
           PostgreSQL                       Redis
                                              ▲   BullMQ queues
                    NotificationsService ─────┘   (email, marketing, reports, imports, media, maintenance)
                                              │
                                              ▼
                                         Worker (apps/worker)
                                           EmailProcessor → renderEmail() → MailProvider (SMTP/SES/…)
                                           MaintenanceProcessor → cron jobs
           MinIO (S3) ◄── MediaService (uploads, public-read bucket)
```

## Package dependency graph

```
types ◄─────────── database (no dep on types)
  ▲                    ▲
  ├── email-templates  │
  │        ▲           │
  ├── api ─┼───────────┤
  ├── worker ──────────┘ (database, email-templates)
  ├── api-client
  │        ▲
  └── web / admin / vendor (types, api-client, ui)
ui (no deps on types: pure React + Tailwind)
config ◄── everything (devDependency)
```

`types`, `database` and `email-templates` compile to `dist/` (CommonJS) so NestJS can consume them.
`ui` and `api-client` are consumed as TypeScript source and transpiled by Next.js (`transpilePackages`).
Turborepo builds packages before apps (`dependsOn: ["^build"]`).

## Auth & sessions

- Login sets HttpOnly cookies `access_token` (15 min) and `refresh_token` (30 days). The api-client sends cookies;
  Swagger can use `Authorization: Bearer`.
- Roles (`Role` in `packages/types/src/enums.ts`): `SUPER_ADMIN` (passes every `@Roles` check), `ADMIN`,
  `CONTENT_MANAGER`, `MARKETING_MANAGER`, `SUPPORT_AGENT`, `WAREHOUSE_STAFF`, `VENDOR`, `VENDOR_STAFF`, `CUSTOMER`
  (given at registration).
- Admin and seller apps gate their dashboards client-side (redirect to `/login` on 401/403). A seller whose store
  is not `APPROVED` can only open onboarding, store profile and payout settings.
- Storefront account pages (`/account/*`) show a sign-in card to guests (`AccountShell`).
- Guest cart: `cart_session` cookie. At sign-in the guest cart is merged into the user's cart.

## Business flows

### Vendor

```
apply (register) ──► PENDING ──approve──► APPROVED ──suspend──► SUSPENDED ──approve──► APPROVED
                        └──reject──► REJECTED (reason)
```

Each decision writes `statusReason`, an audit log and an email. Products of non-approved vendors are hidden
from the storefront.

### Product

```
DRAFT ──submit──► PENDING_REVIEW ──approve──► PUBLISHED ──reject (unpublish)──► REJECTED
  ▲                    └──reject──► REJECTED (rejectionReason) ──edit + submit──┘
  └── archive / restore ── ARCHIVED
```

Every product has ≥ 1 variant (a default one when it has no options). Variants are the sellable unit: SKU, price,
compare-at price, stock. `marketplace.productApprovalRequired` controls whether submit goes to review.

### Stock

Per variant per warehouse: `StockLevel { quantity, reserved }`. **Available = Σ(quantity − reserved)** over active
warehouses (`availableByVariant()` in `apps/api/src/common/utils/stock-availability.ts`).

| Event                       | quantity | reserved | Records                                                     |
| --------------------------- | -------- | -------- | ----------------------------------------------------------- |
| Seller adjusts stock        | ±n       | –        | `StockMovement` (ADJUSTMENT / RESTOCK / …)                  |
| Order placed                | –        | +n       | `StockReservation` (re-checked atomically, never oversells) |
| Sub-order shipped           | −n       | −n       | `StockMovement` type `SALE`, reservation committed          |
| Sub-order / order cancelled | –        | −n       | reservation released                                        |

Low-stock and back-in-stock emails fire from stock changes. Reservation expiry (for unpaid online payments)
arrives with the payments step.

### Order (multi-vendor)

One `Order` → one `VendorOrder` per seller → `OrderItem`s. Each vendor order has its own status, shipment and
(later) payout item. The parent `Order.status` is **derived** from its vendor orders (`deriveOrderStatus()` in
`orders/order-rules.ts`).

```
place (COD) ──► COD_CONFIRMED ──► PROCESSING ──► PACKED ──► SHIPPED ──► OUT_FOR_DELIVERY ──► DELIVERED
 (online, next step: PENDING_PAYMENT ──► PAID ──► PROCESSING …)
                   └──────────── CANCELLED (customer, seller or admin, only before shipping) ─────┘
```

- Allowed seller moves: `VENDOR_ORDER_TRANSITIONS` in `packages/types/src/orders/order.ts` (the API and the UI use
  the same table). Cancellable statuses: `CANCELLABLE_STATUSES`.
- **SHIPPED** requires a tracking number, creates a `Shipment`, commits stock.
  **DELIVERED** increments `soldCount`; when every sub-order is delivered, a COD payment is marked `PAID`.
- Every change appends `OrderStatusHistory` and emails the customer (shipped / out for delivery / delivered / cancelled).
- Placing an order emails the customer (`ORDER_CONFIRMATION`) and each seller (`VENDOR_NEW_ORDER`).
- Order numbers: `ORD-YYMMDD-XXXXX` (retry on collision).

### Checkout totals

Computed by the API only (`POST /checkout/quote`); the UI never calculates totals.

- Shipping: `shipping.flatRatePerVendor` per seller, free when that seller's subtotal ≥ `shipping.freeShippingAbove`.
- Cash on delivery: allowed while the total ≤ `checkout.codMaxOrderTotal`; fee `checkout.codFee`.
- Guest checkout: `checkout.guestCheckout`. Commission per seller: the vendor's rate, else
  `marketplace.defaultCommissionRate`.
- Settings are rows in the `Setting` table, read with `readSetting(prisma, key, fallback)`.

## Conventions

- **Email only through `NotificationsService.sendEmail()`.** It checks the suppression list and marketing
  preferences, writes an `EmailLog`, and enqueues the job. The worker renders the React Email template and updates the log.
  Services wrap email sending so a mail failure never fails the business action.
- **Adding an email:** add a key to `EmailTemplateKey` (packages/types), add a template + registry entry
  (packages/email-templates). TypeScript fails the build if a key has no template.
- **Money:** `Decimal(12,2)` in Postgres; API math uses integer cents (`toCents` / `fromCents` in
  `common/utils/money.ts`); DTOs carry plain numbers.
- **Idempotency:** `Order.idempotencyKey` (one random key per checkout visit) and `WebhookEvent (provider, eventId)` are unique.
- **Transactions:** any multi-row change (order placement, status changes with stock, variant sync) runs in
  `prisma.$transaction`.
- **Audit:** admin and vendor mutations call `AuditService.log()` to write `AuditLog`.
- **Snapshots:** orders store the shipping address and item names, SKUs, prices and images at purchase time.

## Ports

| App           | Port                       |
| ------------- | -------------------------- |
| web           | 3000                       |
| admin         | 3001                       |
| vendor        | 3002                       |
| email preview | 3003                       |
| api           | 4000                       |
| postgres      | 5432                       |
| prisma studio | 5555                       |
| redis         | 6379                       |
| mailpit       | 1025 (SMTP) / 8025 (UI)    |
| minio         | 9000 (S3) / 9001 (console) |
