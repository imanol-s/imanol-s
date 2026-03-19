/**
 * Register a callback to run on Astro view-transition swaps,
 * guaranteeing it is only registered once per key.
 *
 * Also calls the callback immediately on first invocation.
 */
const REGISTRY_KEY = '__astroSwapRegistry';

function getRegistry(): Set<string> {
  const win = window as unknown as Record<string, unknown>;
  if (!win[REGISTRY_KEY]) {
    win[REGISTRY_KEY] = new Set<string>();
  }
  return win[REGISTRY_KEY] as Set<string>;
}

export function registerOnceAfterSwap(key: string, callback: () => void): void {
  const registry = getRegistry();
  if (registry.has(key)) return;
  registry.add(key);
  callback();
  document.addEventListener('astro:after-swap', () => callback());
}
