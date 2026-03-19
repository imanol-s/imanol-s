// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSessionState } from './useSessionState';

beforeEach(() => {
  sessionStorage.clear();
});

describe('useSessionState', () => {
  it('returns default value when key is not in storage', () => {
    const { result } = renderHook(() => useSessionState('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('persists value to sessionStorage on set', () => {
    const { result } = renderHook(() => useSessionState('test-key', 'default'));
    act(() => result.current[1]('updated'));
    expect(result.current[0]).toBe('updated');
    expect(sessionStorage.getItem('test-key')).toBe(JSON.stringify('updated'));
  });

  it('reads existing value from sessionStorage', () => {
    sessionStorage.setItem('counter', JSON.stringify(42));
    const { result } = renderHook(() => useSessionState('counter', 0));
    expect(result.current[0]).toBe(42);
  });

  it('handles boolean values', () => {
    const { result } = renderHook(() => useSessionState('flag', false));
    expect(result.current[0]).toBe(false);
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);
    expect(sessionStorage.getItem('flag')).toBe(JSON.stringify(true));
  });
});
