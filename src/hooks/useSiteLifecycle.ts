import { useSyncExternalStore } from 'react';
import { transition, getInitialState, LIFECYCLE_SESSION_KEY, type State, type Action } from '../utils/siteLifecycle';

type Listener = () => void;

/**
 * Module-level singleton store shared by LoadingOverlay and TypewriterText.
 * These are two separate React islands (no shared React context), so the store
 * lives at module scope and coordinates via useSyncExternalStore subscriptions.
 */
let currentState: State | null = null;
const listeners = new Set<Listener>();

/** Lazy init — avoids calling getInitialState() during SSR where sessionStorage is unavailable. */
function ensureInitialized(): State {
  if (currentState === null) {
    currentState = getInitialState();
  }
  return currentState;
}

/** Notifies all registered store listeners of a state change. */
function notify() {
  listeners.forEach(fn => fn());
}

/**
 * Advance the lifecycle state machine.
 *
 * When transitioning to 'ready', persists the flag to sessionStorage so
 * subsequent page loads in the same tab skip the intro overlay entirely
 * (checked by getInitialState on next navigation).
 */
export function dispatch(action: Action) {
  const state = ensureInitialized();
  const next = transition(state, action);
  if (next === state) return;
  if (next === 'ready' && state !== 'ready') {
    try { sessionStorage.setItem(LIFECYCLE_SESSION_KEY, 'true'); } catch {}
  }
  currentState = next;
  notify();
}

/**
 * Adds a listener to the store and returns an unsubscribe function.
 * Used as the first argument to `useSyncExternalStore`.
 */
function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Returns the current lifecycle state, lazily initialising the store on first call. */
function getSnapshot(): State {
  return ensureInitialized();
}

/**
 * React hook that exposes the site lifecycle `state` and `dispatch` function.
 * Shares a module-level singleton store across all islands (no React context needed).
 */
export function useSiteLifecycle() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { state, dispatch };
}

/** Resets the module-level singleton to a blank state. Only for use in tests. */
export function _resetForTesting() {
  currentState = null;
  listeners.clear();
}

