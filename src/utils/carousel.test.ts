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
  const track = document.createElement('div');
  Object.defineProperty(track, 'clientWidth', { value: 300, configurable: true });
  Object.defineProperty(track, 'scrollWidth', { value: 900, configurable: true });
  Object.defineProperty(track, 'scrollLeft', { value: 0, writable: true, configurable: true });
  track.scrollBy = vi.fn((opts?: ScrollToOptions) => {
    const left = opts?.left ?? 0;
    track.scrollLeft = Math.max(0, Math.min(track.scrollLeft + left, 600));
    track.dispatchEvent(new Event('scroll'));
  }) as unknown as typeof track.scrollBy;
  track.setPointerCapture = vi.fn();
  track.releasePointerCapture = vi.fn();

  const prev = document.createElement('button');
  const next = document.createElement('button');

  return { track, prev, next };
}

function pointerEvent(type: string, init: PointerEventInit = {}): PointerEvent {
  return new PointerEvent(type, { bubbles: true, pointerId: 1, button: 0, clientX: 0, ...init });
}

describe('initCarousel', () => {
  it('scrolls track forward on next click', () => {
    const { track, prev, next } = createFixture();
    initCarousel(track, prev, next);
    next.click();
    expect(track.scrollBy).toHaveBeenCalledWith({ left: 255 }); // 300 * 0.85
  });

  it('disables prev arrow at start, next arrow at end', () => {
    const { track, prev, next } = createFixture();
    initCarousel(track, prev, next);

    expect(prev.disabled).toBe(true);
    expect(next.disabled).toBe(false);
  });

  it('cleanup removes listeners and disconnects observer', () => {
    const { track, prev, next } = createFixture();
    const cleanup = initCarousel(track, prev, next);
    cleanup();

    (track.scrollBy as ReturnType<typeof vi.fn>).mockClear();
    next.click();
    expect(track.scrollBy).not.toHaveBeenCalled();
  });

  describe('pointer drag', () => {
    it('does not drag when movement is below threshold', () => {
      const { track, prev, next } = createFixture();
      initCarousel(track, prev, next);

      track.dispatchEvent(pointerEvent('pointerdown', { clientX: 100 }));
      track.dispatchEvent(pointerEvent('pointermove', { clientX: 103 })); // dx=3, below threshold of 5
      track.dispatchEvent(pointerEvent('pointerup'));

      // scrollLeft unchanged, no pointer capture
      expect(track.scrollLeft).toBe(0);
      expect(track.setPointerCapture).not.toHaveBeenCalled();
    });

    it('starts drag and updates scrollLeft when movement exceeds threshold', () => {
      const { track, prev, next } = createFixture();
      Object.defineProperty(track, 'scrollLeft', { value: 0, writable: true, configurable: true });
      initCarousel(track, prev, next);

      track.dispatchEvent(pointerEvent('pointerdown', { clientX: 100 }));
      track.dispatchEvent(pointerEvent('pointermove', { clientX: 90 })); // dx=10, exceeds threshold

      // dragging right→left: startScroll(0) - (90 - 100) = 10
      expect(track.scrollLeft).toBe(10);
      expect(track.setPointerCapture).toHaveBeenCalledWith(1);
      expect(track.style.cursor).toBe('grabbing');
      expect(track.style.userSelect).toBe('none');
    });

    it('resets cursor and releases capture on pointerup after drag', () => {
      const { track, prev, next } = createFixture();
      initCarousel(track, prev, next);

      track.dispatchEvent(pointerEvent('pointerdown', { clientX: 100 }));
      track.dispatchEvent(pointerEvent('pointermove', { clientX: 88 })); // dx=12, dragging
      track.dispatchEvent(pointerEvent('pointerup'));

      expect(track.releasePointerCapture).toHaveBeenCalledWith(1);
      expect(track.style.cursor).toBe('');
      expect(track.style.userSelect).toBe('');
    });

    it('suppresses click event immediately after drag', () => {
      const { track, prev, next } = createFixture();
      initCarousel(track, prev, next);

      const clickHandler = vi.fn();
      track.addEventListener('click', clickHandler);

      track.dispatchEvent(pointerEvent('pointerdown', { clientX: 100 }));
      track.dispatchEvent(pointerEvent('pointermove', { clientX: 88 }));
      track.dispatchEvent(pointerEvent('pointerup'));

      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      track.dispatchEvent(clickEvent);

      expect(clickEvent.defaultPrevented).toBe(true);
    });

    it('ignores pointerdown on non-primary button', () => {
      const { track, prev, next } = createFixture();
      initCarousel(track, prev, next);

      // button: 2 = right-click
      track.dispatchEvent(pointerEvent('pointerdown', { clientX: 100, button: 2 }));
      track.dispatchEvent(pointerEvent('pointermove', { clientX: 80, button: 2 }));

      expect(track.scrollLeft).toBe(0);
      expect(track.setPointerCapture).not.toHaveBeenCalled();
    });
  });
});
