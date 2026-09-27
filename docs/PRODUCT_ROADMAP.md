# Market Commerce Suite — Product Roadmap

The goal is one reusable, configurable commerce product for small and medium merchants. Work is ordered by commercial and operational risk.

## Phase 1 — Monorepo and quality baseline

- [x] Merge storefront and admin under one repository
- [x] Preserve independent builds and deployments
- [x] Add suite CI
- [x] Correct admin API semantics and error handling
- [x] Add meaningful admin tests
- [x] Add shared typed contracts
- [x] Move API endpoints to environment configuration

**Exit criterion:** completed.

## Phase 2 — Owned backend foundation

- [x] Create NestJS API application
- [x] Add PostgreSQL/Prisma foundation
- [x] Add product, user, order, order-item, and audit schema
- [x] Add health endpoint
- [x] Add durable product CRUD
- [x] Add validation and environment configuration
- [x] Add local PostgreSQL with Docker Compose
- [x] Commit deterministic API dependency lockfile
- [x] Add API build/test/migration CI
- [x] Add database migrations and seed data
- [x] Connect admin development catalog flow to owned API
- [x] Add atomic inventory rules and movement history
- [ ] Switch deployed admin from legacy demo API to owned API
- [x] Connect storefront development catalog/order flows to owned API

**Exit criterion:** catalog writes and inventory rules are owned by Market; final deployed cutover remains.

## Phase 3 — Identity and operations

- [x] Staff authentication
- [x] Rotating/revocable refresh sessions
- [x] Role-based permissions
- [x] Protected admin routes
- [x] Staff account lifecycle management
- [x] Audit log for sensitive admin mutations
- [x] Order status workflow
- [x] Paginated/filterable order operations
- [ ] Customer authentication
- [ ] Product publishing workflow beyond basic status fields

**Exit criterion:** staff actions are attributable and authorization is enforced server-side. Customer identity remains separate work.

## Phase 4 — Sellable merchant configuration

- [x] Store branding foundation (name, logo URL, primary color)
- [x] Currency and locale configuration
- [ ] Tax configuration
- [ ] Shipping methods
- [ ] Payment-provider adapter
- [ ] Email/notification adapter
- [x] Merchant settings with ADMIN/OWNER authorization and audit logging
- [ ] Media storage adapter
- [ ] Demo tenant and seed data

**Exit criterion:** a new merchant can be configured without editing application source code.

## Phase 5 — Commercial readiness

- [x] Containerized deployment foundation and runtime frontend configuration
- [x] Deployment runbook, migration gating, and backup baseline
- [ ] Production API/database deployment
- [ ] Storefront/admin public deployment cutover
- [ ] End-to-end checkout and admin-order tests
- [ ] Accessibility review
- [ ] Security review and rate limiting
- [ ] Monitoring and structured error reporting
- [ ] Backup and recovery plan
- [x] Deployment/runbook documentation
- [ ] License and commercial packaging
- [ ] Buyer-facing onboarding, screenshots, and demo data

**Exit criterion:** Market can be demonstrated, deployed, maintained, and sold without representing unfinished capabilities as complete.
