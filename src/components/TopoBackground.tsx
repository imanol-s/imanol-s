import { useEffect, useRef, useState } from "react";

/** Retrieve or generate a session-scoped seed for feTurbulence. */
function getSessionSeed(): number {
  const key = "topo-seed";
  const stored = sessionStorage.getItem(key);
  if (stored !== null) return parseInt(stored, 10);
  const seed = Math.floor(Math.random() * 10000);
  sessionStorage.setItem(key, String(seed));
  return seed;
}

/**
 * Fixed animated topographic background — shared across all pages.
 * Handles its own rAF loop + reduced-motion media query internally.
 * Terrain shape is randomised once per session via a sessionStorage seed.
 */
export default function TopoBackground() {
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const rafId = useRef(0);
  const reducedMotion = useRef(false);
  const [dims, setDims] = useState({ width: 2000, height: 2000 });
  // Initialised to 2 (SSR-safe default); replaced with session seed on mount.
  const [seed, setSeed] = useState(2);

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
      }, 150);
    };

    updateDims();
    window.addEventListener("resize", handleResize);

    return () => {
      if (resizeTimeoutId !== undefined) {
        window.clearTimeout(resizeTimeoutId);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setSeed(getSessionSeed());
  }, []);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => {
      reducedMotion.current = e.matches;
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion.current) return;

    let phase = 0;

    const tick = () => {
      if (reducedMotion.current) return;

      // Continuous flow: oscillate baseFrequency with two independent rates.
      // Large range (0.0025–0.0055) makes morphing visually prominent.
      phase += 0.0006;
      // toFixed(5) is intentional — do NOT reduce precision here.
      // Per-frame delta is ~0.0000009 (phase step 0.0006 × amplitude 0.0015).
      // At toFixed(4) the attribute stays identical for ~111 frames before
      // jumping, producing visible stutter. 5 decimal places keeps each step
      // (~0.00001) small enough to appear continuous at 60 fps.
      const bfx = (0.004 + Math.sin(phase) * 0.0015).toFixed(5);
      const bfy = (0.004 + Math.cos(phase * 0.73) * 0.0015).toFixed(5);
      turbulenceRef.current?.setAttribute("baseFrequency", `${bfx} ${bfy}`);

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  const lineYs = Array.from(
    { length: Math.ceil(dims.height / 14) + 3 },
    (_, i) => -20 + i * 14,
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
               * far from their original position (scale=280 can move ±140 units).
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
                  baseFrequency="0.004"
                  numOctaves={6}
                  seed={seed}
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale={280}
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
              strokeOpacity="0.22"
              strokeWidth="0.8"
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
