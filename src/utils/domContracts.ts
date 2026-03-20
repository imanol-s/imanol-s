// Single source of truth for DOM IDs, CSS class names, numeric thresholds,
// and registerOnceAfterSwap keys shared between controllers and Astro templates.

export const BACK_TO_TOP = {
  // Defined in BackToTop.astro
  btnId: 'back-to-top',
  // Defined in ExperienceTimeline.astro — cross-component dependency owned by BackToTop.astro
  sidebarId: 'profile-sidebar',
  swapKey: 'back-to-top',
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
  swapKey:        'carousel',
  scrollRatio:    0.85,
  dragThresholdPx: 5,
} as const;

export const MOBILE_MENU = {
  btnId:       'mobile-menu-btn',
  menuId:      'mobile-menu',
  swapKey:     'site-header',
  hiddenClass: 'hidden',
} as const;
