import type {
  TransitionBeforePreparationEvent,
  TransitionBeforeSwapEvent,
} from "astro:transitions/client";

async function prepareArtwork(event: TransitionBeforePreparationEvent) {
  if (event.signal.aborted || event.defaultPrevented) return;
  const incoming = event.newDocument;
  const sources = [
    ...incoming.querySelectorAll(
      ".field-map-terrain, .portrait-image, .forest-scene image[href], .project-opening-art img",
    ),
    ...[...incoming.querySelectorAll("[data-transition-cover]")].slice(
      0,
      matchMedia("(min-width: 768px)").matches ? 2 : 1,
    ),
  ];
  const images = new Map<string, HTMLImageElement>();
  for (const source of sources) {
    const src = source.getAttribute("src") ?? source.getAttribute("href");
    if (!src) continue;
    const url = new URL(src, event.to).href;
    const srcset = source.getAttribute("srcset") ?? "";
    const sizes = source.getAttribute("sizes") ?? "";
    const key = `${url}\n${srcset}\n${sizes}`;
    if (images.has(key)) continue;
    const image = new Image();
    image.sizes = sizes;
    image.srcset = srcset;
    image.src = url;
    images.set(key, image);
  }
  if (!images.size) return;

  await new Promise<void>((resolve) => {
    const finish = () => {
      clearTimeout(timeout);
      event.signal.removeEventListener("abort", stop);
      resolve();
    };
    const stop = () => {
      for (const image of images.values()) {
        image.removeAttribute("src");
        image.removeAttribute("srcset");
      }
      finish();
    };
    // Slow or broken art must not hold navigation indefinitely.
    const timeout = window.setTimeout(stop, 800);
    event.signal.addEventListener("abort", stop, { once: true });
    if (event.signal.aborted) stop();
    else {
      void Promise.all(
        [...images.values()].map((image) => image.decode().catch(() => {})),
      ).then(finish);
    }
  });
}

export function initPageTransitions() {
  document.addEventListener("astro:before-preparation", (event) => {
    const transition = event as TransitionBeforePreparationEvent;
    const loader = transition.loader;
    transition.loader = async () => {
      await loader();
      await prepareArtwork(transition);
    };
  });
  document.addEventListener("astro:before-swap", (event) => {
    const { newDocument } = event as TransitionBeforeSwapEvent;
    const overlay = newDocument.getElementById("loading-overlay");
    if (overlay) overlay.style.display = "none";
  });
}
