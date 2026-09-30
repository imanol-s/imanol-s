import { useCallback, useEffect, useRef } from "react";
import {
  buildDotGrid,
  dotAlpha,
  dotGlow,
  type Dot,
} from "../animations/dotMath";
import { useDarkMode } from "./useDarkMode";
import { useReducedMotion } from "./useReducedMotion";

// ponytail: options removed — LoadingOverlay is the only caller and never
// overrode these; reintroduce parameters if a second caller needs different values.
const GAP = 12;
const RADIUS = 2;
const OPACITY = 0.6;
const SPEED_MIN = 0.3;
const SPEED_MAX = 1.0;
const ACCENT_VAR = "--color-accent";
const GLOW_VAR = "--color-primary";

/**
 * Reads a CSS custom property value from `:root` at call-time.
 * Falls back to `varName` itself if the property is unset.
 */
function resolveCssVar(varName: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value || varName;
}

/**
 * Encapsulates all canvas setup, animation loop, ResizeObserver, and
 * IntersectionObserver logic for the dotted-glow background animation.
 *
 * Returns a callback ref to attach to the <canvas> element.
 */
export function useDottedGlow(): React.RefCallback<HTMLCanvasElement> {
  // Called for its side-effect: triggers re-render on theme change so
  // getComputedStyle in the draw loop reads fresh CSS variable values.
  useDarkMode();
  const reduced = useReducedMotion();

  // Stable ref so the RAF closure always sees the latest value without
  // needing to re-run the full setup (observers + RAF) on every render.
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  // Holds the cleanup function returned when we attach to a canvas.
  const cleanupRef = useRef<(() => void) | null>(null);

  const attachCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    // Tear down any previous attachment
    cleanupRef.current?.();
    cleanupRef.current = null;

    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let stopped = false;
    let isVisible = true;
    let dots: Dot[] = [];

    // Cap DPR at 2 — 3x displays add ~2.25x fill cost for imperceptible detail
    // on a diffuse dot-grid animation.
    const dpr = Math.min(Math.max(1, window.devicePixelRatio || 1), 2);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${Math.floor(width)}px`;
      canvas.style.height = `${Math.floor(height)}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const regenDots = () => {
      const { width, height } = container.getBoundingClientRect();
      dots = buildDotGrid(width, height, GAP, SPEED_MIN, SPEED_MAX);
    };

    const ro = new ResizeObserver(() => {
      resize();
      regenDots();
    });
    ro.observe(container);
    resize();
    regenDots();

    const draw = (now: number) => {
      if (stopped) return;
      if (!isVisible || reducedRef.current) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const accentColor = resolveCssVar(ACCENT_VAR);
      const glowColor = resolveCssVar(GLOW_VAR);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.fillStyle = accentColor;

      const timeSec = now / 1000;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const a = dotAlpha(d, timeSec, 1);
        const glow = dotGlow(a);

        if (glow > 0) {
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 6 * glow;
        } else {
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = a * OPACITY;
        ctx.beginPath();
        ctx.arc(d.x, d.y, RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      raf = requestAnimationFrame(draw);
    };

    // Pause the RAF loop when the canvas is off-screen to avoid wasting
    // GPU fill cycles on a non-visible element (common when scrolled past).
    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.1 },
    );
    io.observe(container);

    raf = requestAnimationFrame(draw);

    cleanupRef.current = () => {
      stopped = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []); // stable — mutable state is accessed via refs

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  return attachCanvas;
}
