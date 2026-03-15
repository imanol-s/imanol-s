import { describe, it, expect } from "vitest";
import { formatDate } from "./dates";

describe("formatDate", () => {
  it("formats a Date object", () => {
    const result = formatDate(new Date("2025-03-15T00:00:00Z"));
    expect(result).toBe("MAR 2025");
  });

  it("formats a date string", () => {
    const result = formatDate("2025-08-16");
    expect(result).toBe("AUG 2025");
  });

  it("handles January correctly", () => {
    expect(formatDate(new Date("2026-01-01T00:00:00Z"))).toBe("JAN 2026");
  });

  it("handles December correctly", () => {
    expect(formatDate("2025-12-31")).toBe("DEC 2025");
  });

  it("returns empty string for invalid date", () => {
    expect(formatDate("not-a-date")).toBe("");
    expect(formatDate(new Date("garbage"))).toBe("");
  });
});
