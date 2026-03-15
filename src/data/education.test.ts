import { describe, it, expect } from "vitest";
import education from "./education";

describe("education data", () => {
  it("exports a non-empty array", () => {
    expect(education.length).toBeGreaterThan(0);
  });

  it("each entry has required fields", () => {
    for (const entry of education) {
      expect(entry.title).toBeTruthy();
      expect(entry.school).toBeTruthy();
      expect(entry.location).toBeTruthy();
    }
  });
});
