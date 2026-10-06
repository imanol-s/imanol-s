---
paths:
  - "src/pages/**"
  - "src/layouts/Layout.astro"
  - "src/components/*.astro"
---

# View Transition Rules

Astro `<ClientRouter/>` enables view transitions. After a navigation, inline `<script>` tags in Astro components re-execute but event listeners on previous DOM nodes are lost.

## Script Re-initialization

Any script that sets up event listeners, observers, or DOM state MUST use `astro:page-load` with a module-scoped cleanup variable:

```ts
let cleanup: (() => void) | undefined;
document.addEventListener("astro:page-load", () => {
  cleanup?.();
  // setup code — assign cleanup
  cleanup = initSomething(el);
});
```

This guarantees:

- The callback runs on first load and after every view transition
- Previous cleanup runs before each re-invocation
- No global registry needed

## DOM IDs

DOM IDs, class names, and thresholds are plain literals owned by each component/util pair (e.g. `#back-to-top` in BackToTop.astro + backToTop.ts). When an ID crosses components, note it with a comment at the lookup site (`#profile-sidebar` is defined in ExperienceTimeline.astro but used by BackToTop.astro).
