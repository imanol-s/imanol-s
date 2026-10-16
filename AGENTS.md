# Codex agent instructions

Read [`.github/copilot-instructions.md`](.github/copilot-instructions.md) first. It is canonical and takes precedence. Product context is in `PRODUCT.md`; `DESIGN.md` records the incumbent design. This pointer stays current with infrastructure/config changes.

- Preserve dirty work and other agents' edits. Follow the canonical checkout/branch safety rules; never blindly switch branches.
- Code changes require `coding-specialist`; substantive portfolio writing/reviews require `portfolio_writer` (`.codex/agents/portfolio-writer.toml`) and `.agents/skills/portfolio-writing/SKILL.md`. Give delegates strict ownership; the parent applies drafts and owns validation/Git.
- Use native subagent tooling when delegation is requested or required; do not create user-owned chats for internal subtasks.
- Before Astro-specific changes/recommendations, retrieve version-compatible Astro Docs MCP guidance. Verify the installed version; documentation never authorizes upgrades. If MCP is unavailable, use official docs and disclose that limitation.
- Build, preview, and browser validation follow the canonical testing section. Preserve user-retained servers; stop only verification servers you started.
- Never hardcode secrets; use environment variables or macOS Keychain references and ask if secure configuration is unclear.
