import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useSessionState } from "../hooks/useSessionState";
import { computeTopoFrame, buildLineYs } from "../animations/topoMath";
import {
  sweepOffset,
  buildSweepStops,
  SWEEP_DURATION,
  BASE_OPACITY,
} from "../animations/lavaSweepMath";

// Oversized to 150% with -25% inset so the slow CSS rotation never exposes
// blank corners at the viewport edges.
const TOPO_LINES_STYLE: CSSProperties = {
  position: 'fixed',
  inset: '-25%',
  width: '150%',
  height: '150%',
  zIndex: 1,
  pointerEvents: 'none',
  willChange: 'transform',
};

export default function TopoBackground() {
  const reduced = useReducedMotion();
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const sweepGradRef = useRef<SVGLinearGradientElement>(null);
  const rafId = useRef(0);
  const [dims, setDims] = useState({ width: 2000, height: 2000 });
  // Ref synced via layoutEffect so the RAF loop reads current width without
  // a stale closure. useLayoutEffect (not render body) avoids side-effects
  // during concurrent render passes.
  const dimsWidthRef = useRef(dims.width);
  useLayoutEffect(() => {
    dimsWidthRef.current = dims.width;
  }, [dims.width]);
  const [seed, setSeed] = useSessionState<number | null>("topo-seed", null);

  // Seed is stored in sessionStorage so the topography shape stays consistent
  // across Astro view-transition navigations within the same tab, rather than
  // regenerating a visually jarring new pattern on every page visit.
  useEffect(() => {
    if (seed === null) setSeed(Math.floor(Math.random() * 10000));
  }, [seed, setSeed]);

  useEffect(() => {
    const updateDims = () => {
      setDims({ width: window.innerWidth * 2, height: window.innerHeight * 2 });
    };

    // Debounce at 150ms — SVG viewBox resize is expensive (triggers filter
    // recomputation) and resize events fire at 60Hz during window drag.
    let resizeTimeoutId: number | undefined;

    const handleResize = () => {
      if (resizeTimeoutId !== undefined) {
        window.clearTimeout(resizeTimeoutId);
      }
      resizeTimeoutId = window.setTimeout(() => {
        updateDims();
        resizeTimeoutId = undefined;
      }, 150);
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

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;

    // Two animation clocks: `phase` drives the feTurbulence baseFrequency
    // oscillation (very slow), `driftTime` drives the CSS translate/rotate
    // drift on a 55s cycle. Both are frame-counted rather than wall-clock
    // so the animation slows gracefully when the tab is throttled.
    let phase = 0;
    let driftTime = 0;
    let sweepTime = 0;

    const tick = () => {
      phase += 0.0006;
      driftTime += 1 / 60;
      sweepTime += 1 / 60;

      const { bfx, bfy, transform } = computeTopoFrame(phase, driftTime);
      turbulenceRef.current?.setAttribute("baseFrequency", `${bfx} ${bfy}`);
      if (containerRef.current) {
        containerRef.current.style.transform = transform;
      }

      // Brightness sweep: one setAttribute per frame translates the gradient.
      // Painted before the displacement filter so the band warps with topography.
      const offset = sweepOffset(sweepTime, dimsWidthRef.current, SWEEP_DURATION);
      sweepGradRef.current?.setAttribute("gradientTransform", `translate(${offset}, 0)`);

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [reduced]);

  const sweepStops = useMemo(() => buildSweepStops(), []);
  const lineYs = buildLineYs(dims.height, 24);

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -2 }}
        aria-hidden="true"
      >
        <div ref={containerRef} style={TOPO_LINES_STYLE}>
          <svg
            viewBox={`0 0 ${dims.width} ${dims.height}`}
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            className="w-full h-full"
          >
            <defs>
              {/*
               * Large filter region prevents clipping when lines are displaced
               * far from their original position (scale=380 can move ±190 units).
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
                  seed={seed ?? undefined}
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale={380}
                  xChannelSelector="R"
                  yChannelSelector="G"
                  result="displaced"
                />
                {/* Sub-pixel smoothing to remove rasterization jaggedness */}
                <feGaussianBlur in="displaced" stdDeviation="0.4" />
              </filter>
              {/*
               * Gaussian brightness sweep: a linearGradient whose stops encode a
               * gaussian opacity profile. The RAF loop translates the gradient via
               * gradientTransform; spreadMethod="repeat" handles seamless wrapping.
               * Because the gradient is applied as a stroke BEFORE feTurbulence
               * displacement, the bright band warps organically with the topography.
               */}
              {!reduced && (
                <linearGradient
                  ref={sweepGradRef}
                  id="sweep-grad"
                  gradientUnits="userSpaceOnUse"
                  x1={0}
                  y1={0}
                  x2={dims.width}
                  y2={0}
                  spreadMethod="repeat"
                >
                  {sweepStops.map((s, i) => (
                    <stop
                      key={i}
                      offset={s.offset}
                      stopColor="var(--color-accent)"
                      stopOpacity={s.opacity}
                    />
                  ))}
                </linearGradient>
              )}
            </defs>
            {/* Reduced motion: flat stroke at baseline opacity (no sweep).
                Motion enabled: gradient stroke animated via RAF. */}
            <g
              filter="url(#topo-warp)"
              fill="none"
              stroke={reduced ? "var(--color-accent)" : "url(#sweep-grad)"}
              strokeOpacity={reduced ? BASE_OPACITY : undefined}
              strokeWidth="1.2"
            >
              {lineYs.map((y) => (
                <line key={y} x1={-50} y1={y} x2={dims.width + 50} y2={y} />
              ))}
            </g>
          </svg>
        </div>
      </div>

    </>
  );
}
