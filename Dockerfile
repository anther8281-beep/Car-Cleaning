# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

# --- Dependencies (schema present so postinstall `prisma generate` succeeds) ---
FROM base AS deps
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

# --- Build ---
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- Runtime ---
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Bring over the full build + deps (kept simple/robust over a slim standalone image).
COPY --from=builder /app ./
EXPOSE 3000
# Apply migrations, (idempotently) seed, then start.
CMD ["sh", "-c", "npx prisma migrate deploy && (npx prisma db seed || true) && npm run start"]
