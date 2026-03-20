// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prefersReducedMotion, REDUCED_MOTION_QUERY } from './prefersReducedMotion';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: false,
      media: query,
    })),
  });
});

describe('REDUCED_MOTION_QUERY', () => {
  it('is the correct media query string', () => {
    expect(REDUCED_MOTION_QUERY).toBe('(prefers-reduced-motion: reduce)');
  });
});

describe('prefersReducedMotion', () => {
  it('returns false when no preference set', () => {
    expect(prefersReducedMotion()).toBe(false);
  });

  it('returns true when reduced motion preferred', () => {
    (window.matchMedia as ReturnType<typeof vi.fn>).mockReturnValue({ matches: true });
    expect(prefersReducedMotion()).toBe(true);
  });
});
