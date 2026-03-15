import { describe, it, expect } from "vitest";
import { SITE, ME, SOCIALS } from "./config";
import jobs from "./data/jobs";
import education from "./data/education";
import { getTechIconPath } from "./data/techIcons";

describe("config-to-page data pipeline", () => {
  it("SITE fields used by Layout.astro are present and valid", () => {
    expect(SITE.title).toBeTruthy();
    expect(SITE.description).toBeTruthy();
    expect(SITE.author).toBeTruthy();
    expect(SITE.tags.length).toBeGreaterThan(0);
    expect(SITE.lang).toBeTruthy();
    expect(SITE.favicon).toMatch(/\.\w+$/);
    expect(SITE.ogImage).toMatch(/\.\w+$/);
    expect(SITE.logoText).toBeTruthy();
  });

  it("ME fields used by index.astro are present", () => {
    expect(ME.name).toBeTruthy();
    expect(ME.bio).toBeTruthy();
    expect(ME.profession.length).toBeGreaterThan(0);
    expect(ME.profileImage).toBeTruthy();
    expect(ME.focusAreas.length).toBeGreaterThan(0);
    expect(ME.coreLanguages.length).toBeGreaterThan(0);
    expect(ME.competencies.length).toBeGreaterThan(0);
    expect(ME.languages.length).toBeGreaterThan(0);
    expect(ME.location).toBeTruthy();
  });

  it("ME.contactInfo used by SiteHeader and SiteFooter is valid", () => {
    expect(ME.contactInfo.email).toMatch(/.+@.+/);
    expect(ME.contactInfo.linkedin).toMatch(/^https?:\/\//);
    expect(ME.contactInfo.resumeDoc).toMatch(/\.\w+$/);
  });

  it("SOCIALS used by index.astro and SiteFooter have valid URLs", () => {
    expect(SOCIALS.length).toBeGreaterThan(0);
    for (const social of SOCIALS) {
      expect(social.url).toMatch(/^https?:\/\//);
    }
  });

  it("jobs used by index.astro has valid date ranges", () => {
    for (const job of jobs) {
      const start = new Date(job.startDate);
      expect(start.getTime()).not.toBeNaN();
      if (job.endDate) {
        const end = new Date(job.endDate);
        expect(end.getTime()).not.toBeNaN();
        expect(end.getTime()).toBeGreaterThanOrEqual(start.getTime());
      }
    }
  });

  it("education used by index.astro has required fields", () => {
    expect(education.length).toBeGreaterThan(0);
    expect(education[0].title).toBeTruthy();
    expect(education[0].school).toBeTruthy();
  });

  it("getTechIconPath returns valid paths for known techs", () => {
    const pythonPath = getTechIconPath("Python");
    expect(pythonPath).toMatch(/\.svg$/);

    const unknownPath = getTechIconPath("nonexistent-tech-xyz");
    expect(unknownPath).toBeNull();
  });
});
