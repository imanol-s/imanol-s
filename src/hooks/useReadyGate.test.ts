// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Stub matchMedia before module loads
window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn() });

import { useReadyGate } from './useReadyGate';
import { _resetForTesting, dispatch } from './useSiteLifecycle';

describe('useReadyGate', () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn() });
    _resetForTesting();
  });

  it('returns false when lifecycle is not yet ready', () => {
    const { result } = renderHook(() => useReadyGate());
    expect(result.current).toBe(false);
  });

  it('returns true when lifecycle reaches ready', () => {
    const { result } = renderHook(() => useReadyGate());
    act(() => { dispatch('PLAY'); dispatch('FADE'); dispatch('FINISH'); });
    expect(result.current).toBe(true);
  });

  it('calls onReady exactly once when gate opens, even across re-renders', () => {
    const onReady = vi.fn();
    const { result, rerender } = renderHook(() => useReadyGate(onReady));
    act(() => { dispatch('PLAY'); dispatch('FADE'); dispatch('FINISH'); });
    rerender();
    rerender();
    expect(onReady).toHaveBeenCalledOnce();
  });

  it('does not throw when onReady is not provided', () => {
    const { result } = renderHook(() => useReadyGate());
    expect(() => {
      act(() => { dispatch('PLAY'); dispatch('FADE'); dispatch('FINISH'); });
    }).not.toThrow();
    expect(result.current).toBe(true);
  });

  it('fires onReady on mount if gate is already open (return visit)', () => {
    sessionStorage.setItem('site-lifecycle-ready', 'true');
    _resetForTesting();
    const onReady = vi.fn();
    renderHook(() => useReadyGate(onReady));
    expect(onReady).toHaveBeenCalledOnce();
  });
});
