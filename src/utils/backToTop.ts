import { prefersReducedMotion } from "./prefersReducedMotion";

const SCROLL_THRESHOLD = 300;
const COLLAPSE_MIN_WIDTH = 1024;
const VISIBLE_CLASSES = ["opacity-100", "pointer-events-auto"];
const HIDDEN_CLASSES = ["opacity-0", "pointer-events-none"];

function updateA11y(btn: HTMLElement, visible: boolean): void {
  if (visible) {
    btn.setAttribute("tabindex", "0");
    btn.removeAttribute("aria-hidden");
  } else {
    btn.setAttribute("tabindex", "-1");
    btn.setAttribute("aria-hidden", "true");
  }
}

/**
 * Back-to-top button with sidebar-aware collapse.
 *
 * On desktop, the button shrinks to icon-only when it overlaps the profile
 * sidebar to avoid obscuring content. On mobile (< 1024px) the sidebar is
 * stacked above, so the button always renders expanded.
 *
 * Returns a cleanup function (AbortController) for view-transition teardown.
 */
export function initBackToTop(
  btn: HTMLElement,
  sidebar: HTMLElement | null,
): () => void {
  const controller = new AbortController();
  const { signal } = controller;

  let isVisible = false;
  let isCollapsed = false;

  function show() {
    if (isVisible) return;
    isVisible = true;
    btn.classList.remove(...HIDDEN_CLASSES);
    btn.classList.add(...VISIBLE_CLASSES);
    updateA11y(btn, true);
  }

  function hide() {
    if (!isVisible) return;
    isVisible = false;
    btn.classList.add(...HIDDEN_CLASSES);
    btn.classList.remove(...VISIBLE_CLASSES);
    updateA11y(btn, false);
  }

  function collapse() {
    if (isCollapsed) return;
    isCollapsed = true;
    btn.classList.add("collapsed");
  }

  function expand() {
    if (!isCollapsed) return;
    isCollapsed = false;
    btn.classList.remove("collapsed");
  }

  function update() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      show();
    } else {
      hide();
    }

    if (!sidebar || window.innerWidth < COLLAPSE_MIN_WIDTH) {
      expand();
      return;
    }

    const sidebarRect = sidebar.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    const overlaps =
      sidebarRect.top < btnRect.bottom && sidebarRect.bottom > btnRect.top;

    if (overlaps) {
      collapse();
    } else {
      expand();
    }
  }

  window.addEventListener("scroll", update, { passive: true, signal });
  window.addEventListener("resize", update, { passive: true, signal });
  update();

  btn.addEventListener(
    "click",
    () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? "instant" : "smooth",
      });
    },
    { signal },
  );

  return () => controller.abort();
}
