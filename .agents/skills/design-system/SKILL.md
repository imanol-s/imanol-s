---
name: design-system
description: Use when writing or reviewing UI code for the imanols.dev portfolio site — covers color tokens, utility classes, dark mode, typography, and layout conventions
---

# Design System Reference

## Theme

Blueprint/topographic aesthetic. Slate palette. **Always dark mode** — `<html class="dark">` is hardcoded in Layout.astro.

## Color Tokens

| Token | Hex | Use |
|-------|-----|-----|
| `primary` | `#64748b` | Accents, hover states, CTAs, timeline dots, typing caret |
| `accent` | `#94a3b8` | Secondary borders, grid lines, scrollbar |
| `background-dark` | `#0f172a` | Page background (always active) |
| `background-light` | `#f8fafc` | Light mode fallback only |

**Text scale (dark mode):**

| Role | Class |
|------|-------|
| Strong headings | `text-white` / `text-slate-900` |
| Body / primary | `text-slate-200` / `text-slate-800` |
| Meta / secondary | `text-slate-400` / `text-slate-600` |
| Muted / labels | `text-slate-500` |

## Typography

| Role | Class | Font |
|------|-------|------|
| Headings, nav, CTAs | `font-display` | JetBrains Mono |
| Body text | `font-body` | Inter |

## Layout

- Container: `max-w-7xl mx-auto px-6`
- Section padding: `py-16` or `py-24`
- Dark mode prefix required in custom CSS: `.dark .my-class { ... }`

## Custom Utility Classes (globals.css)

| Class | Purpose |
|-------|---------|
| `cad-border` | Blueprint-style border |
| `cta-primary` | Primary call-to-action button |
| `drawing-hover` | Hover animation for interactive elements |
| `focus-ring` | Accessible focus indicator |
| `grid-pulse` | Animated grid pulse effect |
| `horizontal-scroll-snap` | Snap-scrolling row |
| `typing-caret` | Animated text cursor |
| `project-mdx` | Styles for project detail MDX content |
| `blueprint-grid` | Blueprint grid background layer |
| `motion-topography` | Animated topo layer |
| `isometric-topography` | Isometric topo layer |
| `topo-lines` | Topo contour lines |

## Dark Mode Rules

- Always use `dark:` Tailwind prefix or `.dark` CSS selector
- Never use light-mode-only classes without a `dark:` counterpart
- Astro `<style>` blocks: cannot use `@apply` with Tailwind — use plain CSS or add `@reference "../../styles/globals.css"` at top

## No `cn()` Utility

`shadcn` was removed. Use template literals:
```tsx
// Correct
const cls = `text-white ${isActive ? "opacity-100" : "opacity-50"}`;
```

## Conditional Classes Pattern

```astro
// Astro
<div class:list={["base-class", { "active-class": isActive }]}>

// React/TSX
<div className={`base-class ${isActive ? "active-class" : ""}`}>
```

## Inline SVG Icons

All icons are inline SVGs. No icon library for new code — just copy the SVG markup directly. The `astro-icon` package remains only for legacy blog icons in `src/icons/`.
