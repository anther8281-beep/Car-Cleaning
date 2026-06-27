"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";
import { createTotpSecret, verifyTotp } from "@/lib/auth/totp";
import { logAudit } from "@/lib/audit";

/**
 * Ensure the current user has a pending TOTP secret to enroll. The secret is
 * stored immediately (with mfaEnabled still false) so it survives the
 * generate -> scan -> verify round-trip. Returns the active secret.
 */
export async function ensureTotpSecret(): Promise<string> {
  const session = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });
  if (user.totpSecret && !user.mfaEnabled) {
    return user.totpSecret;
  }
  if (user.mfaEnabled && user.totpSecret) {
    return user.totpSecret;
  }
  const secret = createTotpSecret();
  await prisma.user.update({
    where: { id: user.id },
    data: { totpSecret: secret },
  });
  return secret;
}

export type EnableMfaState = { error?: string };

export async function enableMfa(
  _prev: EnableMfaState,
  formData: FormData,
): Promise<EnableMfaState> {
  const session = await requireUser();
  const token = String(formData.get("token") ?? "").trim();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });
  if (!user.totpSecret) {
    return { error: "No pending secret. Reload the page and try again." };
  }
  if (!verifyTotp(user.totpSecret, token)) {
    return { error: "That code didn't match. Try the current code." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { mfaEnabled: true },
  });
  await logAudit({
    userId: user.id,
    action: "auth.mfa.enabled",
    target: user.email,
  });

  redirect("/admin-dashboard");
}
