import { useState, useEffect } from 'react';
import { waitForOverlay } from '../utils/overlayReady';
import { prefersReducedMotion } from '../utils/prefersReducedMotion';

const FALLBACK_MS = 2000;

export function useOverlayReady(): boolean {
  const [ready, setReady] = useState(() => prefersReducedMotion());

  useEffect(() => {
    if (ready) return;

    let cancelled = false;

    const fallback = setTimeout(() => {
      if (!cancelled) setReady(true);
    }, FALLBACK_MS);

    waitForOverlay().then(() => {
      if (!cancelled) {
        clearTimeout(fallback);
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(fallback);
    };
  }, [ready]);

  return ready;
}
