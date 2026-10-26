# Images, fonts, and caching

- Use `src/components/SiteImage.astro` around Astro `<Image>`; inspect that component for current defaults. Preserve constrained responsive layout, native mobile candidates, lazy/async defaults, AVIF artwork, and SVG passthrough. Forward native props/attributes; callers own sizes, dimensions, cropping, and overrides. PNG is appropriate for readable evidence labels.
- Import Go2-W artwork from `src/assets/project-story/`; never target generated image URLs in CSS. Preloads must match rendered URLs and responsive candidates exactly. Inline diagrams/scenery retain their `getImage()` calls.
- Use eager/high-priority loading only above the fold; lazy-load other images.
- The story font uses `/project-story/WixMadeforText.woff2` with TTF fallback and case-study preloading via Layout's `storyFont` flag. Keep preload and `@font-face` sources synchronized.
- Scenery uses `getImage()` WebP quality 60. Hero/scenery terrain call sites must share options to reuse one request.
- Keep hashed `/_astro/` assets immutable for one year and preserve CDN variant caching for previously published URLs. HTML uses `Netlify-CDN-Cache-Control: public, max-age=0, stale-while-revalidate=86400`; unversioned images revalidate.
