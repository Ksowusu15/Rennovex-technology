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
Copy-Item .env.example .env.local
```

3. Add your real environment values to `.env.local`.

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

Use `.env.example` as the reference. Never commit `.env`, `.env.local`, database passwords, API keys, or authentication secrets.

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
2. Add every required variable from `.env.local` in Vercel Project Settings.
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
