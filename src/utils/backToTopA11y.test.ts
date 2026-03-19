// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { updateBackToTopA11y } from './backToTopA11y';

describe('updateBackToTopA11y', () => {
  let btn: HTMLButtonElement;

  beforeEach(() => {
    btn = document.createElement('button');
    document.body.appendChild(btn);
  });

  afterEach(() => {
    document.body.removeChild(btn);
  });

  describe('when visible = true', () => {
    it('sets tabindex="0"', () => {
      updateBackToTopA11y(btn, true);
      expect(btn.getAttribute('tabindex')).toBe('0');
    });

    it('removes aria-hidden', () => {
      btn.setAttribute('aria-hidden', 'true');
      updateBackToTopA11y(btn, true);
      expect(btn.hasAttribute('aria-hidden')).toBe(false);
    });

    it('does not set aria-hidden when already visible', () => {
      updateBackToTopA11y(btn, true);
      expect(btn.getAttribute('aria-hidden')).toBeNull();
    });
  });

  describe('when visible = false', () => {
    it('sets tabindex="-1"', () => {
      updateBackToTopA11y(btn, false);
      expect(btn.getAttribute('tabindex')).toBe('-1');
    });

    it('sets aria-hidden="true"', () => {
      updateBackToTopA11y(btn, false);
      expect(btn.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('transitions', () => {
    it('toggling visible → hidden → visible removes aria-hidden again', () => {
      updateBackToTopA11y(btn, true);
      updateBackToTopA11y(btn, false);
      updateBackToTopA11y(btn, true);
      expect(btn.hasAttribute('aria-hidden')).toBe(false);
      expect(btn.getAttribute('tabindex')).toBe('0');
    });

    it('toggling hidden → visible → hidden sets aria-hidden again', () => {
      updateBackToTopA11y(btn, false);
      updateBackToTopA11y(btn, true);
      updateBackToTopA11y(btn, false);
      expect(btn.getAttribute('aria-hidden')).toBe('true');
      expect(btn.getAttribute('tabindex')).toBe('-1');
    });
  });
});
