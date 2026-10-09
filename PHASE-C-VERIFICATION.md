# Phase C verification results

Prepared locally on 9 October 2026. No live Vercel deployment or production
configuration was changed. No real email was sent. No live database was accessed.

| Check | Result |
| --- | --- |
| TypeScript | Passed |
| Prisma Client generation | Passed, Prisma 6.19.3 |
| Production bundle compilation | Passed, Next.js 16.4.0 |
| Complete production build | Blocked at contact page generation: DATABASE_URL absent |
| Form success/validation/offline/non-JSON/timeout cases | Passed |
| Production secret validation | Passed |
| Configured HTTPS reset origins and cross-origin rejection | Passed |
| Client session validity/deactivation/password revocation/signature rejection | Passed with mocked database and cookies |
| Legacy client token rejection and expired token rejection | Passed with mocked database and cookies |
| All 12 client-management actions reject unauthorised callers before DB access | Passed with mocked authorisation |
| CSV formula protection and HTTPS file URL checks | Passed |
| Password policy and single-instance throttling | Passed |
| Email sender fallback/provider rejection/missing configuration | Passed with mocked fetch; no email sent |
| Production dependency audit | 0 vulnerabilities reported |
| All dependency audit including development/build tools | 7 findings: 5 high, 2 moderate; see below |
| Environment checker | Correctly identifies missing local production configuration |
| Live database and migration history | Not verified; credentials not supplied |
| Domain/HTTPS/Vercel environment settings | Not verified; live URL/account not supplied |
| Real Resend delivery | Not verified; provider credentials and recipient not supplied |
| Visual/browser QA and performance measurements | Still pending on a configured deployment |

## Remaining dependency work

The remaining seven audit findings are in the Tailwind CSS 3 build-tool chain:
braces, chokidar, fast-glob, micromatch, postcss-nested, postcss-selector-parser
and tailwindcss. npm proposes a Tailwind 4 upgrade for these findings. A forced
major upgrade was not applied because it changes the CSS toolchain and needs a
separate visual regression pass. These are not included in the zero-finding
production-only audit result. Review them before claiming complete security
sign-off, especially if building untrusted styles or patterns.

Next.js and other compatible dependencies were updated. A deepmerge-ts 8
resolution override removed the Prisma configuration dependency advisory; Prisma
Client generation, types and bundle compilation passed with that override.
Repeat the audit before the final update, since new advisories can appear.

## Migration history blocker

The provided migration files cannot initialise a new database as written:
there is no initial schema migration, and the client reset-column migration
sorts before Client table creation. Existing applied SQL and names were
preserved. Reconcile against the authentic repository and live migration history
on a test database before applying any pending migration. Phase C itself adds
no schema migration.

## Security review limits

The client-management authorisation gap is fixed in code and tested. Session,
origin, email-failure and CSV checks are automated local checks, not a penetration
test. Throttles are per process, not distributed across Vercel instances. Platform
rules or shared rate limiting, the live migration-history check, real email
workflow testing and browser/end-to-end QA remain required before launch sign-off.

The public settings reader now uses SELECT and an in-memory default when no
settings row exists. Builds and public reads no longer create settings rows.
Settings writes remain in the administrator update path.

Use `PHASE-C-VERCEL-UPDATE.md` for the exact update procedure and environment keys.
