import { describe, it, expect } from "vitest";
import { bookingSchema, settingsSchema, serviceSchema } from "./validation";

describe("bookingSchema", () => {
  const valid = {
    customerName: "Jane Doe",
    phone: "5551234567",
    email: "jane@example.com",
    service: "Basic Exterior Wash",
    date: "2026-06-29",
    time: "09:00",
    notes: "",
  };

  it("accepts a valid booking", () => {
    expect(bookingSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a bad email", () => {
    expect(
      bookingSchema.safeParse({ ...valid, email: "nope" }).success,
    ).toBe(false);
  });

  it("rejects a malformed date and time", () => {
    expect(bookingSchema.safeParse({ ...valid, date: "6/29/26" }).success).toBe(
      false,
    );
    expect(bookingSchema.safeParse({ ...valid, time: "9am" }).success).toBe(
      false,
    );
  });

  it("requires a name", () => {
    expect(
      bookingSchema.safeParse({ ...valid, customerName: "" }).success,
    ).toBe(false);
  });
});

describe("serviceSchema", () => {
  it("coerces numeric strings for price and duration", () => {
    const parsed = serviceSchema.safeParse({
      id: "svc",
      name: "Wash",
      description: "",
      durationMinutes: "60",
      price: "40",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.durationMinutes).toBe(60);
      expect(parsed.data.price).toBe(40);
    }
  });
});

describe("settingsSchema", () => {
  const base = {
    businessName: "Hernandez Auto Detailing",
    phone: "",
    contactEmail: "",
    seoTitle: "Title",
    seoDescription: "",
    logoUrl: "",
    primaryColor: "#1a2e5a",
    secondaryColor: "#c9a84c",
    slotIntervalMin: "60",
    services: [],
    hours: {
      mon: { open: "08:00", close: "18:00" },
      tue: null,
      wed: null,
      thu: null,
      fri: null,
      sat: null,
      sun: null,
    },
  };

  it("accepts a valid settings payload", () => {
    expect(settingsSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a non-hex color", () => {
    expect(
      settingsSchema.safeParse({ ...base, primaryColor: "navy" }).success,
    ).toBe(false);
  });

  it("rejects hours where close is before open", () => {
    const bad = {
      ...base,
      hours: { ...base.hours, mon: { open: "18:00", close: "08:00" } },
    };
    expect(settingsSchema.safeParse(bad).success).toBe(false);
  });
});
