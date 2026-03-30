# Portfolio Architecture — Debate Findings

> Five agents investigated the portfolio's architecture across five axes, debated
> with code-level evidence, and converged on the consensus below.
>
> Date: 2026-03-19 | Branch: `ui-migration`

---

## Panel

| Agent | Axis | Stance |
|---|---|---|
| **island-advocate** | React island architecture | Defend current 3-island constraint |
| **perf-skeptic** | Performance & loading strategy | Challenge overlay orchestration cost |
| **content-analyst** | Content & data architecture | Evaluate content collections + techRegistry |
| **style-critic** | Styling & design system | Assess Tailwind 4 + dark-mode-only |
| **nav-explorer** | Navigation & view transitions | Audit ClientRouter + transition patterns |

---

## Unanimous Consensus

These items had full agreement across all five agents:

1. **The 3-island constraint is correct.** TopoBackground, TypewriterText, and LoadingOverlay each earn their React hydration cost. No existing server-rendered component should become an island. No island should be converted to vanilla JS (the 136KB React bundle is already loaded for the other two islands, making TopoBackground's marginal cost ~2KB).

2. **No content or detail page needs React.** `/projects/[id].astro` and all content pages are 100% Astro-rendered. The 3 islands live entirely in `Layout.astro` and `HeroSection.astro`.

3. **BackBtn.astro:7 is a concrete UX bug.** `onclick="history.back()"` bypasses `ClientRouter`, breaking the shared-element image morph (`transition:name` on PostCard.astro:28 / blog/[id].astro:35) on the return journey. Fix: replace with an `<a href>` link so ClientRouter handles the transition.

4. **TagPill.astro:8 bypasses the design token system.** Hardcoded `bg-slate-800 text-slate-100` while every other component uses `@theme` tokens or semantic utilities (`.cad-border`, `.cta-primary`). Fix: use a `.tag-pill` semantic class or `var(--color-background-dark)`.

5. **techRegistry is well-designed as a single source of truth.** The `techTagSchema` Zod transform validates at `astro check` build time. The `as const satisfies` pattern provides both runtime `lookupTech()` and compile-time `TechId` union type. Asymmetric validation (projects validate against registry; blog posts use free-form strings) is intentional and correct.

6. **No headless CMS needed.** 4 projects + 1 blog post — file-based MDX with Zod schemas is the right tool at this scale.

7. **`useReducedMotion()` guards are correct** and must be preserved on all animation paths regardless of other changes.

8. **Design tokens belong in CSS `@theme`, not config.ts.** `config.ts` owns content identity (who, what); CSS `@theme` owns presentation (colors, fonts, spacing). The codebase already respects this boundary.

---

## Majority Consensus (4-5 agents)

9. **The 1100ms overlay delay is too long.** 600ms timer (LoadingOverlay.tsx:39) + 500ms fade (line 15) = mandatory blank screen on cold load. Reduce the timer to ~200ms. The `reduced` motion path already skips it correctly.

10. **The overlay should be scoped to the homepage, not global Layout.** `useOverlayReady` consumers (TypewriterText) only exist on the homepage. Blog/project pages — 95% SSR'd HTML — block behind the overlay for no benefit. Move `LoadingOverlay` out of `Layout.astro` into the homepage layout.

11. **`client:only` islands remount on every view transition.** Astro's `ClientRouter` swaps the entire `<body>`, destroying and recreating all `client:only` islands. TopoBackground re-measures viewport + reinitializes on each navigation. The seed survives via `sessionStorage`, but there's a brief default-size frame. Consider `transition:persist` on the island wrappers (Layout.astro:75-76) to eliminate remount cost.

---

## Debated — No Full Consensus

### Should the overlay be deleted entirely?

- **perf-skeptic** (strong): If TopoBackground uses `client:idle` instead of `client:only`, it hydrates after content is visible. No jank to hide = overlay machinery can be deleted (~300 lines across 4 files).
- **nav-explorer** (partial dissent): The overlay serves as a synchronization gate for view transitions — without it, the topo background could pop in mid shared-element morph. Removing it may degrade transition quality.
- **island-advocate** (partial dissent): The overlay is an intentional intro animation (DottedGlowBackground canvas), not merely a jank mask. The aesthetic value is a design decision, not an architecture one.

**Resolution needed:** Profile the actual transition quality with `client:idle` + no overlay before deciding. The aesthetic intro is a product decision for the site owner.

### Should TopoBackground's rAF animation be replaced with CSS-only?

**Resolved during debate: No.** style-critic initially argued for CSS-only, but retracted after island-advocate demonstrated that the rAF loop (TopoBackground.tsx:50-64) mutates `feTurbulence.baseFrequency` at ~0.00001 delta per frame using `toFixed(5)` precision. CSS `@keyframes` cannot animate SVG filter primitive attributes at this granularity — at lower precision the attribute jumps every ~111 frames causing visible stutter.

The CSS/rAF split is correctly architected and complementary:
- `.topo-lines` CSS keyframe handles position/rotation (GPU-composited, zero main-thread cost)
- React rAF handles `baseFrequency` mutation (main thread, justified by precision requirements)

**The rAF loop is load-bearing and should be kept.** The perf concern (main-thread SVG filter pipeline) remains valid — consider throttling or OffscreenCanvas as optimizations, not elimination.

---

## Actionable Recommendations (Priority Order)

### P0 — Bugs / Consistency Breaks

| # | What | Where | Evidence |
|---|---|---|---|
| 1 | Replace `history.back()` with `<a href>` link | `BackBtn.astro:7` | Bypasses ClientRouter, breaks shared-element morph on return |
| 2 | Replace hardcoded `bg-slate-800` with design token | `TagPill.astro:8` | Only component bypassing `@theme` token system |

### P1 — Performance Wins

| # | What | Where | Evidence |
|---|---|---|---|
| 3 | Reduce overlay delay from 600ms to ~200ms | `LoadingOverlay.tsx:39` | 1100ms mandatory blank screen on cold load |
| 4 | Scope overlay to homepage only | `Layout.astro:74-75` | Content pages block behind overlay with no consumers |
| 5 | Add `transition:persist` to island wrappers | `Layout.astro:75-76` | Prevents `client:only` island remount on every navigation |

### P2 — Architecture Simplification (Requires Profiling)

| # | What | Where | Evidence |
|---|---|---|---|
| 6 | Try `client:idle` for TopoBackground | `Layout.astro:76` | May eliminate overlay dependency entirely |
| 7 | Consider throttling or OffscreenCanvas for topo rAF | `TopoBackground.tsx:50-64` | Main-thread SVG filter mutation; CSS-only ruled out (precision required) |
| 8 | Decouple TypewriterText from overlay signal | `useOverlayReady.ts` | Typewriter gate is aesthetic, not functional |

### P3 — Content Modeling

| # | What | Where | Evidence |
|---|---|---|---|
| 9 | Rename `goals` to `highlights` or split into `achievements`/`goals` | `career.ts` | Mixed tenses in same array |
| 10 | Document `resetOverlayReady()` ordering constraint in code | `overlayReady.ts` | Currently only documented in CLAUDE.md |

---

## What Was Validated (No Changes Needed)

- **3 React islands** — all justified, correct hydration directives
- **techRegistry** — Zod build-time validation, `TechId` type system, `lookupTech()` runtime API
- **Content collections** — MDX + Zod schemas, appropriate for scale
- **career.ts as plain TypeScript** — not a content collection, correctly accessed directly
- **Tailwind CSS 4 `@theme` tokens** — semantic utilities (`.cad-border`, `.drawing-hover`, `.cta-primary`, `.focus-ring`) are well-extracted
- **Dark-mode-only** — intentional aesthetic choice, not a hack. `class="dark"` + inline script guard prevents FOUC
- **`astro:page-load` pattern** — replaced `registerOnceAfterSwap` with native Astro event + module-scoped cleanup
- **mobileMenu.ts AbortController** — clean listener cleanup, no leaks
- **Asymmetric tag validation** — projects vs blog posts intentionally use different validation
- **`config.ts` / CSS `@theme` boundary** — content identity vs presentation tokens correctly separated
