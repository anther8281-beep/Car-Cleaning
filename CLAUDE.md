# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Goal

Build a production-ready **appointment booking website** for a car-cleaning business. The full specification is in `Claude_Code_Website_Specification.docx`. The current `index.html` is a placeholder scaffold — the real project needs to be built from scratch using the stack below.

## Technology Stack

- **Framework**: Next.js (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: Auth.js / NextAuth with MFA, session timeout, rate limiting, CSRF protection
- **Notifications**: Twilio (SMS), Nodemailer (email), Firebase (push)
- **Deployment**: Vercel (frontend/API) + Supabase (PostgreSQL)

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run test         # Run test suite
npx prisma migrate dev   # Run DB migrations
npx prisma studio        # Open Prisma Studio (DB GUI)
npx prisma generate      # Regenerate Prisma client after schema changes
```

## Architecture

### Pages (public)
`/` Home · `/services` · `/about` · `/contact` · `/booking` · `/privacy` · `/terms`

### Admin (hidden)
`/secure-admin-login` — email/password + MFA login  
`/admin-dashboard` — manage appointments, settings (business name, phone, email, services, hours, logo, colors, SEO)

### Database schema (Prisma)
Four core models: `User`, `Appointment`, `Settings`, `AuditLog`.

### API routes (Next.js App Router)
- `/api/appointments` — create, read, update, cancel; double-booking prevention enforced server-side
- `/api/admin/*` — protected routes for dashboard operations
- `/api/notifications/*` — Twilio SMS + Nodemailer email triggers

### Booking form fields
name, phone, email, service, date, time, notes. Supports rescheduling and cancellation with email confirmation to customer and full summary to owner.

## Security Requirements

Every endpoint must enforce: XSS protection, SQL injection prevention via Prisma, CSRF tokens, HTTPS-only cookies, Content Security Policy headers. Admin login requires rate limiting and MFA.

## Reliability Requirements

Global error boundaries, automatic retries, transaction rollbacks, DB backups, health-check endpoints, structured logging, and monitoring. The app must be deployable with a single command and recover gracefully from failures.

## Deliverables Checklist

- [ ] Complete Next.js source code
- [ ] Prisma database schema + migrations
- [ ] API routes with validation
- [ ] Admin dashboard
- [ ] Email + SMS notification system
- [ ] Test suite
- [ ] `Dockerfile` + `docker-compose.yml`
- [ ] CI/CD workflow (GitHub Actions)
- [ ] Documentation
