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

**CRITICAL**: Never use `innerHTML` or Astro's `set:html` directive with user-controlled data.

- **Always use `textContent`** for plain text rendering to prevent HTML parsing
- **Never use `innerHTML`** with any data that could come from user input, URL parameters, form fields, or external sources
- **Build DOM elements manually** when markup is needed — use `createElement()` and `textContent` together

**Bad (XSS vulnerable):**
```javascript
// ❌ NEVER DO THIS
element.innerHTML = `Showing results for "${userInput}"`;
```

**Good (XSS safe):**
```javascript
// ✅ Safe: Use textContent
element.textContent = `Showing results for "${userInput}"`;

// ✅ Safe: Build DOM manually when markup is needed
const container = document.getElementById('result');
container.replaceChildren();
const prefix = document.createTextNode('Showing results for "');
const strong = document.createElement('strong');
strong.textContent = userInput; // textContent escapes HTML
const suffix = document.createTextNode('"');
container.append(prefix, strong, suffix);
```

**In Astro components:**
```astro
<!-- ❌ NEVER DO THIS -->
<div set:html={userInput} />

<!-- ✅ SAFE: Use text interpolation -->
<div>{userInput}</div>

<!-- ✅ SAFE: Astro automatically escapes expressions -->
<p>Welcome, {userName}!</p>
```

**Exception**: Only use `innerHTML` or `set:html` with:
- Trusted, hardcoded HTML strings
- Content sanitized by a trusted HTML sanitizer library (e.g., DOMPurify)
- Content from your own content collections that you control

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
