---
applyTo: "**/*.{astro,ts,tsx,mjs,css,md,mdx}"
---

# Astro Portfolio Site Guidelines

## Purpose

Review instructions for a personal portfolio site built with Astro 5, React 18, Tailwind CSS 3, and TypeScript. Applies to all source files under `src/`, config files at the root, and content collections.

## Naming Conventions

- **Astro components**: PascalCase (e.g., `ProfileInfo.astro`, `PostCard.astro`)
- **React components**: PascalCase `.tsx` files (e.g., `TabsButtons.tsx`)
- **shadcn/ui components**: lowercase in `src/components/ui/` (e.g., `badge.tsx`, `button.tsx`)
- **Data files**: PascalCase or camelCase in `src/data/` (e.g., `Jobs.ts`, `hardSkills.ts`)
- **Content files**: kebab-case for posts and projects (e.g., `crime-analysis.mdx`)
- **SVG icons**: kebab-case in `src/icons/` (e.g., `github-fill.svg`)
- **Interfaces**: PascalCase, defined in the file that uses them (not in separate type files)
- **Path alias**: Use `@/*` for imports from `src/` (maps to `./src/*` via `tsconfig.json`)

## Code Style

- TypeScript in strict mode (`astro/tsconfigs/strict`)
- Prefer `const` for values that don't change; use arrow functions for utility exports
- Use proper TypeScript interfaces instead of `any` — define props interfaces in each component
- JSDoc comments on exported utility functions with `@param` and `@return` tags
- Astro component frontmatter uses section comments to organize imports (e.g., `// component imports`, `// library imports`)

```typescript
// Correct: typed interface + destructured props
interface Job {
    title: string;
    company: string;
    currentJob: boolean;
}
const { jobData } = Astro.props;
const { title, company, currentJob } = jobData as Job;
```

```typescript
// Correct: utility function with JSDoc
/**
 * Merges multiple class values into a single string.
 * @param {...ClassValue[]} inputs - Class values to merge.
 * @return {string} Merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Architecture Rules

- **Astro-first**: Default to `.astro` components. Only use React (`.tsx`) when client-side interactivity is required
- **Island architecture**: React components hydrate via `client:visible`, `client:idle`, or `client:load` — never hydrate entire pages
- **Content collections**: All blog/project content goes through Astro content collections with Zod schemas in `src/content/config.ts` — do not bypass with raw file reads
- **Static data**: Typed arrays/objects exported from `src/data/*.ts` for non-content data (jobs, skills, education)
- **Single layout**: All pages use `src/layouts/Layout.astro` — do not create additional layouts without justification
- **shadcn/ui**: Add new UI primitives via `npx shadcn@latest add <component>`, do not hand-roll components that shadcn provides

## Error Handling

- Content collection schemas validate at build time via Zod — ensure all required fields are present in frontmatter
- The `astro check` command runs before every build (`npm run build`) — all TypeScript errors must be resolved
- Use optional chaining for fields marked optional in schemas (e.g., `url` in projects)
- Provide fallback rendering for empty collections (see `projects/index.astro` pattern: `allProjects.length > 0 ? ... : <p>No projects found.</p>`)

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
- Use `import.meta.glob` with `{ eager: true }` for build-time image loading
- Keep the container narrow: max `520px` at lg, `620px` at xl — do not override without design intent
- Minimize client-side JavaScript: only `TabsButtons.tsx` should hydrate; avoid adding new React islands unless truly interactive

## Styling

- Use project color tokens from `tailwind.config.mjs` — do not use hardcoded hex values
- Dark mode is `prefers-color-scheme: media` (not class-based) — always provide both light and dark variants
- Light mode primary: `primary-light` (gold `#FBD144`); dark mode primary: `primary-dark` (olive `#556B2F`)
- Prose/typography colors are mapped in `src/styles/globals.css` — update both light and dark sections together
- Use the `cn()` utility from `src/lib/utils.ts` for conditional class merging in React components
