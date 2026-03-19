/**
 * Initialise the ProjectsCarousel behaviour.
 *
 * Returns a cleanup function that removes all 6 event listeners and
 * disconnects the ResizeObserver, or `undefined` when required DOM
 * elements are not present.
 */
export function initCarousel(): (() => void) | undefined {
  const track = document.getElementById('projects-track');
  const prev = document.getElementById('carousel-prev') as HTMLButtonElement | null;
  const next = document.getElementById('carousel-next') as HTMLButtonElement | null;
  if (!track || !prev || !next) return undefined;

  const scrollAmount = () => track.clientWidth * 0.85;

  function updateArrows() {
    prev!.disabled = track!.scrollLeft <= 1;
    next!.disabled = track!.scrollLeft + track!.clientWidth >= track!.scrollWidth - 1;
  }

  function handlePrevClick() {
    track!.scrollBy({ left: -scrollAmount() });
  }

  function handleNextClick() {
    track!.scrollBy({ left: scrollAmount() });
  }

  prev.addEventListener('click', handlePrevClick);
  next.addEventListener('click', handleNextClick);
  track.addEventListener('scroll', updateArrows, { passive: true });

  const resizeObserver = new ResizeObserver(updateArrows);
  resizeObserver.observe(track);
  updateArrows();

  let isPointerDown = false;
  let isDragging = false;
  let startX = 0;
  let startScroll = 0;
  let pointerId = -1;

  function handlePointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    isPointerDown = true;
    isDragging = false;
    startX = e.clientX;
    startScroll = track!.scrollLeft;
    pointerId = e.pointerId;
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isPointerDown) return;
    const dx = Math.abs(e.clientX - startX);
    if (!isDragging && dx > 5) {
      isDragging = true;
      track!.setPointerCapture(pointerId);
      track!.style.cursor = 'grabbing';
      track!.style.userSelect = 'none';
    }
    if (isDragging) {
      track!.scrollLeft = startScroll - (e.clientX - startX);
    }
  }

  function handlePointerUp() {
    if (isDragging) {
      track!.releasePointerCapture(pointerId);
      track!.style.cursor = '';
      track!.style.userSelect = '';
      track!.addEventListener('click', (ev) => ev.preventDefault(), { once: true, capture: true });
    }
    isPointerDown = false;
    isDragging = false;
  }

  track.addEventListener('pointerdown', handlePointerDown);
  track.addEventListener('pointermove', handlePointerMove);
  track.addEventListener('pointerup', handlePointerUp);

  return function cleanup() {
    prev!.removeEventListener('click', handlePrevClick);
    next!.removeEventListener('click', handleNextClick);
    track!.removeEventListener('scroll', updateArrows);
    track!.removeEventListener('pointerdown', handlePointerDown);
    track!.removeEventListener('pointermove', handlePointerMove);
    track!.removeEventListener('pointerup', handlePointerUp);
    resizeObserver.disconnect();
  };
}
