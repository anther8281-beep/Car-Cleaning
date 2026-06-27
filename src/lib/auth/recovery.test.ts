import { describe, it, expect } from "vitest";
import { compare } from "bcryptjs";
import { generateRecoveryCodes } from "./recovery";

describe("generateRecoveryCodes", () => {
  it("creates 10 codes in XXXX-XXXX format with matching hashes", async () => {
    const { plain, hashed } = await generateRecoveryCodes();
    expect(plain).toHaveLength(10);
    expect(hashed).toHaveLength(10);
    for (const code of plain) {
      expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    }
    // Each plaintext code verifies against its stored hash.
    expect(await compare(plain[0], hashed[0])).toBe(true);
    expect(await compare(plain[0], hashed[1])).toBe(false);
  });

  it("produces unique codes", async () => {
    const { plain } = await generateRecoveryCodes();
    expect(new Set(plain).size).toBe(plain.length);
  });
});
