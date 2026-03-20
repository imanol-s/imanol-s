export function initMobileMenu(root: ParentNode = document): (() => void) | undefined {
  const btn = root.querySelector<HTMLButtonElement>('#mobile-menu-btn');
  const menu = root.querySelector<HTMLElement>('#mobile-menu');
  if (!btn || !menu) return undefined;

  const controller = new AbortController();
  const { signal } = controller;

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('hidden');
  }, { signal });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    }, { signal });
  });

  return () => controller.abort();
}
