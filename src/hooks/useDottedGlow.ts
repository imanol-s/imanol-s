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
// Alpha is baked into the sprites too: changing globalAlpha per draw made
// Chrome 107's canvas flush take ~16s per frame for a full-viewport grid.
const ALPHA_LEVELS = 32;
// Range of dotAlpha() in animations/dotMath.ts.
const ALPHA_MIN = 0.25;
const ALPHA_MAX = 0.8;
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
  // Read for its side-effect too: a theme change re-renders the component, and
  // the effect below refreshes the resolved colors once instead of on every frame.
  const dark = useDarkMode();
  const reduced = useReducedMotion();

  // Resolved once per theme instead of twice per frame: reading a custom
  // property forces a style recalculation, which on its own dominated the
  // frame budget on throttled devices.
  const colorsRef = useRef<{ accent: string; glow: string } | null>(null);
  useEffect(() => {
    colorsRef.current = {
      accent: resolveCssVar(ACCENT_VAR),
      glow: resolveCssVar(GLOW_VAR),
    };
  }, [dark]);

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

    // Render at 1x — the grid shows at 15% opacity, and on phones the 2x
    // canvas upload alone took ~50ms per frame under 4x CPU throttling.
    const dpr = 1;

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

    // One sprite per alpha level, rebuilt only when the theme colors change.
    let sprites: HTMLCanvasElement[] = [];
    let spriteColors = "";
    const buildSprites = (accentColor: string, glowColor: string) => {
      const size = Math.ceil(SPRITE_HALF * 2 * dpr);
      sprites = Array.from({ length: ALPHA_LEVELS + 1 }, (_, level) => {
        const sprite = document.createElement("canvas");
        sprite.width = size;
        sprite.height = size;
        const sctx = sprite.getContext("2d");
        if (!sctx) return sprite;
        const a = ALPHA_MIN + ((ALPHA_MAX - ALPHA_MIN) * level) / ALPHA_LEVELS;
        const glow = dotGlow(a);
        sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        sctx.globalAlpha = a * OPACITY;
        sctx.fillStyle = accentColor;
        if (glow > 0) {
          sctx.shadowColor = glowColor;
          sctx.shadowBlur = MAX_BLUR * glow;
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

      const colors =
        colorsRef.current ??
        (colorsRef.current = {
          accent: resolveCssVar(ACCENT_VAR),
          glow: resolveCssVar(GLOW_VAR),
        });
      const colorKey = `${colors.accent}|${colors.glow}`;
      if (colorKey !== spriteColors) {
        buildSprites(colors.accent, colors.glow);
        spriteColors = colorKey;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();

      const timeSec = now / 1000;
      const spriteSize = SPRITE_HALF * 2;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const a = dotAlpha(d, timeSec, 1);
        const level = Math.round(
          ((a - ALPHA_MIN) / (ALPHA_MAX - ALPHA_MIN)) * ALPHA_LEVELS,
        );

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
