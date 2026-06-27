import { describe, it, expect } from "vitest";
import { formatTime, formatTimeRange } from "./time";

describe("formatTime", () => {
  it("converts 24h times to 12h AM/PM", () => {
    expect(formatTime("00:00")).toBe("12:00 AM");
    expect(formatTime("09:00")).toBe("9:00 AM");
    expect(formatTime("11:30")).toBe("11:30 AM");
    expect(formatTime("12:00")).toBe("12:00 PM");
    expect(formatTime("13:00")).toBe("1:00 PM");
    expect(formatTime("18:00")).toBe("6:00 PM");
    expect(formatTime("23:45")).toBe("11:45 PM");
  });

  it("returns the input unchanged when it is not HH:mm", () => {
    expect(formatTime("nonsense")).toBe("nonsense");
  });
});

describe("formatTimeRange", () => {
  it("formats an open/close range", () => {
    expect(formatTimeRange("08:00", "18:00")).toBe("8:00 AM – 6:00 PM");
  });
});
