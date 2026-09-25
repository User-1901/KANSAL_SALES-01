# Kansal Sales Migration Plan

## Current architecture

- The root workspace uses npm workspaces for a Vite + React 18 frontend and an Express + TypeScript backend.
- The backend currently uses PostgreSQL through `DATABASE_URL` in production and PGlite locally, with SQL migrations under `backend/migrations`.
- A second Supabase client/migration implementation exists under `supabase/` and `backend/src/lib/`, but the active Express routes still use the database pool for authentication, catalog, cart, checkout, and admin operations.
- Authentication is JWT-based with an httpOnly cookie. Admin authorization is enforced server-side by `authenticate` followed by `requireAdmin`.
- Products have `quantity_available` and a derived `stock_status`; the current cart is account-backed and checkout currently creates a Razorpay order before payment verification.
- The admin UI is isolated under `/admin/*` with product, inventory, category, ratings, user, and order-related pages.

## Existing functionality to reuse

- Product browsing, product details, cart UI/API, order and admin pages, JWT authentication, bcrypt password hashing, inventory reporting, upload handling, email services, and existing order/item schema.
- The existing Chandigarh pincode list in `backend/src/services/delivery.ts`, after removing entries that are outside Chandigarh and centralizing its export.
- Existing server-side price lookup and order item snapshots, extended with an atomic stock reservation transaction.

## Features requiring modification

- Replace Razorpay checkout with COD-only order creation and make checkout available to guests using customer contact/address fields.
- Validate pincode and order quantities on both client and server; compute prices only from database product records.
- Add a database-side atomic stock decrement/reservation path and make order creation transactional.
- Add WhatsApp order notification through a dedicated backend service with environment-configured destination/API settings.
- Update branding, metadata, customer/admin copy, API health text, and documentation to Kansal Sales.
- Harden admin bootstrap credentials so production requires explicit environment values and no source file contains plaintext credentials.

## Features to remove

- Razorpay SDK, checkout scripts, payment verification routes, payment service code, Razorpay environment variables, and payment-only UI/schema usage.
- Payment table usage and Supabase payment policies/migration content after a compatibility migration removes the obsolete table where applicable.
- Login as a prerequisite for customer checkout, while retaining login for account features and admin access.

## Supabase migration requirements

- Keep public product/category reads and admin-only product mutations protected by RLS.
- Add COD payment method/status fields or constraints to orders, guest checkout customer fields where needed, and an RPC/function or equivalent atomic stock reservation operation.
- Ensure order creation and item insertion are protected from client-supplied prices and quantities; privileged server operations must use the service-role client only on the server.
- Remove or deprecate Razorpay payment storage and policies without dropping data blindly; deployment should apply a reviewed migration in the target Supabase project.

## Risks and potential breaking changes

- Existing pending/paid Razorpay orders may need a data migration or archival decision before removing payment columns/table usage.
- Guest checkout changes cart ownership and order lookup behavior; the existing account cart remains reusable but guest cart persistence may require browser storage or a server-side guest token.
- Existing local PGlite data and tracked migrations may not match a fresh Supabase database; migrations must be applied and verified in a staging project.
- Removing the Razorpay dependency changes the lockfile and any code importing payment types/services.
- WhatsApp delivery depends on the selected provider/API credentials and should not make successful order persistence fail.

## Implementation order

1. Brand and metadata cleanup.
2. COD checkout and guest-friendly cart flow.
3. Centralized Chandigarh validation.
4. Transactional stock reservation and server-side order validation.
5. WhatsApp notification service.
6. Admin credential hardening and route/security review.
7. Payment dependency/schema cleanup, tests, README, environment examples, and build verification.
