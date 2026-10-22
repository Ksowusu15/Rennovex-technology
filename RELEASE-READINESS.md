# Rennovex release readiness fixes

These changes are prepared on `release/readiness-fixes`. They have not been deployed and no production database has been changed. `vercel.json` disables automatic deployment for this review branch; `main` is unchanged.

## What changed

- Assistant bookings now convert the visitor's local date/time to ISO UTC, using the same helper as the consultation page. The API rejects timestamps without an explicit offset.
- Invoice updates reject overpayments, sub-pesewa precision and contradictory status/payment combinations. Clients see paid and remaining amounts; draft invoices are hidden.
- New enquiries, quotes, bookings and support requests commit with a notification job in one transaction. Delivery runs after the response. Retries use a database lease and a stable provider idempotency key. Six unsuccessful attempts require an admin retry.
- Admins can review/retry undelivered alerts at `/admin/notifications`. The bell includes client support and delivery failures and displays unavailable counts honestly.
- Admin/client sign-in and client password-change attempts use atomic, shared PostgreSQL buckets keyed by hashed account and IP. An unavailable limiter fails closed with 503. The existing in-memory limiter remains an inexpensive first layer.
- Invitation failures keep the account, display a retry message, and restore the previous invitation token if the newer token is still current. Activated/inactive clients cannot be reinvited. Duplicate account creation opens the existing account instead.

## Migration adoption must precede rollout

Do not run `db push`, reset a live database, or blindly deploy these migrations on an existing database.

1. Back up the database and inspect `_prisma_migrations` and the live schema using read-only tools. `npm run migrations:preflight` reports known adoption requirements without changing records.
2. This repository previously lacked an initial schema migration. `20260724000000_initial_schema` now supplies the historical core schema, including the authentication tables. On a genuinely empty database, replay all migrations normally. On an existing database, verify that the baseline's objects already exist and match before recording it as applied with `prisma migrate resolve --applied 20260724000000_initial_schema`. Do not execute the baseline SQL against existing tables.
3. The password-reset migration has moved from `20261008230000_add_client_password_reset` to `20261008230100_add_client_password_reset`. Its SQL contents/checksum are unchanged; it now sorts after client-table creation. If the old name has never been recorded, no history repair is needed. If the old name is recorded, reconcile that migration history before deployment: verify its checksum against the unchanged SQL, verify whether the two reset columns actually exist, and rename the historical record to the corrected migration name in a reviewed maintenance transaction. Do not leave duplicate old/new history entries or edit checksums. For a failed attempt, first establish what SQL actually ran; after the name reconciliation use Prisma's rolled-back/applied resolution appropriate to that verified state. A failed migration is not evidence that its SQL was rolled back completely.
4. Then apply pending migrations, including `20261022090000_release_readiness`, to staging first. It creates `AuthRateLimit` and `NotificationJob` and adds invitation delivery state. Authentication now depends on these tables, so migrate before switching application traffic.
5. Run `npm run db:verify` and `npm run db:status`. The database verifier reports inconsistent legacy invoices but does not change them. Reconcile those invoices with actual payment records in admin before approval.

No migration history reconciliation or production migration has been performed by this change.

## Notification worker setup

Set a separate random `CRON_SECRET` of at least 32 characters. Configure your hosting scheduler or another trusted scheduler to request `GET /api/cron/notifications` with `Authorization: Bearer <CRON_SECRET>`, for example every five minutes if the hosting plan permits it. No external scheduler has been created. The authenticated admin retry action works independently of a scheduler.

The worker processes up to four due jobs per invocation; increase worker frequency/capacity for sustained higher volume. Network delivery is bounded to ten seconds per job. It also removes expired authentication buckets. Jobs remain in the database if a worker stops. Completed deliveries are retained as records; establish a retention policy before sustained use. The provider's idempotency guarantee has a finite retention window, so delayed/manual retries cannot guarantee exactly-once delivery after an ambiguous provider timeout.

## Validation

- `npm run typecheck` generates Next route/image types before TypeScript checking.
- `npm run test:forms`, `npm run test:security`, `npm run test:notifications`, `npm run test:readiness` cover form failures, session revocation, origins, transactional alerts, provider failure/retry, concurrent claims, invitation recovery, payment invariants, and three timezones. Email providers are mocked; no real email is sent.
- `npm run test:database` requires `TEST_DATABASE_URL` for a disposable loopback PostgreSQL database named `rennovex_release_test` and `ALLOW_LOCAL_RELEASE_TESTS=1`. It checks the shared limiter against PostgreSQL, transaction rollback, and notification leasing with real Prisma queries. It refuses a remote or differently named database.
- All committed migration SQL was replayed in order against an isolated PostgreSQL-compatible engine (PGlite). This is not a substitute for staging migration rehearsal using a copy of the production schema/history.
- Production email acceptance/delivery, environment values, hosting scheduler, legacy invoice reconciliation and authenticated staging/browser flows remain rollout gates. Do not treat a Vercel build status as proof of these checks.

## Review checks

The GitHub Actions workflow uses an ephemeral PostgreSQL 16 service and test-only values. It replays migrations on a new database, runs the test suites and database checks, audits production dependencies, and builds the application. It has read-only repository permissions and does not deploy or send email.
