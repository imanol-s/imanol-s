// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initCarousel } from './initCarousel';

// Minimal ResizeObserver mock
class MockResizeObserver {
  static instances: MockResizeObserver[] = [];
  callback: ResizeObserverCallback;
  observed: Element[] = [];
  disconnected = false;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  unobserve(_el: Element) {}
  disconnect() {
    this.disconnected = true;
  }
}

describe('initCarousel', () => {
  let track: HTMLElement;
  let prev: HTMLButtonElement;
  let next: HTMLButtonElement;

  beforeEach(() => {
    MockResizeObserver.instances = [];
    // @ts-ignore
    window.ResizeObserver = MockResizeObserver;

    track = document.createElement('div');
    track.id = 'projects-track';
    prev = document.createElement('button');
    prev.id = 'carousel-prev';
    next = document.createElement('button');
    next.id = 'carousel-next';

    document.body.appendChild(track);
    document.body.appendChild(prev);
    document.body.appendChild(next);
  });

  afterEach(() => {
    document.body.removeChild(track);
    document.body.removeChild(prev);
    document.body.removeChild(next);
  });

  it('returns a cleanup function', () => {
    const cleanup = initCarousel();
    expect(typeof cleanup).toBe('function');
    cleanup!();
  });

  it('returns undefined when track is missing', () => {
    document.body.removeChild(track);
    const result = initCarousel();
    expect(result).toBeUndefined();
    document.body.appendChild(track);
  });

  it('returns undefined when prev button is missing', () => {
    document.body.removeChild(prev);
    const result = initCarousel();
    expect(result).toBeUndefined();
    document.body.appendChild(prev);
  });

  it('returns undefined when next button is missing', () => {
    document.body.removeChild(next);
    const result = initCarousel();
    expect(result).toBeUndefined();
    document.body.appendChild(next);
  });

  it('cleanup removes click listener from prev button', () => {
    const addSpy = vi.spyOn(prev, 'addEventListener');
    const removeSpy = vi.spyOn(prev, 'removeEventListener');

    const cleanup = initCarousel()!;
    expect(addSpy.mock.calls.find(([t]) => t === 'click')).toBeDefined();

    cleanup();
    expect(removeSpy.mock.calls.find(([t]) => t === 'click')).toBeDefined();

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('cleanup removes click listener from next button', () => {
    const addSpy = vi.spyOn(next, 'addEventListener');
    const removeSpy = vi.spyOn(next, 'removeEventListener');

    const cleanup = initCarousel()!;
    expect(addSpy.mock.calls.find(([t]) => t === 'click')).toBeDefined();

    cleanup();
    expect(removeSpy.mock.calls.find(([t]) => t === 'click')).toBeDefined();

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('cleanup removes scroll listener from track', () => {
    const addSpy = vi.spyOn(track, 'addEventListener');
    const removeSpy = vi.spyOn(track, 'removeEventListener');

    const cleanup = initCarousel()!;
    expect(addSpy.mock.calls.find(([t]) => t === 'scroll')).toBeDefined();

    cleanup();
    expect(removeSpy.mock.calls.find(([t]) => t === 'scroll')).toBeDefined();

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('cleanup removes pointerdown listener from track', () => {
    const addSpy = vi.spyOn(track, 'addEventListener');
    const removeSpy = vi.spyOn(track, 'removeEventListener');

    const cleanup = initCarousel()!;
    expect(addSpy.mock.calls.find(([t]) => t === 'pointerdown')).toBeDefined();

    cleanup();
    expect(removeSpy.mock.calls.find(([t]) => t === 'pointerdown')).toBeDefined();

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('cleanup removes pointermove listener from track', () => {
    const addSpy = vi.spyOn(track, 'addEventListener');
    const removeSpy = vi.spyOn(track, 'removeEventListener');

    const cleanup = initCarousel()!;
    expect(addSpy.mock.calls.find(([t]) => t === 'pointermove')).toBeDefined();

    cleanup();
    expect(removeSpy.mock.calls.find(([t]) => t === 'pointermove')).toBeDefined();

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('cleanup removes pointerup listener from track', () => {
    const addSpy = vi.spyOn(track, 'addEventListener');
    const removeSpy = vi.spyOn(track, 'removeEventListener');

    const cleanup = initCarousel()!;
    expect(addSpy.mock.calls.find(([t]) => t === 'pointerup')).toBeDefined();

    cleanup();
    expect(removeSpy.mock.calls.find(([t]) => t === 'pointerup')).toBeDefined();

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('cleanup disconnects the ResizeObserver', () => {
    const cleanup = initCarousel()!;
    expect(MockResizeObserver.instances.length).toBe(1);
    expect(MockResizeObserver.instances[0].disconnected).toBe(false);

    cleanup();
    expect(MockResizeObserver.instances[0].disconnected).toBe(true);
  });

  it('after cleanup, scroll events on track no longer update arrow state', () => {
    const cleanup = initCarousel()!;
    cleanup();

    // Spy to ensure updateArrows is not called after cleanup
    const prevDisabledBefore = prev.disabled;
    track.dispatchEvent(new Event('scroll'));
    // Disabled state should not have changed after cleanup
    expect(prev.disabled).toBe(prevDisabledBefore);
  });
});
