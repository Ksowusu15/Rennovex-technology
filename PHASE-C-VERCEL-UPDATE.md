# Phase C: prepare the existing Vercel site for its next update

This package prepares an update. It does not deploy, change your domain,
modify Vercel settings, send real test emails or write to your live database.
Keep your existing Vercel project and domain.

## Changes in this package

- Every client-management server action now checks an administrator role before
  database access. Client-management pages also restrict access to ADMIN and
  SUPER_ADMIN. EDITOR accounts cannot manage client financial records.
- Production signing secrets must be configured and at least 32 characters.
  Administrator cookies always use Secure in production.
- Client sessions check live account status and a password-derived signed
  version. Deactivating/deleting an account rejects its sessions; changing or
  resetting a password rejects older sessions. Profile password changes renew
  the current session. Existing client sessions must sign in again after update.
- Browser mutation requests check their Origin. Client login, invitation
  activation, reset and reference lookups have throttles.
- Invitation and reset tokens use conditional updates to prevent concurrent
  consumption. Reset email replies stay generic across known and unknown users.
- Production invitation/reset links are never logged. Reset URLs use the
  configured HTTPS origin. Email requests have timeouts and detect rejection.
  Existing ADMIN_FROM_EMAIL, RESEND_FROM_EMAIL and CONTACT_FROM_EMAIL settings
  remain supported with documented fallbacks.
- Public settings reads no longer create database rows. HTTPS-only production
  cookies and HSTS support the existing HTTPS deployment.
- Financial and status inputs are validated. File links require HTTPS and no
  embedded credentials; legacy unsafe links are not clickable. CSV exports
  protect cells that spreadsheet software could interpret as formulas.
- Compatible dependency updates include Next.js 16.4.0. Prisma remains 6.19.3.
  A deepmerge-ts 8 override resolves its advisory through Prisma's configuration
  dependency. Prisma generation, typing and compilation checks must validate
  this override before any future dependency update.

No new database migration was added by Phase C.

## Environment configuration

Use `.env.example` as a list of keys. Keep existing working secret values.
Never replace your real environment file with the empty example. Never commit
DATABASE_URL, DIRECT_URL, AUTH_SECRET or provider keys.

| Key | Purpose |
| --- | --- |
| DATABASE_URL | PostgreSQL app connection; pooled Neon URL with TLS |
| DIRECT_URL | Direct PostgreSQL URL used by this Prisma 6 migration configuration |
| AUTH_SECRET | Unique random signing secret, at least 32 characters |
| APP_URL | HTTPS origin for the environment being tested |
| NEXT_PUBLIC_SITE_URL | Same HTTPS origin for canonical URLs and the sitemap |
| RESEND_API_KEY | Email provider access |
| ADMIN_FROM_EMAIL | Admin reset and device-notification sender |
| RESEND_FROM_EMAIL | Client invitations/resets; falls back to ADMIN_FROM_EMAIL |
| CONTACT_FROM_EMAIL | Contact sender; falls back to RESEND_FROM_EMAIL |
| CONTACT_NOTIFICATION_EMAIL | Contact recipient if not set in admin Site Settings |
| CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET | Persistent uploaded images |

Use your existing domain for Production. Set Preview URLs to the actual preview
origin when you are ready to test there, so email links do not point at the
wrong environment. Use a separate test database for Preview. Emails must use
addresses on a verified sending domain.

Vercel environment changes apply to new deployments, not earlier deployments.
Keep secrets scoped to the intended Production/Preview environment. This package
leaves build-time migration execution disabled.

## Local verification

Install the updated lockfile's dependencies once with `npm install`. The existing
postinstall step generates Prisma Client. Use your configured local `.env`.

```powershell
npm run env:check
npm run typecheck
npm run test:forms
npm run test:security
npm audit --omit=dev
npm run db:verify
npm run db:status
npm run build
```

