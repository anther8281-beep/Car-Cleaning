import { describe, it, expect } from "vitest";
import {
  generateSlots,
  parseDateOnly,
  weekdayOf,
  slotEpoch,
  withinAdvanceWindow,
} from "./booking";

describe("parseDateOnly", () => {
  it("parses a valid YYYY-MM-DD into a UTC-midnight date", () => {
    const d = parseDateOnly("2026-06-29");
    expect(d).not.toBeNull();
    expect(d!.toISOString()).toBe("2026-06-29T00:00:00.000Z");
  });

  it("rejects malformed dates", () => {
    expect(parseDateOnly("2026-6-9")).toBeNull();
    expect(parseDateOnly("not-a-date")).toBeNull();
    expect(parseDateOnly("")).toBeNull();
  });
});

describe("weekdayOf", () => {
  it("maps dates to Monday-first weekday keys", () => {
    expect(weekdayOf(parseDateOnly("2026-06-29")!)).toBe("mon");
    expect(weekdayOf(parseDateOnly("2026-06-28")!)).toBe("sun");
    expect(weekdayOf(parseDateOnly("2026-06-27")!)).toBe("sat");
  });
});

describe("generateSlots", () => {
  it("generates slot starts at the interval within open hours", () => {
    const slots = generateSlots({ open: "08:00", close: "12:00" }, 60);
    expect(slots).toEqual(["08:00", "09:00", "10:00", "11:00"]);
  });

  it("does not emit a slot whose start + interval exceeds close", () => {
    const slots = generateSlots({ open: "08:00", close: "09:30" }, 60);
    expect(slots).toEqual(["08:00"]);
  });

  it("respects a 30-minute interval", () => {
    const slots = generateSlots({ open: "09:00", close: "10:30" }, 30);
    expect(slots).toEqual(["09:00", "09:30", "10:00"]);
  });

  it("returns no slots when the day is closed (null)", () => {
    expect(generateSlots(null, 60)).toEqual([]);
  });
});

describe("slotEpoch", () => {
  it("computes the UTC epoch of a date + time", () => {
    expect(slotEpoch("2026-06-29", "09:00")).toBe(
      Date.UTC(2026, 5, 29, 9, 0, 0),
    );
  });
});

describe("withinAdvanceWindow", () => {
  it("accepts a date inside the window", () => {
    const soon = new Date(Date.now() + 5 * 86400000);
    expect(withinAdvanceWindow(soon, 60)).toBe(true);
  });

  it("rejects a date beyond the window", () => {
    const far = new Date(Date.now() + 90 * 86400000);
    expect(withinAdvanceWindow(far, 60)).toBe(false);
  });
});
