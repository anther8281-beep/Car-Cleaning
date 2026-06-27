# Hernandez Auto Detailing — Appointment Booking Site

A production-ready appointment booking website for a car‑detailing business, with a
public booking flow and a secure admin dashboard. Built with **Next.js 16 (App
Router)**, **TypeScript**, **Tailwind CSS v4**, **Prisma 7 / PostgreSQL**,
**NextAuth v5**, and **Nodemailer**.

## Features

- **Public site** — Home, Services, About, Contact, Privacy, Terms, and a Booking
  page with live slot availability. Dark/light mode and **admin‑configurable brand
  colors, services, hours, and SEO** (changes apply immediately, no redeploy).
- **Booking flow** — Customer books → request is `PENDING` → owner gets an email
  with **Approve / Reject** links → customer is emailed the outcome. Customers can
  reschedule or cancel via a private link. Double‑booking is prevented at the
  database level inside a transaction.
- **Hidden admin area** (`/secure-admin-login`, `/admin-dashboard`) — email +
  password with **TOTP two‑factor auth**, session timeout, login rate limiting,
  and CSRF protection. Manage appointments (approve, cancel, delete, status,
  **CSV export**), edit all site settings, and view an audit log.
- **Hardening** — nonce‑based Content‑Security‑Policy, HSTS and other security
  headers, server + client validation (Zod), error boundaries, structured logging,
  and a `/api/health` database probe.

## Quick start (local)

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env        # then fill in DATABASE_URL, AUTH_SECRET, SEED_ADMIN_*
#   Generate a secret: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 3. Database
npm run db:migrate          # apply migrations  (prisma migrate deploy)
npm run db:seed             # seed settings + first owner account

# 4. Run
npm run dev                 # http://localhost:3000
```

The first owner account is created from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.
Sign in at `/secure-admin-login`; you'll be prompted to set up two‑factor auth on
first login.

> **Email in development:** if `EMAIL_HOST` is empty, emails are logged to the
> console instead of being sent — handy for local testing.

## Run with Docker

```bash
docker compose up --build       # app on http://localhost:3000 + PostgreSQL
```

The app container runs `prisma migrate deploy`, idempotently seeds, then starts.
Override secrets via environment variables (see `docker-compose.yml`).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests |
| `npm run db:migrate` | `prisma migrate deploy` |
| `npm run db:seed` | Seed settings + owner |
| `npm run db:generate` | Regenerate the Prisma client |

## Deployment (Vercel + Supabase)

1. Create a PostgreSQL database on **Supabase** and copy its connection string.
2. Import the repo into **Vercel**. Set the environment variables from
   `.env.example` (`DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `APP_URL`,
   `OWNER_EMAIL`, SMTP `EMAIL_*`, and `SEED_ADMIN_*`).
3. Run migrations against the production DB: `npm run db:migrate` (and `db:seed`
   once to create the owner account).
4. Deploy. CI (`.github/workflows/ci.yml`) lints, type‑checks, tests, and builds on
   every push; set the repo variable `DEPLOY_ENABLED=true` and add `VERCEL_TOKEN`,
   `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets to enable automatic production
   deploys from `main`.

## Architecture

See [`CLAUDE.md`](./CLAUDE.md) for a detailed map of the codebase, conventions, and
the data model.
