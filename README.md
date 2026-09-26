# Market Commerce Suite

Market Commerce Suite combines a customer storefront and an operations dashboard in one repository.

- **Storefront** — customer-facing catalog, product details, cart, and demo checkout.
- **Admin** — internal catalog and cart/order operations.
- **Product direction** — one configurable commerce system with separate customer and staff applications.

> This repository is being upgraded from a portfolio demo into a reusable commerce product foundation. It is **not yet presented as production commerce software**: real authentication, persistent backend data, payment processing, authorization, audit logs, inventory guarantees, and production order workflows remain explicit product work.

## Applications

| Application | Path | Purpose |
| --- | --- | --- |
| Storefront | `apps/storefront` | Customer shopping experience |
| Admin | `apps/admin` | Staff operations dashboard |

### Current live demos

- Storefront: https://market-two-rosy.vercel.app
- Admin legacy deployment: https://market-admin-tau.vercel.app

The admin deployment still comes from the historical `Market_Admin` repository while the monorepo migration is validated.

## Repository structure

```text
Market/
├── apps/
│   ├── storefront/
│   └── admin/
├── docs/
│   ├── ARCHITECTURE.md
│   └── PRODUCT_ROADMAP.md
├── .github/workflows/ci.yml
├── package.json
└── vercel.json
```

## Local development

Requirements: Node.js 18+ and npm.

```bash
npm run install:all
npm run start:storefront
npm run start:admin
```

## Quality commands

```bash
npm run build
npm run test:storefront
```

CI builds both applications and runs the current storefront test suite. Admin tests become a required merge gate after the dashboard hardening phase.

## Historical repositories

The admin application originated in [Market_Admin](https://github.com/SamirNexus/Market_Admin). That repository stays available during migration so deployment and history are preserved.

## Author

**Mohamed Samir** — Front-End Developer  
[GitHub](https://github.com/SamirNexus) · [LinkedIn](https://www.linkedin.com/in/samirnexus98/)
