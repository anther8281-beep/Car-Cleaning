-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'RESCHEDULED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "totpSecret" TEXT,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT NOT NULL,
    "notes" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "manageToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "businessName" TEXT NOT NULL DEFAULT 'Hernandez Auto Detailing',
    "phone" TEXT NOT NULL DEFAULT '',
    "contactEmail" TEXT NOT NULL DEFAULT '',
    "services" JSONB NOT NULL DEFAULT '[]',
    "hours" JSONB NOT NULL DEFAULT '{}',
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#1a2e5a',
    "secondaryColor" TEXT NOT NULL DEFAULT '#c9a84c',
    "seoTitle" TEXT NOT NULL DEFAULT 'Hernandez Auto Detailing',
    "seoDescription" TEXT NOT NULL DEFAULT 'Professional car detailing. Book your appointment online.',
    "slotIntervalMin" INTEGER NOT NULL DEFAULT 60,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_manageToken_key" ON "appointments"("manageToken");

-- CreateIndex
CREATE INDEX "appointments_date_time_idx" ON "appointments"("date", "time");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
