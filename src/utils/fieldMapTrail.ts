import { prefersReducedMotion } from "./prefersReducedMotion";

export interface TrailGeometry {
  startX: number;
  startY: number;
  gutterX: number;
  endY: number;
  amp: number;
  turnY?: number;
}

export interface Box {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const SEGMENT_LENGTH = 480;
const BEND = 40;
const MAX_AMP = 10;
const EDGE_INSET = 6;
const CONTENT_CLEARANCE = 4;
const FIRE_OFFSET = 14;
const CONTACT_OFFSET = 16;

const OBSTACLE_GAP = 4;
const CORNER = 12;

const r = (n: number) => Math.round(n * 10) / 10;

/** Lowest y at or below startY where a horizontal leg from x0 to x1 clears every box. */
export function clearTurnY(
  startY: number,
  x0: number,
  x1: number,
  boxes: Box[],
): number {
  const [left, right] = x0 < x1 ? [x0, x1] : [x1, x0];
  const crossing = boxes.filter((b) => b.right > left && b.left < right);
  let y = startY;
  for (let moved = true; moved; ) {
    moved = false;
    for (const b of crossing) {
      if (y >= b.top - OBSTACLE_GAP && y <= b.bottom + OBSTACLE_GAP) {
        y = b.bottom + OBSTACLE_GAP + 1;
        moved = true;
      }
    }
  }
  return y;
}

/**
 * One curve from the start to the gutter, then a descent with alternating
 * lateral offsets. Control points stay within their segment's x range, so the
 * line never leaves the x range of its anchors.
 */
export function buildTrailPath({
  startX,
  startY,
  gutterX,
  endY,
  amp,
  turnY = startY,
}: TrailGeometry): string {
  if (![startX, startY, gutterX, endY, amp, turnY].every(Number.isFinite)) {
    return "";
  }
  const drop = Math.max(0, turnY - startY);
  const corner = Math.min(CORNER, drop, Math.abs(gutterX - startX) / 3);
  const legX = startX + Math.sign(gutterX - startX) * corner;
  const legY = startY + drop;
  const run = gutterX - legX;
  const bend = Math.sign(run) * Math.min(BEND, Math.abs(run) / 3);
  const descentY = legY + Math.abs(bend);
  if (endY <= descentY) return "";
  let d = `M${r(startX)} ${r(startY)}`;
  if (drop > 0) {
    d += `C${r(startX)} ${r(legY)} ${r(startX)} ${r(legY)} ${r(legX)} ${r(legY)}`;
  }
  d += `C${r(legX + run * 0.4)} ${r(legY)} ${r(gutterX - bend * 2)} ${r(legY)} ${r(gutterX - bend)} ${r(legY)}`;
  d += `C${r(gutterX)} ${r(legY)} ${r(gutterX)} ${r(legY)} ${r(gutterX)} ${r(descentY)}`;
  const count = Math.max(1, Math.round((endY - descentY) / SEGMENT_LENGTH));
  const step = (endY - descentY) / count;
  let x = gutterX;
  for (let i = 1; i <= count; i++) {
    const nextX = i === count ? gutterX : gutterX + (i % 2 ? amp : -amp);
    const y = descentY + step * (i - 1);
    d += `C${r(x)} ${r(y + step / 2)} ${r(nextX)} ${r(y + step / 2)} ${r(nextX)} ${r(y + step)}`;
    x = nextX;
  }
  return d;
}

/** Positions the trail path from the campfire to the top of #contact in layer coordinates. */
export function initFieldMapTrail(path: SVGPathElement): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  let frame = 0;

