# Market — Final Release Runbook

## Preflight

1. Start from a green `master` revision.
2. Provision PostgreSQL and enable automated backups.
3. Create deployment secrets from `deploy/production.env.example`; never commit the populated file.
4. Configure exact storefront/admin origins and HTTPS URLs.
5. Keep `PAYMENT_PROVIDER=manual` until the Stripe account and webhook are verified.
6. Connect uptime/error monitoring using `docs/OBSERVABILITY.md`.

## Deploy

1. Back up the database.
2. Build immutable application/container artifacts for the selected commit SHA.
3. Run committed Prisma migrations as a one-off task.
4. Stop the rollout if migration fails.
5. Deploy API, then storefront and admin.
6. Verify API `/api/v1/health` and frontend `/healthz`.

## Payment cutover

1. Store the Stripe secret key and webhook signing secret in the platform secret manager.
2. Register the HTTPS webhook destination: `POST /api/v1/payments/webhooks/stripe`.
3. Set exact HTTPS success and cancel URLs.
4. Set `PAYMENT_PROVIDER=stripe`.
5. Deploy/restart the API.
6. Complete a controlled low-value checkout.
7. Verify payment becomes `SUCCEEDED` and its pending order becomes `CONFIRMED`.
8. Verify an invalid/replayed signature does not mutate state.
9. Verify the order is visible to authorized staff.

## Smoke test

Verify catalog, cart quantity/stock constraints, server-priced order creation, payment redirect (when enabled), payment confirmation, admin login, order visibility, one authorized status transition, cancellation/restock behavior, and inventory consistency.

## Rollback

Keep the previous application image/revision available. Roll back application code independently of schema recovery. Do not blindly reverse a migration; use backward-compatible changes or a deliberate database restore when recovery requires it.

## Launch evidence

Record: deployed commit SHA, public origins, migration result, health-check result, backup/restore evidence, monitoring status, checkout evidence, and rollback target. Only mark the infrastructure items in `docs/LAUNCH_CHECKLIST.md` complete when this evidence exists.
