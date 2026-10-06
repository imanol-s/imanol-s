interface FrogScrollElements {
  header: HTMLElement;
  logo: SVGElement;
  frog: HTMLElement;
  menuButton: HTMLButtonElement | null;
}

export function initFrogScroll({
  header,
  logo,
  frog,
  menuButton,
}: FrogScrollElements): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let keyboardEngaged = false;
  let originX = 0;
  let originY = 0;
  let destinationX = 0;

  const measure = () => {
    const bounds = logo.getBoundingClientRect();
    originX = bounds.left;
    originY = bounds.top - header.getBoundingClientRect().top;
    destinationX = window.innerWidth + 40;
  };

  const render = () => {
    frame = 0;
    const scroll = Math.max(0, window.scrollY);
    if (header.querySelector(":focus-visible")) keyboardEngaged = true;
    if (!header.contains(document.activeElement)) keyboardEngaged = false;
    header.toggleAttribute("data-keyboard-engaged", keyboardEngaged);
    const engaged =
      keyboardEngaged || menuButton?.getAttribute("aria-expanded") === "true";
    const active = !motion.matches && !engaged && scroll > 0 && scroll < 600;
    frog.hidden = !active;
    logo.style.opacity = active ? "0" : "";
    if (!active) return;

    const progress = scroll / 600;
    const hop = Math.abs(Math.sin(progress * Math.PI * 3));
    const x = originX + (destinationX - originX) * progress;
    const y = Math.max(Math.min(28, originY), originY - scroll) - hop * 20;
    const rotation = Math.sin(progress * Math.PI * 6) * -12;
    frog.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
  };

  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(render);
  };
  const resize = () => {
    measure();
    schedule();
  };

  measure();
  render();
  window.addEventListener("scroll", schedule, { passive: true, signal });
  window.addEventListener("resize", resize, { passive: true, signal });
  header.addEventListener(
    "focusin",
    () => {
      if (header.querySelector(":focus-visible")) {
        keyboardEngaged = true;
        header.setAttribute("data-keyboard-engaged", "");
      }
      schedule();
    },
    { signal },
  );
  header.addEventListener("focusout", schedule, { signal });
  header.addEventListener("click", schedule, { signal });
  motion.addEventListener("change", schedule, { signal });

  return () => {
    controller.abort();
    window.cancelAnimationFrame(frame);
    header.removeAttribute("data-keyboard-engaged");
    frog.hidden = true;
    logo.style.opacity = "";
    frog.style.transform = "";
  };
}
