export function initHeaderScroll(
  header: HTMLElement,
  menuButton: HTMLButtonElement | null,
): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  let frame = 0;
  let previous = Math.max(0, window.scrollY);
  let travel = 0;
  let keyboardEngaged = false;

  const setHidden = (hidden: boolean) => {
    if (hidden === header.hasAttribute("data-header-hidden")) return;
    header.dispatchEvent(
      new CustomEvent("portfolio:header-hide", { detail: { hidden } }),
    );
    header.toggleAttribute("data-header-hidden", hidden);
  };

  const render = () => {
    frame = 0;
    const scroll = Math.max(0, window.scrollY);
    const delta = scroll - previous;
    if (Math.sign(delta) !== Math.sign(travel)) travel = 0;
    travel += delta;
    previous = scroll;
    if (header.querySelector(":focus-visible")) keyboardEngaged = true;
    if (!header.contains(document.activeElement)) keyboardEngaged = false;
    header.toggleAttribute("data-keyboard-engaged", keyboardEngaged);
    header.toggleAttribute("data-header-compact", scroll > 36);
    if (
      scroll < 80 || keyboardEngaged ||
      menuButton?.getAttribute("aria-expanded") === "true"
    ) {
      setHidden(false);
      travel = 0;
    } else if (scroll > 100 && travel > 20) {
      setHidden(true);
      travel = 0;
    } else if (travel < -14) {
      setHidden(false);
      travel = 0;
    }
  };

  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(render);
  };
  window.addEventListener("scroll", schedule, { passive: true, signal });
  header.addEventListener("focusin", render, { signal });
  header.addEventListener("focusout", schedule, { signal });
  header.addEventListener("click", schedule, { signal });
  render();
  return () => {
    controller.abort();
    window.cancelAnimationFrame(frame);
    header.removeAttribute("data-header-hidden");
    header.removeAttribute("data-header-compact");
    header.removeAttribute("data-keyboard-engaged");
  };
}
