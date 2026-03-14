import { describe, it, expect } from "vitest";
import { fmtDate } from "../dates";

describe("fmtDate", () => {
  it("formats a Date object", () => {
    const result = fmtDate(new Date("2025-03-15T00:00:00Z"));
    expect(result).toBe("MAR 2025");
  });

  it("formats a date string", () => {
    const result = fmtDate("2025-08-16");
    expect(result).toBe("AUG 2025");
  });

  it("handles January correctly", () => {
    expect(fmtDate(new Date("2026-01-01T00:00:00Z"))).toBe("JAN 2026");
  });

  it("handles December correctly", () => {
    expect(fmtDate("2025-12-31")).toBe("DEC 2025");
  });
});
