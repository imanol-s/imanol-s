import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useSessionState } from "../hooks/useSessionState";
import { computeTopoFrame, buildLineYs } from "../animations/topoMath";

// Oversized to 150% with -25% inset so the slow CSS rotation never exposes
// blank corners at the viewport edges. Absolute within the fixed 100lvh
// parent so mobile URL bar toggles do not resize (and rescale) the layer.
const TOPO_LINES_STYLE: CSSProperties = {
  position: "absolute",
  inset: "-25%",
  width: "150%",
  height: "150%",
  zIndex: 1,
  pointerEvents: "none",
  willChange: "transform",
};

export default function TopoBackground() {
  const reduced = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const [dims, setDims] = useState({ width: 2000, height: 2000 });
  const [seed, setSeed] = useSessionState<number | null>("topo-seed", null);

  // Seed is stored in sessionStorage so the topography shape stays consistent
  // across Astro view-transition navigations within the same tab, rather than
  // regenerating a visually jarring new pattern on every page visit.
  useEffect(() => {
    if (seed === null) setSeed(Math.floor(Math.random() * 10000));
  }, [seed, setSeed]);

  useEffect(() => {
    // Height comes from the 100lvh layer, not innerHeight, so mobile URL bar
    // toggles (which fire resize) leave the pattern untouched.
    const updateDims = () => {
      const width = window.innerWidth * 2;
      const height =
        (viewportRef.current?.clientHeight || window.innerHeight) * 2;
      setDims((current) =>
        current.width === width && current.height === height
          ? current
          : { width, height },
      );
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

  // The island renders only after hydration, so fade in rather than snap.
  // Web Animations, not CSS: Astro re-inserts the persisted node on every
  // navigation, which would restart a CSS animation and flicker the layer.
  useEffect(() => {
    if (reduced) return;
    viewportRef.current?.animate?.([{ opacity: 0 }, { opacity: 1 }], {
      duration: 900,
      easing: "ease-out",
    });
    // Mount only: a later motion-preference change must not replay it.
  }, []);

  useEffect(() => {
    if (reduced) return;

    // Hold the filtered shape on every device: changing its frequency repeatedly
    // rasterizes the oversized SVG. Keep the existing translate/rotate drift.
    let driftTime = 0;
    let rafId = 0;
    let lastFrequency = "";

    const tick = () => {
      driftTime += 1 / 60;

      const { bfx, bfy, transform } = computeTopoFrame(0.0006, driftTime);
      const frequency = `${bfx} ${bfy}`;
      if (turbulenceRef.current && !lastFrequency) {
        turbulenceRef.current.setAttribute("baseFrequency", frequency);
        lastFrequency = frequency;
      }
      if (containerRef.current) {
        containerRef.current.style.transform = transform;
      }

      rafId = requestAnimationFrame(tick);
    };

    const syncAnimation = () => {
      // Layout.astro suppresses the persisted island on field-map routes.
      if (document.body.hasAttribute("data-field-map")) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      } else if (!rafId) {
        rafId = requestAnimationFrame(tick);
      }
    };

    syncAnimation();
    document.addEventListener("astro:after-swap", syncAnimation);
    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("astro:after-swap", syncAnimation);
    };
  }, [reduced]);

  const lineYs = buildLineYs(dims.height, 24);

  return (
    <>
      <div
        ref={viewportRef}
        className="fixed inset-x-0 top-0 h-lvh pointer-events-none"
        style={{ zIndex: -2 }}
        aria-hidden="true"
      >
        <div data-topo-background ref={containerRef} style={TOPO_LINES_STYLE}>
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
              strokeOpacity="0.10"
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
