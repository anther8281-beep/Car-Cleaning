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

## Task status
- [x] 1. Install toolchain (Node.js)
- [~] 2. Scaffold Next.js project + checkpoint  ← in progress
- [ ] 3. Prisma schema + seed
- [ ] 4. Auth + MFA
- [ ] 5. Public pages + dynamic theming
- [ ] 6. Booking + appointments API + notifications
- [ ] 7. Admin dashboard
- [ ] 8. Security, error handling, health checks
- [ ] 9. Tests, Docker, CI/CD, docs

## How to resume
1. `cd /home/anther8281/Car-cleaning && git log --oneline` to see last checkpoint.
2. Read this file's task status + the plan file.
3. `npm install` if `node_modules` is missing.
4. Continue from the first unchecked task.
