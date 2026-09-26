# Market Commerce API

Backend foundation for the Market Commerce product.

## Stack

- NestJS
- PostgreSQL
- Prisma
- class-validator / class-transformer

## Current implemented foundation

- Versioned API prefix: `/api/v1`
- Environment-based configuration
- Global request validation
- Restricted CORS configuration
- Prisma database service
- Health endpoint
- Product CRUD service/controller
- Initial product, user, order, order-item, and audit-log schema

## Run locally

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL.
3. Install dependencies.
4. Generate Prisma client.
5. Run the initial migration.
6. Start the API.

```bash
npm install
npm run prisma:generate
npm run prisma:migrate:dev -- --name init
npm run start:dev
```

Health endpoint:

```text
GET /api/v1/health
```

## Security boundary

Authentication and authorization are intentionally not faked at this stage. Product mutation routes must be protected with staff/admin RBAC before the API is used as a production admin backend.
