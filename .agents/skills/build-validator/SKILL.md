---
name: build-validator
description: Use when running or debugging the build for the imanols.dev portfolio site — covers astro check, build errors, and common failure patterns
---

# Build Validator

## Commands

```bash
npm run build          # astro check && astro build (type-check + build)
npm run dev            # development server
npx astro check        # type-check only, no build output
```

`npm run build` will fail and show type errors **before** generating any output — fix `astro check` errors first.

## Error Triage Order

1. Run `npx astro check` — fix all TypeScript errors
2. Run `npm run build` — fix any remaining build errors
3. Run `npm run preview` — validate the production output locally

## Common Error Patterns

### Content collection schema mismatch
```
ZodError: Required field missing: "description"
```
Check `src/content/config.ts` for the exact schema. All required fields must be present in frontmatter. See `new-blog-post` or `new-project-entry` skills for correct templates.

### Tailwind v4 `@apply` in scoped styles
```
Cannot apply unknown utility class
```
Astro `<style>` blocks cannot use `@apply` with Tailwind classes unless the file starts with:
```css
<style>
@reference "../../styles/globals.css";
.my-class { @apply text-white; }
</style>
```
Prefer plain CSS in scoped styles to avoid this entirely.

### TypeScript `any` type
```
error TS7006: Parameter 'x' implicitly has an 'any' type
```
Project runs in strict mode. Use `unknown` with type guards, or define a proper interface.

### Missing Astro prop interface
```
error: Property 'title' does not exist on type '{}'
```
Define a `interface Props { ... }` and destructure from `Astro.props`.

### Image import errors
```
Could not load image: ./images/...
```
- Blog post `cover.src` must be a path relative to the `.md` file
- Project `cover` must also be relative
- Image files must exist at the referenced path before build

### React island hydration
- `client:only="react"` — component skips SSR entirely (use for `TopoBackground`)
- `client:load` — component SSR renders, then hydrates (use for `TypewriterText`, `LoadingOverlay`)
- Mixing these up causes hydration mismatches or `window is not defined` during build

### View Transitions event listener leak
If a `<script>` block registers event listeners without cleanup, View Transitions will re-run the block on every navigation → listeners stack. Guard with a flag or removeEventListener.

## Netlify Build Config

See `netlify.toml` for the build command and publish directory. The build runs identically locally and on Netlify. Environment: no `.env` file — no secrets used.

## Quick Checks Before Push

- [ ] `npm run build` exits 0
- [ ] No TypeScript errors from `astro check`
- [ ] New content files have all required frontmatter fields
- [ ] New React components use `client:*` directive if interactive
