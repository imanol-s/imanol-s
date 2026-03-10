# AGENTS.md

Instructions for AI coding assistants working with this repository.

## Canonical Source

- Primary instructions live in `.github/copilot-instructions.md`.
- If this file conflicts with `.github/copilot-instructions.md`, `.github/copilot-instructions.md` wins.

## Agent-Specific Deltas

- Prefer concise, direct responses.
- For high-level questions, answer directly first; only explore code if needed.
- If asked to use parallel agents, spawn sub-agents via the Task tool.

## Learned User Preferences

- Hover effects should enhance/brighten elements, never dim text
- Use Plan mode before implementing multi-step or multi-file changes
- Prefer minimal, focused edits over broad rewrites
- Skip major version upgrades (React 19, Tailwind 4) unless explicitly planned
- Subagents should have mandatory delegation for their scope — enforce strict ownership
- Run `/test-server` to validate site changes (build → preview → browser inspection)
- No redundant HTML comments or unnecessary code comments
- When asked about the best approach, provide a clear recommendation with rationale rather than only listing options

## Learned Workspace Facts

- Astro 5 portfolio site with React 18, Tailwind CSS, TypeScript
- PRs follow `.github/pull_request_template.md` template
- Design tokens: `--color-primary: #64748b` (slate gray), slate palette, JetBrains Mono display + Inter body
- Nav links use `text-primary` base with `hover:text-white` (muted → bright on hover)
- Card titles stay bright on hover; interactivity signaled via border and image effects
- Build command: `npm run build` runs `astro check && astro build`; preview on port 4321
- Netlify pins Node 20 via `NODE_VERSION` in `netlify.toml`
- Fonts self-hosted via `@fontsource-variable` (Inter + JetBrains Mono) — no Google Fonts CDN
- Project subagents in `.cursor/agents/`: `coding-specialist` (mandatory for code changes), `software-architect`, `performance-optimizer`
- Experience card descriptions render in full with no truncation
