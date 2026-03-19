// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOverlayReady } from './useOverlayReady';
import { signalOverlayReady } from '../utils/overlayReady';

beforeEach(() => {
  vi.useFakeTimers();
  const win = window as unknown as Record<string, unknown>;
  delete win.__overlayReady;

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useOverlayReady', () => {
  it('returns false initially when overlay has not signaled', () => {
    const { result } = renderHook(() => useOverlayReady());
    expect(result.current).toBe(false);
  });

  it('returns true after signalOverlayReady fires', async () => {
    const { result } = renderHook(() => useOverlayReady());
    expect(result.current).toBe(false);

    await act(async () => {
      signalOverlayReady();
      // Flush the promise .then()
      await Promise.resolve();
    });

    expect(result.current).toBe(true);
  });

  it('returns true immediately when reduced motion is preferred', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useOverlayReady());
    expect(result.current).toBe(true);
  });

  it('falls back to true after timeout if signal never fires', async () => {
    const { result } = renderHook(() => useOverlayReady());
    expect(result.current).toBe(false);

    await act(async () => {
      vi.advanceTimersByTime(2000);
      await Promise.resolve();
    });

    expect(result.current).toBe(true);
  });

  it('cleans up on unmount without errors', async () => {
    const { unmount } = renderHook(() => useOverlayReady());
    unmount();
    // Signal after unmount should not throw
    signalOverlayReady();
    await Promise.resolve();
  });
});