`npm run release:check` runs those checks in order. It performs no migration,
deployment or email send. `db:verify` only reads the database; `db:status` checks
migration history. The environment check prints names and pass/fail, never values.

## Migration history: resolve before running migration deployment

The supplied ZIP contains six migration directories but no initial schema
migration. Its first migration alters existing User tables and enum types.
Also, `20261008230000_add_client_password_reset` sorts before
`20261008230000_add_client_portal`, although the reset migration alters Client
and the portal migration creates Client. This archive cannot replay its current
migration chain on a fresh database as written.

Preserve the authentic migration files from the repository already connected
to your live Vercel project. Compare them with your database's `_prisma_migrations`
records using `npm run db:status`. Do not rename/delete applied directories,
edit their SQL, reset the live database, run `db push`, or mark migrations as
applied just to hide an error. A missing baseline/history mismatch needs an
explicit reconciliation on a test database, based on the real production history.

This package has no schema changes. If your live database already has all
required tables and columns, the code update itself needs no migration. If
pending migrations exist, review their history and SQL first, make a backup,
test on a cloned database, then use Prisma 6 `migrate deploy` only after the
history is reconciled. Do not add that command to Vercel builds yet.

## Update the existing Vercel project when ready

1. Keep these changes in a development branch while finishing them. A push to
   the branch configured as Production can trigger an immediate Vercel update.
2. Preserve your existing environment variables, upload settings and domain.
   Verify the framework is Next.js and the build uses `npm run build` or the
   existing `vercel-build` script. Both generate Prisma Client without migrations.
3. Once ready, create a Preview deployment against an isolated test database.
   Check the checklist below before updating the production branch/deployment.
4. After the approved production update, run read-only route checks:

```powershell
npm run smoke -- https://YOUR-EXISTING-DOMAIN
```

Protected Preview deployments need an authenticated browser rather than this
unauthenticated smoke script. A 200 response alone does not verify page content.

## Final end-to-end checklist

- Public pages, logo, images, mobile navigation and Return to website work.
- At 320, 375, 640, 768, 1024 and 1440px, cards, files and invoice amounts fit.
- Admin login/logout, session expiry, permissions and current session controls.
- An EDITOR and an anonymous caller cannot manage clients or client invoices.
- Client invitation arrives, opens the correct domain and activates once only.
- Client login/logout; old sessions reject after password reset or deactivation.
- Password reset arrives; expires after 10 minutes; reuse is rejected.
- Client profile changes, files, project updates, invoice details and support.
- Contact/consultation/newsletter submissions persist; notifications arrive.
- Cloudinary uploads persist after a deployment; delete/edit actions work.
- Canonicals, sitemap URLs, portal/admin noindex and `/api/health` are correct.
- Keyboard navigation, focus, reduced motion, 200% zoom and screen-reader feedback.
- Check Vercel function logs, Resend delivery events, HTTPS and domain ownership.
- Measure Lighthouse/Web Vitals and repeat critical workflows on the production
  update. Keep the previous working deployment available for code rollback.

A code rollback does not undo database changes. There are no schema changes in
Phase C, but client sessions created by this version may not be accepted by an
older version; be prepared to sign in again following a rollback.

## Throttling and remaining limits

The rate limiter is bounded in memory and helps within a single running
instance. Vercel instances/cold starts do not share it. Before final launch
sign-off, configure platform-level rules or a shared limiter for authentication
and abuse-sensitive endpoints. This package does not claim distributed
brute-force protection. Administrator account locking remains database-backed.

See `PHASE-C-VERIFICATION.md` for exact results and blocked checks.

## Official references checked for this update

- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Vercel environments](https://vercel.com/docs/deployments/environments)
- [Prisma 6 development and production migrations](https://www.prisma.io/docs/orm/v6/prisma-migrate/workflows/development-and-production)
- [Resend verified domains](https://resend.com/docs/dashboard/domains/introduction)
