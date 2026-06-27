import { createHmac, timingSafeEqual } from "node:crypto";

// Compact signed tokens for owner email action links (approve/reject). The
// payload is HMAC-signed with AUTH_SECRET so links can't be forged, and they
// carry an expiry. Not a full JWT — intentionally tiny and dependency-free.

function secret(): string {
  const s = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64urlDecode(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

export type ActionPayload = {
  appointmentId: string;
  action: "approve" | "reject";
  exp: number; // epoch seconds
};

export function signActionToken(
  payload: Omit<ActionPayload, "exp">,
  ttlSeconds = 60 * 60 * 24 * 7,
): string {
  const full: ActionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = b64url(JSON.stringify(full));
  const sig = b64url(createHmac("sha256", secret()).update(body).digest());
  return `${body}.${sig}`;
}

export function verifyActionToken(token: string): ActionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = b64url(
    createHmac("sha256", secret()).update(body).digest(),
  );
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(b64urlDecode(body).toString()) as ActionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
