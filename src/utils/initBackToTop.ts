import { prefersReducedMotion } from './prefersReducedMotion';
import { updateBackToTopA11y } from './backToTopA11y';

/**
 * Initialise the Back-to-Top button behaviour.
 *
 * Returns a cleanup function that removes all event listeners, or
 * `undefined` when the button element is not present in the DOM.
 */
export function initBackToTop(): (() => void) | undefined {
  const btn = document.getElementById('back-to-top');
  if (!btn) return undefined;

  let isVisible = false;
  let isCollapsed = false;

  function show() {
    if (isVisible) return;
    isVisible = true;
    btn!.classList.remove('opacity-0', 'pointer-events-none');
    btn!.classList.add('opacity-100', 'pointer-events-auto');
    updateBackToTopA11y(btn!, true);
  }

  function hide() {
    if (!isVisible) return;
    isVisible = false;
    btn!.classList.add('opacity-0', 'pointer-events-none');
    btn!.classList.remove('opacity-100', 'pointer-events-auto');
    updateBackToTopA11y(btn!, false);
  }

  function collapse() {
    if (isCollapsed) return;
    isCollapsed = true;
    btn!.classList.add('collapsed');
  }

  function expand() {
    if (!isCollapsed) return;
    isCollapsed = false;
    btn!.classList.remove('collapsed');
  }

  const sidebar = document.getElementById('tech-stack-sidebar');

  function update() {
    if (window.scrollY > 300) {
      show();
    } else {
      hide();
    }

    if (!sidebar || window.innerWidth < 1024) {
      expand();
      return;
    }

    const sidebarRect = sidebar.getBoundingClientRect();
    const vpHeight = window.innerHeight;
    const btnTop = vpHeight - 32 - 40;
    const btnBottom = vpHeight - 32;

    const overlaps = sidebarRect.top < btnBottom && sidebarRect.bottom > btnTop;

    if (overlaps) {
      collapse();
    } else {
      expand();
    }
  }

  function handleClick() {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'smooth' });
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  btn.addEventListener('click', handleClick);
  update();

  return function cleanup() {
    window.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
    btn.removeEventListener('click', handleClick);
  };
}
