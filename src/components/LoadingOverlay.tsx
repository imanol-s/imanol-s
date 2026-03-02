import { useState, useEffect, useCallback, useRef } from "react";
import { DottedGlowBackground } from "./ui/dotted-glow-background";

export default function LoadingOverlay() {
  const [active, setActive] = useState(true);
  const [fading, setFading] = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  // Initial load: fade out after short delay
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(false);
      return;
    }
    const timer = setTimeout(fadeOut, 600);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Astro view transitions: show on swap, hide on page-load
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const showOnSwap = () => fadeIn();
    const hideOnLoad = () => setTimeout(fadeOut, 300);

    document.addEventListener("astro:before-swap", showOnSwap);
    document.addEventListener("astro:page-load", hideOnLoad);
    return () => {
      document.removeEventListener("astro:before-swap", showOnSwap);
      document.removeEventListener("astro:page-load", hideOnLoad);
      clearTimeout(fadeTimerRef.current);
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
        darkColor="#94a3b8"
        darkGlowColor="#64748b"
        color="#94a3b8"
        glowColor="#64748b"
        opacity={0.8}
        speedMin={0.3}
        speedMax={1.0}
      />
    </div>
  );
}
