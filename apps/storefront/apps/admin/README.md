# Market Admin

Market Admin is the internal operations application for the Market Commerce Suite.

It currently provides a working Angular dashboard for:

- catalog listing
- create/update/delete product interactions against the Fake Store API
- cart listing and date filtering
- cart detail inspection
- demo cart deletion
- loading, error, and feedback states

## Important product boundary

This dashboard is part of an active migration from demo infrastructure to a commercial product foundation.

The current Fake Store API simulates writes and does not persist production merchant data. Real staff authentication, role-based authorization, inventory, persistent orders, customer management, audit logs, and payment operations are planned at the suite level and are **not claimed as implemented here**.

## Run locally

From the repository root:

```bash
npm run install:all
npm run start:admin
```

Or from this directory:

```bash
npm ci
npm start
```

## Quality

```bash
npm run build
npm run test:ci
```

See the root [architecture](../../docs/ARCHITECTURE.md) and [product roadmap](../../docs/PRODUCT_ROADMAP.md) for the production target.
