# Claude agent instructions

Read [`.github/copilot-instructions.md`](.github/copilot-instructions.md) first; it is canonical and takes precedence. Product and current design live in `PRODUCT.md` and `DESIGN.md`.

- Preserve dirty work. Use the required coding specialist and portfolio-writing agent/skill with explicit ownership; the coordinating parent owns validation and Git.
- Retrieve version-compatible Astro Docs MCP guidance before Astro changes or recommendations. Verify the installed version; fall back to official docs and disclose unavailable MCP access.
- Shared skills live in `.agents/skills/`; `.claude/skills/` links to identical active skills. Keep portable project hooks in `.claude/settings.json`; machine-specific settings belong in ignored local configuration.
- If gstack is available, use `/browse` for Claude browsing rather than `mcp__claude-in-chrome__*`. Do not assume global tools are installed.
- Follow the canonical build → preview → browser gate and server ownership rules. Never hardcode secrets.
