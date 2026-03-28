export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)' as const;

/**
 * Returns true if the user's OS prefers reduced motion.
 * Safe to call in SSR contexts — returns false when `window` is unavailable.
 */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
