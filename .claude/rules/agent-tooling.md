---
paths:
  - "**/AGENTS.md"
  - "AGENTS.md"
  - "CLAUDE.md"
  - ".claude/**"
  - ".codex/**"
  - ".agents/**"
  - ".mcp.json"
  - ".husky/**"
  - "commitlint.config.js"
  - "scripts/git-identity*"
---

# Agent tooling and Git guards

- Keep the Astro Docs MCP URL synchronized in `.mcp.json` and `.codex/config.toml`: `https://mcp.docs.astro.build/mcp`. Trust the project before expecting Codex project config to load; restart the client after config changes.
- Keep active skills in `.agents/skills/` and Claude skill symlinks pointing there. Preserve Impeccable's launcher/config/hooks and the portfolio-writing agent/skill; leave downloaded runtimes and local consent/cache files untracked.
- Keep retired session audit artifacts ignored, Claude hooks repository-relative, and personal launchers/machine-specific MCP/session hooks out of shared config.
- Preserve the root `Read before` heading: `.claude/hooks/guidance-gate.sh` injects that index on the first file-changing tool call. Use directory instructions for subtree rules and path-scoped adapters for Claude; do not require this hook to discover an edited file's subtree.
- Update the owning policy in the same commit as infrastructure/config changes that alter agent workflows or constraints; repair pointers and reading conditions when moving instructions.
- Keep `scripts/git-identity.mjs` authoritative for the repo-local identity and setup behavior; do not copy account values into policy. Run `npm run test:git-identity` when changing setup or guards. The suite uses isolated repositories and runs separately from Vitest in CI.
- Preserve commitlint's ESM conventional rules/parser imports, direct parser dependency, and commit hook.
- For Claude browsing, use `/browse` when gstack is available rather than `mcp__claude-in-chrome__*`; check availability instead of assuming installation.
