# Market — Production Observability Baseline

Market exposes lightweight application health endpoints and expects the deployment platform to provide logs, metrics, alerts, and uptime monitoring.

## Signals

Monitor at minimum:

- API availability and latency for `GET /api/v1/health`
- storefront/admin `GET /healthz`
- HTTP 5xx rate
- API process/container restarts
- PostgreSQL availability, connection saturation, disk/storage pressure, and backup status
- failed database migrations
- payment creation failures
- rejected Stripe webhook signatures
- payment events that remain `REQUIRES_ACTION` unexpectedly
- order/payment state mismatches

Do not log passwords, access/refresh tokens, Stripe secret keys, webhook secrets, full authorization headers, or sensitive customer/payment data.

## Alert baseline

Create actionable alerts for sustained API unavailability, elevated 5xx responses, failed migrations, database unavailability/storage pressure, backup failures, and payment/webhook failure spikes.

## Release verification

For every production release record the deployed commit SHA, migration result, smoke-test result, and rollback target. A release is not considered verified only because CI is green.

## Payment diagnostics

Correlate provider payment/session IDs with internal payment and order IDs. The current integration stores provider IDs and event metadata for this purpose. Production operators should use the payment provider dashboard plus application logs when investigating failures.

## Backup evidence

Automated backups must have retention configured and a restore must be exercised against a non-production database. Record the restore date and result in the operator's runbook or incident/operations system.
