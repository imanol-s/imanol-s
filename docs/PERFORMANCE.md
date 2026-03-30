# Performance Optimization Guide

Performance optimizations and best practices for the portfolio site.

## Current Architecture

### React Islands (Client-Side JS)

Three React components hydrate on the client:

| Component | Directive | Size (gzip) | Purpose |
| --- | --- | --- | --- |
| `TopoBackground.tsx` | `client:only="react"` | ~1.1 KB | Animated SVG contours + parallax |
| `TypewriterText.tsx` | `client:load` | ~0.7 KB | Hero name character animation |
| `LoadingOverlay.tsx` | `client:only="react"` | — | Intro animation overlay (once per session) |

Everything else is server-rendered Astro (zero client JS).

### Bundle Sizes (from build output)

| Asset | Raw | Gzip |
| --- | --- | --- |
| `client.js` (React runtime) | 136 KB | 44 KB |
| `ClientRouter.js` (view transitions) | 15 KB | 5.3 KB |
| `index.js` (React shared) | 6.8 KB | 2.7 KB |
| `TopoBackground.js` | 2.3 KB | 1.1 KB |
| `TypewriterText.js` | 1.2 KB | 0.7 KB |
| `jsx-runtime.js` | 1.0 KB | 0.6 KB |

### Build Stats

- Build time: ~1.6s total
- Pages generated: 10 static HTML pages
- Images: optimized with AVIF + WebP via `<Picture>` component

## Performance Patterns

### Images

- All images use Astro's `<Picture>` component with `formats={['avif']}` and `fallbackFormat="webp"` for optimal compression
- Responsive `widths` and `sizes` attributes ensure browsers download the smallest adequate variant
- Project card images: `widths={[300, 350]}` with `loading="lazy" decoding="async"`
- Profile image: `widths={[256, 512]}` with `sizes="256px"`
- Project detail hero: `widths={[640, 960, 1280]}` with responsive `sizes`
- Blog images use view transitions via `transition:name`

### Fonts

- Latin-only `@font-face` declarations in `globals.css` replace full `@fontsource-variable` imports — eliminates Cyrillic/Greek/Vietnamese subset downloads
- `font-display: swap` prevents invisible text during font load
- `<link rel="preload" as="font" type="font/woff2">` in `<head>` eliminates the CSS→parse→download waterfall for Inter and JetBrains Mono

### Navigation

- **Speculation Rules API** (`<script type="speculationrules">`) prerenders same-origin pages on hover in Chromium, enabling near-instant navigation

### Deferred Rendering

- `.render-deferred` utility class applies `content-visibility: auto` to off-screen sections (ExperienceTimeline, ProjectsCarousel), deferring their render cost until they near the viewport

### Build

- Vite `build.target: 'es2022'` drops legacy polyfills for smaller output
- `assetsInlineLimit: 4096` inlines small assets as data URIs to reduce HTTP requests

### Caching (Netlify)

- AVIF images and hashed `_astro/*.woff2` files served with `Cache-Control: public, max-age=31536000, immutable`

### Layout Shift Prevention

- `TypewriterText`: invisible duplicate `<span>` reserves final dimensions before animation starts
- All images have explicit `width`/`height` attributes
- Fonts use `font-display: swap` in CSS `@font-face` declarations

### Reduced Motion

- `TypewriterText`: renders full text instantly, no caret
- `.topo-lines`: animation disabled via `@media (prefers-reduced-motion: reduce)`
- `.typing-caret`: hidden entirely under reduced motion

### Background Performance

- `TopoBackground` owns a single `requestAnimationFrame` loop
- Event listeners use `{ passive: true }` for scroll/mousemove
- SVG turbulence seed cycles every 2s (not every frame)
- All background layers use `pointer-events: none`

## Astro-Specific Patterns

- **Static by default**: All pages are statically generated at build time
- **Selective hydration**: Only `TopoBackground` and `TypewriterText` ship JS to the client
- **Content collection caching**: `getCollection()` results are cached during build
- **`client:only="react"`** for TopoBackground: skips SSR entirely (uses `window`/`requestAnimationFrame`)
- **`client:load`** for TypewriterText: SSR-safe with `typeof window` guard, hydrates immediately

## Monitoring

```bash
# Build with timing
npm run build

# Preview production build
npm run preview

# Check bundle sizes
npm run build && du -h dist/_astro/*

# Lighthouse audit
npx lighthouse https://imanols.dev --view
```

### Target Metrics

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- TTFB (Time to First Byte): < 600ms (Netlify CDN)
