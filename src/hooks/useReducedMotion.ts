import { useSyncExternalStore } from 'react';
import { REDUCED_MOTION_QUERY } from '../utils/prefersReducedMotion';

// Module-level cache so all subscribers share the same MediaQueryList value.
// The server snapshot returns false (motion enabled) — a safe default since
// the browser will correct it immediately on hydration.
let cachedValue = false;

/**
 * Registers a callback on the `prefers-reduced-motion` MediaQueryList.
 * Updates the module-level cache before calling back so `getSnapshot` is
 * always in sync. Returns an unsubscribe function.
 */
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

/** Returns the cached `prefers-reduced-motion` boolean for useSyncExternalStore. */
function getSnapshot(): boolean {
  return cachedValue;
}

/**
 * React hook that returns `true` when the OS prefers reduced motion.
 * Reactively updates when the user changes their system preference.
 * Server snapshot defaults to `false` (motion enabled) — corrected on hydration.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
