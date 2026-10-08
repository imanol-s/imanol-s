# AGENTS.md

Instructions for AI coding assistants working with this repository.

## Canonical Source

- Primary instructions live in `.github/copilot-instructions.md`.
- If this file conflicts with `.github/copilot-instructions.md`, `.github/copilot-instructions.md` wins.

## Agent-Specific Deltas

- Prefer concise, direct responses.
- For high-level questions, answer directly first; only explore code if needed.
- Delegate substantive portfolio writing and editorial reviews to `portfolio_writer`, defined in [`.codex/agents/portfolio-writer.toml`](.codex/agents/portfolio-writer.toml). The parent agent applies drafts and owns validation and Git operations.
- The writer must read [the portfolio-writing skill](.agents/skills/portfolio-writing/SKILL.md) before drafting or reviewing project articles, including formatting-only work. Every project draft or review includes a Markdown audit and brief formatting decisions; use restrained headings, lists, bold, and code where they help reading, without quotas.
- If asked to use parallel agents, spawn sub-agents via the Task tool.
- **Always work on the `ui-migration` branch.** Cloud agent sessions default to creating a new branch; immediately switch to `ui-migration` at session start (`git checkout ui-migration`) and push all commits directly to it. Never leave work on a session-scoped branch.

## Learned User Preferences

- Avoid em dashes in visitor-facing copy, accessible labels, and metadata.
- Use plain headings that identify content. Avoid decorative numbered kickers, generic slogans, and redundant preambles. Keep supporting labels only when they provide useful information.
- Leave career bullets unchanged unless the user explicitly requests edits to those bullets; general site-copy requests do not authorize rewriting them.
- Hover effects should enhance/brighten elements, never dim text
- Use Plan mode before implementing multi-step or multi-file changes
- Prefer minimal, focused edits over broad rewrites
- Skip major version upgrades (React 19, Tailwind 4) unless explicitly planned
- Subagents should have mandatory delegation for their scope — enforce strict ownership
- Run `/test-server` to validate site changes (build → preview → browser inspection)
- No redundant HTML comments or unnecessary code comments
- When asked about the best approach, provide a clear recommendation with rationale rather than only listing options
- When proposing style changes, audit all touch points across the codebase before implementing — show full impact surface
- Accessibility fixes should include WCAG contrast ratios and visual comparisons (e.g., Paper artboards or side-by-side screenshots)
- CI runs on pull requests via `.github/workflows/ci.yml` (npm ci → test → build). Linting also runs locally via pre-commit hooks.
- React island architecture is frozen; do not add, remove, or convert islands without explicit user approval
- When making infrastructure or config changes, update AGENTS.md and copilot-instructions.md in the same commit
- **Never hardcode personal values** (name, bio, email, location, profession, etc.) in templates — always derive from `src/config.ts`
- **When editing `src/config.ts`** (adding, renaming, or removing fields), update the config reference table in `.github/copilot-instructions.md` and this file in the same commit

## Learned Workspace Facts

- Astro 7.3 portfolio site with React 19, Tailwind CSS 4, TypeScript, and Vite 8
- PRs follow `.github/pull_request_template.md` template
- Design tokens: `--color-primary: #64748b` (slate gray), slate palette, JetBrains Mono display + Inter body
- Nav links use `text-primary` base with `hover:text-white` (muted → bright on hover)
- Card titles stay bright on hover; interactivity signaled via border and image effects
- Build command: `npm run build` runs `astro check && astro build`; preview on port 4321
- Browser-level validation is available via `npm run test:e2e` with Playwright against the local preview on port 4321
- Netlify pins Node 22 via `NODE_VERSION` in `netlify.toml`
- Fonts self-hosted via `@fontsource-variable` (Inter + JetBrains Mono) — no Google Fonts CDN
- Raster content images use Netlify Image CDN with AVIF quality 80 and responsive widths 400/800/1200; SVG artwork stays vector. Hashed `/_astro/` assets and their Image CDN variants cache immutably for one year; HTML uses CDN stale-while-revalidate, and unversioned images revalidate.
- Three React islands: `TopoBackground.tsx` (`client:only="react"`), `TypewriterText.tsx` (`client:load`), and `LoadingOverlay.tsx` (`client:only="react"`)
- Project subagents in `.cursor/agents/`: `coding-specialist` (mandatory for code changes), `software-architect`, `performance-optimizer`
- Work history shows every role, with full descriptions and supplied highlights; do not impose role-count caps.
- Blog routes, navigation, and legacy redirects are removed. Posts and their content schema remain archived; do not expose them as public pages.
- `src/config.ts` is the single source of truth for all personal/site data — full field reference in `.github/copilot-instructions.md` under "Site Configuration"
- Paper MCP is used for design prototyping; designs live in a Paper file with separate pages per section (Home, Projects, Blog)
- Tag pills appear in `projects/index.astro` (listing) and `projects/[id].astro` (hero + stack sidebar) — stack sidebar uses a different, already-accessible style

## Homepage content configuration

- `ME.headline: string[]` supplies the hero value statement.
- `ME.portraitNote: string` supplies the animated portrait status caption; CSS reveals decorative dots, with static dots for reduced motion.
- `ME.workingStyle: string` introduces the approach section.
- `ME.approach: { title: string; description: string }[]` supplies the working approach cards.
- `ME.contactNote: string` supplies the footer invitation.
- `ME.aboutMe` is the concise hero introduction and homepage meta description.
- `ME.focusAreas` supplies the hero context strip. Career and education context continues to use `src/data/career.ts`.
- Homepage project cards show all projects in a responsive grid; `ProjectsCarousel.astro` is also reused by the projects listing.
- Project covers use original watercolor concept illustrations from `src/assets/projects/` in consistent 2:1 full-bleed media regions. The original Dallas arrest-count map remains uncropped in the case-study body; cover illustrations do not represent screenshots or measured results.
- Project dates are optional when unconfirmed. Dated projects sort newest first, with stable ID ordering for ties; undated projects follow in stable ID order, and their pages omit unavailable dates.
- Automaton charts and architecture diagrams use server-rendered Astro HTML/CSS, with visible data and descriptions. Measurements are operation-specific, retain approximation qualifiers, and omit business identifiers. No chart runtime or React island is added.
- Hero portrait uses `src/assets/portrait-lineart.svg`, a transparent vector trace of the original illustration, with an unframed treatment and compact mobile presentation.
- Header navigation contracts toward a fixed frog anchor on downward scroll and expands on upward scroll or activation. `src/utils/headerScroll.ts` measures the header width, protects keyboard/menu interaction, and cleans up on Astro navigation; labels reveal after expansion, and reduced motion disables transitions.

- Intro name reveal starts while the overlay fades and never clears already-visible text. Returning visits, late hydration, reduced motion, Escape, and no-JS preserve the full name. The existing topography island persists across Astro navigation to retain its animation phase; Back to Top keeps a stable 48px outlined target.

## Resume publishing

- `ME.contactInfo.resumeDoc` is `resume.pdf`; existing buttons use `/resume.pdf`, a forced Netlify 302 to the Pages PDF.
- `resume/main.tex` is the maintained source. Push to `ui-migration` to compile with pdfLaTeX and publish independently. Never commit generated output.
- Publication is serialized and compares current resume inputs; later site-only changes do not invalidate a valid build.
- Resume-only changes skip Netlify through `node scripts/resume-pipeline.mjs ignore`; uncertain history builds normally.
- Run `node --test scripts/resume-pipeline.check.mjs` for the Git-history regression checks.
