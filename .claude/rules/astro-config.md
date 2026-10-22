---
paths:
  - "astro.config.mjs"
  - "netlify.toml"
  - ".github/workflows/ci.yml"
---

# Astro Config Rules

Before Astro-specific changes or recommendations, retrieve documentation compatible with the installed version through Astro Docs MCP; use official docs and disclose the limitation if MCP is unavailable. When changing redirects, read `PRODUCT.md` and `.claude/rules/routes.md`. Before changing CI, read `.github/AGENTS.md`.

## Integrations

Current integrations: `mdx()`, `react()`, `icon()`, `sitemap()`. Adding or removing integrations changes the build pipeline — verify with `npm run build`.

## Vite Settings

- Tailwind loaded via `@tailwindcss/vite` plugin (NOT PostCSS)
- Build target: `es2022` (modern browsers only)
- Asset inline limit: `4096` (4KB) — small assets are inlined to reduce HTTP requests

## CI Pipeline

`.github/workflows/ci.yml` is the source of truth for CI gates, including Git identity checks, unit tests, build and browser tests. Inspect the workflow when changing build configuration or dependencies; do not maintain a duplicate pipeline inventory here.

## Deployment

Static site deployed via Netlify. Output goes to `dist/`. Security headers are configured in `netlify.toml`.
