// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { initMobileMenu } from './mobileMenu';

function createFixture() {
  const root = document.createElement('div');
  root.innerHTML = `
    <button id="mobile-menu-btn" aria-expanded="false">Menu</button>
    <div id="mobile-menu" class="hidden">
      <a href="/about">About</a>
      <a href="/blog">Blog</a>
    </div>
  `;
  return root;
}

describe('initMobileMenu', () => {
  it('toggles menu visibility and aria-expanded on button click', () => {
    const root = createFixture();
    const btn = root.querySelector<HTMLButtonElement>('#mobile-menu-btn')!;
    const menu = root.querySelector<HTMLElement>('#mobile-menu')!;

    initMobileMenu(root);

    btn.click();
    expect(menu.classList.contains('hidden')).toBe(false);
    expect(btn.getAttribute('aria-expanded')).toBe('true');

    btn.click();
    expect(menu.classList.contains('hidden')).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes menu when a link is clicked', () => {
    const root = createFixture();
    const btn = root.querySelector<HTMLButtonElement>('#mobile-menu-btn')!;
    const menu = root.querySelector<HTMLElement>('#mobile-menu')!;
    const link = root.querySelector<HTMLAnchorElement>('a')!;

    initMobileMenu(root);

    // Open menu first
    btn.click();
    expect(menu.classList.contains('hidden')).toBe(false);

    // Click a link
    link.click();
    expect(menu.classList.contains('hidden')).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('cleanup removes all listeners', () => {
    const root = createFixture();
    const btn = root.querySelector<HTMLButtonElement>('#mobile-menu-btn')!;
    const menu = root.querySelector<HTMLElement>('#mobile-menu')!;

    const cleanup = initMobileMenu(root)!;
    cleanup();

    // Button click should have no effect after cleanup
    btn.click();
    expect(menu.classList.contains('hidden')).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('returns undefined when elements are missing', () => {
    const empty = document.createElement('div');
    expect(initMobileMenu(empty)).toBeUndefined();
  });
});
