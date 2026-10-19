# Repository agent instructions

## Purpose

Review instructions for a personal portfolio site built with Astro 7.3, React 19, Tailwind CSS 4, Vite 8, and TypeScript. Applies to all source files under `src/`, config files at the root, and content collections.

Product context lives in `PRODUCT.md`; `DESIGN.md` records the current implemented design.

## Instruction Precedence

- Root `AGENTS.md` is the single source of truth for shared repository agent instructions.
- If `CLAUDE.md`, `.github/copilot-instructions.md`, or a tool-specific role prompt conflicts with this file, `AGENTS.md` takes precedence.
- `CLAUDE.md` imports this file with `@AGENTS.md` and otherwise carries only repo-agnostic engineering guidance (its always-on directives, conflict resolutions, and the read-before index into `.claude/guidance/`); `.github/copilot-instructions.md` is a pointer-only tool adapter. Maintain shared repository rules here.
- Repository Impeccable hooks are configured in `.codex/hooks.json` with the vendored `.agents/skills/impeccable/` launcher and `.impeccable/config.json`. Preserve this complete bundle; downloaded binaries, local configuration/consent, and hook caches stay untracked. Comp-first applies to new surfaces; refinements preserve the incumbent design.

## Agent workflow and repository hygiene

- Preserve existing dirty changes and inspect the current checkout before edits. Default portfolio work targets `ui-migration`; do not switch an occupied branch or overwrite a checkout. Follow an explicitly authorized isolated staging checkout when provided.
- Use concise, direct responses; answer high-level questions before exploring code. Prefer minimal focused changes, plan multi-step work, and recommend one approach with reasons. Skip major dependency upgrades unless explicitly planned.
- Code changes require a `coding-specialist` delegate; delegate with explicit file ownership and preserve other agents' work. Portfolio writing follows the dedicated agent section below. The parent owns validation and Git operations.
- Audit all affected style touch points before editing. Preserve incumbent design and all three React islands; no added, removed, or converted islands without explicit approval. Hover brightens rather than dims text. Accessibility fixes include measured contrast and visual comparisons.
- Preserve every career role and supplied highlights, without role-count caps. Concept covers remain 2:1 crops; the Dallas evidence map stays complete and uncropped. Hero portrait remains the transparent vector illustration. These are not screenshots or measured results.
- Keep comments necessary and concise. Use conventional commits and `.github/PULL_REQUEST_TEMPLATE.md`; no redundant HTML comments. When moving or renaming files, update imports and documentation references; schema changes must keep content valid.
- Infrastructure/config changes update `AGENTS.md` in the same commit. Keep the configuration field reference below current when fields change; do not duplicate its table in tool adapters.
- Active local skills live in `.agents/skills/`; byte-identical Claude skills link there. Keep Impeccable's committed launcher/config/hooks and the portfolio-writing agent/skill. Do not commit downloaded runtimes or local consent/cache files.
- Graphify output and retired session audit notes are generated artifacts, not maintained project documentation. Keep them ignored; historical copies remain in Git history. Project Claude hooks use repository-relative paths; personal launchers and machine-specific MCP/session hooks do not belong in shared configuration.

- Use native subagent tooling when delegation is requested or required; do not create user-owned chats for internal subtasks.
- Before Astro-specific changes or recommendations, retrieve version-compatible Astro Docs MCP guidance and verify the installed Astro version. Documentation never authorizes a dependency upgrade. If MCP is unavailable, use official Astro documentation and disclose the limitation.
- For Claude browsing, use `/browse` if gstack is available rather than `mcp__claude-in-chrome__*`; do not assume global tools are installed.

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
- Use plain headings that identify content. Avoid decorative numbered kickers, generic slogans, and redundant preambles. Keep supporting labels only when they provide useful information.
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
- **Content collections**: All blog/project content goes through Astro content collections with Zod schemas in `src/content.config.ts` — do not bypass with raw file reads
- Optional project `cardSummary` supplies homepage gallery card copy, falling back to `summary`; the full `summary` remains the detail introduction and metadata source.
- Required project `coverAlt` is the alt text for the concept cover on the project page; keep it with the artwork in frontmatter rather than in page templates.
- Blog routes, navigation, and legacy redirects are removed. Posts and their content schema remain archived; do not expose them as public pages.
- The homepage `/#projects` gallery is the complete project index. WORK and case-study “All projects” links return there; retain every individual `/projects/[id]` page. Exact `/projects` and `/projects/` legacy paths redirect to `/#projects`: Astro supplies a static fallback and Netlify supplies forced HTTP 301 rules. Never redirect `/projects/*` or recreate a duplicate listing page.
- Project `startDate` and `endDate` are optional when unconfirmed. Never invent dates: omit unavailable date text, sort dated projects newest first, use stable ID ordering for ties, and place undated projects last in stable ID order.
- Project charts and architecture diagrams use server-rendered Astro HTML/CSS with visible data and descriptions. Keep measurement scope and approximation qualifiers explicit; omit business identifiers rather than hiding them in the DOM. Do not add a chart runtime or React island.
- **Static data**: Typed arrays/objects exported from `src/data/*.ts` for non-content data (jobs, education)
- **Single layout**: All pages use `src/layouts/Layout.astro` — do not create additional layouts without justification
- **No shadcn/ui**: The shadcn stack has been removed. Build components with Tailwind utility classes directly

