/**
 * Synchronise the accessibility attributes of the back-to-top button with its
 * visual visibility state.
 *
 * When invisible the button must be removed from the tab order and from the
 * accessibility tree so that keyboard and screen-reader users do not encounter
 * a control that has no visible affordance.
 *
 * @param btn     - The back-to-top button element.
 * @param visible - Whether the button is currently shown to the user.
 */
export function updateBackToTopA11y(btn: HTMLElement, visible: boolean): void {
  if (visible) {
    btn.setAttribute('tabindex', '0');
    btn.removeAttribute('aria-hidden');
  } else {
    btn.setAttribute('tabindex', '-1');
    btn.setAttribute('aria-hidden', 'true');
  }
}
