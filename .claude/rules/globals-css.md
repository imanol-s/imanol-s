---
paths:
  - "src/styles/globals.css"
---

# globals.css Rules

## Existing Utilities

Before adding new CSS, check if one of these already covers it:

- `.drawing-hover` — animated underline on hover
- `.cad-border` — CAD-style border with corner brackets
- `.focus-ring` — custom focus styles
- `.cta-primary` — primary call-to-action button
- `.horizontal-scroll-snap` — carousel scroll-snap base
- `.render-deferred` — `content-visibility: auto` for below-fold sections

## Theme Variables

Defined in the `@theme` block — use these tokens, don't hardcode hex values:

- `--color-primary`, `--color-accent`, slate variants
- `--font-display` (JetBrains Mono), `--font-body` (Inter)
- `--radius-DEFAULT` (4px)

## Font Loading

Two Latin-only `@font-face` blocks for Inter Variable and JetBrains Mono Variable. Do NOT add full `@fontsource-variable` imports — they add 11 unused @font-face declarations.

## Dark Mode

Uses `@custom-variant dark (&:is(.dark *))`. Use Tailwind `dark:` prefix in templates.
