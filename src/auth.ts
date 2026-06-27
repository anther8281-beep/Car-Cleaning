import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { verifyTotp } from "@/lib/auth/totp";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  token: z.string().optional(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        token: {},
      },
      // This is the strict final gate. The login UI pre-checks credentials and
      // MFA in stages, but authorize re-validates everything so a session is
      // only ever issued when email + password (+ TOTP when enabled) all pass.
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password, token } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user) return null;

        const passwordOk = await compare(password, user.passwordHash);
        if (!passwordOk) return null;

        if (user.mfaEnabled) {
          if (!user.totpSecret || !token) return null;
          if (!verifyTotp(user.totpSecret, token)) return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          mfaEnabled: user.mfaEnabled,
        };
      },
    }),
  ],
});
