import { useSyncExternalStore } from "react";
import { prefersReducedMotion } from "../utils/prefersReducedMotion";

export const LIFECYCLE_SESSION_KEY = "site-lifecycle-ready";

/** Overlay phases, in order. `advance()` walks this sequence left to right. */
const SEQUENCE = [
  "loading",
  "overlay-playing",
  "overlay-fading",
  "ready",
] as const;
export type State = (typeof SEQUENCE)[number];

/**
 * Delay before advancing out of each non-ready phase.
 *
 * `loading` (100ms) is a render fence: the overlay must paint its first frame
 * before advancing, otherwise the transition fires on a still-invisible
 * element and the user sees nothing.
 */
export const OVERLAY_TIMINGS: Record<Exclude<State, "ready">, number> = {
  loading: 100,
  "overlay-playing": 500,
  "overlay-fading": 500,
};

/**
 * Module-level singleton store shared by LoadingOverlay and TypewriterText.
 * These are two separate React islands (no shared React context), so the store
 * lives at module scope and coordinates via useSyncExternalStore subscriptions.
 */
let currentState: State | null = null;
const listeners = new Set<() => void>();

/**
 * Current state, resolved lazily on first read (sessionStorage is unavailable
 * during SSR). Reduced-motion users never see the animation; return
 * navigations within a tab skip straight to ready.
 */
function getSnapshot(): State {
  currentState ??=
    prefersReducedMotion() ||
    (typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem(LIFECYCLE_SESSION_KEY))
      ? "ready"
      : "loading";
  return currentState;
}

/**
 * Advance to the next phase; no-op once ready. On reaching ready, persists a
 * session flag so subsequent page loads in the same tab skip the intro.
 */
export function advance() {
  const state = getSnapshot();
  if (state === "ready") return;
  const next = SEQUENCE[SEQUENCE.indexOf(state) + 1];
  if (next === "ready") {
    try {
      sessionStorage.setItem(LIFECYCLE_SESSION_KEY, "true");
    } catch {}
  }
  currentState = next;
  listeners.forEach((fn) => fn());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** React hook exposing the shared lifecycle `state` and `advance` across islands. */
export function useSiteLifecycle() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { state, advance };
}

/** Resets the module-level singleton to a blank state. Only for use in tests. */
export function _resetForTesting() {
  currentState = null;
  listeners.clear();
}