## Portfolio Writing Agent

- Delegate substantive visitor-facing writing and editorial reviews to `portfolio_writer`, defined in [`.codex/agents/portfolio-writer.toml`](.codex/agents/portfolio-writer.toml). This agent drafts and reviews project summaries, case studies, homepage copy, and blog prose; the parent agent applies changes and owns validation and Git operations.
- The writer must read [the portfolio-writing skill](.agents/skills/portfolio-writing/SKILL.md) before drafting or reviewing project articles, including formatting-only work. Every project draft or review includes a Markdown audit and brief formatting decisions; use restrained headings, lists, bold, and code where they help reading, without quotas.
- Follow the five editorial criteria in its definition: clear problem/contribution/outcome, easy scanning, grounded voice, preserved facts and metrics, and plain language without em dashes.
- Career bullets in `src/data/career.ts` remain unchanged unless the user explicitly requests edits to those bullets. General requests to improve site copy do not authorize rewriting them.

## Site Configuration (`src/config.ts`)

`src/config.ts` is the **single source of truth** for all personal and site data. Never hardcode personal values (name, bio, email, location, profession, etc.) anywhere in templates or components — always derive them from this file.

**Rule**: When adding or editing a field in `src/config.ts`, update this reference in `AGENTS.md` in the same commit.

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
| `contactInfo.resumeDoc` | `string` (`resume.pdf`)  | Header, hero, profile, footer résumé links   |

### `SOCIALS` — social link entries

Each entry: `{ name, url, icon, show }`. Consumed via `SOCIALS.find(s => s.name === '...')` in `SiteFooter.astro` and `index.astro`. The `icon` field is a legacy string name — inline SVGs are used instead of `<Icon>` calls.

## Browser lifecycle and shared utilities

- Use `astro:page-load` to initialize DOM listeners/observers after navigation; keep module-scoped cleanup and dispose prior listeners. Cross-component DOM IDs need an ownership note at the lookup site.
- React islands coordinate through `src/hooks/useSiteLifecycle.ts`, a module-level `useSyncExternalStore`, not shared React context. Reuse `useReducedMotion`, `useSessionState`, and Astro's `prefersReducedMotion` utility rather than duplicating platform access. Format dates with `src/utils/formatDate.ts`.
- Register technology IDs before using them in project tags. Archived post tags remain free-form.
- Use explicit return types for exported functions; prefer `??` when zero or empty strings are valid, and optional chaining for optional data.

## Error Handling

- Content collection schemas validate at build time via Zod — ensure all required fields are present in frontmatter
- The `astro check` command runs before every build (`npm run build`) — all TypeScript errors must be resolved
- Use optional chaining for fields marked optional in schemas (e.g., `url` in projects)

## Security Considerations

- Never hardcode or commit API keys, tokens, or secrets. Use environment variables or macOS Keychain references; ask before writing configuration if secure referencing is unclear. No `.env` files are used in this project
- External links use `target="_blank"` with `rel="noopener noreferrer"`
- Security headers are set in `netlify.toml` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`)
- Netlify build environment pins Node 22 via `NODE_VERSION` in `netlify.toml`
- Resume PDF is published independently through GitHub Pages; never commit generated PDFs or sensitive personal data

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
- Expectations must be independent of the implementation: no mocked subject, copied algorithm, vacuous assertions, or generated candidate caps that hide regressions. Each changed test must catch a concrete failure.
- Use `npm run test:e2e` for browser-level validation when page rendering, navigation, or responsive layout changes are involved
- Add `// @vitest-environment jsdom` at the top of test files that require browser APIs
- Type-checking via `astro check` remains the primary safety net; tests supplement it for behavioral coverage

### Mandatory Post-Edit Validation (Agent Requirement)

- After **any file edit**, agents must run `npm run build` before finalizing a response.
- After a successful build, preview with `npm run preview -- --port 4321` and inspect the affected routes in a browser (the `/test-server` workflow). The coordinating parent may run these gates for delegated work.
- Agents must not consider a task complete until both commands have been executed and outcomes reported.
- If port `4321` is occupied, identify its owner. Reuse the intended preview or stop only a server started for this verification; never terminate an unrelated/user-retained server. Stop verification servers on completion unless asked to keep them running.
- If build or preview fails, agents must report the exact blocker and either fix it or stop only when genuinely blocked.

## Performance

