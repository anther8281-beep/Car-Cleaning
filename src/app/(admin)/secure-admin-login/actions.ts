"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { compare } from "bcryptjs";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { verifyTotp } from "@/lib/auth/totp";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

export type LoginState = {
  stage: "credentials" | "mfa";
  error?: string;
};

export async function authenticate(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");
  const token = String(formData.get("token") ?? "").trim();

  if (!email || !password) {
    return { stage: "credentials", error: "Email and password are required." };
  }

  // Rate limit by email + client IP to slow brute-force attempts.
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    "unknown";
  const limit = rateLimit(`login:${email}:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.success) {
    return {
      stage: "credentials",
      error: "Too many attempts. Please wait a few minutes and try again.",
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const passwordOk = user ? await compare(password, user.passwordHash) : false;

  if (!user || !passwordOk) {
    await logAudit({
      action: "auth.login.failed",
      target: email,
      ipAddress: ip,
    });
    return { stage: "credentials", error: "Invalid email or password." };
  }

  // Password is correct — enforce MFA when enabled.
  if (user.mfaEnabled) {
    if (!token) {
      return { stage: "mfa" };
    }
    if (!user.totpSecret || !verifyTotp(user.totpSecret, token)) {
      return { stage: "mfa", error: "Invalid authenticator code." };
    }
  }

  // All factors satisfied — establish the session.
  try {
    await signIn("credentials", { email, password, token, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { stage: "credentials", error: "Could not sign in." };
    }
    throw error;
  }

  resetRateLimit(`login:${email}:${ip}`);
  await logAudit({
    userId: user.id,
    action: "auth.login.success",
    target: email,
    ipAddress: ip,
  });

  // First-time users (no MFA yet) are sent to set it up.
  redirect(user.mfaEnabled ? "/admin-dashboard" : "/admin-dashboard/setup-mfa");
}
