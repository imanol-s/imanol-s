---
paths:
  - "src/content/projects/**"
  - "src/content/posts/**"
---

# Content Frontmatter Rules

## Project Frontmatter (`.mdx`)

Required fields:

- `title`: string
- `summary`: string
- `cover`: relative image path
- `tags`: array of techRegistry IDs (validated at build)
- `ogImage`: string

Optional:

- `startDate`, `endDate`: confirmed YAML dates; omit when unknown
- `cardSummary`: non-empty homepage card summary
- `url`: string
- `keywords`: array of free-form strings (NOT validated)

Images go in `src/content/projects/images/{project-id}/`.

## Post Frontmatter (`.md` / `.mdx`)

Required fields:

- `publishDate`: YAML date
- `title`: string
- `tags`: array of strings (free-form, NOT validated)
- `description`: string
- `cover`: object with `src` (image path) and optional `alt`

Optional:

- `author`: string
- `keywords`: array of strings
