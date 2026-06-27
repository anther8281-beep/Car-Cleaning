import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { DEFAULT_SERVICES, DEFAULT_HOURS } from "../src/lib/types";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Settings singleton (idempotent upsert).
  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      businessName: "Hernandez Auto Detailing",
      phone: "",
      contactEmail: process.env.OWNER_EMAIL ?? "",
      services: DEFAULT_SERVICES,
      hours: DEFAULT_HOURS,
      primaryColor: "#1a2e5a",
      secondaryColor: "#c9a84c",
      seoTitle: "Hernandez Auto Detailing | Professional Car Detailing",
      seoDescription:
        "Professional interior and exterior car detailing. Book your appointment online in minutes.",
    },
  });
  console.log("✔ Settings seeded");

  // 2. First admin/owner account.
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn(
      "⚠ SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping admin user creation.",
    );
  } else {
    const passwordHash = await hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: {},
      create: {
        email: adminEmail.toLowerCase(),
        passwordHash,
        role: "OWNER",
      },
    });
    console.log(`✔ Owner account seeded: ${adminEmail.toLowerCase()}`);
    console.log("  → Log in, then set up MFA on first sign-in.");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
