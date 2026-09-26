# Market Commerce Suite Architecture

## Current state

The repository contains two independently buildable Angular 16 applications.

### Storefront

Responsible for customer-facing catalog and cart interactions.

### Admin

Responsible for catalog operations and cart/order inspection.

Both applications currently integrate directly with Fake Store API. This is acceptable for preserving the existing demo behavior during consolidation, but it is intentionally treated as a temporary data layer.

## Production target

The productization target is a three-tier architecture:

```text
Browser
├── Storefront Angular app
└── Admin Angular app
        │
        ▼
Commerce API
├── Authentication and RBAC
├── Catalog
├── Inventory
├── Customers
├── Orders
├── Payments
└── Audit log
        │
        ▼
PostgreSQL
```

## API ownership

The storefront and admin applications should not independently encode business rules that must remain consistent across channels. Inventory availability, price validation, order state transitions, permissions, and payment state belong in the backend.

## Deployment model

The two front-end applications remain independently deployable. This supports separate customer and operator domains while keeping source, CI, contracts, and release documentation in one repository.

## Security baseline for productization

- Server-side authentication and authorization
- Least-privilege RBAC for admin actions
- No API secrets in browser bundles
- Server-side price and inventory validation
- Secure password hashing or managed identity provider
- Rate limiting and request validation
- Audit records for sensitive administrative actions
- Payment tokenization delegated to a payment provider
