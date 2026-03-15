import { useState, useEffect, useCallback, useRef } from "react";
import DottedGlowBackground from "./DottedGlowBackground";
import { OVERLAY_OPAQUE_MS, OVERLAY_FADE_MS, PAGE_SWAP_DELAY_MS } from "../constants";

export default function LoadingOverlay() {
  // Start active so the overlay is visible on first React render.
  // The static #loading-overlay div covers the page before React hydrates;
  // the mount effect hands off from that div to this animated component.
  const [active, setActive] = useState(true);
  const [fading, setFading] = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pageLoadTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Read once at mount; same session-scoped value shared by both effects below.
  const [reducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const fadeOut = useCallback(() => {
    setFading(true);
    fadeTimerRef.current = setTimeout(() => {
      setActive(false);
      setFading(false);
    }, OVERLAY_FADE_MS);
  }, []);

  const fadeIn = useCallback(() => {
    clearTimeout(fadeTimerRef.current);
    setActive(true);
    setFading(false);
  }, []);

  // Initial load: hide the static fallback div, then fade out.
  useEffect(() => {
    const staticEl = document.getElementById("loading-overlay");
    if (staticEl) staticEl.style.display = "none";

    if (reducedMotion) {
      setActive(false);
      return;
    }

    const timer = setTimeout(fadeOut, OVERLAY_OPAQUE_MS);
    return () => clearTimeout(timer);
  }, [fadeOut, reducedMotion]);

  // Astro view transitions: show on swap, hide on page-load.
  useEffect(() => {
    if (reducedMotion) return;

    const hideOnLoad = () => {
      // Each navigation swaps in a fresh #loading-overlay from the new page HTML;
      // hide it so it doesn't linger after the React overlay fades out.
      const staticEl = document.getElementById("loading-overlay");
      if (staticEl) staticEl.style.display = "none";
      pageLoadTimerRef.current = setTimeout(fadeOut, PAGE_SWAP_DELAY_MS);
    };

    document.addEventListener("astro:before-swap", fadeIn);
    document.addEventListener("astro:page-load", hideOnLoad);
    return () => {
      document.removeEventListener("astro:before-swap", fadeIn);
      document.removeEventListener("astro:page-load", hideOnLoad);
      clearTimeout(fadeTimerRef.current);
      clearTimeout(pageLoadTimerRef.current);
    };
  }, [fadeIn, fadeOut, reducedMotion]);

  if (!active) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: "var(--color-background-dark)" }}
      aria-hidden="true"
    >
      <DottedGlowBackground
        gap={14}
        radius={1.5}
        colors={{
          dot: "var(--color-accent)",
          glow: "var(--color-primary)",
          darkDot: "var(--color-accent)",
          darkGlow: "var(--color-primary)",
        }}
        opacity={0.8}
        speed={{ min: 0.3, max: 1.0 }}
      />
    </div>
  );
}
