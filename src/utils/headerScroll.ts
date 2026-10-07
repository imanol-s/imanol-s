export function initHeaderScroll(
  header: HTMLElement,
  menuButton: HTMLButtonElement | null,
): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  const navigation = header.querySelector<HTMLElement>("#header-navigation");
  const dockButton =
    header.querySelector<HTMLButtonElement>("#header-dock-btn");
  let frame = 0;
  let focusFrame = 0;
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
    // Accumulate travel in one direction so small scroll reversals do not flicker the dock.
    if (delta && Math.sign(delta) !== Math.sign(travel)) travel = 0;
    travel += delta;
    previous = scroll;
    if (navigation?.querySelector(":focus-visible")) keyboardEngaged = true;
    if (!focusFrame && !navigation?.contains(document.activeElement))
      keyboardEngaged = false;
    header.toggleAttribute("data-keyboard-engaged", keyboardEngaged);
    header.toggleAttribute("data-header-compact", scroll > 36);
    if (
      scroll < 80 ||
      keyboardEngaged ||
      menuButton?.getAttribute("aria-expanded") === "true"
    ) {
      setDocked(false);
      travel = 0;
    } else if (scroll > 100 && travel > 28) {
      setDocked(true);
      travel = 0;
    } else if (travel < -20) {
      setDocked(false);
      travel = 0;
    }
  };

  const measure = () => {
    const available = Math.max(
      56,
      window.innerWidth - (window.innerWidth < 768 ? 32 : 48),
    );
    if (
      window.innerWidth >= 768 &&
      menuButton?.getAttribute("aria-expanded") === "true"
    ) {
      menuButton.setAttribute("aria-expanded", "false");
      header.querySelector("#mobile-menu")?.classList.add("hidden");
    }
    // Measure once per resize: the capsule contracts from its right edge while the frog stays anchored.
    const expandedWidth = Math.min(960, available);
    header.style.setProperty("--header-expanded-width", `${expandedWidth}px`);
    header.style.setProperty("--header-compact-width", `${expandedWidth}px`);
    header.style.setProperty(
      "--header-left",
      `${(window.innerWidth - expandedWidth) / 2}px`,
    );
  };

  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(render);
  };
  dockButton?.addEventListener(
    "click",
    () => {
      setDocked(false);
      travel = 0;
      keyboardEngaged = true;
      window.cancelAnimationFrame(focusFrame);
      // Inherited visibility can settle after the container; focus the link only when it is ready.
      const focusBrand = () => {
        focusFrame = 0;
        if (
          signal.aborted ||
          !header.isConnected ||
          header.hasAttribute("data-header-docked")
        )
          return;
        const brand =
          navigation?.querySelector<HTMLAnchorElement>(".site-brand");
        if (!brand) return;
        if (window.getComputedStyle(brand).visibility !== "visible") {
          focusFrame = window.requestAnimationFrame(focusBrand);
          return;
        }
        brand.focus({ preventScroll: true });
      };
      focusFrame = window.requestAnimationFrame(focusBrand);
    },
    { signal },
  );
  measure();
  window.addEventListener("resize", measure, { passive: true, signal });
  window.addEventListener("scroll", schedule, { passive: true, signal });
  header.addEventListener("focusin", schedule, { signal });
  header.addEventListener("focusout", schedule, { signal });
  header.addEventListener("click", schedule, { signal });
  header.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Escape" &&
        menuButton?.getAttribute("aria-expanded") === "true"
      ) {
        menuButton.setAttribute("aria-expanded", "false");
        header.querySelector("#mobile-menu")?.classList.add("hidden");
        menuButton.focus({ preventScroll: true });
        schedule();
      }
    },
    { signal },
  );
  render();
  return () => {
    controller.abort();
    window.cancelAnimationFrame(frame);
    window.cancelAnimationFrame(focusFrame);
    setDocked(false);
    header.style.removeProperty("--header-expanded-width");
    header.style.removeProperty("--header-compact-width");
    header.style.removeProperty("--header-left");
    header.removeAttribute("data-header-compact");
    header.removeAttribute("data-keyboard-engaged");
  };
}
