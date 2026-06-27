import { describe, it, expect } from "vitest";
import { signActionToken, verifyActionToken } from "./token";

describe("action tokens", () => {
  it("round-trips a valid token", () => {
    const token = signActionToken({ appointmentId: "appt_1", action: "approve" });
    const payload = verifyActionToken(token);
    expect(payload).not.toBeNull();
    expect(payload!.appointmentId).toBe("appt_1");
    expect(payload!.action).toBe("approve");
  });

  it("rejects a tampered token", () => {
    const token = signActionToken({ appointmentId: "appt_1", action: "approve" });
    const [body] = token.split(".");
    const forged = `${body}.deadbeef`;
    expect(verifyActionToken(forged)).toBeNull();
  });

  it("rejects a malformed token", () => {
    expect(verifyActionToken("garbage")).toBeNull();
    expect(verifyActionToken("")).toBeNull();
  });

  it("rejects an expired token", () => {
    const token = signActionToken(
      { appointmentId: "appt_1", action: "reject" },
      -1, // already expired
    );
    expect(verifyActionToken(token)).toBeNull();
  });
});
