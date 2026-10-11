# Build roadmap

We build one entity at a time through every layer:

1. `packages/types`: interfaces + zod form schemas + helpers
2. `apps/api`: DTOs (class-validator), service with business rules, controller, unit tests
3. `packages/api-client`: typed endpoint functions + query keys
4. `packages/ui`: any new reusable component the screens need
5. App screens (admin / vendor / web)
6. Seed data so the screen has something to show

## Phase 1: Catalog foundation

| #   | Entity                                              | API                                                                                                  | Admin                                  | Vendor                                         | Storefront                 | Status   |
| --- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------- | -------------------------- | -------- |
| 0   | Admin sign-in (cookies)                             | ✅                                                                                                   | ✅                                     | –                                              | –                          | Done     |
| 1   | **Category**                                        | ✅ CRUD + tree                                                                                       | ✅ list, create, edit, delete          | –                                              | menu (with products)       | **Done** |
| 2   | **Brand**                                           | ✅ CRUD + public list                                                                                | ✅ list, create, edit, delete          | –                                              | filters (with products)    | **Done** |
| 3   | **Attribute & values**                              | ✅ CRUD + value sync + public filters                                                                | ✅ list, create, edit, delete          | –                                              | filters (with products)    | **Done** |
| 4   | **Media upload (S3/MinIO)**                         | ✅ upload, list, delete; byte-level type check                                                       | ✅ category image, brand logo          | (with products)                                | –                          | **Done** |
| 5   | **Vendor (onboarding, approval)**                   | ✅ apply, self profile/payout, approve/reject/suspend + emails                                       | ✅ list, review, decisions, commission | ✅ apply, sign-in, onboarding, profile, payout | store page (with products) | **Done** |
| 6a  | **Product core** (info, gallery, price, SKU, specs) | ✅ seller CRUD + submit/archive/restore; admin list/detail                                           | ✅ list + detail (read-only)           | ✅ list, create, edit, status actions          | (with storefront step)     | **Done** |
| 6b  | **Product variants + moderation**                   | ✅ variant sync, approve/reject/feature + emails, suspended vendors hidden                           | ✅ moderation actions, variants table  | ✅ variant builder                             | (with storefront step)     | **Done** |
| 7   | **Inventory / warehouses**                          | ✅ warehouses, stock adjust + movement log, low-stock & back-in-stock emails, admin low-stock report | ✅ low-stock report                    | ✅ inventory, adjust, history, warehouses      | (with cart)                | **Done** |

## Phase 2: Buying flow

| #   | Entity                                         | API                                                                                                                                     | Admin                   | Vendor                                     | Storefront                                                                        | Status   |
| --- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------ | --------------------------------------------------------------------------------- | -------- |
| 8   | **Cart** (+ first storefront pages)            | ✅ guest/user cart, merge at sign-in, stock & price checks, save for later                                                              | –                       | –                                          | ✅ listing, category, product + variant picker, cart, sign-in/up                  | **Done** |
| 9   | **Checkout + Orders** (vendor sub-orders, COD) | ✅ quote, idempotent place order, stock reservation, vendor status flow (ship commits stock), cancel, guest tracking, addresses, emails | ✅ list, detail, cancel | ✅ list, detail, status actions + tracking | ✅ checkout, success, my orders, order detail + cancel, track order, address book | **Done** |
| 10  | Payments (gateway)                             |                                                                                                                                         |                         |                                            |                                                                                   | Next     |
| 11  | Shipping                                       |                                                                                                                                         |                         |                                            |                                                                                   |          |

## Phase 3: After-sale & growth

Returns → Reviews & Q&A → Wishlist → Coupons/Promotions → Loyalty → Payouts → CMS → Reports
