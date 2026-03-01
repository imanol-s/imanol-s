import { useEffect, useRef } from "react";

/**
 * Fixed animated topographic background — shared across all pages.
 * Handles its own rAF loop + reduced-motion media query internally.
 */
export default function TopoBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const rafId = useRef(0);
  const lastSeedTime = useRef(0);
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
    const container = containerRef.current;
    if (!container) return;

    let scrollY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let seed = 1;

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const tick = (timestamp: number) => {
      if (!reducedMotion.current) {
        const scrollShift = scrollY * 0.05;
        const mx = mouseX * 8;
        const my = mouseY * 8;
        container.style.transform = `translateY(${scrollShift}px) translate(${mx}px, ${my}px)`;

        if (timestamp - lastSeedTime.current > 2000) {
          lastSeedTime.current = timestamp;
          seed = (seed % 10) + 1;
          turbulenceRef.current?.setAttribute("seed", String(seed));
        }
      }
      rafId.current = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  const contourGroups = [
    { cx: 500, cy: 500, radii: [80, 130, 185, 245, 310, 380, 455, 530] },
    { cx: 300, cy: 350, radii: [60, 110, 170, 240, 320, 410] },
    { cx: 720, cy: 650, radii: [70, 125, 190, 265, 350] },
  ];

  return (
    <>
      <div className="fixed inset-0 pointer-events-none blueprint-grid z-[-1]" />

      <div
        ref={containerRef}
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
              <filter id="topo-warp">
                <feTurbulence
                  ref={turbulenceRef}
                  type="fractalNoise"
                  baseFrequency="0.01"
                  numOctaves={2}
                  seed={1}
                  result="noise"
                />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale={50} />
              </filter>
            </defs>
            <g
              filter="url(#topo-warp)"
              fill="none"
              stroke="rgba(0, 229, 255, 0.12)"
              strokeWidth="0.8"
            >
              {contourGroups.map((group, gi) =>
                group.radii.map((r) => (
                  <circle key={`${gi}-${r}`} cx={group.cx} cy={group.cy} r={r} />
                )),
              )}
            </g>
          </svg>
        </div>
      </div>

      <div className="motion-topography" />
      <div className="isometric-topography opacity-20 dark:opacity-40" />
    </>
  );
}
