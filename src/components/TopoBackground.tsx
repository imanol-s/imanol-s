import { useEffect, useRef, useState } from "react";
import { safeSessionGet, safeSessionSet } from "../utils/session";

const PHASE_STEP = 0.0006;
const BASE_FREQ_CENTER = 0.004;
const BASE_FREQ_AMPLITUDE = 0.0015;
const Y_RATE_MULTIPLIER = 0.73;
const DISPLACEMENT_SCALE = 380;
const LINE_SPACING = 24;
const LINE_START_OFFSET = -20;
const RESIZE_DEBOUNCE_MS = 150;
const INITIAL_DIMENSION = 2000;
const SEED_RANGE = 10_000;

/** Retrieve or generate a session-scoped seed for feTurbulence. */
function getOrCreateSessionSeed(): number {
  const key = "topo-seed";
  const stored = safeSessionGet(key);
  if (stored !== null) {
    const parsed = parseInt(stored, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  const seed = Math.floor(Math.random() * SEED_RANGE);
  safeSessionSet(key, String(seed));
  return seed;
}

/** Animate feTurbulence baseFrequency with rAF, respecting reduced-motion. */
function useTopoAnimation(
  turbulenceRef: React.RefObject<SVGFETurbulenceElement | null>,
) {
  const rafId = useRef(0);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = mql.matches;
    let phase = 0;

    const tick = () => {
      if (reducedMotion) return;
      phase += PHASE_STEP;
      // toFixed(5) is intentional — do NOT reduce precision here.
      // Per-frame delta is ~0.0000009 (phase step × amplitude).
      // At toFixed(4) the attribute stays identical for ~111 frames before
      // jumping, producing visible stutter. 5 decimal places keeps each step
      // small enough to appear continuous at 60 fps.
      const bfx = (BASE_FREQ_CENTER + Math.sin(phase) * BASE_FREQ_AMPLITUDE).toFixed(5);
      const bfy = (BASE_FREQ_CENTER + Math.cos(phase * Y_RATE_MULTIPLIER) * BASE_FREQ_AMPLITUDE).toFixed(5);
      turbulenceRef.current?.setAttribute("baseFrequency", `${bfx} ${bfy}`);
      rafId.current = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      rafId.current = requestAnimationFrame(tick);
    };
    const stopLoop = () => cancelAnimationFrame(rafId.current);

    if (!reducedMotion) startLoop();

    const onChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
      if (e.matches) stopLoop();
      else startLoop();
    };

    mql.addEventListener("change", onChange);
    return () => {
      mql.removeEventListener("change", onChange);
      stopLoop();
    };
  }, [turbulenceRef]);
}

/** Track viewport dimensions at 2× resolution with debounced resize. */
function useViewportDims() {
  const [dims, setDims] = useState({ width: INITIAL_DIMENSION, height: INITIAL_DIMENSION });

  useEffect(() => {
    const updateDims = () => {
      setDims({ width: window.innerWidth * 2, height: window.innerHeight * 2 });
    };

    let resizeTimeoutId: number | undefined;

    const handleResize = () => {
      if (resizeTimeoutId !== undefined) {
        window.clearTimeout(resizeTimeoutId);
      }
      resizeTimeoutId = window.setTimeout(() => {
        updateDims();
        resizeTimeoutId = undefined;
      }, RESIZE_DEBOUNCE_MS);
    };

    updateDims();
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      if (resizeTimeoutId !== undefined) {
        window.clearTimeout(resizeTimeoutId);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return dims;
}

/**
 * Fixed animated topographic background — shared across all pages.
 * Handles its own rAF loop + reduced-motion media query internally.
 * Terrain shape is randomised once per session via a sessionStorage seed.
 */
export default function TopoBackground() {
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const dims = useViewportDims();
  const [seed] = useState(getOrCreateSessionSeed);

  useTopoAnimation(turbulenceRef);

  const lineYs = Array.from(
    { length: Math.ceil(dims.height / LINE_SPACING) + 3 },
    (_, i) => LINE_START_OFFSET + i * LINE_SPACING,
  );

  return (
    <>
      <div className="fixed inset-0 pointer-events-none blueprint-grid z-[-1]" />

      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -2 }}
      >
        <div className="topo-lines">
          <svg
            viewBox={`0 0 ${dims.width} ${dims.height}`}
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            className="w-full h-full"
          >
            <defs>
              {/*
               * Large filter region prevents clipping when lines are displaced
               * far from their original position (scale can move ±190 units).
               */}
              <filter
                id="topo-warp"
                x="-40%"
                y="-40%"
                width="180%"
                height="180%"
              >
                <feTurbulence
                  ref={turbulenceRef}
                  type="fractalNoise"
                  baseFrequency="0.002"
                  numOctaves={2}
                  seed={seed}
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale={DISPLACEMENT_SCALE}
                  xChannelSelector="R"
                  yChannelSelector="G"
                  result="displaced"
                />
                {/* Sub-pixel smoothing to remove rasterization jaggedness */}
                <feGaussianBlur in="displaced" stdDeviation="0.4" />
              </filter>
            </defs>
            <g
              filter="url(#topo-warp)"
              fill="none"
              stroke="var(--color-accent)"
              strokeOpacity="0.40"
              strokeWidth="1.2"
            >
              {lineYs.map((y) => (
                <line key={y} x1={-50} y1={y} x2={dims.width + 50} y2={y} />
              ))}
            </g>
          </svg>
        </div>
      </div>

      <div className="motion-topography" />
      <div className="isometric-topography opacity-20 dark:opacity-40" />
    </>
  );
}
