# Market Commerce Suite — Deployment Runbook

This runbook describes the deployment boundary for the current Market architecture. The product is three deployables—storefront, admin, and API—but remains one commercial system.

## Recommended topology

For a small or medium installation:

- storefront: static/Nginx container or static host
- admin: static/Nginx container or static host
- API: one or more NestJS containers
- database: managed PostgreSQL preferred
- TLS: terminated by the hosting platform or a reverse proxy
- secrets: provider secret store or an untracked environment file

The API remains the only business-rule and persistence boundary.

## Runtime frontend configuration

Both Angular applications load:

```text
/assets/runtime-config.js
```

before Angular starts. This means the same compiled frontend artifact can point to a different API without rebuilding.

Container deployments use:

```text
API_BASE_URL=/api/v1
```

and generate the runtime file at container startup.

Static-host builds can set:

```text
MARKET_API_BASE_URL=https://api.example.com/api/v1
```

before running the Angular build. When the variable is absent, the repository keeps the historical demo endpoint so the existing public demo is not silently broken before the owned API is deployed.

## Self-hosted Docker deployment

Copy the example environment file outside source control:

```bash
cp deploy/production.env.example .env
```

Replace every placeholder. Use a long random JWT secret and a unique database password.

Build the deployment:

```bash
docker compose --env-file .env -f compose.production.yml build
```

Apply database migrations before starting the API:

```bash
docker compose --env-file .env -f compose.production.yml run --rm migrate
```

Start the system:

```bash
docker compose --env-file .env -f compose.production.yml up -d
```

Default host ports are:

- storefront: `8080`
- admin: `8081`

The frontend containers proxy `/api/v1` to the API container so browser traffic can stay same-origin.

## First owner account

No default admin password is committed.

After migrations, bootstrap the first owner only when needed:

```bash
docker compose --env-file .env -f compose.production.yml run --rm \
  -e OWNER_EMAIL="$OWNER_EMAIL" \
  -e OWNER_PASSWORD="$OWNER_PASSWORD" \
  migrate npm run prisma:seed
```

After successful bootstrap, remove the owner password from long-lived deployment environment configuration if your platform does not need it again.

## Managed PostgreSQL

Managed PostgreSQL is preferred for commercial deployments because backups, storage durability, upgrades, and point-in-time recovery are operational concerns outside the application process.

Set `DATABASE_URL` to the provider connection URL and apply the same committed Prisma migrations before each application rollout.

Do not run `prisma migrate dev` in production.

## Migration rule

Production rollout order:

1. back up the database
2. deploy or run the migration task
3. verify migration success
4. roll out API instances
5. roll out storefront/admin configuration
6. run smoke tests

A failed migration blocks the API rollout.

## Health checks

API:

```text
GET /api/v1/health
```

Frontend containers:

```text
GET /healthz
```

The provided Docker images include health checks.

## Backup baseline

For the bundled PostgreSQL service, a logical backup can be created with:

```bash
mkdir -p backups

docker compose --env-file .env -f compose.production.yml exec -T postgres \
  sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' \
  > "backups/market-$(date +%Y%m%d-%H%M%S).dump"
```

Backups are not useful until restore has been tested. Keep backups outside the application host and define retention appropriate to the merchant.

For managed databases, enable provider-managed automated backups and point-in-time recovery where available.

## TLS and cookies

Production traffic must use HTTPS.

Admin refresh sessions use HttpOnly cookies. Keep `REFRESH_COOKIE_SAME_SITE=lax` when admin and API are same-site. If your deployment requires cross-site cookies, use `none` only with HTTPS and verify the exact CORS origins.

`PUBLIC_STOREFRONT_ORIGIN` and `PUBLIC_ADMIN_ORIGIN` must be exact browser origins. Do not use wildcard CORS for authenticated admin traffic.

## Rollback

Application rollback and database rollback are separate concerns.

- frontend/API container images can be rolled back to the previous known-good tag
- schema rollback should not assume a reversible migration
- prefer backward-compatible schema changes before destructive cleanup
- restore a database backup only as a deliberate recovery action

## Payment cutover

Keep `PAYMENT_PROVIDER=manual` until the external provider account is ready. For Stripe launch:

1. create the production Stripe account configuration and obtain the secret key
2. expose the API over HTTPS
3. register `POST /api/v1/payments/webhooks/stripe` as the webhook destination
4. store the resulting webhook signing secret in the deployment secret store
5. set exact HTTPS success/cancel URLs
6. change `PAYMENT_PROVIDER=stripe`
7. deploy, create a low-value test order, complete Checkout, and verify the persisted payment becomes `SUCCEEDED` and the order becomes `CONFIRMED`
8. replay the same webhook and verify the order/payment are not advanced twice

Never commit live gateway keys or webhook secrets.

## Launch smoke test

After every production cutover verify, in order: API health, storefront health, admin health, owner login, public catalog, server-priced order creation, external checkout redirect (when enabled), verified payment confirmation, admin order visibility, one authorized order transition, and inventory consistency.

## Production cutover checklist

Before replacing the historical public demos:

- owned API is deployed over HTTPS
- PostgreSQL backups are enabled and restore-tested
- migrations pass against the production database
- exact CORS origins are configured
- owner login succeeds
- storefront published catalog loads from owned API
- cart submits a server-priced order
- stock decrements once
- admin can see the order
- authorized status transition succeeds
- cancellation restocks exactly once
- archived/draft products are not public
- runtime frontend API URL points to the owned API
- monitoring and error reporting are enabled
- payment provider is intentionally selected (`manual` or `stripe`)
- when Stripe is enabled, webhook signature verification and one successful checkout have been verified in the deployed environment
- backup restore has been exercised against a non-production database

## Current boundary

The codebase includes a Stripe Checkout integration boundary and verified webhook lifecycle, but repository code cannot create provider accounts, issue production secrets, provision DNS/TLS, or prove a backup restore on infrastructure that has not been supplied. Those are explicit launch-operator gates, not hidden application TODOs.
