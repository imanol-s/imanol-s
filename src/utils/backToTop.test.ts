// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initBackToTop } from './backToTop';

function createFixture() {
  const btn = document.createElement('button');
  btn.classList.add('opacity-0', 'pointer-events-none');

  const sidebar = document.createElement('div');

  return { btn, sidebar };
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
    const { btn, sidebar } = createFixture();
    initBackToTop(btn, sidebar);

    Object.defineProperty(window, 'scrollY', { value: 400 });
    window.dispatchEvent(new Event('scroll'));

    expect(btn.classList.contains('opacity-100')).toBe(true);
    expect(btn.classList.contains('pointer-events-auto')).toBe(true);
  });

  it('hides button before scroll threshold', () => {
    const { btn, sidebar } = createFixture();
    initBackToTop(btn, sidebar);

    Object.defineProperty(window, 'scrollY', { value: 400 });
    window.dispatchEvent(new Event('scroll'));
    Object.defineProperty(window, 'scrollY', { value: 100 });
    window.dispatchEvent(new Event('scroll'));

    expect(btn.classList.contains('opacity-0')).toBe(true);
  });

  it('scrolls to top on click', () => {
    const { btn, sidebar } = createFixture();
    initBackToTop(btn, sidebar);
    btn.click();

    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });

  it('cleanup removes all listeners', () => {
    const { btn, sidebar } = createFixture();
    const cleanup = initBackToTop(btn, sidebar);
    cleanup();

    Object.defineProperty(window, 'scrollY', { value: 400 });
    window.dispatchEvent(new Event('scroll'));

    expect(btn.classList.contains('opacity-0')).toBe(true);
  });

  it('works without a sidebar (null)', () => {
    const { btn } = createFixture();
    Object.defineProperty(window, 'scrollY', { value: 400 });
    const cleanup = initBackToTop(btn, null);
    window.dispatchEvent(new Event('scroll'));

    expect(btn.classList.contains('opacity-100')).toBe(true);
    expect(btn.classList.contains('collapsed')).toBe(false);
    cleanup();
  });
});

describe('collapse/expand based on sidebar overlap', () => {
  function makeRect(top: number, bottom: number): DOMRect {
    return { top, bottom, left: 0, right: 0, width: 0, height: bottom - top, x: 0, y: top, toJSON: () => ({}) } as DOMRect;
  }

  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true, configurable: true });
    window.scrollTo = vi.fn();
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn() });
  });

  it('collapses when button and sidebar rects overlap', () => {
    const btn = document.createElement('button');
    const sidebar = document.createElement('div');
    // btn: top=700 bottom=750, sidebar: top=720 bottom=900 → overlaps
    btn.getBoundingClientRect = () => makeRect(700, 750);
    sidebar.getBoundingClientRect = () => makeRect(720, 900);

    initBackToTop(btn, sidebar);
    window.dispatchEvent(new Event('scroll'));

    expect(btn.classList.contains('collapsed')).toBe(true);
  });

  it('expands when button and sidebar rects do not overlap', () => {
    const btn = document.createElement('button');
    const sidebar = document.createElement('div');
    // btn: top=100 bottom=150, sidebar: top=400 bottom=800 → no overlap
    btn.getBoundingClientRect = () => makeRect(100, 150);
    sidebar.getBoundingClientRect = () => makeRect(400, 800);

    initBackToTop(btn, sidebar);
    window.dispatchEvent(new Event('scroll'));

    expect(btn.classList.contains('collapsed')).toBe(false);
  });

  it('never collapses when sidebar is null', () => {
    const btn = document.createElement('button');
    btn.getBoundingClientRect = () => makeRect(700, 750);

    initBackToTop(btn, null);
    window.dispatchEvent(new Event('scroll'));

    expect(btn.classList.contains('collapsed')).toBe(false);
  });

  it('never collapses when viewport is narrower than collapseMinWidth', () => {
    const btn = document.createElement('button');
    const sidebar = document.createElement('div');
    btn.getBoundingClientRect = () => makeRect(700, 750);
    sidebar.getBoundingClientRect = () => makeRect(720, 900);

    Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });
    initBackToTop(btn, sidebar);
    window.dispatchEvent(new Event('scroll'));

    expect(btn.classList.contains('collapsed')).toBe(false);
  });

  it('re-evaluates collapse on each scroll event', () => {
    const btn = document.createElement('button');
    const sidebar = document.createElement('div');

    let sidebarTop = 720;
    btn.getBoundingClientRect = () => makeRect(700, 750);
    sidebar.getBoundingClientRect = () => makeRect(sidebarTop, sidebarTop + 200);

    initBackToTop(btn, sidebar);

    // First scroll: overlapping → collapsed
    window.dispatchEvent(new Event('scroll'));
    expect(btn.classList.contains('collapsed')).toBe(true);

    // Sidebar scrolls above button: no overlap → expanded
    sidebarTop = 0;
    window.dispatchEvent(new Event('scroll'));
    expect(btn.classList.contains('collapsed')).toBe(false);
  });
});
