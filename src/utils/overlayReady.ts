const SLOT = '__overlayReady' as const;

interface OverlayReadySlot {
  promise: Promise<void>;
  resolve: () => void;
}

function getSlot(): OverlayReadySlot {
  const win = window as unknown as Record<string, unknown>;
  if (!win[SLOT]) {
    let resolve!: () => void;
    const promise = new Promise<void>((res) => { resolve = res; });
    win[SLOT] = { promise, resolve };
  }
  return win[SLOT] as OverlayReadySlot;
}

/** Called by LoadingOverlay when the overlay becomes invisible. */
export function signalOverlayReady(): void {
  getSlot().resolve();
}

/**
 * Resets the slot to a new pending promise.
 * Must be called before fadeIn() on astro:before-swap so the next
 * navigation cycle gets a fresh gate.
 */
export function resetOverlayReady(): void {
  let resolve!: () => void;
  const promise = new Promise<void>((res) => { resolve = res; });
  (window as unknown as Record<string, unknown>)[SLOT] = { promise, resolve };
}

/** Returns a promise that resolves when the overlay is gone. */
export function waitForOverlay(): Promise<void> {
  return getSlot().promise;
}
