// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDarkMode } from './useDarkMode';

type MqlHandler = (e: { matches: boolean }) => void;

let mqlMatches: boolean;
let mqlListeners: MqlHandler[];

beforeEach(() => {
  mqlMatches = false;
  mqlListeners = [];

  // Reset html class
  document.documentElement.className = '';

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn(() => ({
      get matches() { return mqlMatches; },
      addEventListener: (_: string, handler: MqlHandler) => {
        mqlListeners.push(handler);
      },
      removeEventListener: (_: string, handler: MqlHandler) => {
        mqlListeners = mqlListeners.filter((h) => h !== handler);
      },
    })),
  });
});

describe('useDarkMode', () => {
  it('returns false when no dark signals are active', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current).toBe(false);
  });

  it('returns true when matchMedia reports dark on mount', () => {
    mqlMatches = true;
    const { result } = renderHook(() => useDarkMode());
    expect(result.current).toBe(true);
  });

  it('returns true when documentElement has "dark" class on mount', () => {
    document.documentElement.classList.add('dark');
    const { result } = renderHook(() => useDarkMode());
    expect(result.current).toBe(true);
  });

  it('returns false when documentElement has "light" class, overriding matchMedia', () => {
    mqlMatches = true; // OS says dark
    document.documentElement.classList.add('light'); // explicit override
    const { result } = renderHook(() => useDarkMode());
    expect(result.current).toBe(false);
  });

  it('updates reactively when matchMedia fires a change event', () => {
    mqlMatches = false;
    const { result } = renderHook(() => useDarkMode());
    expect(result.current).toBe(false);

    act(() => {
      mqlMatches = true;
      mqlListeners.forEach((h) => h({ matches: true }));
    });
    expect(result.current).toBe(true);
  });

  it('updates reactively when "dark" class is added to documentElement', async () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current).toBe(false);

    await act(async () => {
      document.documentElement.classList.add('dark');
      // MutationObserver callbacks are microtask-queued in jsdom
      await Promise.resolve();
    });
    expect(result.current).toBe(true);
  });

  it('updates reactively when "dark" class is removed from documentElement', async () => {
    document.documentElement.classList.add('dark');
    const { result } = renderHook(() => useDarkMode());
    expect(result.current).toBe(true);

    await act(async () => {
      document.documentElement.classList.remove('dark');
      await Promise.resolve();
    });
    expect(result.current).toBe(false);
  });

  it('cleans up observers on unmount', () => {
    const { unmount } = renderHook(() => useDarkMode());
    unmount();
    // After unmount, no listeners remain registered
    expect(mqlListeners.length).toBe(0);
  });
});
