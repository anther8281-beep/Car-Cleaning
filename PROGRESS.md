# Build Progress — Hernandez Auto Detailing Booking Site

> **Resume anchor.** This file tracks what's done and what's next so any session can pick up cleanly.
> Full plan: `/home/anther8281/.claude/plans/modular-soaring-walrus.md`. Architecture: `CLAUDE.md`.

## Key decisions (locked)
- **Business**: Hernandez Auto Detailing
- **Stack**: Next.js 16.2.9 (App Router) · React 19 · TypeScript · Tailwind v4 · Prisma 7 · PostgreSQL (Supabase) · NextAuth v5 (beta) · Nodemailer
- **No Twilio/SMS** (owner has no account) — email notifications only via Nodemailer
- **No online payments** — pay at service
- **Booking flow**: customer books → status `PENDING` → owner gets email w/ Approve/Reject links → customer gets confirmation/rejection email
- **Auth**: email + password + TOTP MFA; first admin via `prisma/seed.ts`
- **Admin-customizable**: services, business hours, colors, SEO, logo, business info
- **Deploy targets**: Vercel + Supabase (accounts exist)

## ⚠️ Environment notes for future sessions
- Node 20 + git were NOT preinstalled — installed via apt/nodesource. If missing, reinstall.
- Project dir is `Car-cleaning` (capital C) → npm rejects as package name; app was scaffolded in a temp dir then moved in. `package.json` name is `car-cleaning-app`.
- **Next.js 16 + Tailwind v4 differ from training data.** Bundled docs live in `node_modules/next/dist/docs/`. `params`/`searchParams` are Promises; `cookies()`/`headers()` are async; route handlers use `route.ts` with `GET/POST` exports; Tailwind v4 is CSS-config (`@import "tailwindcss"` + `@theme`), no `tailwind.config.js`.
- Prisma 7 (not 5/6) — verify generator `output` path and client import location against installed version.

## Checkpoints (git commits)
- [x] **CP1** — Toolchain + Next.js scaffold + all deps installed + PROGRESS.md
- [x] **CP2** — Prisma schema (4 models) + migration + seed (3 services, owner account)
- [x] **CP3** — Auth + MFA: NextAuth v5 (split edge/node config), staged login (password→TOTP), MFA enrollment with QR, proxy route guard, audit log, rate limiter. `tsc` + `next build` both green.
- [x] **CP4** — Public pages (Home, Services, About, Contact, Privacy, Terms) + Navbar/Footer + dark-light toggle (next-themes) + DB-driven brand colors + dynamic SEO metadata. Smoke-tested: home renders injected color + seeded data, admin redirects to login. Whole app is `force-dynamic` so admin edits apply immediately.
- [x] **CP5** — Booking flow: booking page + form (live availability), appointments API (create=PENDING w/ transactional double-booking guard, availability endpoint), signed owner approve/reject email links, customer manage page (cancel/reschedule), contact API, Nodemailer email layer (console fallback when SMTP unset). **Runtime-tested end-to-end**: availability open/closed, create→PENDING + 2 emails, double-book→409, approve→CONFIRMED + email, bad token rejected.
- [x] **CP6** — Admin dashboard: overview (stats + upcoming), appointments table (filter/expand/approve/cancel/delete/status + CSV export), settings editor (business info, branding colors, SEO, services add/edit/delete, per-day hours), audit log viewer, nav. **Runtime-tested authenticated**: logged in via credentials callback, all admin pages 200, CSV export auth-gated (307→login when anon), settings color change reflects on public home immediately.
- [x] **CP7** — Security + reliability: nonce-based CSP (proxy generates per-request nonce, strict-dynamic script-src; merged with auth in proxy.ts), static security headers (HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, no X-Powered-By) in next.config.ts, error boundary + global-error + 404 not-found, structured JSON logger, `/api/health` DB probe. **Verified**: all headers present, all 23 script tags carry matching nonce (incl. next-themes script — JS not broken), health=200 db up, auth still 307s.
- [x] **CP8** — Tests + Docker + CI/CD + docs: Vitest config + 25 unit tests (booking slots, Zod schemas, HMAC tokens, TOTP, color sanitize) all passing; Dockerfile (multi-stage) + docker-compose (app+postgres, migrate+seed+start); GitHub Actions CI (lint/typecheck/test/build + opt-in Vercel deploy); README + finalized CLAUDE.md; package scripts (typecheck/test/db:*). **Final gate green**: lint ✓, typecheck ✓, 25 tests ✓, build ✓.

## ✅ BUILD COMPLETE — all 9 tasks done. Generated Prisma client is gitignored (regenerated via postinstall/`db:generate`). `.env` gitignored. Local dev DB Postgres seeded with owner anther8281@gmail.com / ChangeMe!2026.

