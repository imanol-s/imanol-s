# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Canonical Source

- Primary instructions live in `.github/copilot-instructions.md`.
- If this file conflicts with `.github/copilot-instructions.md`, `.github/copilot-instructions.md` wins.

## Claude-Specific Deltas

- Keep solutions minimal and focused; avoid unrequested refactors.
- Validate changes with `npm run build` when code is modified.
- Use the Astro Docs MCP server for Astro API lookups when needed.
