interface FrogScrollElements {
  header: HTMLElement;
  logo: SVGElement;
  frog: HTMLElement;
  menuButton: HTMLButtonElement | null;
}

const FLIGHT_DURATION = 1800;

export function initFrogScroll({ header, logo, frog }: FrogScrollElements): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let startedAt = 0;
  let originX = 0;
  let originY = 0;
  let destinationX = 0;
  let active = false;

  const stop = () => {
    active = false;
    window.cancelAnimationFrame(frame);
    frame = 0;
    frog.hidden = true;
    logo.style.opacity = "";
    frog.style.transform = "";
  };

  const render = (now: number) => {
    if (!active) return;
    const progress = Math.min(1, (now - startedAt) / FLIGHT_DURATION);
    if (progress >= 1) {
      stop();
      return;
    }
    const phase = (progress * 3) % 1;
    const airborne = Math.sin(Math.PI * phase);
    const landing = Math.max(0, 1 - Math.min(phase, 1 - phase) / 0.12);
    const x = originX + (destinationX - originX) * progress;
    const ground = originY + (82 - originY) * Math.min(1, progress * 3);
    const y = ground - airborne * Math.min(48, Math.max(24, originY - 10));
    const scaleX = 1 + landing * 0.24 - airborne * 0.1;
    const scaleY = 1 - landing * 0.22 + airborne * 0.13;
    const rotation = Math.cos(Math.PI * phase) * -13 * airborne;
    frog.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`;
    frame = window.requestAnimationFrame(render);
  };

  const change = (event: Event) => {
    const { hidden } = (event as CustomEvent<{ hidden: boolean }>).detail;
    stop();
    if (!hidden || motion.matches) return;
    const bounds = logo.getBoundingClientRect();
    originX = bounds.left;
    originY = Math.max(28, bounds.top);
    destinationX = window.innerWidth + bounds.width;
    startedAt = performance.now();
    active = true;
    frog.hidden = false;
    logo.style.opacity = "0";
    render(startedAt);
  };

  header.addEventListener("portfolio:header-hide", change, { signal });
  window.addEventListener("resize", stop, { passive: true, signal });
  motion.addEventListener("change", stop, { signal });

  return () => {
    controller.abort();
    stop();
  };
}