## Post-build: enhancements (CP9) + DEPLOY (in progress)
- **CP9 done & pushed**: folded valuable features from a pre-existing "Shine Auto Detailing" schema found in the user's Supabase project (lead time / max advance booking window, address, tagline, SEO keywords, COMPLETED/NO_SHOW statuses, adminNotes, service price/duration snapshot, account lockout, MFA recovery codes, lastLoginAt, audit userAgent). Skipped DB-session model + timestamp scheduling by design. 30 tests pass.
- **GitHub**: pushed through CP9 (main @ 5a3cada) to anther8281-beep/Car-Cleaning via one-time PAT (network flaky — retry pushes 2-3x).
- **Supabase (project xngbeursemwmmajmftmc, us-west-2, UTC)**: DONE via MCP — dropped the old incompatible schema, applied my full schema, enabled RLS deny-all (app uses direct Postgres role / Prisma which bypasses RLS), seeded settings (3 services) + owner anther8281@gmail.com (role OWNER). **Prod admin temp password: `Hzd-1SSjWBlI-26`** (change on first login; MFA required).
- **Vercel**: CLI installed at node_modules/.bin/vercel; token works (scope `anther8281-1771`).
- **⏳ BLOCKED**: need the Supabase DB connection string (with password) for Vercel `DATABASE_URL` — MCP can't read the password. Pooler form: `postgresql://postgres.xngbeursemwmmajmftmc:[PW]@aws-0-us-west-2.pooler.supabase.com:6543/postgres`.
- **Remaining once unblocked**: set Vercel env (DATABASE_URL, AUTH_SECRET, NEXTAUTH_SECRET, AUTH_TRUST_HOST=true, APP_URL, NEXTAUTH_URL, OWNER_EMAIL=anther8281@gmail.com, EMAIL_FROM; EMAIL_* empty = console fallback) → `vercel deploy --prod` → set APP_URL/NEXTAUTH_URL to the assigned domain → redeploy → smoke test.
- **⚠️ Secrets to rotate after deploy**: GitHub PAT, Vercel token, Supabase DB password (all pasted in chat).

## ⚠️ Security notes
- CSP nonce passed to next-themes via `ThemeProvider nonce={...}` (root layout reads `x-nonce` header). `style-src 'unsafe-inline'` is intentional (covers the brand-color `<style>` + framework inline styles); `script-src` stays strict (nonce + strict-dynamic). No inline `style={{}}` attributes exist in components, so this is safe.
- Proxy matcher is now broad (all pages except api/_next/static/image/favicon) to apply CSP everywhere; auth redirects still keyed on pathname. `/api/*` has no CSP by design.

## ⚠️ Auth testing recipe (works)
To exercise the authenticated app via curl: GET `/api/auth/csrf` (cookie jar) → POST `/api/auth/callback/credentials` with `csrfToken,email,password,token=` (form-encoded) → sets `authjs.session-token` → reuse jar. Seed creds: anther8281@gmail.com / ChangeMe!2026. Note `/admin-dashboard/*` is proxy-protected so anon hits 307→login before any route-level 401.

## ⚠️ Testing notes
- Local dev DB occasionally has a **stale `npm start`** holding port 3000 → new starts fail `EADDRINUSE`. Kill via `ps aux|grep next-server` then `kill <pid>` before restarting.
- To sign an approve/reject token manually for testing, HMAC-SHA256 the base64url payload `{appointmentId,action,exp}` with `AUTH_SECRET` (see token.ts). Inline `tsx -e` import of project files fails on path resolution — use a node crypto one-liner instead.

## ⚠️ More environment notes (auth)
- **NextAuth v5 beta.31** — split config: `src/auth.config.ts` (edge-safe, no Prisma/bcrypt, used by `src/proxy.ts`) and `src/auth.ts` (full, Credentials provider). Session strategy MUST be `jwt` for Credentials. JWT module augmentation may not flow to callback types — coerced defensively in the session callback.
- **Next 16 renames Middleware → Proxy**: file is `src/proxy.ts` (default export wraps NextAuth `auth`). Same matcher/config API.
- **otplib v13** new functional API: `generateSecret()`, `generateURI({strategy,issuer,label,secret})`, `verifySync({secret,token,epochTolerance})` → `{valid}`. Drift window is `epochTolerance` in SECONDS (not steps).
- Login flow: password verified in a server action (staged), then `signIn(...,{redirect:false})`, then manual `redirect()`. First login (no MFA) → `/admin-dashboard/setup-mfa`.

## ⚠️ More environment notes (discovered during build)
- **Prisma 7 requires a driver adapter** — `@prisma/adapter-pg` (`PrismaPg`). Construct clients as `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })`. The schema datasource has NO `url`; URL is supplied at runtime via the adapter and to the CLI via `prisma.config.ts` (`datasource.url`).
- Generated client imports from `@/generated/prisma/client` (PrismaClient, enums `Role`/`AppointmentStatus`, model types, `Prisma`).
- Seed config is `migrations.seed` in `prisma.config.ts`; seed script needs its own `import "dotenv/config"`.
- **Local dev DB**: PostgreSQL 17 installed via apt and running. DB `car_cleaning`, user `caruser`, pass `carpass`. Start with `sudo pg_ctlcluster 17 main start`. This is only for local dev/migrations — production is Supabase.
- Seed admin: `anther8281@gmail.com` / `ChangeMe!2026` (temp, change on first login).

## Task status
- [x] 1. Install toolchain (Node.js)
- [x] 2. Scaffold Next.js project + checkpoint
- [x] 3. Prisma schema + seed
- [x] 4. Auth + MFA
- [x] 5. Public pages + dynamic theming
- [x] 6. Booking + appointments API + notifications
- [x] 7. Admin dashboard
- [x] 8. Security, error handling, health checks
- [x] 9. Tests, Docker, CI/CD, docs

## How to resume
1. `cd /home/anther8281/Car-cleaning && git log --oneline` to see last checkpoint.
2. Read this file's task status + the plan file.
3. `npm install` if `node_modules` is missing.
4. Continue from the first unchecked task.
