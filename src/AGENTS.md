# Shared source boundaries

Paths below are repository-root-relative.

- Before changing identity, profile copy, or contact links, read `src/config.ts` and search consumers of `SITE`, `ME`, and `SOCIALS`; derive those values from the existing fields.
- Never invent dates or measured outcomes. Omit unconfirmed dates and business identifiers rather than hiding identifiers in the DOM; state measurement scope and approximation qualifiers.
- Delegate substantive visitor-facing drafts and editorial reviews to `portfolio_writer`; `.codex/agents/portfolio-writer.toml` owns editorial criteria and the handoff.
- Render untrusted plain text with Astro interpolation or text nodes. Permit `innerHTML`/`set:html` only for static trusted markup, trusted-library-sanitized HTML, or controlled collection content.
- Keep `rel="noopener noreferrer"` on links opened with `target="_blank"`; ordinary MDX links need not open a new tab.
- Preserve surrounding relative or `@/*` imports and local versus shared type ownership. Use Astro `class:list`, template literals, or ternaries for conditional classes; do not introduce a `cn()` helper.
- For browser-API unit tests, add `// @vitest-environment jsdom`; Vitest's default environment is not a browser.

## Contracts shared across source folders

- Initialize page-owned DOM listeners/observers on `astro:page-load`; keep module-scoped cleanup and run it before reinitialization and on `astro:before-swap`. Processed component scripts do not rerun on each navigation. Document ownership at cross-component DOM-ID lookups.
- Reuse `src/hooks/useReducedMotion.ts` and `src/hooks/useSessionState.ts` in React; use `src/utils/prefersReducedMotion.ts` for imperative motion snapshots and retain live preference subscriptions where needed.
- Preserve the shared `data-scenery-paused` document state and `scenery:pause-change` event between `src/components/ForestScene.astro`, `src/components/FieldMapScenery.astro`, and `src/utils/fieldMapTrail.ts`.
- Use Astro collections and `src/content.config.ts` for page content rather than raw file reads. Validate required fields, including project `coverAlt`, against the schema rather than a copied frontmatter checklist.
- Keep `cardSummary` limited to gallery copy with a `summary` fallback. Keep the full summary as the detail introduction and metadata source; keep alt text with its artwork.
- Use `src/data/projectCollection.ts` for project ordering and adjacent-project navigation, and `src/utils/formatDate.ts` for UTC date display.
- Register project tags in `src/data/techRegistry.ts` before using them; use `keywords` for free-form topics. Archived post tags remain free-form.
- Preserve every career role and supplied highlight without role-count caps.

## Page files

These constraints apply to `src/pages/**`. Keep instruction files outside that directory: Astro publishes Markdown there as routes, so this ancestor owns its page instructions.

- Wrap page content in `src/layouts/Layout.astro`; justify introducing another layout. Retain inferred framework entry-point return types where already used.
- Keep WORK and “All projects” links pointing to `/#projects`; preserve the paired Astro fallback and Netlify forced rules when changing legacy redirects.
