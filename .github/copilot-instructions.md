---
applyTo: "**/*.{astro,ts,tsx,mjs,css,md,mdx}"
---

# Astro Portfolio Site Guidelines

## Purpose

Review instructions for a personal portfolio site built with Astro 5, React 18, Tailwind CSS 4, and TypeScript. Applies to all source files under `src/`, config files at the root, and content collections.

## Instruction Precedence

- This file is the canonical instruction source for coding agents in this repository.
- If `AGENTS.md` or `CLAUDE.md` conflicts with this file, this file takes precedence.
- `AGENTS.md` and `CLAUDE.md` should only contain tool-specific deltas and links back to this file.

## Naming Conventions

- **Astro components**: PascalCase (e.g., `SiteHeader.astro`, `PostCard.astro`)
- **React components**: PascalCase `.tsx` files (e.g., `TopoBackground.tsx`, `TypewriterText.tsx`)
- **Data files**: PascalCase or camelCase in `src/data/` (e.g., `Jobs.ts`, `education.ts`)
- **Content files**: kebab-case for posts and projects (e.g., `crime-analysis.mdx`)
- **SVG icons**: kebab-case in `src/icons/` (e.g., `github-fill.svg`)
- **Interfaces**: PascalCase, defined in the file that uses them (not in separate type files)
- **Path alias**: Use `@/*` for imports from `src/` (maps to `./src/*` via `tsconfig.json`)

## Code Style

- TypeScript in strict mode (`astro/tsconfigs/strict`)
- Prefer `const` for values that don't change; use arrow functions for utility exports
- Use proper TypeScript interfaces instead of `any` — define props interfaces in each component
- No `cn()` utility — use template literals or ternaries for conditional classes

```typescript
// Correct: typed interface + destructured props
interface Props {
    title: string;
    description: string;
}
const { title, description } = Astro.props;
```

## Architecture Rules

- **Astro-first**: Default to `.astro` components. Only use React (`.tsx`) when client-side interactivity is required
- **Island architecture**: Only two React islands ship JS to the client:
  - `TopoBackground.tsx` — animated SVG background (`client:only="react"`, skips SSR)
  - `TypewriterText.tsx` — hero name animation (`client:load`, SSR-safe)
- **Content collections**: All blog/project content goes through Astro content collections with Zod schemas in `src/content/config.ts` — do not bypass with raw file reads
- **Static data**: Typed arrays/objects exported from `src/data/*.ts` for non-content data (jobs, education)
- **Single layout**: All pages use `src/layouts/Layout.astro` — do not create additional layouts without justification
- **No shadcn/ui**: The shadcn stack has been removed. Build components with Tailwind utility classes directly

## Error Handling

- Content collection schemas validate at build time via Zod — ensure all required fields are present in frontmatter
- The `astro check` command runs before every build (`npm run build`) — all TypeScript errors must be resolved
- Use optional chaining for fields marked optional in schemas (e.g., `url` in projects)

## Security Considerations

- Never commit secrets or API keys; no `.env` files are used in this project
- External links use `target="_blank"` with `rel="noopener noreferrer"`
- Security headers are set in `netlify.toml` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`)
- Resume PDF is served as a static file from `public/` — do not inline sensitive personal data in source

### XSS Prevention

**Never use `innerHTML` with user-controlled data** — it creates DOM-based XSS vulnerabilities where malicious HTML/JavaScript can be injected.

```typescript
// VULNERABLE: Never do this
function displayName(name: string) {
  const nameElement = document.getElementById('name-display');
  if (nameElement) {
    nameElement.innerHTML = `Showing results for "${name}"`; // XSS risk!
  }
}
```

**Always use `textContent` for plain text** — it prevents HTML parsing and script execution:

```typescript
// SAFE: Use textContent for user input
function displayName(name: string) {
  const nameElement = document.getElementById('name-display');
  if (nameElement) {
    nameElement.textContent = `Showing results for "${name}"`; // Safe!
  }
}
```

**For complex markup, build DOM elements explicitly**:

```typescript
// SAFE: Construct DOM nodes programmatically
function displayName(name: string) {
  const nameElement = document.getElementById('name-display');
  if (nameElement) {
    nameElement.replaceChildren();
    const prefix = document.createTextNode('Showing results for "');
    const strong = document.createElement('strong');
    strong.textContent = name; // User input stays as text
    const suffix = document.createTextNode('"');
    nameElement.append(prefix, strong, suffix);
  }
}
```

**Guidelines**:
- Use `textContent` or `innerText` for plain text content
- Use `createElement()` + `textContent` for structured content with user input
- Only use `innerHTML` with static, trusted content (e.g., hardcoded strings)
- Never interpolate user input directly into HTML strings

## Testing Guidelines

- No test framework is configured — validate changes via `npm run build` (runs `astro check && astro build`)
- Type-checking is the primary safety net; ensure `astro check` passes with 0 errors and 0 warnings
- Preview production builds locally with `npm run preview` before deploying

## Performance

- Use Astro's `<Image>` component for all images — provides automatic WebP conversion and responsive sizing
- Set `loading="eager"` and `fetchpriority="high"` only for above-the-fold images; use `loading="lazy"` for everything else
- Keep client JS minimal: only `TopoBackground.tsx` and `TypewriterText.tsx` hydrate — avoid adding new React islands unless truly interactive
- Container: `max-w-7xl mx-auto px-6`

## Styling

- **Tailwind CSS 4** with CSS-first config in `src/styles/globals.css` — all tokens defined in `@theme {}` block
- Dark mode is **class-based** via `<html class="dark">` (set by inline script in Layout.astro) — use `dark:` prefix in Tailwind or `.dark` selector in custom CSS
- Design system: blueprint/topographic theme with slate palette
- Color tokens: `primary` (#64748b), `accent` (#94a3b8), `background-light` (#f8fafc), `background-dark` (#0f172a)
- Fonts: JetBrains Mono (`font-display`) for headings/nav/CTAs, Inter (`font-body`) for body text
- Custom utility classes in globals.css: `cad-border`, `cta-primary`, `drawing-hover`, `focus-ring`, `horizontal-scroll-snap`, `typing-caret`, `project-mdx`, `topo-lines`
- Blog prose uses `@tailwindcss/typography` `.prose` class with custom color overrides in globals.css
- Scoped Astro `<style>` blocks cannot use `@apply` with Tailwind classes unless `@reference` is added — prefer plain CSS in scoped styles
