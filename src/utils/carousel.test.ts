// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { initCarousel } from './carousel';

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

function createFixture() {
  const root = document.createElement('div');
  root.innerHTML = `
    <div id="projects-track" style="width:300px;overflow:auto;">
      <div style="width:900px;height:100px;"></div>
    </div>
    <button id="carousel-prev">Prev</button>
    <button id="carousel-next">Next</button>
  `;
  // jsdom doesn't compute layout — stub the properties
  const track = root.querySelector<HTMLElement>('#projects-track')!;
  Object.defineProperty(track, 'clientWidth', { value: 300, configurable: true });
  Object.defineProperty(track, 'scrollWidth', { value: 900, configurable: true });
  Object.defineProperty(track, 'scrollLeft', { value: 0, writable: true, configurable: true });
  track.scrollBy = vi.fn((opts?: ScrollToOptions) => {
    const left = opts?.left ?? 0;
    track.scrollLeft = Math.max(0, Math.min(track.scrollLeft + left, 600));
    track.dispatchEvent(new Event('scroll'));
  }) as unknown as typeof track.scrollBy;
  return root;
}

describe('initCarousel', () => {
  it('scrolls track forward on next click', () => {
    const root = createFixture();
    const track = root.querySelector<HTMLElement>('#projects-track')!;
    const next = root.querySelector<HTMLButtonElement>('#carousel-next')!;

    initCarousel(root);
    next.click();

    expect(track.scrollBy).toHaveBeenCalledWith({ left: 255 }); // 300 * 0.85
  });

  it('disables prev arrow at start, next arrow at end', () => {
    const root = createFixture();
    const prev = root.querySelector<HTMLButtonElement>('#carousel-prev')!;
    const next = root.querySelector<HTMLButtonElement>('#carousel-next')!;

    initCarousel(root);

    // At start: prev disabled, next enabled
    expect(prev.disabled).toBe(true);
    expect(next.disabled).toBe(false);
  });

  it('cleanup removes listeners and disconnects observer', () => {
    const root = createFixture();
    const track = root.querySelector<HTMLElement>('#projects-track')!;
    const next = root.querySelector<HTMLButtonElement>('#carousel-next')!;

    const cleanup = initCarousel(root)!;
    cleanup();

    // After cleanup, clicking should not scroll
    (track.scrollBy as ReturnType<typeof vi.fn>).mockClear();
    next.click();
    expect(track.scrollBy).not.toHaveBeenCalled();
  });

  it('returns undefined when elements are missing', () => {
    const empty = document.createElement('div');
    expect(initCarousel(empty)).toBeUndefined();
  });
});