  const measure = () => {
    frame = 0;
    const svg = path.ownerSVGElement;
    // .campfire lives in ForestScene.astro, #contact in SiteFooter.astro, #main-content in Layout.astro
    const logs = document.querySelector<SVGPathElement>(
      ".forest-art .campfire > path",
    );
    const contact = document.getElementById("contact");
    const main = document.getElementById("main-content");
    if (!svg || !logs || !contact || !main) {
      path.setAttribute("d", "");
      return;
    }
    const origin = svg.getBoundingClientRect();
    const fire = logs.getBoundingClientRect();
    const fireSvg = logs.ownerSVGElement;
    const mainBox = main.getBoundingClientRect();
    const contentRight =
      mainBox.right -
      parseFloat(getComputedStyle(main).paddingRight) -
      origin.left;
    const edge =
      document.documentElement.clientWidth - EDGE_INSET - origin.left;
    const halfRoom = Math.max(0, (edge - contentRight) / 2);
    const gutterX = Math.min(contentRight + halfRoom, edge);
    const startX = Math.min(
      Math.max(
        fire.left + fire.width / 2 + FIRE_OFFSET - origin.left,
        EDGE_INSET,
      ),
      edge,
    );
    const hero = fireSvg?.closest(".hero-section");
    const boxesOf = (selector: string): Box[] =>
      [...(hero?.querySelectorAll(selector) ?? [])].map((el) => {
        const b = el.getBoundingClientRect();
        return {
          left: b.left - origin.left,
          right: b.right - origin.left,
          top: b.top - origin.top,
          bottom: b.bottom - origin.top,
        };
      });
    // Hero text and links sit beside the camp at some widths, so the trail starts and turns below them.
    const text = boxesOf("p, a, h1, h2, button");
    const startY = clearTurnY(
      fire.top + fire.height / 2 - origin.top,
      startX,
      startX,
      text,
    );
    // The portrait is avoided only where the camp sits outside its box.
    const portraits = boxesOf("img").filter(
      (b) =>
        startX < b.left ||
        startX > b.right ||
        startY < b.top ||
        startY > b.bottom,
    );
    path.setAttribute(
      "d",
      buildTrailPath({
        startX,
        startY,
        turnY: clearTurnY(startY, startX, gutterX, [...text, ...portraits]),
        gutterX,
        endY: contact.getBoundingClientRect().top - origin.top + CONTACT_OFFSET,
        amp: Math.min(MAX_AMP, Math.max(0, halfRoom - CONTENT_CLEARANCE)),
      }),
    );
  };

  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(measure);
  };

  const observer = new ResizeObserver(schedule);
  observer.observe(document.body);
  window.addEventListener("resize", schedule, { signal });
  document.addEventListener("load", schedule, { capture: true, signal });
  document.fonts?.ready.then(() => {
    if (!signal.aborted) schedule();
  });

  return () => {
    controller.abort();
    observer.disconnect();
    cancelAnimationFrame(frame);
  };
}

/** Length along a path whose y never decreases at which it first reaches y. */
export function lengthAtY(
  total: number,
  yAt: (length: number) => number,
  y: number,
): number {
  let lo = 0;
  let hi = total;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (yAt(mid) < y) lo = mid;
    else hi = mid;
  }
  return hi;
}

// Sections in ProjectsCarousel, ExperienceTimeline, HeroSection and SiteFooter.
const INK_TARGETS =
  ".hero-section, .project-section, .career-entry, #profile-sidebar, #contact";
const INK_TRANSITION = "stroke-dashoffset 1.6s cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * Masks the trail with an ink stroke that draws down to the bottom of each
 * section once it scrolls into view. Holds while the scenery is paused and is
 * skipped under reduced motion, which leaves the trail whole.
 */
export function initTrailInk(
  path: SVGPathElement,
  ink: SVGPathElement,
): () => void {
  const svg = path.ownerSVGElement;
  const mask = ink.closest("mask");
  if (
    !svg ||
    !mask ||
    prefersReducedMotion() ||
    !("IntersectionObserver" in window)
  ) {
    return () => {};
  }
  const seen = new Set<Element>();
  let total = 0;
  const paused = () =>
    document.documentElement.dataset.sceneryPaused === "true";

  const offsetFor = () => {
    const top = svg.getBoundingClientRect().top;
    const y = Math.max(
      -Infinity,
      ...[...seen].map((el) => el.getBoundingClientRect().bottom - top),
    );
    return total - lengthAtY(total, (l) => path.getPointAtLength(l).y, y);
  };
  const reveal = (animate: boolean) => {
    if (!total || paused()) return;
    ink.style.transition = animate ? INK_TRANSITION : "none";
    ink.style.strokeDashoffset = String(offsetFor());
  };
  const sync = () => {
    // Font/image loads and deferred content can change the geometry while paused.
    const heldFraction =
      paused() && total ? parseFloat(ink.style.strokeDashoffset) / total : null;
    const d = path.getAttribute("d") ?? "";
    ink.setAttribute("d", d);
    total = d ? path.getTotalLength() : 0;
    ink.style.strokeDasharray = `${total} ${total}`;
    ink.style.transition = "none";
    ink.style.strokeDashoffset = String(
      heldFraction === null ? (total ? offsetFor() : 0) : total * heldFraction,
    );
  };
  const hold = () => {
    if (paused()) {
      const now = getComputedStyle(ink).strokeDashoffset;
      ink.style.transition = "none";
      ink.style.strokeDashoffset = now;
    } else reveal(true);
  };

  path.setAttribute("mask", `url(#${mask.id})`);
  sync();
  const shape = new MutationObserver(sync);
  shape.observe(path, { attributeFilter: ["d"] });
  const sections = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        seen.add(entry.target);
        sections.unobserve(entry.target);
      }
      reveal(true);
    },
    { rootMargin: "0px 0px -15% 0px" },
  );
  for (const el of document.querySelectorAll(INK_TARGETS)) sections.observe(el);
  document.addEventListener("scenery:pause-change", hold);

  return () => {
    shape.disconnect();
    sections.disconnect();
    document.removeEventListener("scenery:pause-change", hold);
    path.removeAttribute("mask");
  };
}
