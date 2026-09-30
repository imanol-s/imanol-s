import { useEffect } from "react";
import { useDottedGlow } from "../hooks/useDottedGlow";
import { OVERLAY_TIMINGS, useSiteLifecycle } from "../hooks/useSiteLifecycle";

/**
 * Intro overlay that plays a dotted-glow animation once per session.
 *
 * A static HTML fallback (`#loading-overlay`) is server-rendered in the Astro
 * layout to prevent a flash of unstyled content before React hydrates.
 * On mount, the static element is hidden so React owns the overlay lifecycle.
 */
export default function LoadingOverlay() {
  const { state, advance } = useSiteLifecycle();
  const canvasRef = useDottedGlow();

  // Hide the server-rendered fallback so React controls visibility from here.
  useEffect(() => {
    const staticEl = document.getElementById("loading-overlay");
    if (staticEl) staticEl.style.display = "none";
  }, []);

  // Walk the overlay through its phases on a timer.
  useEffect(() => {
    if (state === "ready") return;
    const t = setTimeout(advance, OVERLAY_TIMINGS[state]);
    return () => clearTimeout(t);
  }, [state]);

  if (state === "ready") return null;

  const isFading = state === "overlay-fading";

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-500 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: "var(--color-background-dark)" }}
      aria-hidden="true"
    >
      <div style={{ position: "absolute", inset: 0 }}>
        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
