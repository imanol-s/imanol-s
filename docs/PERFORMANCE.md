# Performance Optimization Guide

Performance optimizations and best practices for the portfolio site.

## Current Architecture

### React Islands (Client-Side JS)

Only two React components hydrate on the client:

| Component | Directive | Size (gzip) | Purpose |
|---|---|---|---|
| `TopoBackground.tsx` | `client:only="react"` | ~1.1 KB | Animated SVG contours |
| `TypewriterText.tsx` | `client:load` | ~0.7 KB | Hero name character animation |

Everything else is server-rendered Astro (zero client JS).

### Bundle Sizes (from build output)

| Asset | Raw | Gzip |
|---|---|---|
| `client.js` (React runtime) | 136 KB | 44 KB |
| `ClientRouter.js` (view transitions) | 15 KB | 5.3 KB |
| `index.js` (React shared) | 6.8 KB | 2.7 KB |
| `TopoBackground.js` | 2.3 KB | 1.1 KB |
| `TypewriterText.js` | 1.2 KB | 0.7 KB |
| `jsx-runtime.js` | 1.0 KB | 0.6 KB |

### Build Stats

- Build time: ~1.6s total
- Pages generated: 10 static HTML pages
- Images: 17 optimized (auto WebP conversion)

## Performance Patterns

### Images
- All images use Astro's `<Image>` component for automatic WebP conversion and responsive sizing
- Project card images: `width={350} height={160}` with `grayscale opacity-60`
- Profile image: `width={256} height={256}`
- Project detail hero: `width={1280} height={360}`
- Blog images use view transitions via `transition:name`

### Layout Shift Prevention
- `TypewriterText`: invisible duplicate `<span>` reserves final dimensions before animation starts
- All images have explicit `width`/`height` attributes
- Fonts use `display=swap` via Google Fonts URL parameter

### Reduced Motion
- `TypewriterText`: renders full text instantly, no caret
- `.topo-lines`: animation disabled via `@media (prefers-reduced-motion: reduce)`
- `.typing-caret`: hidden entirely under reduced motion

### Background Performance
- `TopoBackground` owns a single `requestAnimationFrame` loop
- No mouse/scroll parallax listeners are attached
- SVG turbulence baseFrequency is animated each frame via rAF
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
