---
paths:
  - "src/pages/**"
---

# Routes

- Keep agent instructions outside `src/pages/`: Astro turns Markdown there into public routes. Use this scoped rule instead of a directory `AGENTS.md`.
- Reuse `src/layouts/Layout.astro`; justify additional layouts. Retain inferred framework entry-point return types where already used.
- Follow `PRODUCT.md` for route boundaries. Keep WORK and “All projects” links pointing to the homepage gallery; preserve the paired Astro fallback and Netlify forced rules when changing redirects.
- Before changing collection rendering, read `src/content/AGENTS.md`; use `src/data/projectCollection.ts` for ordering and read `src/data/AGENTS.md` before changing its behavior.
- Before changing page-owned scripts, read `src/utils/AGENTS.md` for lifecycle and DOM-ownership contracts.
