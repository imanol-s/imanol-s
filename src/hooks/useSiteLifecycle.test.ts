// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Stub matchMedia before module loads (getInitialState runs at import time)
window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn() });

import { useSiteLifecycle, _resetForTesting } from './useSiteLifecycle';

describe('useSiteLifecycle', () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn() });
    _resetForTesting();
  });

  it('starts in loading state on first visit', () => {
    const { result } = renderHook(() => useSiteLifecycle());
    expect(result.current.state).toBe('loading');
  });

  it('transitions through full sequence via dispatch', () => {
    const { result } = renderHook(() => useSiteLifecycle());

    act(() => result.current.dispatch('PLAY'));
    expect(result.current.state).toBe('overlay-playing');

    act(() => result.current.dispatch('FADE'));
    expect(result.current.state).toBe('overlay-fading');

    act(() => result.current.dispatch('FINISH'));
    expect(result.current.state).toBe('ready');
  });

  it('sets sessionStorage when reaching ready', () => {
    const { result } = renderHook(() => useSiteLifecycle());

    act(() => result.current.dispatch('PLAY'));
    act(() => result.current.dispatch('FADE'));
    act(() => result.current.dispatch('FINISH'));

    expect(sessionStorage.getItem('site-lifecycle-ready')).toBe('true');
  });

  it('starts in ready state on return visit', () => {
    sessionStorage.setItem('site-lifecycle-ready', 'true');
    _resetForTesting();
    const { result } = renderHook(() => useSiteLifecycle());
    expect(result.current.state).toBe('ready');
  });
});
