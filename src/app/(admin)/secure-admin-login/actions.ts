"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { compare } from "bcryptjs";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

// Lock the account after this many consecutive failed passwords.
const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;

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

  const userAgent = hdrs.get("user-agent") ?? undefined;
  const user = await prisma.user.findUnique({ where: { email } });

  // Account lockout guard (in addition to IP rate limiting).
  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    await logAudit({
      userId: user.id,
      action: "auth.login.locked",
      target: email,
      ipAddress: ip,
      userAgent,
    });
    return {
      stage: "credentials",
      error: "Account temporarily locked due to failed attempts. Try again later.",
    };
  }

  const passwordOk = user ? await compare(password, user.passwordHash) : false;

  if (!user || !passwordOk) {
    if (user) {
      const failed = user.failedLoginCount + 1;
      const lock = failed >= MAX_FAILED_LOGINS;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: lock ? 0 : failed,
          lockedUntil: lock
            ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
            : null,
        },
      });
    }
    await logAudit({
      userId: user?.id,
      action: "auth.login.failed",
      target: email,
      ipAddress: ip,
      userAgent,
    });
    return { stage: "credentials", error: "Invalid email or password." };
  }

  // Password is correct — ask for the second factor when MFA is enabled.
  if (user.mfaEnabled && !token) {
    return { stage: "mfa" };
  }

  // Establish the session. authorize() verifies the second factor (TOTP or a
  // single-use recovery code) and consumes recovery codes.
  try {
    await signIn("credentials", { email, password, token, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return user.mfaEnabled
        ? { stage: "mfa", error: "Invalid authenticator or recovery code." }
        : { stage: "credentials", error: "Could not sign in." };
    }
    throw error;
  }

  // Success — clear lockout counters and record the login.
  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
  resetRateLimit(`login:${email}:${ip}`);
  await logAudit({
    userId: user.id,
    action: "auth.login.success",
    target: email,
    ipAddress: ip,
    userAgent,
  });

  // First-time users (no MFA yet) are sent to set it up.
  redirect(user.mfaEnabled ? "/admin-dashboard" : "/admin-dashboard/setup-mfa");
}
