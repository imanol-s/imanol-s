# AGENTS.md

Instructions for AI coding assistants working with this repository.

## Project Overview

Personal portfolio site for Imanol Saldana, built with Astro 5, React 18, Tailwind CSS 3, and TypeScript. Deployed at https://imanols.dev.

## Commands

| Command           | Purpose                                             |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Start dev server                                    |
| `npm run build`   | Type-check and build (`astro check && astro build`) |
| `npm run preview` | Preview production build locally                    |

No test framework is configured. Type-checking via `astro check` is the primary safety net.

## Architecture

- **Astro-first**: Default to `.astro` components. Only use React (`.tsx`) for client-side interactivity.
- **Island architecture**: React components hydrate via `client:visible`, `client:idle`, or `client:load`.
- **Content collections**: Blog/project content uses Astro content collections with Zod schemas in `src/content/config.ts`.
- **Static data**: Typed exports from `src/data/*.ts` (jobs, skills, education).
- **UI components**: shadcn/ui components in `src/components/ui/`. Add via `npx shadcn@latest add <component>`.

## Naming Conventions

| Type                 | Convention           | Example                    |
| -------------------- | -------------------- | -------------------------- |
| Astro components     | PascalCase           | `ProfileInfo.astro`        |
| React components     | PascalCase `.tsx`    | `TabsButtons.tsx`          |
| shadcn/ui components | lowercase            | `badge.tsx`                |
| Data files           | PascalCase/camelCase | `Jobs.ts`, `hardSkills.ts` |
| Content files        | kebab-case           | `crime-analysis.mdx`       |
| SVG icons            | kebab-case           | `github-fill.svg`          |

## Code Style

- TypeScript strict mode
- Prefer `const` and arrow functions
- Define interfaces in the file that uses them
- Use `@/*` path alias for imports from `src/`

```typescript
// Correct: typed interface + destructured props
interface Job {
  title: string;
  company: string;
  currentJob: boolean;
}
const { jobData } = Astro.props;
const { title, company, currentJob } = jobData as Job;
```

## Styling

- Use Tailwind color tokens from `tailwind.config.mjs`
- Dark mode is `prefers-color-scheme: media` (not class-based)
- Light primary: `primary-light` (gold `#FBD144`)
- Dark primary: `primary-dark` (olive `#556B2F`)
- Container max: `520px` at lg, `620px` at xl

## Security

**XSS Prevention**: Never use `innerHTML` with user-controlled data. Use `textContent` for plain text or `createElement()` + `textContent` for structured content.

```typescript
// SAFE: Use textContent for user input
function displayName(name: string) {
  const el = document.getElementById("name-display");
  if (el) el.textContent = `Showing results for "${name}"`;
}
```

- Never commit secrets or API keys
- External links: `target="_blank"` with `rel="noopener noreferrer"`

## Performance

- Use Astro's `<Image>` component for all images
- `loading="lazy"` for below-fold images
- Minimize client-side JavaScript (only `TabsButtons.tsx` hydrates)

## Git Workflow

- Conventional commits: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- Pre-commit: lint-staged runs prettier + eslint on staged files
- Commit-msg: commitlint validates conventional commit format

## Communication Style

When asked a high-level question, give a direct answer first. Only explore the codebase if explicitly asked.

## Task Agents

When asked to "use parallel agents", spawn sub-agents via the Task tool. Keep it simple—no elaborate scaffolding.
