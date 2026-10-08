---
applyTo: "**/*.{astro,ts,tsx,mjs,css,md,mdx}"
---

# Astro Portfolio Site Guidelines

## Purpose

Review instructions for a personal portfolio site built with Astro 7.3, React 19, Tailwind CSS 4, Vite 8, and TypeScript. Applies to all source files under `src/`, config files at the root, and content collections.

## Instruction Precedence

- This file is the canonical instruction source for coding agents in this repository.
- If `AGENTS.md` or `CLAUDE.md` conflicts with this file, this file takes precedence.
- `AGENTS.md` and `CLAUDE.md` should only contain tool-specific deltas and links back to this file.

## Naming Conventions

- **Astro components**: PascalCase (e.g., `SiteHeader.astro`, `SiteFooter.astro`)
- **React components**: PascalCase `.tsx` files (e.g., `TopoBackground.tsx`, `TypewriterText.tsx`)
- **Data files**: PascalCase or camelCase in `src/data/` (e.g., `Jobs.ts`, `education.ts`)
- **Content files**: kebab-case for posts and projects (e.g., `crime-analysis.mdx`)
- **SVG icons**: kebab-case in `src/icons/` (e.g., `github-fill.svg`)
- **Interfaces**: PascalCase, defined in the file that uses them (not in separate type files)
- **Path alias**: Use `@/*` for imports from `src/` (maps to `./src/*` via `tsconfig.json`)

## Code Style

- Avoid em dashes in visitor-facing copy, accessible labels, and metadata.
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
- **Island architecture**: Only three React islands ship JS to the client:
  - `TopoBackground.tsx` — animated SVG background (`client:only="react"`, skips SSR)
  - `TypewriterText.tsx` — hero name animation (`client:load`, SSR-safe)
  - `LoadingOverlay.tsx` — session loading overlay (`client:only="react"`, skips SSR)
- **Content collections**: All blog/project content goes through Astro content collections with Zod schemas in `src/content/config.ts` — do not bypass with raw file reads
- Blog routes, navigation, and legacy redirects are removed. Posts and their content schema remain archived; do not expose them as public pages.
- Project `startDate` and `endDate` are optional when unconfirmed. Never invent dates: omit unavailable date text, sort dated projects newest first, use stable ID ordering for ties, and place undated projects last in stable ID order.
- Project charts and architecture diagrams use server-rendered Astro HTML/CSS with visible data and descriptions. Keep measurement scope and approximation qualifiers explicit; omit business identifiers rather than hiding them in the DOM. Do not add a chart runtime or React island.
- **Static data**: Typed arrays/objects exported from `src/data/*.ts` for non-content data (jobs, education)
- **Single layout**: All pages use `src/layouts/Layout.astro` — do not create additional layouts without justification
- **No shadcn/ui**: The shadcn stack has been removed. Build components with Tailwind utility classes directly

## Portfolio Writing Agent

- Delegate substantive visitor-facing writing and editorial reviews to `portfolio_writer`, defined in [`.codex/agents/portfolio-writer.toml`](../.codex/agents/portfolio-writer.toml). This agent drafts and reviews project summaries, case studies, homepage copy, and blog prose; the parent agent applies changes and owns validation and Git operations.
- The writer must read [the portfolio-writing skill](../.agents/skills/portfolio-writing/SKILL.md) before drafting or reviewing project articles, including formatting-only work. Every project draft or review includes a Markdown audit and brief formatting decisions; use restrained headings, lists, bold, and code where they help reading, without quotas.
- Follow the five editorial criteria in its definition: clear problem/contribution/outcome, easy scanning, grounded voice, preserved facts and metrics, and plain language without em dashes.
- Career bullets in `src/data/career.ts` remain unchanged unless the user explicitly requests edits to those bullets. General requests to improve site copy do not authorize rewriting them.

## Site Configuration (`src/config.ts`)

`src/config.ts` is the **single source of truth** for all personal and site data. Never hardcode personal values (name, bio, email, location, profession, etc.) anywhere in templates or components — always derive them from this file.

