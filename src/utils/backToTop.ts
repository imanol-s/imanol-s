import { prefersReducedMotion } from './prefersReducedMotion';

export function initBackToTop(root: ParentNode = document): (() => void) | undefined {
  const btn = root.querySelector<HTMLElement>('#back-to-top');
  if (!btn) return undefined;

  const controller = new AbortController();
  const { signal } = controller;

  let isVisible = false;
  let isCollapsed = false;

  function show() {
    if (isVisible) return;
    isVisible = true;
    btn!.classList.remove('opacity-0', 'pointer-events-none');
    btn!.classList.add('opacity-100', 'pointer-events-auto');
  }

  function hide() {
    if (!isVisible) return;
    isVisible = false;
    btn!.classList.add('opacity-0', 'pointer-events-none');
    btn!.classList.remove('opacity-100', 'pointer-events-auto');
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

  const sidebar = root.querySelector<HTMLElement>('#profile-sidebar');

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
    const btnRect = btn!.getBoundingClientRect();

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
