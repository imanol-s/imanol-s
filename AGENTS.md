# Repository agent instructions

## Commands

Run from the repository root.

| Purpose | Command |
| --- | --- |
| Build, including Astro/TypeScript checking | `npm run build` |
| Type-check without building | `npm run astro -- check` |
| Unit tests | `npm run test` |
| Unit tests in watch mode | `npm run test:watch` |
| Browser tests against built output | `npm run test:e2e` |
| Preview built output | `npm run preview -- --port 4321` |
| Documentation whitespace check | `git diff --check` |

For documentation-only changes, inspect the diff, verify referenced paths, and run the whitespace check; skip build/tests unless executable examples or build inputs change. For source, dependency, or runtime/build configuration changes, build and resolve TypeScript errors; also run unit tests for code changes. For rendering, navigation, or responsive-layout changes, build first, inspect affected preview routes, and run browser tests.

Before using port 4321, identify any listener and verify its checkout; Playwright can reuse an existing server and does not build the site. Stop only your verification server on completion unless asked to leave it running. Report required check outcomes separately from manual inspection; fix failures or name the exact blocker.

There is no `lint` script. Existing Git hooks run identity guards, `lint-staged` (`astro check`), and conventional commit validation. Use `npm run setup:git-identity` if repository identity/hooks need setup; do not bypass guards or rewrite historical contributors. Use `.github/PULL_REQUEST_TEMPLATE.md` for PRs.

## Hard boundaries

- Preserve dirty changes and occupied checkouts; do not switch an occupied branch or overwrite a checkout. Default work targets `ui-migration`; use an explicitly authorized isolated staging checkout when provided. The default is owner policy, not a claim about the current branch.
- Answer high-level questions before exploring code; plan multi-step work and recommend one approach with reasons. Make code changes directly unless delegation is requested or required by source-content instructions. Use native subagents with explicit file ownership; the parent owns validation and Git. Do not create user-owned chats for internal subtasks.
- Get approval for architecture changes such as introducing a client framework or moving static content into client rendering. Plan major dependency upgrades explicitly; documentation does not authorize upgrades.
- Never hardcode or commit secrets, sensitive personal data, or generated résumé PDFs. Do not introduce `.env` files. Use environment variables or macOS Keychain references; ask before writing config when secure referencing is unclear.
- Preserve the security headers and Node 22 build pin in `netlify.toml`.
- Keep shared policy in the nearest applicable `AGENTS.md` or existing reference; tool-specific adapters link to the owner. Let executable guards own checks they already enforce instead of repeating their implementation as instructions.

## Read before

Paths below are repository-root-relative. Read references when their condition applies, including during reviews; leave unrelated references unloaded.

- Before editing or reviewing a file, read the `AGENTS.md` files along its directory path, including narrower source-folder instructions; do not load unrelated sibling folders. Read `src/content/AGENTS.md` before changing the root-level collection schema `src/content.config.ts`.
- `.claude/rules/routes.md`: read before editing or reviewing `src/pages/`; route guidance lives outside that directory to avoid publishing it as a page.
- `.claude/rules/agent-tooling.md`: read before changing agent instructions, skills, MCP settings, Git identity setup, or hooks.
- `.claude/rules/astro-config.md`: read before Astro-specific recommendations or changes to root build/deployment configuration; resolve versions from the lockfile or installed metadata.
- `PRODUCT.md`: read before changing product scope, routes, capabilities, or positioning.
- `DESIGN.md`: read before changing UI, layout, typography, motion, or interaction; verify implementation details against the affected components and update this reference when an authorized change alters documented behavior.
- `REVIEW-GUIDELINES.md`: read before reviewing code or repository changes.
- `.claude/guidance/before-writing.md`: read before choosing a requested mechanism, crossing layers, or relying on unstated data size, shape, or run frequency.
- `.claude/guidance/interfaces.md`: read before adding a class, public function, module, wrapper, subclass, parameter, or flag.
- `.claude/guidance/functions.md`: read before editing an if/else ladder or switch, adding a case to a function that already nests three deep, extracting helpers, writing index arithmetic, or comparing items pairwise.
- `.claude/guidance/errors.md`: read before adding exceptions, assertions, validation, defaults, or bad-value handling.
- `.claude/guidance/changing-code.md`: read before editing functions, moving/refactoring code, changing multi-caller signatures or observable output, or reviewing a diff.
- `.claude/guidance/tests.md`: read before writing tests, choosing mocks/fakes, designing assertions, or acting on coverage numbers.
- `.claude/guidance/data-boundaries.md`: read before adding retries, timeouts, locks, caches, schema/field changes, serialization, or cross-process/service/database writes.
- `.claude/guidance/performance.md`: read before changing code because it is slow or claiming a performance advantage.
- `.claude/guidance/image-delivery.md`: read before changing or reviewing images, fonts, preloads, or CDN caching.
- `.claude/guidance/resume-publication.md`: read before changing résumé sources/links or build, CI, deployment, redirects, or check-skipping that can affect résumé publication.
