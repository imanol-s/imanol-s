// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDottedGlow } from './useDottedGlow';

// ---------------------------------------------------------------------------
// Browser API stubs
// ---------------------------------------------------------------------------

const rafCallbacks: Array<(t: number) => void> = [];

beforeEach(() => {
  // matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });

  // devicePixelRatio
  Object.defineProperty(window, 'devicePixelRatio', {
    writable: true,
    configurable: true,
    value: 1,
  });

  // requestAnimationFrame — capture but don't run automatically
  vi.stubGlobal('requestAnimationFrame', vi.fn((cb: (t: number) => void) => {
    rafCallbacks.push(cb);
    return rafCallbacks.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());

  // ResizeObserver — must be a proper constructor (class/function)
  const ResizeObserverMock = vi.fn(function (this: object) {
    Object.assign(this, {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    });
  });
  vi.stubGlobal('ResizeObserver', ResizeObserverMock);

  // IntersectionObserver — same requirement
  const IntersectionObserverMock = vi.fn(function (this: object) {
    Object.assign(this, {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    });
  });
  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

  // Canvas 2D context
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    setTransform: vi.fn(),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
    get fillStyle() { return ''; },
    set fillStyle(_v: unknown) {},
    get shadowColor() { return ''; },
    set shadowColor(_v: unknown) {},
    get shadowBlur() { return 0; },
    set shadowBlur(_v: number) {},
    get globalAlpha() { return 1; },
    set globalAlpha(_v: number) {},
  })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
});

afterEach(() => {
  vi.restoreAllMocks();
  rafCallbacks.length = 0;
  document.documentElement.className = '';
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a canvas mounted inside a parent div so parentElement is non-null. */
function makeCanvas(): HTMLCanvasElement {
  const div = document.createElement('div');
  Object.defineProperty(div, 'getBoundingClientRect', {
    value: () => ({ width: 300, height: 200, top: 0, left: 0 }),
  });
  const canvas = document.createElement('canvas');
  div.appendChild(canvas);
  document.body.appendChild(div);
  return canvas;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useDottedGlow', () => {
  it('returns a function (callback ref)', () => {
    const { result } = renderHook(() => useDottedGlow());
    expect(typeof result.current).toBe('function');
  });

  it('sets up ResizeObserver and IntersectionObserver when a canvas is attached', () => {
    const { result } = renderHook(() => useDottedGlow());
    const canvas = makeCanvas();

    result.current(canvas);

    expect(ResizeObserver).toHaveBeenCalled();
    expect(IntersectionObserver).toHaveBeenCalled();
    const roInstance = vi.mocked(ResizeObserver).mock.results[0].value;
    const ioInstance = vi.mocked(IntersectionObserver).mock.results[0].value;
    expect(roInstance.observe).toHaveBeenCalledWith(canvas.parentElement);
    expect(ioInstance.observe).toHaveBeenCalledWith(canvas.parentElement);
  });

  it('schedules an animation frame when a canvas is attached', () => {
    const { result } = renderHook(() => useDottedGlow());
    const canvas = makeCanvas();

    result.current(canvas);

    expect(requestAnimationFrame).toHaveBeenCalled();
  });

  it('disconnects observers and cancels RAF when null is passed (detach)', () => {
    const { result } = renderHook(() => useDottedGlow());
    const canvas = makeCanvas();

    result.current(canvas);
    const roInstance = vi.mocked(ResizeObserver).mock.results[0].value;
    const ioInstance = vi.mocked(IntersectionObserver).mock.results[0].value;

    // Detach
    result.current(null);

    expect(roInstance.disconnect).toHaveBeenCalled();
    expect(ioInstance.disconnect).toHaveBeenCalled();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it('disconnects observers and cancels RAF on unmount', () => {
    const { result, unmount } = renderHook(() => useDottedGlow());
    const canvas = makeCanvas();

    result.current(canvas);
    const roInstance = vi.mocked(ResizeObserver).mock.results[0].value;
    const ioInstance = vi.mocked(IntersectionObserver).mock.results[0].value;

    unmount();

    expect(roInstance.disconnect).toHaveBeenCalled();
    expect(ioInstance.disconnect).toHaveBeenCalled();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it('does nothing when canvas has no parentElement', () => {
    const { result } = renderHook(() => useDottedGlow());
    const canvas = document.createElement('canvas');

    expect(() => result.current(canvas)).not.toThrow();
    expect(ResizeObserver).not.toHaveBeenCalled();
  });

  it('accepts default options without errors', () => {
    expect(() => renderHook(() => useDottedGlow())).not.toThrow();
  });

  it('accepts all options without errors', () => {
    expect(() =>
      renderHook(() =>
        useDottedGlow({
          gap: 16,
          radius: 3,
          opacity: 0.8,
          speed: 0.7,
          accentVar: '--color-accent',
          glowVar: '--color-primary',
          _advanced: { speedScale: 2 },
        }),
      ),
    ).not.toThrow();
  });

  it('re-attaches cleanly when called with a new canvas', () => {
    const { result } = renderHook(() => useDottedGlow());

    const canvas1 = makeCanvas();
    const canvas2 = makeCanvas();

    result.current(canvas1);
    const ro1 = vi.mocked(ResizeObserver).mock.results[0].value;

    result.current(canvas2);
    expect(ro1.disconnect).toHaveBeenCalled();
    expect(vi.mocked(ResizeObserver).mock.results.length).toBeGreaterThanOrEqual(2);
  });
});
