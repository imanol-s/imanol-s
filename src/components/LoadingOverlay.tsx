import { useEffect } from "react";
import { useDottedGlow } from "../hooks/useDottedGlow";
import { OVERLAY_TIMINGS, useSiteLifecycle } from "../hooks/useSiteLifecycle";

/** Transparent decorative intro that leaves server-rendered content usable. */
export default function LoadingOverlay() {
  const { state, advance } = useSiteLifecycle();
  const canvasRef = useDottedGlow();

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
      data-loading-overlay={state}
      className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-500 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <div style={{ position: "absolute", inset: 0, opacity: 0.15 }}>
        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