**Rule**: When adding or editing a field in `src/config.ts`, update both `AGENTS.md` and `.github/copilot-instructions.md` in the same commit to keep this reference current.

### `SITE` — site-wide metadata

| Field         | Value                                 | Used by                             |
| ------------- | ------------------------------------- | ----------------------------------- |
| `website`     | `https://imanols.dev`                 | Canonical domain reference          |
| `title`       | `"Imanol 'Oman' Saldana"`             | Layout default title                |
| `description` | Portfolio SEO description             | Layout default meta description     |
| `tags`        | `["portfolio", "Resume cv", "Astro"]` | Meta keywords                       |
| `ogImage`     | `/og-image.webp`                      | Open Graph image                    |
| `logo`        | `"frog"`                              | Logo icon name                      |
| `logoText`    | `"Imanol"`                            | Nav brand text, page title prefixes |
| `lang`        | `"en"`                                | `<html lang>` attribute             |
| `favicon`     | `/favicon.png`                        | `<link rel="icon">`                 |
| `repository`  | GitHub repo URL                       | Reference only                      |
| `author`      | `"Imanol Saldana"`                    | Meta author, copyright line         |
| `profile`     | `https://imanols.dev`                 | Canonical profile URL               |

### `ME` — personal content

| Field                   | Type                     | Used by                                      |
| ----------------------- | ------------------------ | -------------------------------------------- |
| `name`                  | `string`                 | TypewriterText, portrait alt, nav aria-label |
| `profession`            | `string[]`               | Hero profession line                         |
| `aboutMe`               | `string`                 | Hero introduction, homepage meta description |
| `headline`              | `string[]`               | Hero two-line value statement                |
| `portraitNote`          | `string`                 | Animated portrait status caption (CSS dots)  |
| `workingStyle`          | `string`                 | Approach section introduction                |
| `approach`              | `{title, description}[]` | Three working approach cards                 |
| `contactNote`           | `string`                 | Footer contact invitation                    |
| `location`              | `string`                 | Geographic reference                         |
| `focusAreas`            | `string[]`               | Hero context strip                           |
| `coreLanguages`         | `TechId[]`               | Profile toolkit language grid                |
| `competencies`          | `string[]`               | Profile areas of practice                    |
| `languages`             | `{name, level}[]`        | Profile communication rows                   |
| `contactInfo.email`     | `string`                 | Hero/footer email links                      |
| `contactInfo.linkedin`  | `string`                 | Reference for LinkedIn URL                   |
| `contactInfo.resumeDoc` | `string`                 | Header, hero, profile, footer résumé links   |

### `SOCIALS` — social link entries

Each entry: `{ name, url, icon, show }`. Consumed via `SOCIALS.find(s => s.name === '...')` in `SiteFooter.astro` and `index.astro`. The `icon` field is a legacy string name — inline SVGs are used instead of `<Icon>` calls.

## Error Handling

- Content collection schemas validate at build time via Zod — ensure all required fields are present in frontmatter
- The `astro check` command runs before every build (`npm run build`) — all TypeScript errors must be resolved
- Use optional chaining for fields marked optional in schemas (e.g., `url` in projects)

## Security Considerations

