import { useState, useEffect } from 'react';

/**
 * Snapshot the current dark-mode state from the DOM.
 *
 * Priority: explicit class on <html> (set by the theme toggle script in
 * <head>) wins over the OS media query, ensuring the user's manual choice
 * is respected even before React hydrates.
 */
function detectDarkMode(): boolean {
  const root = document.documentElement;
  if (root.classList.contains('dark')) return true;
  if (root.classList.contains('light')) return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

/**
 * Reactive dark-mode boolean that unifies three signal sources:
 * 1. documentElement.classList check (dark/light class)
 * 2. MutationObserver on class/style attribute changes
 * 3. matchMedia '(prefers-color-scheme: dark)' listener
 */
export function useDarkMode(): boolean {
  const [isDark, setIsDark] = useState(() =>
    typeof window !== 'undefined' ? detectDarkMode() : false,
  );

  useEffect(() => {
    const compute = () => setIsDark(detectDarkMode());

    const mql = window.matchMedia?.('(prefers-color-scheme: dark)') ?? null;
    mql?.addEventListener('change', compute);

    const mo = new MutationObserver(compute);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => {
      mql?.removeEventListener('change', compute);
      mo.disconnect();
    };
  }, []);

  return isDark;
}
