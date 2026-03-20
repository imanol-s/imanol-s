import { useEffect, useRef } from 'react';
import { useSiteLifecycle } from './useSiteLifecycle';

/**
 * Returns true once the site lifecycle has reached 'ready'.
 * On reduced-motion or return visits, true immediately.
 * Optional onReady fires exactly once when the gate opens.
 */
export function useReadyGate(onReady?: () => void): boolean {
  const { state } = useSiteLifecycle();
  const isReady = state === 'ready';
  const firedRef = useRef(false);

  useEffect(() => {
    if (isReady && !firedRef.current && onReady) {
      firedRef.current = true;
      onReady();
    }
  }, [isReady, onReady]);

  return isReady;
}
