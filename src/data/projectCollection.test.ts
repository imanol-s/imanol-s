// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { getSortedProjects, getProjectPageData, PLACEHOLDER_URL } from './projectCollection';

// Minimal shape matching what the functions need
function makeProject(id: string, startDate: Date, title = id, url?: string) {
  return { id, data: { startDate, title, url } };
}

const older = makeProject('a', new Date('2023-01-01'), 'Alpha');
const newer = makeProject('b', new Date('2024-06-01'), 'Beta');
const newest = makeProject('c', new Date('2025-03-01'), 'Gamma');

describe('getSortedProjects', () => {
  it('sorts newest startDate first', () => {
    const sorted = getSortedProjects([older, newest, newer]);
    expect(sorted.map(p => p.id)).toEqual(['c', 'b', 'a']);
  });

  it('does not mutate the input array', () => {
    const input = [older, newest, newer];
    getSortedProjects(input);
    expect(input.map(p => p.id)).toEqual(['a', 'c', 'b']);
  });
});

describe('getProjectPageData', () => {
  const sorted = [newest, newer, older]; // c, b, a — newest first

  it('returns correct label for first project (index 0)', () => {
    const { label } = getProjectPageData(sorted, 'c');
    expect(label).toBe('Project 01');
  });

  it('returns correct label for middle project', () => {
    const { label } = getProjectPageData(sorted, 'b');
    expect(label).toBe('Project 02');
  });

  it('returns correct label for last project', () => {
    const { label } = getProjectPageData(sorted, 'a');
    expect(label).toBe('Project 03');
  });

  it('returns null prev for the first project', () => {
    const { prev } = getProjectPageData(sorted, 'c');
    expect(prev).toBeNull();
  });

  it('returns null next for the last project', () => {
    const { next } = getProjectPageData(sorted, 'a');
    expect(next).toBeNull();
  });

  it('returns correct prev and next for a middle project', () => {
    const { prev, next } = getProjectPageData(sorted, 'b');
    expect(prev?.id).toBe('c');
    expect(next?.id).toBe('a');
  });

  it('returns null prev and next for a single-project collection', () => {
    const single = [makeProject('x', new Date('2024-01-01'))];
    const { prev, next } = getProjectPageData(single, 'x');
    expect(prev).toBeNull();
    expect(next).toBeNull();
  });

  describe('hasValidUrl', () => {
    it('returns false for undefined url', () => {
      const { hasValidUrl } = getProjectPageData(sorted, 'c');
      expect(hasValidUrl).toBe(false);
    });

    it('returns false for empty string', () => {
      const projects = [makeProject('x', new Date(), 'X', '')];
      expect(getProjectPageData(projects, 'x').hasValidUrl).toBe(false);
    });

    it('returns false for whitespace-only string', () => {
      const projects = [makeProject('x', new Date(), 'X', '   ')];
      expect(getProjectPageData(projects, 'x').hasValidUrl).toBe(false);
    });

    it('returns false for the placeholder URL', () => {
      const projects = [makeProject('x', new Date(), 'X', PLACEHOLDER_URL)];
      expect(getProjectPageData(projects, 'x').hasValidUrl).toBe(false);
    });

    it('returns true for a real URL', () => {
      const projects = [makeProject('x', new Date(), 'X', 'https://github.com/user/repo')];
      expect(getProjectPageData(projects, 'x').hasValidUrl).toBe(true);
    });
  });
});

describe('PLACEHOLDER_URL', () => {
  it('is a non-empty string', () => {
    expect(typeof PLACEHOLDER_URL).toBe('string');
    expect(PLACEHOLDER_URL.length).toBeGreaterThan(0);
  });
});
