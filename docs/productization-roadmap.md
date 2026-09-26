# Productization Roadmap

The goal is to evolve the consolidated Market repository from a front-end demo into a commerce starter that can be deployed for real businesses.

## Phase 1 — Consolidate and stabilize

- [x] Place storefront and admin applications in one repository
- [x] Preserve independent builds
- [x] Add CI coverage for both applications
- [x] Document current capability boundaries
- [ ] Remove duplicated front-end contracts and utilities where practical
- [ ] Add meaningful admin unit tests
- [ ] Standardize Bootstrap and UI conventions

## Phase 2 — Production backend

Recommended target stack: **NestJS + PostgreSQL + Prisma**.

Required domains:

- Products and categories
- Inventory
- Customers
- Orders and order items
- Admin users
- Roles and permissions
- Audit log

The API must own validation, authorization, pricing, stock checks, and order state transitions.

## Phase 3 — Identity and administration

- Secure admin authentication
- Role-based access control
- Session/token lifecycle
- Protected admin routes
- Product CRUD with durable persistence
- Inventory adjustments
- Order management
- Customer lookup
- Audit trail for sensitive changes

## Phase 4 — Sellable storefront

- Server-backed catalog
- Cart validation against live price and stock
- Customer accounts or guest checkout
- Address management
- Shipping method support
- Payment-provider integration
- Order confirmation and history
- Transactional email hooks

## Phase 5 — Commercial readiness

- Environment-based configuration
- Database migrations and seed data
- Backup/restore documentation
- Error monitoring and structured logging
- Rate limiting and security headers
- Accessibility review
- End-to-end tests for purchase and admin workflows
- Docker-based local environment
- Deployment guide
- Demo seed tenant
- License and customer-facing setup documentation

## Definition of sellable

The product should not be marketed as production-ready until:

1. Product/order writes persist in a controlled database.
2. Admin routes enforce server-side permissions.
3. Price and inventory are validated server-side.
4. Payment data is handled by a compliant provider rather than the application.
5. Critical storefront and admin workflows have automated end-to-end coverage.
6. Backup, deployment, configuration, and upgrade procedures are documented.
