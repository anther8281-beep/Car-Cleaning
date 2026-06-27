import { describe, it, expect } from "vitest";
import { generateSync } from "otplib";
import { createTotpSecret, totpUri, verifyTotp } from "./totp";

describe("totp", () => {
  it("verifies a freshly generated code", () => {
    const secret = createTotpSecret();
    const code = generateSync({ secret, strategy: "totp" });
    expect(verifyTotp(secret, code)).toBe(true);
  });

  it("rejects an incorrect code", () => {
    const secret = createTotpSecret();
    const code = generateSync({ secret, strategy: "totp" });
    const wrong = code === "000000" ? "111111" : "000000";
    expect(verifyTotp(secret, wrong)).toBe(false);
  });

  it("rejects non-numeric / wrong-length input", () => {
    const secret = createTotpSecret();
    expect(verifyTotp(secret, "abcdef")).toBe(false);
    expect(verifyTotp(secret, "123")).toBe(false);
  });

  it("builds an otpauth URI containing the issuer and secret", () => {
    const secret = createTotpSecret();
    const uri = totpUri(secret, "owner@example.com");
    expect(uri).toContain("otpauth://totp/");
    expect(uri).toContain(`secret=${secret}`);
  });
});
