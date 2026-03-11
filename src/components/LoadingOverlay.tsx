import { useState, useEffect, useCallback, useRef } from "react";
import { DottedGlowBackground } from "./ui/dotted-glow-background";

export default function LoadingOverlay() {
  // Start active so the overlay is visible on first React render.
  // The static #loading-overlay div covers the page before React hydrates;
  // the mount effect hands off from that div to this animated component.
  const [active, setActive] = useState(true);
  const [fading, setFading] = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pageLoadTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fadeOut = useCallback(() => {
    setFading(true);
    fadeTimerRef.current = setTimeout(() => {
      setActive(false);
      setFading(false);
    }, 500);
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

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setActive(false);
      return;
    }

    const timer = setTimeout(fadeOut, 600);
    return () => clearTimeout(timer);
  }, [fadeOut]);

  // Astro view transitions: show on swap, hide on page-load.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const showOnSwap = () => fadeIn();
    const hideOnLoad = () => {
      // Each navigation swaps in a fresh #loading-overlay from the new page HTML;
      // hide it so it doesn't linger after the React overlay fades out.
      const staticEl = document.getElementById("loading-overlay");
      if (staticEl) staticEl.style.display = "none";
      pageLoadTimerRef.current = setTimeout(fadeOut, 300);
    };

    document.addEventListener("astro:before-swap", showOnSwap);
    document.addEventListener("astro:page-load", hideOnLoad);
    return () => {
      document.removeEventListener("astro:before-swap", showOnSwap);
      document.removeEventListener("astro:page-load", hideOnLoad);
      clearTimeout(fadeTimerRef.current);
      clearTimeout(pageLoadTimerRef.current);
    };
  }, [fadeIn, fadeOut]);

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
