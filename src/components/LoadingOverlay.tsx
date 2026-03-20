import { useEffect, useRef } from "react";
import { DottedGlowBackground } from "./ui/dotted-glow-background";
import { useSiteLifecycle } from "../hooks/useSiteLifecycle";

export default function LoadingOverlay() {
  const { state, dispatch } = useSiteLifecycle();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Hide the static HTML fallback on mount
  useEffect(() => {
    const staticEl = document.getElementById("loading-overlay");
    if (staticEl) staticEl.style.display = "none";
  }, []);

  // Drive state transitions with timers
  useEffect(() => {
    if (state === 'loading') {
      timerRef.current = setTimeout(() => dispatch('PLAY'), 100);
    } else if (state === 'overlay-playing') {
      timerRef.current = setTimeout(() => dispatch('FADE'), 500);
    } else if (state === 'overlay-fading') {
      timerRef.current = setTimeout(() => dispatch('FINISH'), 500);
    }
    return () => clearTimeout(timerRef.current);
  }, [state, dispatch]);

  if (state === 'ready') return null;

  const isFading = state === 'overlay-fading';

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-500 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: "var(--color-background-dark)" }}
      aria-hidden="true"
    >
      <DottedGlowBackground
        gap={14}
        radius={1.5}
        darkColor="var(--color-accent)"
        darkGlowColor="var(--color-primary)"
        color="var(--color-accent)"
        glowColor="var(--color-primary)"
        opacity={0.8}
        speedMin={0.3}
        speedMax={1.0}
      />
    </div>
  );
}
