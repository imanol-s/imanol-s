# Plan: Architecture Deepening

> Source PRD: Conversation-derived — 5 architectural deepening candidates from codebase review on `ui-migration` branch

## Architectural decisions

Durable decisions that apply across all phases:

- **Registry pattern**: `src/data/techRegistry.ts` is the single source of truth for known technologies. Entries have required `id` and optional `iconPath`, `displayName`, `category`.
- **Hook convention**: React hooks live in `src/hooks/`, plain JS equivalents in `src/utils/`
- **Content schema**: `tags` (validated against tech registry) and `keywords` (free-form topic strings) are separate frontmatter fields
- **Testing**: Vitest with jsdom for DOM-dependent tests. `// @vitest-environment jsdom` directive for browser-API tests. Pure functions get standard Vitest tests.
- **No new React islands**: Animation primitives serve existing frozen React components only (LoadingOverlay, TopoBackground, TypewriterText, DottedGlowBackground)
- **Date format**: All dates render as mixed case `Jan 2025` — no uppercase variant
- **Career data**: Work experience and education co-locate as "career history," separate from identity config

---

## Phase 1: Date Formatter

**Covers**: Module 3 — date formatting consolidation

### What to build

A pure `formatDate` utility that takes a `Date` and returns a consistently formatted string (`Jan 2025`). Replace the 3 independent inline implementations in ExperienceTimeline, project detail page, and PostCard. Remove the `.toUpperCase()` call in ExperienceTimeline that causes the uppercase drift.

### Acceptance criteria

- [ ] `formatDate` utility exists with tests covering: valid dates, edge cases (Jan 1, Dec 31, timezone boundaries)
- [ ] ExperienceTimeline uses `formatDate` — no `.toUpperCase()` on date output
- [ ] Project detail page uses `formatDate` instead of local `fmtDate` helper
- [ ] PostCard uses `formatDate` instead of inline `toLocaleDateString`
- [ ] All rendered dates display as mixed case (`Jan 2025`, not `JAN 2025`)
- [ ] Build passes (`astro check`)

---

## Phase 2: Career Data Consolidation

**Covers**: Module 5 — merge Jobs.ts and education.ts

### What to build

Consolidate `Jobs.ts` and `education.ts` into a single `career.ts` module that exports both `workExperience` and `education`. Update ExperienceTimeline to import from the single source. Delete the two original files. Interfaces (WorkExperience, Education) remain separate since their shapes differ.

### Acceptance criteria

- [ ] `career.ts` exports `workExperience` array and `education` array with their respective interfaces
- [ ] ExperienceTimeline imports from `career.ts` only (no imports from Jobs.ts or education.ts)
- [ ] `Jobs.ts` and `education.ts` are deleted
- [ ] No other file imports from the deleted modules
- [ ] Build passes, site renders identically

---

## Phase 3: BackToTop Init Migration

**Covers**: Module 4 — BackToTop script registration fix

### What to build

Replace BackToTop's manual `__backToTopBound` window flag and `setTimeout(1200)` magic delay with the existing `registerOnceAfterSwap` utility. Replace the timing-based coordination with event-driven timing (listen for the loading overlay's `transitionend` or a similar DOM event instead of hardcoding 1200ms).

### Acceptance criteria

- [ ] BackToTop uses `registerOnceAfterSwap` for its init guard
- [ ] No `__backToTopBound` window property
- [ ] No magic `setTimeout(1200)` delay
- [ ] Initialization timing is event-driven, not hardcoded
- [ ] BackToTop functions correctly on initial load and after view transitions
- [ ] Build passes

---

## Phase 4: Animation Primitives — Reduced Motion

**Covers**: Module 2 part 1 — reduced-motion detection

### What to build

Two utilities that detect `prefers-reduced-motion: reduce`:

1. A React hook (`useReducedMotion`) returning a reactive boolean that updates when the media query changes
2. A plain JS function (`prefersReducedMotion`) for Astro components that returns a boolean at call time

