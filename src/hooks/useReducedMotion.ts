import { useSyncExternalStore } from "react";
import {
  prefersReducedMotion,
  REDUCED_MOTION_QUERY,
} from "../utils/prefersReducedMotion";

/** Re-renders subscribers when the OS motion preference changes. */
function subscribe(callback: () => void): () => void {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

/**
 * React hook that returns `true` when the OS prefers reduced motion.
 * Reactively updates when the user changes their system preference.
 * Server snapshot defaults to `false` (motion enabled) — corrected on hydration.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}
