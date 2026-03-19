// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initBackToTop } from './initBackToTop';

describe('initBackToTop', () => {
  let btn: HTMLButtonElement;

  beforeEach(() => {
    btn = document.createElement('button');
    btn.id = 'back-to-top';
    document.body.appendChild(btn);
    // Reset scroll position
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true, writable: true });
  });

  afterEach(() => {
    document.body.removeChild(btn);
  });

  it('returns a cleanup function', () => {
    const cleanup = initBackToTop();
    expect(typeof cleanup).toBe('function');
    cleanup!();
  });

  it('returns undefined (no-op) when button is not found', () => {
    document.body.removeChild(btn);
    const result = initBackToTop();
    expect(result).toBeUndefined();
    // Re-add so afterEach cleanup does not throw
    document.body.appendChild(btn);
  });

  it('cleanup removes the scroll listener', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const cleanup = initBackToTop()!;

    const scrollCall = addSpy.mock.calls.find(([type]) => type === 'scroll');
    expect(scrollCall).toBeDefined();

    cleanup();

    const removeScrollCall = removeSpy.mock.calls.find(([type]) => type === 'scroll');
    expect(removeScrollCall).toBeDefined();

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('cleanup removes the resize listener', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const cleanup = initBackToTop()!;

    const resizeCall = addSpy.mock.calls.find(([type]) => type === 'resize');
    expect(resizeCall).toBeDefined();

    cleanup();

    const removeResizeCall = removeSpy.mock.calls.find(([type]) => type === 'resize');
    expect(removeResizeCall).toBeDefined();

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('cleanup removes the click listener from the button', () => {
    const addSpy = vi.spyOn(btn, 'addEventListener');
    const removeSpy = vi.spyOn(btn, 'removeEventListener');

    const cleanup = initBackToTop()!;

    const clickCall = addSpy.mock.calls.find(([type]) => type === 'click');
    expect(clickCall).toBeDefined();

    cleanup();

    const removeClickCall = removeSpy.mock.calls.find(([type]) => type === 'click');
    expect(removeClickCall).toBeDefined();

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('after cleanup, scroll events no longer affect button visibility', () => {
    const cleanup = initBackToTop()!;
    cleanup();

    // Simulate scroll beyond threshold
    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true, writable: true });
    window.dispatchEvent(new Event('scroll'));

    // Button should NOT have been made visible (opacity-0 still present from initial state)
    expect(btn.classList.contains('opacity-100')).toBe(false);
  });

  it('after cleanup, resize events no longer affect button', () => {
    const cleanup = initBackToTop()!;
    cleanup();

    const resizeSpy = vi.fn();
    window.addEventListener('resize', resizeSpy);
    window.dispatchEvent(new Event('resize'));
    // The internal handler should not run — btn classes unchanged
    expect(btn.classList.contains('opacity-100')).toBe(false);
    window.removeEventListener('resize', resizeSpy);
  });
});
