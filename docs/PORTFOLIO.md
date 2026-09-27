# Market — Portfolio Presentation

## Positioning

Market is a full-stack commerce suite built as one product with three independently deployable applications: customer storefront, staff admin, and commerce API.

It demonstrates more than interface implementation. Pricing, stock, authorization, order state, tax/shipping, and payment confirmation are server-owned, with PostgreSQL persistence and auditable staff operations.

## Stack

Angular, TypeScript, NestJS, PostgreSQL, Prisma, Docker, GitHub Actions, and a Stripe Checkout integration boundary.

## Engineering highlights

- shared typed contracts across applications
- staff authentication, rotating sessions, and role-based authorization
- atomic inventory updates and movement history
- server-priced orders and controlled order-state transitions
- configurable merchant branding, currency, locale, tax, and shipping
- provider-neutral payment persistence
- verified external-payment webhook lifecycle
- runtime frontend configuration
- migrations, automated tests, container builds, health checks, and release runbooks

## Portfolio claim boundary

The repository contains the current owned-backend implementation and production deployment foundations. Historical public demo URLs predate the final infrastructure cutover and should not be presented as proof that the current API/database/payment stack is already live.

## Recommended LinkedIn project title

Market Commerce Suite — Full-Stack E-Commerce Platform

## Recommended LinkedIn project description

Built and evolved an Angular e-commerce project into a unified commerce suite with a customer storefront, authenticated admin workspace, and NestJS/PostgreSQL backend. Implemented server-owned pricing and inventory, order workflows, RBAC and rotating sessions, merchant tax/shipping configuration, provider-neutral payments, Stripe Checkout/webhook architecture, shared TypeScript contracts, CI, Docker deployment foundations, and operational launch documentation.

## Recommended LinkedIn skills

Angular · TypeScript · NestJS · PostgreSQL · REST APIs

## Recommended media

1. GitHub repository
2. Storefront landing/catalog screenshot after final deployment
3. Admin dashboard/orders screenshot after final deployment
4. Architecture overview image
5. Checkout/payment flow screenshot after final deployment
