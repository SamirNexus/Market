# Market Commerce API

Server-side commerce core for the Market Commerce product.

## Stack

- NestJS
- PostgreSQL
- Prisma
- class-validator / class-transformer
- JWT access tokens with server-side session validation

## Implemented domains

- health
- authentication sessions
- staff users and RBAC
- products
- inventory + movement ledger
- orders + order items
- audit log

## Security model

- short-lived access tokens
- rotating refresh tokens
- refresh-token secrets stored only as SHA-256 hashes
- refresh token delivered through an HttpOnly cookie
- session revocation checked on authenticated requests
- inactive users are rejected even when an access token has not yet expired
- STAFF / ADMIN / OWNER authorization gates
- public product reads and guest order creation separated from staff-only operations
- server-side price, stock, and order-transition validation

The current API deliberately does not implement payment-card handling. A payment provider adapter belongs in a later product phase.

## Run locally

Copy the environment template:

```bash
cp .env.example .env
```

From the repository root, start PostgreSQL:

```bash
docker compose up -d postgres
```

Then:

```bash
npm --prefix apps/api ci
npm --prefix apps/api run prisma:generate
npm --prefix apps/api run prisma:migrate:deploy
npm --prefix apps/api run prisma:seed
npm --prefix apps/api run start:dev
```

Health:

```text
GET /api/v1/health
```

## Owner bootstrap

Set both `OWNER_EMAIL` and `OWNER_PASSWORD` before running the seed script to create or restore the initial owner account. The password must be at least 12 characters. No default production password is committed to the repository.

## Main route groups

```text
/api/v1/auth
/api/v1/products
/api/v1/inventory
/api/v1/orders
/api/v1/users
```

## Deployment requirements

Before production deployment:

- use a long unique `JWT_ACCESS_SECRET`
- configure exact allowed CORS origins
- choose the correct refresh-cookie SameSite policy for the deployed domains
- use managed secrets rather than committed environment files
- use a managed PostgreSQL instance with backups
- enable TLS
- complete rate limiting, monitoring, and end-to-end security review
