import { useCallback, useEffect, useRef, useState } from "react";

type DottedGlowColors = {
  dot?: string;
  glow?: string;
  darkDot?: string;
  darkGlow?: string;
};

type DottedGlowSpeed = {
  min?: number;
  max?: number;
};

type DottedGlowBackgroundProps = {
  gap?: number;
  radius?: number;
  colors?: DottedGlowColors;
  opacity?: number;
  speed?: DottedGlowSpeed;
};

type Dot = { x: number; y: number; phase: number; speed: number };

const MS_PER_SECOND = 1000;

function detectDarkMode(): boolean {
  const root = document.documentElement;
  if (root.classList.contains("dark")) return true;
  if (root.classList.contains("light")) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function generateDots(
  width: number,
  height: number,
  gap: number,
  speedMin: number,
  speedMax: number,
): Dot[] {
  const dots: Dot[] = [];
  const cols = Math.ceil(width / gap) + 2;
  const rows = Math.ceil(height / gap) + 2;
  const min = Math.min(speedMin, speedMax);
  const max = Math.max(speedMin, speedMax);
  for (let i = -1; i < cols; i++) {
    for (let j = -1; j < rows; j++) {
      const x = i * gap + (j % 2 === 0 ? 0 : gap * 0.5);
      const y = j * gap;
      const phase = Math.random() * Math.PI * 2;
      const span = max - min;
      const speed = min + Math.random() * span;
      dots.push({ x, y, phase, speed });
    }
  }
  return dots;
}

function drawDots(
  ctx: CanvasRenderingContext2D,
  dots: Dot[],
  now: number,
  radius: number,
  opacity: number,
  color: string,
  glowColor: string,
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.globalAlpha = opacity;
  ctx.save();
  ctx.fillStyle = color;

  const time = now / MS_PER_SECOND;
  for (let i = 0; i < dots.length; i++) {
    const d = dots[i];
    const cyclePos = (time * d.speed + d.phase) % 2;
    const brightness = cyclePos < 1 ? cyclePos : 2 - cyclePos;
    const a = 0.25 + 0.55 * brightness;

    if (a > 0.6) {
      const glowIntensity = (a - 0.6) / 0.4;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 6 * glowIntensity;
    } else {
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = a * opacity;
    ctx.beginPath();
    ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function useResolvedColors(
  color: string,
  glowColor: string,
  darkColor: string | undefined,
  darkGlowColor: string | undefined,
) {
  const [resolvedColor, setResolvedColor] = useState(color);
  const [resolvedGlowColor, setResolvedGlowColor] = useState(glowColor);

  useEffect(() => {
    const compute = () => {
      const isDark = detectDarkMode();
      setResolvedColor(isDark ? (darkColor ?? color) : color);
      setResolvedGlowColor(isDark ? (darkGlowColor ?? glowColor) : glowColor);
    };

    compute();

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", compute);

    const mo = new MutationObserver(compute);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => {
      mql.removeEventListener("change", compute);
      mo.disconnect();
    };
  }, [color, darkColor, glowColor, darkGlowColor]);

  return { resolvedColor, resolvedGlowColor };
}

type AnimationConfig = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  gap: number;
  speedMin: number;
  speedMax: number;
};

/** Scale canvas to match container at the device pixel ratio (capped at 2×). */
function resizeCanvas(
  el: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  container: HTMLElement,
  dpr: number,
) {
  const { width, height } = container.getBoundingClientRect();
  el.width = Math.max(1, Math.floor(width * dpr));
  el.height = Math.max(1, Math.floor(height * dpr));
  el.style.width = `${Math.floor(width)}px`;
  el.style.height = `${Math.floor(height)}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/** Tracks whether containerRef is within the viewport. Returns a ref with the current visibility state. */
function useVisibilityGate(
  containerRef: React.RefObject<HTMLDivElement | null>,
): React.MutableRefObject<boolean> {
  const isVisibleRef = useRef(true);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => { isVisibleRef.current = entries[0]?.isIntersecting ?? true; },
      { threshold: 0.1 },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef]);
  return isVisibleRef;
}

/** Installs a ResizeObserver that keeps the canvas sized to its container and calls onResize on each change. */
function useCanvasResize(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  onResize: () => void,
) {
  useEffect(() => {
    const el = canvasRef.current;
    const container = containerRef.current;
    if (!el || !container) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const getDpr = () => Math.min(Math.max(1, window.devicePixelRatio || 1), 2);
    resizeCanvas(el, ctx, container, getDpr());
    onResize();
    const ro = new ResizeObserver(() => { resizeCanvas(el, ctx, container, getDpr()); onResize(); });
    ro.observe(container);
    return () => ro.disconnect();
  }, [canvasRef, containerRef, onResize]);
}

function useDotAnimation(
  config: AnimationConfig,
  radius: number,
  opacity: number,
  color: string,
  glowColor: string,
) {
  const { canvasRef, containerRef, gap, speedMin, speedMax } = config;
  const dotsRef = useRef<Dot[]>([]);

  const drawFn = useCallback(
    (ctx: CanvasRenderingContext2D, dots: Dot[], now: number) =>
      drawDots(ctx, dots, now, radius, opacity, color, glowColor),
    [radius, opacity, color, glowColor],
  );

  const regenDots = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();
    dotsRef.current = generateDots(width, height, gap, speedMin, speedMax);
  }, [containerRef, gap, speedMin, speedMax]);

  const isVisibleRef = useVisibilityGate(containerRef);
  useCanvasResize(canvasRef, containerRef, regenDots);

  useEffect(() => {
    const el = canvasRef.current;
    const ctx = el?.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let stopped = false;

    const draw = (now: number) => {
      if (stopped) return;
      if (!isVisibleRef.current) { raf = requestAnimationFrame(draw); return; }
      try { drawFn(ctx, dotsRef.current, now); }
      catch (err) { console.warn("DottedGlowBackground draw error:", err); stopped = true; return; }
      raf = requestAnimationFrame(draw);
    };

    const motionMql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!motionMql.matches) raf = requestAnimationFrame(draw);
    const onMotionChange = () => {
      if (motionMql.matches) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(draw);
    };
    motionMql.addEventListener("change", onMotionChange);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      motionMql.removeEventListener("change", onMotionChange);
    };
  }, [canvasRef, isVisibleRef, drawFn]);
}

export default function DottedGlowBackground({
  gap = 12,
  radius = 2,
  colors: {
    dot: color = "rgba(0,0,0,0.7)",
    glow: glowColor = "rgba(0, 170, 255, 0.85)",
    darkDot: darkColor,
    darkGlow: darkGlowColor,
  } = {},
  opacity = 0.6,
  speed: { min: speedMin = 0.4, max: speedMax = 1.3 } = {},
}: DottedGlowBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedColor, resolvedGlowColor } = useResolvedColors(
    color,
    glowColor,
    darkColor,
    darkGlowColor,
  );

  useDotAnimation(
    { canvasRef, containerRef, gap, speedMin, speedMax },
    radius,
    opacity,
    resolvedColor,
    resolvedGlowColor,
  );

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0 }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
