import { useEffect, useRef, useState } from "react";

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
      const span = Math.max(max - min, 0);
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

  const time = now / 1000;
  for (let i = 0; i < dots.length; i++) {
    const d = dots[i];
    const mod = (time * d.speed + d.phase) % 2;
    const lin = mod < 1 ? mod : 2 - mod;
    const a = 0.25 + 0.55 * lin;

    if (a > 0.6) {
      const glow = (a - 0.6) / 0.4;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 6 * glow;
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
  const [resolvedColor, setResolvedColor] = useState<string>(color);
  const [resolvedGlowColor, setResolvedGlowColor] = useState<string>(glowColor);

  const detectDarkMode = (): boolean => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) return true;
    if (root.classList.contains("light")) return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  useEffect(() => {
    const compute = () => {
      const isDark = detectDarkMode();
      setResolvedColor(isDark ? (darkColor ?? color) : color);
      setResolvedGlowColor(isDark ? (darkGlowColor ?? glowColor) : glowColor);
    };

    compute();

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMql = () => compute();
    mql.addEventListener("change", handleMql);

    const mo = new MutationObserver(() => compute());
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => {
      mql.removeEventListener("change", handleMql);
      mo.disconnect();
    };
  }, [color, darkColor, glowColor, darkGlowColor]);

  useEffect(() => {
    const el = canvasRef.current;
    const container = containerRef.current;
    if (!el || !container) return;

    const ctx = el.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let stopped = false;
    let isVisible = true;

    const dpr = Math.min(Math.max(1, window.devicePixelRatio || 1), 2);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      el.width = Math.max(1, Math.floor(width * dpr));
      el.height = Math.max(1, Math.floor(height * dpr));
      el.style.width = `${Math.floor(width)}px`;
      el.style.height = `${Math.floor(height)}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    let dots: Dot[] = [];

    const regenDots = () => {
      const { width, height } = container.getBoundingClientRect();
      dots = generateDots(width, height, gap, speedMin, speedMax);
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
      if (!isVisible) {
        raf = requestAnimationFrame(draw);
        return;
      }
      drawDots(ctx, dots, now, radius, opacity, resolvedColor, resolvedGlowColor);
      raf = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.1 },
    );
    observer.observe(container);

    const motionMql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!motionMql.matches) {
      raf = requestAnimationFrame(draw);
    }
    const onMotionChange = () => {
      if (motionMql.matches) {
        cancelAnimationFrame(raf);
      } else {
        raf = requestAnimationFrame(draw);
      }
    };
    motionMql.addEventListener("change", onMotionChange);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      motionMql.removeEventListener("change", onMotionChange);
      observer.disconnect();
      ro.disconnect();
    };
  }, [gap, radius, resolvedColor, resolvedGlowColor, opacity, speedMin, speedMax]);

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
