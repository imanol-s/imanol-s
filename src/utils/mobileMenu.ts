/** Mobile navigation disclosure, with keyboard cycling and Escape dismissal. */
export function initMobileMenu(
  btn: HTMLButtonElement,
  menu: HTMLElement,
): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  const isOpen = () => btn.getAttribute("aria-expanded") === "true";
  const setOpen = (open: boolean) => {
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("hidden", !open);
    menu.inert = !open;
  };

  setOpen(isOpen());

  btn.addEventListener("click", () => setOpen(!isOpen()), { signal });
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false), { signal });
  });
  document.addEventListener(
    "keydown",
    (event) => {
      if (!isOpen()) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        btn.focus({ preventScroll: true });
      } else if (event.key === "Tab") {
        const links = Array.from(
          menu.querySelectorAll<HTMLAnchorElement>("a[href]"),
        );
        const first = btn;
        const last = links.at(-1) ?? btn;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    },
    { signal },
  );
  window.addEventListener(
    "resize",
    () => {
      if (window.innerWidth < 768 || !isOpen()) return;
      const focusHidden =
        menu.contains(document.activeElement) || document.activeElement === btn;
      setOpen(false);
      if (focusHidden)
        btn
          .closest("header")
          ?.querySelector<HTMLAnchorElement>(".site-brand")
          ?.focus();
    },
    { signal },
  );
  return () => controller.abort();
}
