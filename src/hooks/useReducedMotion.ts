import { useSyncExternalStore } from 'react';
import { REDUCED_MOTION_QUERY } from '../utils/prefersReducedMotion';

// Module-level cache so all subscribers share the same MediaQueryList value.
// The server snapshot returns false (motion enabled) — a safe default since
// the browser will correct it immediately on hydration.
let cachedValue = false;

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  cachedValue = mql.matches;
  const handler = (e: { matches: boolean }) => {
    cachedValue = e.matches;
    callback();
  };
  mql.addEventListener('change', handler);
  return () => mql.removeEventListener('change', handler);
}

function getSnapshot(): boolean {
  return cachedValue;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
