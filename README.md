# Rennovex Technology

A responsive technology company website and administration platform built with Next.js, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

## Features

- Responsive public website for services, projects, case studies, insights, and company information
- Contact, quote request, consultation booking, newsletter, and website-assistant lead capture
- Secure administrator authentication with server-side role enforcement
- Super Admin, Admin, and Editor permissions
- Projects, services, case studies, blog, media, messages, bookings, and settings management
- Cloudinary image storage
- Neon PostgreSQL database support
- Audit logs, login history, session management, account locking, and password reset
- SEO metadata, sitemap, robots rules, social preview images, legal pages, and security headers
- Responsive admin dashboard and mobile navigation

## Technology stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL / Neon
- Cloudinary
- Resend
- Zod
- Jose JWT authentication

## Requirements

- Node.js 20.9 or newer
- npm
- PostgreSQL database or Neon account
- Cloudinary account for production uploads
- Resend account for production email delivery

## Local setup

1. Install dependencies:

```powershell
npm install
```

2. Create the local environment file:

```powershell
Copy-Item .env.example .env
```

3. Add your real environment values to `.env`.

4. Generate Prisma Client and apply the database schema:

```powershell
npx prisma generate
npx prisma migrate deploy
```

For a new development database without existing migrations, use:

```powershell
npx prisma db push
```

5. Create the initial administrator when required:

```powershell
npm run db:seed
```

6. Start the development server:

```powershell
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Use `.env.example` as the reference. Never commit `.env`, `.env`, database passwords, API keys, or authentication secrets.

Generate a strong authentication secret with:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

For Neon, use the pooled connection string for `DATABASE_URL` and the direct connection string for `DIRECT_URL`.

## Production verification

Run these commands before deployment:

```powershell
npm run typecheck
npm run build
```

The production build must complete successfully before pushing the release.

## GitHub

```powershell
git init
git add .
git commit -m "Initial production release"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rennovex-technology.git
git push -u origin main
```

Keep the repository private until you confirm that no secrets or private data were committed.

## Vercel deployment

1. Import the GitHub repository into Vercel.
2. Add every required variable from `.env` in Vercel Project Settings.
3. Apply production migrations from a trusted terminal:

```powershell
npx prisma migrate deploy
```

4. Deploy the project.
5. Set `APP_URL` and `NEXT_PUBLIC_SITE_URL` to the final production domain and redeploy.
6. Test the public website, admin login, forms, emails, image uploads, logout, and protected routes on the live URL.

## Important production notes

- Do not commit environment files.
- Do not run `prisma migrate dev` against the production database.
- Cloudinary should be configured before testing production uploads.
- Confirm that the Resend sender domain or address is verified.
- Rotate any credential that has ever been exposed publicly.
- Back up production data before destructive schema changes.

## Client Dashboard responsive polish

The client workspace uses the scoped `app/client-portal/portal.css` stylesheet,
short semantic classes and vertically formatted JSX. Metrics use two columns
on phones and four on tablets and desktops. Projects and updates sit side by
side from 1024px. Invoice details stack on phones. Return to website and sign
out remain visible at every screen size.

Includes long filename wrapping, keyboard focus indicators, accessible project
progress, dated updates, invoice due dates and clearer empty states. Open
support counts every active request. Outstanding balances exclude draft and
cancelled invoices, clamp overpayments to zero and keep currencies separate.

Prisma generation and TypeScript checks passed. The production bundle compiled,
but full static generation needs DATABASE_URL, absent from the uploaded project.
No database migration is needed for these dashboard changes.

## Phase B: Production UX and Quality

This version adds resilient forms, accessible navigation and feedback,
Client Portal support history and project target dates, search metadata and
sitemap improvements, a 404 page, workspace error recovery and navigation
loader fixes. See `PHASE-B-QA.md` for verification results and remaining live
checks. No new database migration is required.

Run `node tests/form-request-check.cjs` to check form transport success,
validation responses, offline recovery, malformed responses and timeouts.

## Phase C: prepare an update to the existing live site

See `PHASE-C-VERCEL-UPDATE.md` before updating your current Vercel project. It
covers environment keys, authentication changes, tests, database verification,
migration-history issues and the production update checklist. No deployment or
production database mutation is performed by this package.

Run `npm run release:check` with real local configuration for read-only readiness
checks and build validation. Existing client sessions must sign in again after
this update. Phase C adds no database migration. The supplied migration history
needs review before any migration deployment.
