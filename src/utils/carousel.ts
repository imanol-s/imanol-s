export function initCarousel(root: ParentNode = document): (() => void) | undefined {
  const track = root.querySelector<HTMLElement>('#projects-track');
  const prev = root.querySelector<HTMLButtonElement>('#carousel-prev');
  const next = root.querySelector<HTMLButtonElement>('#carousel-next');
  if (!track || !prev || !next) return undefined;

  const controller = new AbortController();
  const { signal } = controller;

  const scrollAmount = () => track.clientWidth * 0.85;

  function updateArrows() {
    prev!.disabled = track!.scrollLeft <= 1;
    next!.disabled = track!.scrollLeft + track!.clientWidth >= track!.scrollWidth - 1;
  }

  prev.addEventListener('click', () => track.scrollBy({ left: -scrollAmount() }), { signal });
  next.addEventListener('click', () => track.scrollBy({ left: scrollAmount() }), { signal });
  track.addEventListener('scroll', updateArrows, { passive: true, signal });

  const ro = new ResizeObserver(updateArrows);
  ro.observe(track);
  updateArrows();

  // Pointer drag state
  let isPointerDown = false;
  let isDragging = false;
  let startX = 0;
  let startScroll = 0;
  let pointerId = -1;

  track.addEventListener('pointerdown', (e: PointerEvent) => {
    if (e.button !== 0) return;
    isPointerDown = true;
    isDragging = false;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    pointerId = e.pointerId;
  }, { signal });

  track.addEventListener('pointermove', (e: PointerEvent) => {
    if (!isPointerDown) return;
    const dx = Math.abs(e.clientX - startX);
    if (!isDragging && dx > 5) {
      isDragging = true;
      track.setPointerCapture(pointerId);
      track.style.cursor = 'grabbing';
      track.style.userSelect = 'none';
    }
    if (isDragging) {
      track.scrollLeft = startScroll - (e.clientX - startX);
    }
  }, { signal });

  track.addEventListener('pointerup', () => {
    if (isDragging) {
      track.releasePointerCapture(pointerId);
      track.style.cursor = '';
      track.style.userSelect = '';
      track.addEventListener('click', (ev) => ev.preventDefault(), { once: true, capture: true });
    }
    isPointerDown = false;
    isDragging = false;
  }, { signal });

  return () => {
    controller.abort();
    ro.disconnect();
  };
}