- Never commit secrets or API keys; no `.env` files are used in this project
- External links use `target="_blank"` with `rel="noopener noreferrer"`
- Security headers are set in `netlify.toml` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`)
- Netlify build environment pins Node 22 via `NODE_VERSION` in `netlify.toml`
- Resume PDF is served as a static file from `public/` — do not inline sensitive personal data in source

### XSS Prevention

**Never use `innerHTML` or Astro's `set:html` directive with user-controlled data** — it creates DOM-based XSS vulnerabilities where malicious HTML/JavaScript can be injected.

```typescript
// VULNERABLE: Never do this
function displayName(name: string) {
  const nameElement = document.getElementById("name-display");
  if (nameElement) {
    nameElement.innerHTML = `Showing results for "${name}"`; // XSS risk!
  }
}
```

**Always use `textContent` for plain text** — it prevents HTML parsing and script execution:

```typescript
// SAFE: Use textContent for user input
function displayName(name: string) {
  const nameElement = document.getElementById("name-display");
  if (nameElement) {
    nameElement.textContent = `Showing results for "${name}"`; // Safe!
  }
}
```

**For complex markup, build DOM elements explicitly**:

```typescript
// SAFE: Construct DOM nodes programmatically
function displayName(name: string) {
  const nameElement = document.getElementById("name-display");
  if (nameElement) {
    nameElement.replaceChildren();
    const prefix = document.createTextNode('Showing results for "');
    const strong = document.createElement("strong");
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

**In Astro components, use `{}` interpolation — never `set:html` with dynamic data**:

```astro
<!-- ❌ NEVER DO THIS -->
<div set:html={userInput} />

<!-- ✅ SAFE: Astro automatically escapes expressions -->
<div>{userInput}</div>
<p>Welcome, {userName}!</p>
```

**Exception**: `innerHTML` / `set:html` is acceptable only with:

- Hardcoded, static HTML strings
- Content sanitized by a trusted library (e.g., DOMPurify)
- Content from your own Astro content collections that you fully control

## Testing Guidelines

- Vitest + jsdom is configured. Run `npm run test` for a single pass or `npm run test:watch` for watch mode
- Use `npm run test:e2e` for browser-level validation when page rendering, navigation, or responsive layout changes are involved
- Add `// @vitest-environment jsdom` at the top of test files that require browser APIs
- Type-checking via `astro check` remains the primary safety net; tests supplement it for behavioral coverage

### Mandatory Post-Edit Validation (Agent Requirement)

- After **any file edit**, agents must run `npm run build` before finalizing a response.
- After a successful build, agents must start preview with `npm run preview -- --port 4321`.
- Agents must not consider a task complete until both commands have been executed and outcomes reported.
- If port `4321` is occupied, agents should free the port and retry on `4321` rather than silently switching ports.
- If build or preview fails, agents must report the exact blocker and either fix it or stop only when genuinely blocked.

## Performance

- Raster content images use Netlify Image CDN with AVIF quality 80 and responsive widths 400/800/1200. SVG artwork uses its imported source directly; image preloads must match rendered URLs exactly.
- Hashed `/_astro/` assets and their Image CDN variants cache immutably for one year. HTML uses `Netlify-CDN-Cache-Control: public, max-age=0, stale-while-revalidate=86400`; unversioned images revalidate to avoid stale replacements.
- Set `loading="eager"` and `fetchpriority="high"` only for above-the-fold images; use `loading="lazy"` for everything else
- Keep client JS minimal: only `TopoBackground.tsx`, `TypewriterText.tsx`, and `LoadingOverlay.tsx` hydrate — avoid adding new React islands unless truly interactive
- Intro name reveal starts while the overlay fades and never clears already-visible text. Returning visits, late hydration, reduced motion, Escape, and no-JS preserve the full name. The existing topography island persists across Astro navigation to retain its animation phase; Back to Top keeps a stable 48px outlined target.
- Container: `max-w-7xl mx-auto px-6`

## Styling

- **Tailwind CSS 4** with CSS-first config in `src/styles/globals.css` — all tokens defined in `@theme {}` block
- Dark mode is **class-based** via `<html class="dark">` (set by inline script in Layout.astro) — use `dark:` prefix in Tailwind or `.dark` selector in custom CSS
- Design system: blueprint/topographic theme with slate palette
- Color tokens: `primary` (#64748b), `accent` (#94a3b8), `background-light` (#f8fafc), `background-dark` (#0f172a)
- Fonts: JetBrains Mono (`font-display`) for headings/nav/CTAs, Inter (`font-body`) for body text
- Custom utility classes in globals.css: `cad-border`, `cta-primary`, `drawing-hover`, `focus-ring`, `horizontal-scroll-snap`, `typing-caret`, `project-mdx`, `topo-lines`
- Project prose uses `@tailwindcss/typography` `.prose` class with custom color overrides in globals.css
- Scoped Astro `<style>` blocks cannot use `@apply` with Tailwind classes unless `@reference` is added — prefer plain CSS in scoped styles