- Content images use `SiteImage.astro` around Astro `<Image>`: responsive `layout="constrained"`, native 320/400px mobile breakpoints plus the standard larger candidates, lazy/async defaults, AVIF quality 80 for raster artwork, and SVG vector passthrough. Forward native props and attributes; callers own `sizes`, dimensions, CSS cropping, and format/quality/loading/fetchpriority overrides. Evidence images can use PNG for readable labels. Import Go2-W artwork from `src/assets/project-story/`; never target generated image URLs in CSS. Image preloads must match rendered URLs and responsive candidates exactly. Inline diagrams and scenery retain their existing `getImage()` calls.
- Hashed `/_astro/` assets cache immutably for one year; retain existing CDN variant caching for previously published URLs. HTML uses `Netlify-CDN-Cache-Control: public, max-age=0, stale-while-revalidate=86400`; unversioned images revalidate to avoid stale replacements.
- Set `loading="eager"` and `fetchpriority="high"` only for above-the-fold images; use `loading="lazy"` for everything else
- Keep client JS minimal: only `TopoBackground.tsx`, `TypewriterText.tsx`, and `LoadingOverlay.tsx` hydrate — avoid adding new React islands unless truly interactive
- The full hero name remains visible through hydration. Intro dots are transparent, decorative, and nonblocking; the caret and dots finish once per session. Non-home routes, reduced motion, return visits, and constrained connections skip the intro. Denied session storage must not break rendering. The existing topography island persists across Astro navigation to retain its animation phase; Back to Top keeps a stable 48px outlined target.
- Header docking animates only its fixed-height decorative rail/endcap transforms and navigation opacity. Text and layout dimensions stay fixed; the frog and 56px dock target stay anchored. Underline hover uses scaleX, and Back to Top retains its 48px target. Reduced motion removes transitions.
- Container: `max-w-7xl mx-auto px-6`

## Styling

- **Tailwind CSS 4** with CSS-first config in `src/styles/globals.css` — all tokens defined in `@theme {}` block
- Dark mode is **class-based** via `<html class="dark">` (set by inline script in Layout.astro) — use `dark:` prefix in Tailwind or `.dark` selector in custom CSS
- Design system: blueprint/topographic theme with slate palette
- Color tokens: `primary` (#64748b), `accent` (#94a3b8), `background-light` (#f8fafc), `background-dark` (#0f172a)
- Preserve Latin-only font imports rather than full font packages with unused language faces.
- Fonts: JetBrains Mono (`font-display`) for headings/nav/CTAs, IBM Plex Sans (`font-body`) for body text
- Custom utility classes in globals.css: `cad-border`, `cta-primary`, `drawing-hover`, `focus-ring`, `typing-caret`, `project-mdx`, `topo-lines`
- Project prose uses `@tailwindcss/typography` `.prose` class with custom color overrides in globals.css
- Scoped Astro `<style>` blocks cannot use `@apply` with Tailwind classes unless `@reference` is added — prefer plain CSS in scoped styles

## Resume publishing

- `ME.contactInfo.resumeDoc` is `resume.pdf`; existing buttons use `/resume.pdf`, a forced Netlify 302 to the Pages PDF.
- `resume/main.tex` is the maintained source. Author changes on `ui-migration`; merge to `main` to compile with pdfLaTeX and publish independently. Never commit generated output.
- Publication is serialized and compares current resume inputs; later site-only changes do not invalidate a valid build.
- Resume-only changes skip Netlify through `node scripts/resume-pipeline.mjs ignore`; uncertain history builds normally.
- Run `node --test scripts/resume-pipeline.check.mjs` for the Git-history regression checks.
- PR CI also skips site checks on resume-only synchronize pushes using the full before/head range; opened PRs and uncertain history keep site checks.

## Git identity

- Verified GitHub account: `imanol-s` (ID `72887568`). Use repo-local name `Imanol Saldana` and email `72887568+imanol-s@users.noreply.github.com` for new work. The inherited global identity maps to `imanol655`, a different GitHub account, and must not be used here.
- `npm install`/`npm ci` runs local identity setup through `prepare`, except in CI or outside a Git worktree. Run `npm run setup:git-identity` explicitly when needed; it configures only this repository's identity and `core.hooksPath=.husky`, never global settings.
- Run `npm run check:git-identity` before committing. Enabled hooks check effective author and committer emails, including environment/config overrides, before linting; pre-push also checks each pushed tip. Correct conflicting overrides rather than relying on global fallback or bypassing the configured checks. Existing contributors and historical identities are not rewritten by these guards.
- `npm run test:git-identity` exercises setup and guards in isolated temporary repositories and runs in CI.
- Commitlint imports its conventional rules and parser preset through ESM in `commitlint.config.js`; keep the parser as a direct dependency and preserve the standard rules and commit hook.

- Resume publication runs only from `main`; author changes on `ui-migration` and merge to publish. The workflow trigger, job guard, and freshness comparison all target `main`.
