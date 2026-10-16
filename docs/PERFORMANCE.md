# Performance reference

This describes the current delivery contract, not benchmark results. Measure a fresh build before claiming bundle sizes, timings or savings.

## Images

- `SiteImage.astro` forwards Astro `<Image>` props and attributes. Defaults are constrained responsive layout, AVIF quality 80 for raster artwork, lazy loading and asynchronous decoding. SVG artwork stays vector; evidence images can override format to retain readable detail.
- Native breakpoints in `astro.config.mjs` include 320/400px mobile candidates. Callers supply accurate `sizes` and retain CSS dimensions/crops. Do not derive resolution-test expectations from generated candidates; compare selected files against independently known original dimensions.
- Hero/opening images opt into eager loading and high fetch priority. `Layout.astro` image preloads must match rendered URLs, candidates and sizes. Navigation preparation must preserve responsive source selection without duplicate downloads.
- Inline diagrams and scenery retain appropriate `getImage()` calls. The decorative lake uses a native media-selected picture within its existing SVG geometry; hidden widths select an inline transparent fallback rather than downloading lake artwork. Preserve no-JS and resize behavior.
- Generated content images do not depend on the `NETLIFY` environment flag or a Netlify adapter. Compare transferred bytes against equivalent CDN variants, not unoptimized originals.

## Runtime and caching

Keep the existing three React islands; Astro scripts also provide focused interactions. Preserve cleanup on navigation, reduced-motion behavior, visibility/offscreen pausing and the existing topography phase across navigation. Do not add a runtime for static charts or diagrams.

Fonts are self-hosted Latin-only IBM Plex Sans and JetBrains Mono. Layout preloads their hashed URLs. Retain the caching/security rules in `netlify.toml`: hashed assets cache immutably, HTML uses CDN stale-while-revalidate, and unversioned images revalidate. Existing CDN-variant caching remains useful for previously published URLs.

## Verification

1. Run `npm run test` and `npm run build` (`astro check` then static build).
2. Preview the built output on port 4321. Astro 7 preview may run as a background daemon; inspect its status and stop only your verification server with `npx astro preview stop` when finished. Do not stop a user-retained server.
3. Run `npm run test:e2e`. Focused image/scenery coverage lives in `e2e/site-image.spec.ts` and `e2e/field-map.spec.ts`.
4. Inspect cold-cache mobile/desktop waterfalls, representative 1×/2×/3× selections, image decoding, layout/crops, transitions and duplicate requests. Include no-JS, resize and reduced-motion checks where affected.
5. Record viewport, density, browser, cache/network conditions, selected asset dimensions and transferred bytes. Emulated checks are not real-device performance measurements.

See [site structure](SITE_STRUCTURE.md) and the canonical [repository instructions](../.github/copilot-instructions.md).
