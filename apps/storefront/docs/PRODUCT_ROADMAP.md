# Market Commerce Suite — Product Roadmap

The goal is a reusable, configurable commerce product for small and medium merchants. Work is ordered by commercial risk rather than visual novelty.

## Phase 1 — Monorepo and quality baseline

- Merge storefront and admin under one repository
- Preserve independent builds and deployments
- Keep the storefront deployment working
- Add suite CI
- Correct admin API semantics and error handling
- Add meaningful admin tests
- Align naming, TypeScript types, and module ownership

**Exit criterion:** both apps build reliably and core admin workflows have automated coverage.

## Phase 2 — Real backend foundation

- Server-side commerce API
- Persistent database
- Product/category CRUD
- Inventory model
- Cart/order model
- Customer model
- Environment-safe configuration
- API validation and structured errors

**Exit criterion:** no core commerce write depends on a public demo API.

## Phase 3 — Identity and operations

- Customer authentication
- Staff authentication
- Role-based permissions
- Protected admin routes
- Audit log for admin mutations
- Order status workflow
- Product publishing states

**Exit criterion:** admin actions are attributable and authorization is enforced server-side.

## Phase 4 — Sellable merchant configuration

- Store branding
- Currency and locale
- Tax configuration
- Shipping methods
- Payment-provider adapter
- Email/notification adapter
- Merchant settings
- Demo tenant and seed data

**Exit criterion:** a new merchant can be configured without editing application source code.

## Phase 5 — Commercial readiness

- End-to-end checkout and admin-order tests
- Accessibility review
- Security review
- Backup and recovery plan
- Monitoring and error reporting
- Deployment documentation
- License and commercial packaging
- Buyer-facing onboarding, screenshots, and demo data

**Exit criterion:** the product can be demonstrated, deployed, maintained, and sold without misrepresenting prototype functionality.