Migrate all 5 components that currently check `window.matchMedia("(prefers-reduced-motion: reduce)")` independently: LoadingOverlay, TopoBackground, TypewriterText, DottedGlowBackground, BackToTop.

### Acceptance criteria

- [ ] `useReducedMotion` React hook exists with tests: returns `true` when reduced-motion preferred, updates reactively on change, cleans up listener on unmount
- [ ] `prefersReducedMotion` plain JS utility exists with tests
- [ ] All 5 components use the shared primitive instead of direct `matchMedia` calls
- [ ] No remaining `matchMedia("(prefers-reduced-motion` patterns outside the two utilities
- [ ] Reduced-motion behavior unchanged for end users
- [ ] Build passes

---

## Phase 5: Animation Primitives — Session Flags

**Covers**: Module 2 part 2 — sessionStorage state management

### What to build

A React hook (`useSessionFlag`) that reads/writes a boolean flag in sessionStorage by key. The hook returns the current value and a setter. Migrate the 3 React components that use sessionStorage for animation state: LoadingOverlay ("visited"), TopoBackground ("seed"), TypewriterText ("played").

Note: TopoBackground stores a seed (number), not a boolean flag — the hook interface may need to be `useSessionState(key, defaultValue)` rather than strictly boolean. Determine the right generalization during implementation.

### Acceptance criteria

- [ ] Session state hook exists with tests: read/write, default values, SSR safety (no window crash)
- [ ] LoadingOverlay uses hook instead of direct `sessionStorage.getItem/setItem`
- [ ] TopoBackground uses hook for seed persistence
- [ ] TypewriterText uses hook for "already played" flag
- [ ] No remaining direct `sessionStorage` calls in the 3 migrated components
- [ ] Session behavior unchanged for end users
- [ ] Build passes

---

## Phase 6: Tech Registry — Core Module

**Covers**: Module 1 part 1 — registry data structure and lookup

### What to build

A tech registry module that serves as the single source of truth for known technologies. Each entry has a required `id` and optional `iconPath`, `displayName`, and `category`. Export:

1. The registry array (or map)
2. A lookup function replacing `getTechIconPath` (returns full entry, not just icon path)
3. A TypeScript type representing valid tech IDs (derived from the registry data)

Populate with all entries currently in the `ICON_MAP` from `techIcons.ts`. Delete `techIcons.ts` and update all consumers of `getTechIconPath` to use the new lookup.

### Acceptance criteria

- [ ] Tech registry module exists with all current ICON_MAP entries migrated
- [ ] Lookup function tested: known tech returns entry, unknown tech returns null/undefined
- [ ] TypeScript type for valid tech IDs exported (enables autocomplete and compile-time checking)
- [ ] `techIcons.ts` deleted
- [ ] All consumers of `getTechIconPath` migrated to new lookup
- [ ] Icons render identically on all pages
- [ ] Build passes

---

## Phase 7: Tech Registry — Schema & Migration

**Covers**: Module 1 part 2 — content validation and config integration

### What to build

Wire the tech registry into the content collection schema and site config:

1. Update the Zod schema for projects and posts: `tags` validates each entry against registry IDs (build-time error on typos). Add a new `keywords` field as `z.array(z.string())` for free-form topic tags.
2. Migrate all frontmatter: move non-tech tags (e.g., "Data Science", "Robotics", "Full-Stack") from `tags` to `keywords`.
3. Constrain `ME.coreLanguages` in config.ts to only accept valid registry tech IDs.
4. Update any rendering logic that displays tags vs keywords (TagPill, project pages, etc.)

### Acceptance criteria

- [ ] Content schema `tags` field validates against registry — a typo like `"Pytohn"` fails `astro check`
- [ ] Content schema has `keywords` field (free-form, no validation)
- [ ] All existing frontmatter migrated: tech entries in `tags`, topic entries in `keywords`
- [ ] `ME.coreLanguages` type-checks against registry IDs
- [ ] Tag pills render for tech tags (with icons); keyword pills render for topics (without icons)
- [ ] Build passes with no schema validation errors
- [ ] Adding an unrecognized tag to frontmatter causes a build failure
