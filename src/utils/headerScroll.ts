export function initHeaderScroll(
  header: HTMLElement,
  menuButton: HTMLButtonElement | null,
): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  const navigation = header.querySelector<HTMLElement>("#header-navigation");
  const dockButton = header.querySelector<HTMLButtonElement>("#header-dock-btn");
  let frame = 0;
  let previous = Math.max(0, window.scrollY);
  let travel = 0;
  let keyboardEngaged = false;

  const setDocked = (docked: boolean) => {
    header.toggleAttribute("data-header-docked", docked);
    if (navigation) navigation.inert = docked;
    if (dockButton) {
      dockButton.hidden = !docked;
      dockButton.setAttribute("aria-expanded", String(!docked));
    }
  };

  const render = () => {
    frame = 0;
    const scroll = Math.max(0, window.scrollY);
    const delta = scroll - previous;
    if (delta && Math.sign(delta) !== Math.sign(travel)) travel = 0;
    travel += delta;
    previous = scroll;
    if (navigation?.querySelector(":focus-visible")) keyboardEngaged = true;
    if (!navigation?.contains(document.activeElement)) keyboardEngaged = false;
    header.toggleAttribute("data-keyboard-engaged", keyboardEngaged);
    header.toggleAttribute("data-header-compact", scroll > 36);
    if (
      scroll < 80 || keyboardEngaged ||
      menuButton?.getAttribute("aria-expanded") === "true"
    ) {
      setDocked(false);
      travel = 0;
    } else if (scroll > 100 && travel > 20) {
      setDocked(true);
      travel = 0;
    } else if (travel < -14) {
      setDocked(false);
      travel = 0;
    }
  };

  const measure = () => {
    const available = window.innerWidth - (window.innerWidth < 768 ? 32 : 48);
    header.style.setProperty("--header-expanded-width", `${Math.min(760, available)}px`);
    header.style.setProperty("--header-compact-width", `${Math.min(680, available)}px`);
  };

  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(render);
  };
  dockButton?.addEventListener("click", () => {
    setDocked(false);
    travel = 0;
    navigation?.querySelector<HTMLAnchorElement>(".site-brand")?.focus({ preventScroll: true });
  }, { signal });
  measure();
  window.addEventListener("resize", measure, { passive: true, signal });
  window.addEventListener("scroll", schedule, { passive: true, signal });
  header.addEventListener("focusin", schedule, { signal });
  header.addEventListener("focusout", schedule, { signal });
  header.addEventListener("click", schedule, { signal });
  render();
  return () => {
    controller.abort();
    window.cancelAnimationFrame(frame);
    setDocked(false);
    header.style.removeProperty("--header-expanded-width");
    header.style.removeProperty("--header-compact-width");
    header.removeAttribute("data-header-compact");
    header.removeAttribute("data-keyboard-engaged");
  };
}
