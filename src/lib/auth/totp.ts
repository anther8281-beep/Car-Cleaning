import { generateSecret, generateURI, verifySync } from "otplib";

const ISSUER = "Hernandez Auto Detailing";

/** Create a new base32 TOTP secret for an authenticator app. */
export function createTotpSecret(): string {
  return generateSecret();
}

/** Build the otpauth:// URI used to render a QR code for the authenticator app. */
export function totpUri(secret: string, accountLabel: string): string {
  return generateURI({
    strategy: "totp",
    issuer: ISSUER,
    label: accountLabel,
    secret,
  });
}

/**
 * Verify a 6-digit TOTP token against the secret. A tolerance of 1 step
 * accepts the immediately previous/next code to absorb clock drift.
 */
export function verifyTotp(secret: string, token: string): boolean {
  const cleaned = token.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleaned)) return false;
  try {
    // epochTolerance is in seconds; one 30s step of drift each way.
    return verifySync({ secret, token: cleaned, epochTolerance: 30 }).valid;
  } catch {
    return false;
  }
}
