import { useEffect, useRef } from "react";

/**
 * Fixed animated topographic background — shared across all pages.
 * Handles its own rAF loop + reduced-motion media query internally.
 */
export default function TopoBackground() {
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const rafId = useRef(0);
  const reducedMotion = useRef(false);

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

  // Horizontal parallels: displaced by the noise filter into organic terrain contours.
  // Lines extend past viewBox edges (-50 to 1050) so displacement never reveals gaps.
  const lineYs = Array.from({ length: 78 }, (_, i) => -20 + i * 14);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none blueprint-grid z-[-1]" />

      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -2 }}
      >
        <div className="topo-lines">
          <svg
            viewBox="0 0 1000 1000"
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
                  numOctaves={5}
                  seed={2}
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
              stroke="rgba(0, 229, 255, 0.22)"
              strokeWidth="0.8"
            >
              {lineYs.map((y) => (
                <line key={y} x1={-50} y1={y} x2={1050} y2={y} />
              ))}
            </g>
          </svg>
        </div>
      </div>

      <div className="motion-topography" />
      <div className="isometric-topography opacity-100" />
    </>
  );
}
