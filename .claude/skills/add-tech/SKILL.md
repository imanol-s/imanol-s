---
name: add-tech
description: Add a new tech tag to the registry and optionally reference it in project frontmatter. Handles the correct ordering to avoid build failures.
disable-model-invocation: true
---

Add a new tech tag to the project. Accepts `$ARGUMENTS` as the tech name (e.g., `/add-tech docker`).

## Critical ordering

Tech tags in project frontmatter are validated against `src/data/techRegistry.ts` at build time. Adding a frontmatter reference before the registry entry exists will break the build.

**Always: registry first, then frontmatter.**

## Steps

1. Check if the tech already exists in `src/data/techRegistry.ts` (case-insensitive). If it does, report it and stop.
2. Determine the appropriate entry:
   - `id`: lowercase identifier (e.g., `"docker"`)
   - `iconPath`: check if an icon exists in `src/icons/catppuccin/` matching the name. If not, omit `iconPath`.
   - `displayName`: only needed if it differs from the capitalized id (e.g., `"PostgreSQL"` for id `"postgresql"`)
   - `category`: optional, infer from context
3. Add the entry to the `REGISTRY` array in `src/data/techRegistry.ts`.
4. Ask the user if they want to add this tag to any existing project frontmatter.
5. If yes, update the project's `tags` array in its `.mdx` file.
6. Run `npx astro check` to verify the build still passes.
