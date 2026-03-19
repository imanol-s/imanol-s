// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prefersReducedMotion } from './prefersReducedMotion';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: false,
      media: query,
    })),
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
