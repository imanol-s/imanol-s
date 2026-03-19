// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from './useReducedMotion';

let listeners: Map<string, ((e: { matches: boolean }) => void)>;
let currentMatches: boolean;

beforeEach(() => {
  listeners = new Map();
  currentMatches = false;

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: currentMatches,
      media: query,
      addEventListener: (_event: string, handler: (e: { matches: boolean }) => void) => {
        listeners.set(query, handler);
      },
      removeEventListener: (_event: string) => {
        listeners.delete(query);
      },
    })),
  });
});

describe('useReducedMotion', () => {
  it('returns false when user has no motion preference', () => {
    currentMatches = false;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when user prefers reduced motion', () => {
    currentMatches = true;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('updates reactively when preference changes', () => {
    currentMatches = false;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      const handler = listeners.get('(prefers-reduced-motion: reduce)');
      handler?.({ matches: true });
    });
    expect(result.current).toBe(true);
  });

  it('cleans up listener on unmount', () => {
    const { unmount } = renderHook(() => useReducedMotion());
    expect(listeners.has('(prefers-reduced-motion: reduce)')).toBe(true);
    unmount();
    expect(listeners.has('(prefers-reduced-motion: reduce)')).toBe(false);
  });
});
