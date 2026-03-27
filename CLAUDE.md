# Portfolio — Astro 5 + React 18 + Tailwind CSS 4

## Commands

npm run dev        # Start dev server
npm run build      # astro check + astro build
npm run test       # vitest run
npm run test:watch # vitest (watch mode)
npx astro check    # Type-check Astro + TS files

## Architecture

- Astro-first: default to `.astro` components. React `.tsx` only for client-side interactivity.
- Three React islands: TopoBackground (`client:only="react"`), TypewriterText (`client:load`), LoadingOverlay (`client:only="react"`). No new islands without explicit approval.
- Content collections in `src/content/` with Zod schemas in `src/content/config.ts`.
- `src/config.ts` — single source of truth for site identity (SITE, ME, SOCIALS).
- `src/data/techRegistry.ts` — single source of truth for tech tags. All tech rendering flows through this.
- `src/data/career.ts` — work experience + education data.

## Key Patterns

- **Tech tags validated at build time**: `tags` in project frontmatter validates against techRegistry IDs. Unknown tags fail `astro check`. Use `keywords` for free-form topic strings.
- **View transition guards**: Use `document.addEventListener('astro:page-load', handler)` for scripts that must re-run after view transitions. Store cleanup in a module-scoped variable.
- **Site lifecycle state machine**: `src/utils/siteLifecycle.ts` defines a pure `transition(state, action)` function. `useSiteLifecycle()` hook exposes state + dispatch via `useSyncExternalStore`. Overlay plays once per session; return visits skip to `ready` immediately.
- **Reduced motion**: React components use `useReducedMotion()` hook; Astro components use `prefersReducedMotion()` utility. Never access `matchMedia` directly.
- **Session state**: React components use `useSessionState(key, default)` hook instead of direct `sessionStorage` access.
- **Date formatting**: All dates render via `formatDate()` from `src/utils/formatDate.ts`. Format: "Jan 2025" (mixed case, no day).

## Testing

Vitest + jsdom. Add `// @vitest-environment jsdom` directive for tests needing browser APIs.
Test files live alongside source: `foo.ts` → `foo.test.ts`.
Hooks tested with `@testing-library/react` `renderHook` + `act`.

## Code Style

- Conventional commits enforced by commitlint (`feat:`, `fix:`, `chore:`, etc.)
- Props interfaces defined inline in each component (no separate type files)
- Path alias: `@/*` maps to `src/`
- Strict TypeScript

## Gotchas

- `src/content/config.ts` post `tags` are NOT validated against techRegistry (only project tags are). Blog post tags are free-form strings.
- Adding a new tech tag requires updating `techRegistry.ts` first, then referencing it in frontmatter — order matters or build fails.
- LoadingOverlay and TypewriterText are separate Astro islands that share state via a module-level store (`useSiteLifecycle`), not React context.

## gstack

- **For all web browsing, use `/browse`. Never use `mcp__claude-in-chrome__*` tools.**
- Available skills: `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/design-consultation`, `/review`, `/ship`, `/browse`, `/qa`, `/qa-only`, `/design-review`, `/setup-browser-cookies`, `/retro`, `/investigate`, `/document-release`, `/codex`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`
