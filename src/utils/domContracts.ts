/**
 * DOM contracts — single source of truth for IDs, class names, thresholds,
 * shared between TypeScript controllers and
 * Astro templates. Prevents stringly-typed coupling across the two layers.
 */

export const BACK_TO_TOP = {
  // Defined in BackToTop.astro
  btnId: 'back-to-top',
  // Defined in ExperienceTimeline.astro — cross-component dependency owned by BackToTop.astro
  sidebarId: 'profile-sidebar',
  scrollThreshold: 300,
  collapseMinWidth: 1024,
  classes: {
    visible:   ['opacity-100', 'pointer-events-auto'] as const,
    hidden:    ['opacity-0',   'pointer-events-none'] as const,
    collapsed: 'collapsed',
  },
} as const;

export const CAROUSEL = {
  trackId:        'projects-track',
  prevId:         'carousel-prev',
  nextId:         'carousel-next',
  scrollRatio:    0.85,
  dragThresholdPx: 5,
} as const;

export const MOBILE_MENU = {
  btnId:       'mobile-menu-btn',
  menuId:      'mobile-menu',
  hiddenClass: 'hidden',
} as const;
