---
name: new-project-entry
description: Use when creating a new project page for the imanols.dev portfolio site
---

# New Project Entry

## Overview

Scaffolds a new project page in `src/content/projects/`. Uses a two-column MDX layout on the `/projects/[id]` detail page. Schema validated by Zod at build time.

## Required Frontmatter

```yaml
---
title: Project Title Here
summary: One or two sentence summary shown on the project listing card.
tags:
  - TypeScript
  - React
startDate: YYYY-MM-DD          # required, z.date()
endDate: YYYY-MM-DD            # required, z.date()
cover: "./images/<slug>/cover.webp"     # bare Astro image() — relative path only
ogImage: "./images/<slug>/og.webp"     # plain string path for Open Graph
# url: https://github.com/...  # optional — only add if project is live/published
---
```

**Key schema differences from blog posts:**

| Field | Posts | Projects |
|-------|-------|----------|
| `cover` | `{ src: image(), alt: string }` | bare `image()` path string |
| `ogImage` | not present | plain `z.string()` path |
| `url` | not present | optional string |

## File Location & Structure

`src/content/projects/<kebab-case-slug>.mdx` (MDX required for two-column layout)

Cover/OG images go in `src/content/projects/images/<slug>/`.

## Recommended MDX Structure

```mdx
## Table of Contents
1. [Overview](#overview)
2. [Role](#role)
3. [Problem](#problem)
4. [Solution](#solution)

---

## Overview
...

## Role
...
```

## Checklist

- [ ] Use `.mdx` extension (not `.md`) — project detail page expects MDX
- [ ] `cover` is a bare relative string path (NOT `{ src, alt }` like posts)
- [ ] `ogImage` is a relative path that resolves to `public/` or `src/content/`
- [ ] Both `startDate` and `endDate` are bare YYYY-MM-DD dates (no quotes)
- [ ] Run `npm run build` to validate schema

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| `cover: { src: "...", alt: "..." }` | Use bare string: `cover: "./images/..."` |
| Using `.md` extension | Use `.mdx` — needed for the two-column layout component |
| Omitting `ogImage` | Required — used in `<meta property="og:image">` |
