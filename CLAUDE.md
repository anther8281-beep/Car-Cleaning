# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Production appointment-booking website for **Hernandez Auto Detailing** (a car‑detailing
business): a public booking flow plus a hidden, MFA‑protected admin dashboard. Original
spec: `Claude_Code_Website_Specification.docx`. User‑facing setup/deploy docs: `README.md`.

## Stack (as built)

- **Next.js 16.2.9** (App Router) · React 19 · TypeScript · **Tailwind CSS v4**
- **Prisma 7** + PostgreSQL (Supabase in prod)
- **NextAuth v5** (beta) with credentials + TOTP MFA
- **Nodemailer** for email (no SMS/Twilio — the owner has no account)
- Deploy targets: Vercel + Supabase

## ⚠️ Version gotchas (these differ from older/training-data conventions)

- **Next.js 16 renames Middleware → Proxy**: the file is `src/proxy.ts` (not
  `middleware.ts`). Bundled docs live in `node_modules/next/dist/docs/`.
- `params` and `searchParams` are **Promises**; `cookies()`/`headers()` are **async**.
- **Prisma 7 requires a driver adapter** — `@prisma/adapter-pg` (`PrismaPg`). Clients are
  built as `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })`
  (see `src/lib/prisma.ts`). The schema datasource has **no `url`**; the URL is supplied at
  runtime via the adapter and to the CLI via `prisma.config.ts`. The generated client lives at
  `src/generated/prisma/` — import from `@/generated/prisma/client` (PrismaClient, enums
  `Role`/`AppointmentStatus`, model types, `Prisma`). Seed command is `migrations.seed` in
  `prisma.config.ts`.
- **otplib v13** functional API: `generateSecret()`, `generateURI()`, `verifySync({ secret,
  token, epochTolerance })` (drift window is in **seconds**). See `src/lib/auth/totp.ts`.
- **NextAuth v5** uses split config: `src/auth.config.ts` (edge‑safe, no Prisma/bcrypt — used
  by the proxy) and `src/auth.ts` (full, Credentials provider). Session strategy must be `jwt`.

## Commands

```bash
npm run dev            # dev server (localhost:3000)
npm run build / start  # production build / serve
npm run lint           # ESLint   (CI fails on errors)
npm run typecheck      # tsc --noEmit
npm test               # Vitest unit tests
npm run db:migrate     # prisma migrate deploy
npm run db:seed        # seed settings + first owner
npm run db:generate    # regenerate Prisma client after schema changes
npx prisma migrate dev --name <x>   # create a new migration in development
```

Local DB for development is PostgreSQL (the repo assumes a reachable `DATABASE_URL`; a local
Postgres or Supabase both work). Env vars are documented in `.env.example`.

## Architecture

Routing uses two route groups under `src/app/`:
- `(public)/` — `/` Home, `/services`, `/about`, `/contact`, `/booking`,
  `/booking/manage/[token]` (customer reschedule/cancel), `/privacy`, `/terms`. Wrapped by a
  layout with Navbar/Footer.
- `(admin)/` — `/secure-admin-login` (staged password → TOTP) and `/admin-dashboard`
  (overview, `/appointments`, `/settings`, `/audit`, `/setup-mfa`). The dashboard layout calls
  `requireUser()` for real server‑side authz; `src/proxy.ts` does an optimistic redirect.

**The whole app is `force-dynamic`** (set in `src/app/layout.tsx`) so admin‑edited settings —
brand colors, services, hours, SEO — take effect immediately without a redeploy.

### Settings-driven theming & content
`getSettings()` (`src/lib/settings.ts`) reads the singleton `Settings` row (React‑cached per
request). `ThemeColors` injects `--primary`/`--secondary` as CSS variables (sanitized via
`safeHexColor`); components style with `var(--primary)` etc. The root layout generates SEO
metadata from settings.

### Booking
`POST /api/appointments` validates (Zod, `src/lib/validation.ts`), checks availability
(`src/lib/booking.ts`), and creates a `PENDING` row inside a `$transaction` with a final
double‑booking guard. It emails the customer ("received") and the owner (with **signed**
Approve/Reject links — HMAC tokens from `src/lib/token.ts`). `GET /api/appointments/[id]/approve|reject`
verify the token and update status + email the customer. `GET /api/appointments/availability`
returns open slots. Email layer: `src/lib/email.ts` (console fallback when `EMAIL_HOST` unset).

### Admin actions
Server actions per area: `appointments/actions.ts` (approve/reject/status/delete),
`settings/actions.ts` (validated settings upsert), `setup-mfa/actions.ts` (TOTP enroll).
All call `requireUser()` + `logAudit()` (`src/lib/audit.ts`) and `revalidatePath`.
CSV export is a route handler at `admin-dashboard/appointments/export/route.ts`.

### Data model (`prisma/schema.prisma`)
`User` (role, totpSecret, mfaEnabled) · `Appointment` (status enum, `manageToken`, `@db.Date`
date + `HH:mm` time string) · `Settings` (singleton id `"singleton"`; `services`/`hours` JSON)
· `AuditLog`.

## Security & reliability

- CSP with a **per‑request nonce** generated in `src/proxy.ts` (script‑src nonce +
  `strict-dynamic`; the nonce is passed to next‑themes via `ThemeProvider nonce`). Static
  headers (HSTS, X‑Frame‑Options, nosniff, Referrer/Permissions‑Policy) in `next.config.ts`.
- Zod validation on all inputs; Prisma parameterizes queries; login is rate‑limited
  (`src/lib/rate-limit.ts`); auth cookies are httpOnly/secure via NextAuth.
- Error boundaries: `src/app/error.tsx`, `global-error.tsx`, `not-found.tsx`. Health probe at
  `/api/health`. Structured JSON logs via `src/lib/logger.ts`.

## Testing

Vitest unit tests live next to the code (`src/**/*.test.ts`): booking slot logic, Zod schemas,
HMAC token sign/verify, TOTP, color sanitization. Run `npm test`. `vitest.setup.ts` provides
dummy env so modules import without a live DB.

## Working notes

- `PROGRESS.md` tracks build checkpoints and environment caveats (kept for resumability).
- The dir name has a capital `C` (`Car-cleaning`) which npm rejects as a package name — the
  package is named `car-cleaning-app`.
