import { prefersReducedMotion } from './prefersReducedMotion';

export type State = 'loading' | 'overlay-playing' | 'overlay-fading' | 'ready';
export type Action = 'PLAY' | 'FADE' | 'FINISH' | 'SKIP';

export const LIFECYCLE_SESSION_KEY = 'site-lifecycle-ready';

export function getInitialState(): State {
  if (prefersReducedMotion()) return 'ready';
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(LIFECYCLE_SESSION_KEY)) return 'ready';
  return 'loading';
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
