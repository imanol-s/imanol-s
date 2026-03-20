import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useSessionState } from "../hooks/useSessionState";

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
  const rafId = useRef(0);
  const [dims, setDims] = useState({ width: 2000, height: 2000 });
  const [seed, setSeed] = useSessionState<number | null>("topo-seed", null);

  // Generate seed once per session
  useEffect(() => {
    if (seed === null) setSeed(Math.floor(Math.random() * 10000));
  }, [seed, setSeed]);

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

    let phase = 0;
    let driftTime = 0;

    const tick = () => {
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

      // Container drift (replaces CSS @keyframes topo-drift, 55s cycle)
      driftTime += 1 / 60; // ~60fps
      const t = (driftTime % 55) / 55; // 0→1 over 55s
      const angle = t * Math.PI * 2;
      const tx = Math.sin(angle) * -5 + Math.sin(angle * 2) * 3;
      const ty = Math.cos(angle) * -3 + Math.cos(angle * 2) * -2;
      const rot = Math.sin(angle) * 1.5 - Math.sin(angle * 2) * 1;
      if (containerRef.current) {
        containerRef.current.style.transform = `translate(${tx}%, ${ty}%) rotate(${rot}deg)`;
      }

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [reduced]);

  const lineYs = Array.from(
    { length: Math.ceil(dims.height / 24) + 3 },
    (_, i) => -20 + i * 24,
  );

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -2 }}
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

    </>
  );
}
