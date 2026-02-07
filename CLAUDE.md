# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio site for Imanol Saldana, built with Astro 5, React 18, Tailwind CSS 3, and TypeScript. Deployed at https://imanols.dev. Based on the `astro-simple-portfolio` template by Victor Alvarado.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Type-check via `astro check` then build (`astro check && astro build`)
- `npm run preview` — Preview production build locally

No test framework is configured.

## Architecture

**Astro + React island pattern**: Most components are `.astro` files (server-rendered). React (`.tsx`) is only used where client-side interactivity is needed — currently just `TabsButtons.tsx` which hydrates via `client:visible`.

**Content collections** (`src/content/config.ts`): Two collections using Astro's glob loader:
- `posts` — Markdown/MDX blog posts in `src/content/posts/`, schema requires `publishDate`, `title`, `tags`, `description`, `cover` image
- `projects` — MDX project pages in `src/content/projects/`, schema requires `title`, `startDate`, `endDate`, `summary`, `url`, `cover` image, `tags`

**Site configuration** (`src/config.ts`): Central config exports `SITE` (metadata, SEO), `ME` (profile info, contact details), and `SOCIALS` (social links with show/hide toggle).

**Static data files** (`src/data/`): Work experience (`Jobs.ts`), education, skills, languages, and nav menu items — all typed TypeScript exports.

**UI components**: shadcn/ui components live in `src/components/ui/` (tabs, button, badge). Configured via `components.json` with path alias `@/*` → `./src/*`. Add new shadcn components with `npx shadcn@latest add <component>`.

**Routing**: File-based routing in `src/pages/`. Dynamic routes `[id].astro` for individual blog posts and projects. Single layout in `src/layouts/Layout.astro` handles SEO meta, OG tags, and `ClientRouter` for view transitions.

## Styling

- Tailwind with custom color tokens defined in `tailwind.config.mjs` — light mode (`light-theme`, `primary-light`) and dark mode (`dark-theme`, `primary-dark` olive green palette)
- Dark mode uses `prefers-color-scheme: media` strategy (not class-based)
- Prose/typography styles customized in `src/styles/globals.css` with separate light/dark color mappings
- Container is narrow by design: max `520px` at lg, `620px` at xl

## Icons

Uses `astro-icon` package. Custom SVG icons stored in `src/icons/`. Reference by filename (e.g., `"github-fill"` for `github-fill.svg`).

## Communication Style

When I ask a high-level or advisory question, give a direct conversational answer first before exploring the codebase. Only use tools if I explicitly ask you to investigate.

## Task Agents / Parallel Work

When I say "use task-distributor" or "use parallel agents", use the Task tool to spawn sub-agents. Do NOT overcomplicate with separate plugin specs or permission scaffolding — keep it simple with direct file creation.

## Session Management

Be aware of context window limits. For large multi-phase projects, complete one phase fully and write a handoff document before starting the next. Don't launch many parallel agents simultaneously.

## MCP Servers

An **Astro Docs MCP server** is available. Use it to look up Astro API references, configuration options, and component patterns instead of guessing or searching the web.
