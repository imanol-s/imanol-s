import { describe, it, expect } from "vitest";
import jobs from "./jobs";

describe("jobs data", () => {
  it("exports a non-empty array", () => {
    expect(jobs.length).toBeGreaterThan(0);
  });

  it("each entry has required fields", () => {
    for (const job of jobs) {
      expect(job.title).toBeTruthy();
      expect(job.company).toBeTruthy();
      expect(job.startDate).toBeTruthy();
      expect(job.location).toBeTruthy();
      expect(typeof job.currentJob).toBe("boolean");
      expect(Array.isArray(job.goals)).toBe(true);
    }
  });

  it("has at most one current job", () => {
    const currentJobs = jobs.filter((j) => j.currentJob);
    expect(currentJobs.length).toBeLessThanOrEqual(1);
  });

  it("dates are in valid ISO format", () => {
    for (const job of jobs) {
      expect(Date.parse(job.startDate)).not.toBeNaN();
      if (job.endDate) {
        expect(Date.parse(job.endDate)).not.toBeNaN();
      }
    }
  });
});
