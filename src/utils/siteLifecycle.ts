import { prefersReducedMotion } from './prefersReducedMotion';

export type State = 'loading' | 'overlay-playing' | 'overlay-fading' | 'ready';
export type Action = 'PLAY' | 'FADE' | 'FINISH' | 'SKIP';

export const LIFECYCLE_SESSION_KEY = 'site-lifecycle-ready';

/**
 * Determines the starting lifecycle state before the overlay plays.
 * Reduced-motion is checked first: users who prefer reduced motion should
 * never see an animation, even on their first visit. Session storage is
 * checked second to skip the intro on return navigations within a tab.
 */
export function getInitialState(): State {
  if (prefersReducedMotion()) return 'ready';
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(LIFECYCLE_SESSION_KEY)) return 'ready';
  return 'loading';
}

/**
 * Named timing constants for the intro overlay animation.
 * playDelayMs is a render fence — gives the overlay one frame to paint before the animation starts.
 */
export const OVERLAY_TIMINGS = {
  playDelayMs: 100,
  fadeDelayMs: 500,
  finishDelayMs: 500,
} as const;

/**
 * Drives the overlay state machine forward via timeouts.
 * Designed to be called from `useEffect`; returns a cleanup function to cancel
 * the pending timeout when the state changes before the timer fires.
 */
export function scheduleOverlay(
  dispatch: (action: Action) => void,
  state: State,
): (() => void) | undefined {
  if (state === 'loading') {
    const t = setTimeout(() => dispatch('PLAY'), OVERLAY_TIMINGS.playDelayMs);
    return () => clearTimeout(t);
  }
  if (state === 'overlay-playing') {
    const t = setTimeout(() => dispatch('FADE'), OVERLAY_TIMINGS.fadeDelayMs);
    return () => clearTimeout(t);
  }
  if (state === 'overlay-fading') {
    const t = setTimeout(() => dispatch('FINISH'), OVERLAY_TIMINGS.finishDelayMs);
    return () => clearTimeout(t);
  }
}

export function transition(state: State, action: Action): State {
  switch (state) {
    case 'loading':
      if (action === 'PLAY') return 'overlay-playing';
      if (action === 'SKIP') return 'ready';
      return state;
    case 'overlay-playing':
      if (action === 'FADE') return 'overlay-fading';
      return state;
    case 'overlay-fading':
      if (action === 'FINISH') return 'ready';
      return state;
    case 'ready':
      return state;
  }
}
