---
name: new-blog-post
description: Use when creating a new blog post entry for the imanols.dev portfolio site
---

# New Blog Post

## Overview

Scaffolds a new blog post in `src/content/posts/`. The collection schema is validated at build time by Zod — all required fields must be present.

## Required Frontmatter

```yaml
---
author: Imanol
publishDate: YYYY-MM-DD        # required, z.date()
title: Post Title Here
tags:
  - Tag1
  - Tag2
description: One-sentence summary shown in post cards and SEO.
cover:
  src: "./images/<slug>/cover.webp"   # local image path relative to the .md file
  alt: "Descriptive alt text"
---
```

**Optional fields:**
- `updateDate: YYYY-MM-DD` — shown if content was revised
- `relatedPosts: [other-post-slug]` — reference to other `posts` entries

## File Location

`src/content/posts/<kebab-case-slug>.md` (or `.mdx` if JSX components needed)

Cover images go in `src/content/posts/images/<slug>/`.

## Checklist

- [ ] File named in kebab-case matching the slug you want in the URL
- [ ] `publishDate` is a valid YYYY-MM-DD date (Astro parses it as `Date`)
- [ ] `cover.src` path is relative to the `.md` file (starts with `./`)
- [ ] Run `npm run build` to validate schema before committing

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| `publishDate: "2025-01-01"` (string) | Use bare date: `publishDate: 2025-01-01` |
| `cover: "./images/..."` (bare string) | Must be object: `cover: { src: ..., alt: ... }` |
| Absolute image path | Use `./images/...` relative to the content file |
| Missing `description` | Required — used in `<meta name="description">` |
