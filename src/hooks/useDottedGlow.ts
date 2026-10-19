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
// Glow is quantized into pre-rendered sprites; per-dot shadowBlur on every
// frame dominated main-thread time on throttled devices.
const GLOW_LEVELS = 16;
const MAX_BLUR = 6;
const SPRITE_HALF = RADIUS + MAX_BLUR * 2;

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

    // One sprite per glow level, rebuilt only when the theme colors change.
    let sprites: HTMLCanvasElement[] = [];
    let spriteColors = "";
    const buildSprites = (accentColor: string, glowColor: string) => {
      const size = Math.ceil(SPRITE_HALF * 2 * dpr);
      sprites = Array.from({ length: GLOW_LEVELS + 1 }, (_, level) => {
        const sprite = document.createElement("canvas");
        sprite.width = size;
        sprite.height = size;
        const sctx = sprite.getContext("2d");
        if (!sctx) return sprite;
        sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        sctx.fillStyle = accentColor;
        if (level > 0) {
          sctx.shadowColor = glowColor;
          sctx.shadowBlur = (MAX_BLUR * level) / GLOW_LEVELS;
        }
        sctx.beginPath();
        sctx.arc(SPRITE_HALF, SPRITE_HALF, RADIUS, 0, Math.PI * 2);
        sctx.fill();
        return sprite;
      });
    };

    const draw = (now: number) => {
      if (stopped) return;
      if (!isVisible || reducedRef.current) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const accentColor = resolveCssVar(ACCENT_VAR);
      const glowColor = resolveCssVar(GLOW_VAR);
      const colors = `${accentColor}|${glowColor}`;
      if (colors !== spriteColors) {
        buildSprites(accentColor, glowColor);
        spriteColors = colors;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();

      const timeSec = now / 1000;
      const spriteSize = SPRITE_HALF * 2;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const a = dotAlpha(d, timeSec, 1);
        const level = Math.round(dotGlow(a) * GLOW_LEVELS);

        ctx.globalAlpha = a * OPACITY;
        ctx.drawImage(
          sprites[level],
          d.x - SPRITE_HALF,
          d.y - SPRITE_HALF,
          spriteSize,
          spriteSize,
        );
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
