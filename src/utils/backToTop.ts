import { prefersReducedMotion } from "./prefersReducedMotion";

const SCROLL_THRESHOLD = 300;
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

/** Back-to-top visibility and focus, with cleanup for Astro navigation. */
export function initBackToTop(btn: HTMLElement): () => void {
  const controller = new AbortController();
  const { signal } = controller;

  let isVisible = false;

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

  function update() {
    if (window.scrollY > SCROLL_THRESHOLD || document.activeElement === btn) {
      show();
    } else {
      hide();
    }
  }

  window.addEventListener("scroll", update, { passive: true, signal });
  update();

  btn.addEventListener(
    "click",
    () => {
      document.getElementById("main-content")?.focus({ preventScroll: true });
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? "instant" : "smooth",
      });
    },
    { signal },
  );

  return () => controller.abort();
}
