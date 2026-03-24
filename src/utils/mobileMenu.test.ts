// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { initMobileMenu } from './mobileMenu';

function createFixture() {
  const btn = document.createElement('button');
  btn.setAttribute('aria-expanded', 'false');
  btn.textContent = 'Menu';

  const menu = document.createElement('div');
  menu.classList.add('hidden');
  menu.innerHTML = `
    <a href="/projects">Projects</a>
    <a href="/blog">Blog</a>
  `;

  return { btn, menu };
}

describe('initMobileMenu', () => {
  it('toggles menu visibility and aria-expanded on button click', () => {
    const { btn, menu } = createFixture();

    initMobileMenu(btn, menu);

    btn.click();
    expect(menu.classList.contains('hidden')).toBe(false);
    expect(btn.getAttribute('aria-expanded')).toBe('true');

    btn.click();
    expect(menu.classList.contains('hidden')).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes menu when a link is clicked', () => {
    const { btn, menu } = createFixture();
    const link = menu.querySelector<HTMLAnchorElement>('a')!;

    initMobileMenu(btn, menu);

    btn.click();
    expect(menu.classList.contains('hidden')).toBe(false);

    link.click();
    expect(menu.classList.contains('hidden')).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('cleanup removes all listeners', () => {
    const { btn, menu } = createFixture();

    const cleanup = initMobileMenu(btn, menu);
    cleanup();

    btn.click();
    expect(menu.classList.contains('hidden')).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });
});
