# Market — Launch Gate

Use this as the final go/no-go sheet for a real deployment. Repository checks and infrastructure checks are intentionally separated.

## Repository gate

- [x] storefront/admin/API production builds are defined
- [x] PostgreSQL migrations are deployment-gated
- [x] health endpoints are defined
- [x] exact-origin CORS is configurable
- [x] staff authentication, session revocation, and RBAC are server-enforced
- [x] pricing, stock, tax, shipping, and order state are server-authoritative
- [x] payment provider is server-selected
- [x] Stripe Checkout adapter is isolated behind the payment-provider boundary
- [x] webhook signatures use the raw request body and signing secret
- [x] successful verified payment can confirm a pending order
- [x] payment transition handling is idempotent at the persisted state boundary
- [x] no production credentials are committed
- [x] CI validates API/frontend tests, builds, migrations, and container images

## Infrastructure gate — must be completed for the chosen production environment

- [ ] public storefront/admin/API domains selected
- [ ] TLS active on all public endpoints
- [ ] managed PostgreSQL provisioned and production `DATABASE_URL` stored as a secret
- [ ] automated backups enabled
- [ ] restore exercised successfully
- [ ] unique production JWT secret stored in the platform secret manager
- [ ] exact CORS origins configured
- [ ] monitoring/error reporting provider connected
- [ ] Stripe production credentials stored as secrets, if live payments are enabled
- [ ] Stripe webhook points to `/api/v1/payments/webhooks/stripe`
- [ ] one production-mode checkout verified end to end
- [ ] owner/admin login verified
- [ ] inventory/order/admin smoke tests pass after deployment

## Launch rule

Do not switch `PAYMENT_PROVIDER` to `stripe` or describe the deployment as live until every applicable infrastructure gate above has evidence. Keep `manual` for demos that do not have a configured external gateway.

A green repository CI proves the software revision passed its automated gates; it does not prove DNS, TLS, provider accounts, secrets, monitoring, or database recovery in an environment that has not been provisioned.
