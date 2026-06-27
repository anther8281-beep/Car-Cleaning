import { randomBytes } from "node:crypto";
import { hash, compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const CODE_COUNT = 10;

/** Format a random buffer as a readable XXXX-XXXX code (base32-ish, no ambiguity). */
function formatCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += alphabet[bytes[i] % alphabet.length];
    if (i === 3) out += "-";
  }
  return out;
}

/**
 * Generate a fresh set of recovery codes. Returns the plaintext codes (shown to
 * the user ONCE) and their bcrypt hashes (stored on the user).
 */
export async function generateRecoveryCodes(): Promise<{
  plain: string[];
  hashed: string[];
}> {
  const plain = Array.from({ length: CODE_COUNT }, formatCode);
  const hashed = await Promise.all(plain.map((c) => hash(c, 10)));
  return { plain, hashed };
}

/**
 * Check a submitted recovery code against the user's stored hashes. On a match,
 * the code is removed (single‑use) and true is returned.
 */
export async function consumeRecoveryCode(
  userId: string,
  submitted: string,
): Promise<boolean> {
  const normalized = submitted.trim().toUpperCase();
  if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalized)) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { recoveryCodes: true },
  });
  if (!user) return false;

  for (const codeHash of user.recoveryCodes) {
    if (await compare(normalized, codeHash)) {
      await prisma.user.update({
        where: { id: userId },
        data: { recoveryCodes: user.recoveryCodes.filter((c) => c !== codeHash) },
      });
      return true;
    }
  }
  return false;
}
