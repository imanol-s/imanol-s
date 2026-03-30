import { useEffect } from "react";
import { DottedGlowBackground } from "./ui/dotted-glow-background";
import { useSiteLifecycle } from "../hooks/useSiteLifecycle";
import { scheduleOverlay } from "../utils/siteLifecycle";

/**
 * Intro overlay that plays a dotted-glow animation once per session.
 *
 * A static HTML fallback (`#loading-overlay`) is server-rendered in the Astro
 * layout to prevent a flash of unstyled content before React hydrates.
 * On mount, the static element is hidden so React owns the overlay lifecycle.
 */
export default function LoadingOverlay() {
  const { state, dispatch } = useSiteLifecycle();

  // Hide the server-rendered fallback so React controls visibility from here.
  useEffect(() => {
    const staticEl = document.getElementById("loading-overlay");
    if (staticEl) staticEl.style.display = "none";
  }, []);

  // Drive state transitions with timers
  useEffect(() => scheduleOverlay(dispatch, state), [state, dispatch]);

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
      <DottedGlowBackground />
    </div>
  );
}
