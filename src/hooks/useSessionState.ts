import { useState, useCallback } from 'react';

/**
 * useState backed by sessionStorage for per-tab persistence across page navigations.
 * Falls back silently to in-memory state when sessionStorage is unavailable
 * (private browsing mode, storage quota exceeded, or SSR).
 */
export function useSessionState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = sessionStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      setState(value);
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch {
        // sessionStorage unavailable (private mode, quota exceeded)
      }
    },
    [key],
  );

  return [state, setValue];
}
