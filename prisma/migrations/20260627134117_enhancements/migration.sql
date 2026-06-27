-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AppointmentStatus" ADD VALUE 'COMPLETED';
ALTER TYPE "AppointmentStatus" ADD VALUE 'NO_SHOW';

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "durationMinutes" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "priceCents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "address" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "leadTimeHours" INTEGER NOT NULL DEFAULT 12,
ADD COLUMN     "maxAdvanceDays" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "seoKeywords" TEXT NOT NULL DEFAULT 'car detailing, auto detailing, car wash',
ADD COLUMN     "tagline" TEXT NOT NULL DEFAULT 'Professional auto detailing, done right.';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "name" TEXT,
ADD COLUMN     "recoveryCodes" TEXT[] DEFAULT ARRAY[]::TEXT[];
