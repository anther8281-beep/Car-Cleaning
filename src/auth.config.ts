import type { NextAuthConfig, Session } from "next-auth";

// Edge-safe base config shared by the proxy (middleware) and the full server
// config in `auth.ts`. It deliberately contains NO database or Node-only
// imports (Prisma, bcrypt) so it can run in the edge runtime.
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/secure-admin-login",
  },
  session: {
    strategy: "jwt",
    // 30-minute idle session timeout.
    maxAge: 30 * 60,
    updateAge: 5 * 60,
  },
  callbacks: {
    jwt({ token, user }) {
      // On sign-in, copy our custom fields onto the token.
      if (user) {
        token.role = user.role;
        token.mfaEnabled = user.mfaEnabled;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      // token fields are populated in the jwt callback above; coerce defensively
      // in case the JWT module augmentation is not picked up at the call site.
      session.user.role = (token.role ??
        "ADMIN") as Session["user"]["role"];
      session.user.mfaEnabled = Boolean(token.mfaEnabled);
      return session;
    },
  },
  providers: [], // real providers are added in auth.ts (Node runtime only)
} satisfies NextAuthConfig;
