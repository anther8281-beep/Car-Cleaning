import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Reuse a single PrismaClient across hot-reloads in development to avoid
// exhausting database connections.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  // Prisma 7 uses driver adapters instead of the bundled query engine.
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
