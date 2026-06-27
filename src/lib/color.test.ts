import { describe, it, expect } from "vitest";
import { safeHexColor } from "./color";

describe("safeHexColor", () => {
  it("accepts valid hex colors", () => {
    expect(safeHexColor("#fff", "#000")).toBe("#fff");
    expect(safeHexColor("#1a2e5a", "#000")).toBe("#1a2e5a");
    expect(safeHexColor("#1a2e5aff", "#000")).toBe("#1a2e5aff");
  });

  it("falls back on invalid or malicious input", () => {
    expect(safeHexColor("red", "#000")).toBe("#000");
    expect(safeHexColor("#1a2e5a; background:url(x)", "#000")).toBe("#000");
    expect(safeHexColor("", "#000")).toBe("#000");
    expect(safeHexColor("javascript:alert(1)", "#000")).toBe("#000");
  });
});
