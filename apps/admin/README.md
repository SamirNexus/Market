# Market Admin

Angular operations dashboard for the Market Commerce Suite.

## Current implemented capabilities

- Product catalog listing
- Product creation form
- Category loading
- Cart/order listing
- Date-based cart filtering
- Cart detail inspection
- Cart deletion against the external demo API

## Current limitations

The admin application still uses Fake Store API. Writes on that service are simulated rather than durable, and this application does **not** currently implement production authentication, role-based access control, inventory, user administration, or durable order workflows.

Those capabilities are tracked in the repository productization roadmap.

From the repository root:

```bash
npm run install:admin
npm run start:admin
npm run build:admin
```
