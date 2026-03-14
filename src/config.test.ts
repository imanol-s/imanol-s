import { describe, it, expect } from "vitest";
import { SITE, ME, SOCIALS } from "./config";

describe("SITE config", () => {
  it("has a valid website URL", () => {
    expect(SITE.website).toMatch(/^https?:\/\//);
  });

  it("has required fields", () => {
    expect(SITE.title).toBeTruthy();
    expect(SITE.description).toBeTruthy();
    expect(SITE.author).toBeTruthy();
    expect(SITE.lang).toBeTruthy();
  });
});

describe("ME config", () => {
  it("has required identity fields", () => {
    expect(ME.name).toBeTruthy();
    expect(ME.profession.length).toBeGreaterThan(0);
    expect(ME.profileImage).toBeTruthy();
  });

  it("has contact info", () => {
    expect(ME.contactInfo.email).toBeTruthy();
    expect(ME.contactInfo.linkedin).toMatch(/^https?:\/\//);
    expect(ME.contactInfo.resumeDoc).toBeTruthy();
  });

  it("has a bio", () => {
    expect(ME.bio).toBeTruthy();
  });
});

describe("SOCIALS config", () => {
  it("has at least one social link", () => {
    expect(SOCIALS.length).toBeGreaterThan(0);
  });

  it("each entry has required fields", () => {
    for (const social of SOCIALS) {
      expect(social.name).toBeTruthy();
      expect(social.url).toMatch(/^https?:\/\//);
      expect(social.icon).toBeTruthy();
      expect(typeof social.show).toBe("boolean");
    }
  });
});
