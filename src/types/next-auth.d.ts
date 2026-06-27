import type { DefaultSession } from "next-auth";
import type { Role } from "@/generated/prisma/client";

// Augment NextAuth's types so `role` and `mfaEnabled` flow through the
// User -> JWT -> Session pipeline with full type-safety.
declare module "next-auth" {
  interface User {
    role: Role;
    mfaEnabled: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      mfaEnabled: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    mfaEnabled: boolean;
  }
}
