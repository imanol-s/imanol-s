import { useSyncExternalStore } from 'react';
import { transition, getInitialState, LIFECYCLE_SESSION_KEY, type State, type Action } from '../utils/siteLifecycle';

type Listener = () => void;

let currentState: State | null = null;
const listeners = new Set<Listener>();

function ensureInitialized(): State {
  if (currentState === null) {
    currentState = getInitialState();
  }
  return currentState;
}

function notify() {
  listeners.forEach(fn => fn());
}

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

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): State {
  return ensureInitialized();
}

export function useSiteLifecycle() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { state, dispatch };
}

// For testing — reset to a known state
export function _resetForTesting() {
  currentState = null;
  listeners.clear();
}

