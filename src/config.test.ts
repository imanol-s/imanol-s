import { describe, it, expect } from 'vitest';
import { SITE, ME, SOCIALS } from './config';
import { lookupTech } from './data/techRegistry';

// Simple URL validation: must start with http:// or https://
const URL_RE = /^https?:\/\/.+/;

describe('SITE', () => {
  it('has a non-empty title', () => {
    expect(typeof SITE.title).toBe('string');
    expect(SITE.title.length).toBeGreaterThan(0);
  });

  it('has a non-empty description', () => {
    expect(typeof SITE.description).toBe('string');
    expect(SITE.description.length).toBeGreaterThan(0);
  });

  it('website is a valid URL', () => {
    expect(SITE.website).toMatch(URL_RE);
  });

  it('repository is a valid URL', () => {
    expect(SITE.repository).toMatch(URL_RE);
  });

  it('profile is a valid URL', () => {
    expect(SITE.profile).toMatch(URL_RE);
  });

  it('has a non-empty author', () => {
    expect(typeof SITE.author).toBe('string');
    expect(SITE.author.length).toBeGreaterThan(0);
  });

  it('lang is a non-empty string', () => {
    expect(typeof SITE.lang).toBe('string');
    expect(SITE.lang.length).toBeGreaterThan(0);
  });

  it('ogImage starts with a slash (root-relative path)', () => {
    expect(SITE.ogImage).toMatch(/^\//);
  });

  it('favicon starts with a slash (root-relative path)', () => {
    expect(SITE.favicon).toMatch(/^\//);
  });

  it('tags is a non-empty array of strings', () => {
    expect(Array.isArray(SITE.tags)).toBe(true);
    expect(SITE.tags.length).toBeGreaterThan(0);
    for (const tag of SITE.tags) {
      expect(typeof tag).toBe('string');
    }
  });
});

describe('ME', () => {
  it('has a non-empty name', () => {
    expect(typeof ME.name).toBe('string');
    expect(ME.name.length).toBeGreaterThan(0);
  });

  it('profession is a non-empty array of strings', () => {
    expect(Array.isArray(ME.profession)).toBe(true);
    expect(ME.profession.length).toBeGreaterThan(0);
    for (const p of ME.profession) {
      expect(typeof p).toBe('string');
      expect(p.length).toBeGreaterThan(0);
    }
  });

  it('has a non-empty aboutMe', () => {
    expect(typeof ME.aboutMe).toBe('string');
    expect(ME.aboutMe.length).toBeGreaterThan(0);
  });

  it('has a non-empty location', () => {
    expect(typeof ME.location).toBe('string');
    expect(ME.location.length).toBeGreaterThan(0);
  });

  it('focusAreas is a non-empty array of strings', () => {
    expect(Array.isArray(ME.focusAreas)).toBe(true);
    expect(ME.focusAreas.length).toBeGreaterThan(0);
    for (const area of ME.focusAreas) {
      expect(typeof area).toBe('string');
      expect(area.length).toBeGreaterThan(0);
    }
  });

  it('competencies is a non-empty array of strings', () => {
    expect(Array.isArray(ME.competencies)).toBe(true);
    expect(ME.competencies.length).toBeGreaterThan(0);
    for (const c of ME.competencies) {
      expect(typeof c).toBe('string');
      expect(c.length).toBeGreaterThan(0);
    }
  });

  it('languages is a non-empty array with name and level fields', () => {
    expect(Array.isArray(ME.languages)).toBe(true);
    expect(ME.languages.length).toBeGreaterThan(0);
    for (const lang of ME.languages) {
      expect(typeof lang.name).toBe('string');
      expect(lang.name.length).toBeGreaterThan(0);
      expect(typeof lang.level).toBe('string');
      expect(lang.level.length).toBeGreaterThan(0);
    }
  });

  it('contactInfo.email is a non-empty string', () => {
    expect(typeof ME.contactInfo.email).toBe('string');
    expect(ME.contactInfo.email.length).toBeGreaterThan(0);
    expect(ME.contactInfo.email).toContain('@');
  });

  it('contactInfo.linkedin is a valid URL', () => {
    expect(ME.contactInfo.linkedin).toMatch(URL_RE);
  });

  it('contactInfo.resumeDoc is a non-empty string', () => {
    expect(typeof ME.contactInfo.resumeDoc).toBe('string');
    expect(ME.contactInfo.resumeDoc.length).toBeGreaterThan(0);
  });

  it('coreLanguages is a non-empty array', () => {
    expect(Array.isArray(ME.coreLanguages)).toBe(true);
    expect(ME.coreLanguages.length).toBeGreaterThan(0);
  });

  it('every coreLanguage TechId exists in the techRegistry', () => {
    for (const techId of ME.coreLanguages) {
      const entry = lookupTech(techId);
      expect(entry, `TechId "${techId}" not found in techRegistry`).not.toBeNull();
    }
  });
});

describe('SOCIALS', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(SOCIALS)).toBe(true);
    expect(SOCIALS.length).toBeGreaterThan(0);
  });

  it('every entry has a non-empty name', () => {
    for (const social of SOCIALS) {
      expect(typeof social.name).toBe('string');
      expect(social.name.length).toBeGreaterThan(0);
    }
  });

  it('every entry has a valid URL', () => {
    for (const social of SOCIALS) {
      expect(social.url, `${social.name} url is not a valid URL`).toMatch(URL_RE);
    }
  });

  it('every entry has a non-empty icon string', () => {
    for (const social of SOCIALS) {
      expect(typeof social.icon).toBe('string');
      expect(social.icon.length).toBeGreaterThan(0);
    }
  });

  it('every entry has a boolean show field', () => {
    for (const social of SOCIALS) {
      expect(typeof social.show).toBe('boolean');
    }
  });
});
