---
paths:
  - "src/data/techRegistry.ts"
  - "src/content/projects/**"
  - "src/content.config.ts"
---

# Tech Registry Rules

## Update Order

When adding a new tech tag:

1. Add the entry to `REGISTRY` in `src/data/techRegistry.ts` FIRST
2. THEN reference the ID in project frontmatter `tags`

Reversing this order fails `astro check` because `techTagSchema` validates against the registry at build time.

## Project Tags vs Post Tags

- **Project tags** (`src/content/projects/`): validated against `techRegistry` via `techTagSchema`. Only registered IDs are allowed.
- **Post tags** (`src/content/posts/`): free-form strings. NOT validated against the registry.

Do not confuse these — they use different schemas in `src/content.config.ts`.
