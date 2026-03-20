// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initBackToTop } from './backToTop';

function createFixture() {
  const root = document.createElement('div');
  root.innerHTML = `
    <button id="back-to-top" class="opacity-0 pointer-events-none">Top</button>
    <div id="profile-sidebar" style="position:absolute;"></div>
  `;
  return root;
}

describe('initBackToTop', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true, configurable: true });
    window.scrollTo = vi.fn();
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn() });
  });

  it('shows button after scroll threshold', () => {
    const root = createFixture();
    const btn = root.querySelector<HTMLElement>('#back-to-top')!;

    initBackToTop(root);

    // Simulate scroll past threshold
    Object.defineProperty(window, 'scrollY', { value: 400 });
    window.dispatchEvent(new Event('scroll'));

    expect(btn.classList.contains('opacity-100')).toBe(true);
    expect(btn.classList.contains('pointer-events-auto')).toBe(true);
  });

  it('hides button before scroll threshold', () => {
    const root = createFixture();
    const btn = root.querySelector<HTMLElement>('#back-to-top')!;

    initBackToTop(root);

    // Scroll past then back
    Object.defineProperty(window, 'scrollY', { value: 400 });
    window.dispatchEvent(new Event('scroll'));
    Object.defineProperty(window, 'scrollY', { value: 100 });
    window.dispatchEvent(new Event('scroll'));

    expect(btn.classList.contains('opacity-0')).toBe(true);
  });

  it('scrolls to top on click', () => {
    const root = createFixture();
    const btn = root.querySelector<HTMLElement>('#back-to-top')!;

    initBackToTop(root);
    btn.click();

    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });

  it('cleanup removes all listeners', () => {
    const root = createFixture();
    const btn = root.querySelector<HTMLElement>('#back-to-top')!;

    const cleanup = initBackToTop(root)!;
    cleanup();

    Object.defineProperty(window, 'scrollY', { value: 400 });
    window.dispatchEvent(new Event('scroll'));

    // Should still be hidden — listeners removed
    expect(btn.classList.contains('opacity-0')).toBe(true);
  });

  it('returns undefined when button is missing', () => {
    const empty = document.createElement('div');
    expect(initBackToTop(empty)).toBeUndefined();
  });
});
