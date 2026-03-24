import { prefersReducedMotion } from './prefersReducedMotion';
import { BACK_TO_TOP } from './domContracts';

/**
 * Back-to-top button with sidebar-aware collapse.
 *
 * On desktop, the button shrinks to icon-only when it overlaps the profile
 * sidebar to avoid obscuring content. On mobile (< 1024px) the sidebar is
 * stacked above, so the button always renders expanded.
 *
 * Returns a cleanup function (AbortController) for view-transition teardown.
 */
export function initBackToTop(btn: HTMLElement, sidebar: HTMLElement | null): () => void {
  const controller = new AbortController();
  const { signal } = controller;

  let isVisible = false;
  let isCollapsed = false;

  function show() {
    if (isVisible) return;
    isVisible = true;
    btn.classList.remove(...BACK_TO_TOP.classes.hidden);
    btn.classList.add(...BACK_TO_TOP.classes.visible);
  }

  function hide() {
    if (!isVisible) return;
    isVisible = false;
    btn.classList.add(...BACK_TO_TOP.classes.hidden);
    btn.classList.remove(...BACK_TO_TOP.classes.visible);
  }

  function collapse() {
    if (isCollapsed) return;
    isCollapsed = true;
    btn.classList.add(BACK_TO_TOP.classes.collapsed);
  }

  function expand() {
    if (!isCollapsed) return;
    isCollapsed = false;
    btn.classList.remove(BACK_TO_TOP.classes.collapsed);
  }

  function update() {
    if (window.scrollY > BACK_TO_TOP.scrollThreshold) {
      show();
    } else {
      hide();
    }

    if (!sidebar || window.innerWidth < BACK_TO_TOP.collapseMinWidth) {
      expand();
      return;
    }

    const sidebarRect = sidebar.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    const overlaps = sidebarRect.top < btnRect.bottom && sidebarRect.bottom > btnRect.top;

    if (overlaps) {
      collapse();
    } else {
      expand();
    }
  }

  window.addEventListener('scroll', update, { passive: true, signal });
  window.addEventListener('resize', update, { passive: true, signal });
  update();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'smooth' });
  }, { signal });

  return () => controller.abort();
}
