# Market Contracts

Shared TypeScript contracts used by the storefront and admin applications.

This package intentionally contains data contracts only. It has no browser framework dependencies and should not contain UI state or app-specific behavior.

Current contracts:

- Product and product-input DTOs
- Cart/order-list DTOs used by the admin application

The contracts are consumed directly through the `@market/contracts/*` TypeScript path alias while the repository is consolidated. A versioned package boundary can be introduced later if the backend becomes independently released.
