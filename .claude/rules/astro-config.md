---
paths:
  - "astro.config.mjs"
  - "netlify.toml"
  - ".github/workflows/ci.yml"
---

# Astro Config Rules

## Integrations

Current integrations: `mdx()`, `react()`, `icon()`, `sitemap()`. Adding or removing integrations changes the build pipeline — verify with `npm run build`.

## Vite Settings

- Tailwind loaded via `@tailwindcss/vite` plugin (NOT PostCSS)
- Build target: `es2022` (modern browsers only)
- Asset inline limit: `4096` (4KB) — small assets are inlined to reduce HTTP requests

## CI Pipeline

The CI workflow (`.github/workflows/ci.yml`) runs: `npm ci` -> `npm run test` -> `npm run build`. Changes to build config or dependencies should pass all three steps.

## Deployment

Static site deployed via Netlify. Output goes to `dist/`. Security headers are configured in `netlify.toml`.
