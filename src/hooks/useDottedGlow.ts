import { useCallback, useEffect, useRef } from 'react';
import { buildDotGrid, dotAlpha, dotGlow, type Dot } from '../animations/dotMath';
import { useDarkMode } from './useDarkMode';
import { useReducedMotion } from './useReducedMotion';

/** Advanced escape hatch for power callers. */
export interface AdvancedDotProps {
  speedMin?: number;
  speedMax?: number;
  speedScale?: number;
  backgroundOpacity?: number;
}

export interface DottedGlowOptions {
  gap?: number;
  radius?: number;
  opacity?: number;
  /** 0–1 normalized speed. Default 0.5 maps to speedMin≈0.3, speedMax≈1.0. */
  speed?: number;
  /** CSS variable name without var() wrapper, e.g. "--color-accent" */
  accentVar?: string;
  /** CSS variable name without var() wrapper, e.g. "--color-primary" */
  glowVar?: string;
  /** Escape hatch for power callers */
  _advanced?: AdvancedDotProps;
}

function resolveCssVar(varName: string): string {
  const normalized = varName.startsWith('--') ? varName : `--${varName}`;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(normalized)
    .trim();
  return value || varName;
}

/**
 * Encapsulates all canvas setup, animation loop, ResizeObserver, and
 * IntersectionObserver logic for the dotted-glow background animation.
 *
 * Returns a callback ref to attach to the <canvas> element.
 */
export function useDottedGlow({
  gap = 12,
  radius = 2,
  opacity = 0.6,
  speed = 0.5,
  accentVar = '--color-accent',
  glowVar = '--color-primary',
  _advanced,
}: DottedGlowOptions = {}): React.RefCallback<HTMLCanvasElement> {
  // Called for its side-effect: triggers re-render on theme change so
  // getComputedStyle in the draw loop reads fresh CSS variable values.
  useDarkMode();
  const reduced = useReducedMotion();

  // Stable refs so the RAF closure always sees the latest values without
  // needing to re-run the full setup (observers + RAF) on every render.
  const reducedRef = useRef(reduced);
  const gapRef = useRef(gap);
  const radiusRef = useRef(radius);
  const opacityRef = useRef(opacity);
  const speedRef = useRef(speed);
  const accentVarRef = useRef(accentVar);
  const glowVarRef = useRef(glowVar);
  const advancedRef = useRef(_advanced);

  useEffect(() => { reducedRef.current = reduced; }, [reduced]);
  useEffect(() => { gapRef.current = gap; }, [gap]);
  useEffect(() => { radiusRef.current = radius; }, [radius]);
  useEffect(() => { opacityRef.current = opacity; }, [opacity]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { accentVarRef.current = accentVar; }, [accentVar]);
  useEffect(() => { glowVarRef.current = glowVar; }, [glowVar]);
  useEffect(() => { advancedRef.current = _advanced; }, [_advanced]);

  // Holds the cleanup function returned when we attach to a canvas.
  const cleanupRef = useRef<(() => void) | null>(null);

  const attachCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    // Tear down any previous attachment
    cleanupRef.current?.();
    cleanupRef.current = null;

    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let stopped = false;
    let isVisible = true;
    let dots: Dot[] = [];

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
      const s = speedRef.current;
      const adv = advancedRef.current;
      const speedMin = adv?.speedMin ?? 0.1 + s * 0.4;
      const speedMax = adv?.speedMax ?? 0.1 + s * 1.8;
      dots = buildDotGrid(width, height, gapRef.current, speedMin, speedMax);
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

      const currentOpacity = opacityRef.current;
      const currentRadius = radiusRef.current;
      const accentColor = resolveCssVar(accentVarRef.current);
      const glowColor = resolveCssVar(glowVarRef.current);
      const adv = advancedRef.current;
      const speedScale = adv?.speedScale ?? 1;
      const backgroundOpacity = adv?.backgroundOpacity ?? 0;

      const { width, height } = container.getBoundingClientRect();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (backgroundOpacity > 0) {
        ctx.globalAlpha = currentOpacity;
        const grad = ctx.createRadialGradient(
          width * 0.5, height * 0.4, Math.min(width, height) * 0.1,
          width * 0.5, height * 0.5, Math.max(width, height) * 0.7,
        );
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, `rgba(0,0,0,${Math.min(Math.max(backgroundOpacity, 0), 1)})`);
        ctx.fillStyle = grad as unknown as CanvasGradient;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.save();
      ctx.fillStyle = accentColor;

      const timeSec = now / 1000;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const a = dotAlpha(d, timeSec, speedScale);
        const glow = dotGlow(a);

        if (glow > 0) {
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 6 * glow;
        } else {
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = a * currentOpacity;
        ctx.beginPath();
        ctx.arc(d.x, d.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      raf = requestAnimationFrame(draw);
    };

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
  }, []); // stable — all mutable state is accessed via refs

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  return attachCanvas;
}
