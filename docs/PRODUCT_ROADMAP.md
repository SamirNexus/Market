# Market Commerce Suite — Product Roadmap

The goal is one reusable, configurable commerce product for small and medium merchants. Work is ordered by commercial risk rather than visual novelty.

## Phase 1 — Monorepo and quality baseline

- [x] Merge storefront and admin under one repository
- [x] Preserve independent builds and deployments
- [x] Add suite CI
- [x] Correct admin API semantics and error handling
- [x] Add meaningful admin tests
- [x] Add shared typed contracts
- [x] Move API endpoints to environment configuration

**Exit criterion:** completed. Both front-end applications build reliably and core admin workflows have automated coverage.

## Phase 2 — Owned backend foundation

- [x] Create NestJS API application
- [x] Add PostgreSQL/Prisma foundation
- [x] Add product, user, order, order-item, and audit schema
- [x] Add health endpoint
- [x] Add initial product CRUD
- [x] Add validation and environment configuration
- [x] Add local PostgreSQL service with Docker Compose
- [x] Commit deterministic API dependency lockfile
- [x] Add API build/test/migration CI
- [x] Add initial database migration
- [x] Add seed data
- [ ] Connect admin catalog CRUD to owned API
- [ ] Connect storefront catalog reads to owned API
- [ ] Add inventory rules

**Exit criterion:** no core catalog write depends on a public demo API.

## Phase 3 — Identity and operations

- Staff authentication
- Customer authentication
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

**Exit criterion:** Market can be demonstrated, deployed, maintained, and sold without misrepresenting prototype functionality.
