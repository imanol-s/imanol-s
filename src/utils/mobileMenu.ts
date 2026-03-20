export function initMobileMenu(btn: HTMLButtonElement, menu: HTMLElement): () => void {
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
