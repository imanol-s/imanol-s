/**
 * Register a callback to run on Astro view-transition swaps,
 * guaranteeing it is only registered once per key.
 *
 * Also calls the callback immediately on first invocation.
 *
 * The callback may return a cleanup function (React useEffect pattern).
 * If it does, the cleanup is called before each re-invocation on
 * `astro:after-swap`. The cleanup is NOT called on the initial invocation.
 */
const REGISTRY_KEY = '__astroSwapRegistry';

type Cleanup = () => void;
type SwapCallback = () => Cleanup | void;

function getRegistry(): Map<string, Cleanup | undefined> {
  const win = window as unknown as Record<string, unknown>;
  if (!win[REGISTRY_KEY]) {
    win[REGISTRY_KEY] = new Map<string, Cleanup | undefined>();
  }
  return win[REGISTRY_KEY] as Map<string, Cleanup | undefined>;
}

export function registerOnceAfterSwap(key: string, callback: SwapCallback): void {
  const registry = getRegistry();
  if (registry.has(key)) return;

  // Initial invocation — store whatever cleanup (or undefined) is returned.
  const initialCleanup = callback();
  registry.set(key, typeof initialCleanup === 'function' ? initialCleanup : undefined);

  document.addEventListener('astro:after-swap', () => {
    // Call the stored cleanup before re-invoking.
    const stored = registry.get(key);
    if (stored) stored();

    const nextCleanup = callback();
    registry.set(key, typeof nextCleanup === 'function' ? nextCleanup : undefined);
  });
}
