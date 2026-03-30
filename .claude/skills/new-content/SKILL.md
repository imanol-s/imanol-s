---
name: new-content
description: Scaffold a new blog post or project with correct Zod-validated frontmatter.
disable-model-invocation: true
---

Create a new content entry. Accepts `$ARGUMENTS` as the content type and title (e.g., `/new-content post "My New Post"` or `/new-content project "My Project"`).

## Steps

1. Parse `$ARGUMENTS` for type (`post` or `project`) and title. If missing, ask.
2. Generate a kebab-case slug from the title.
3. Read `src/content.config.ts` to confirm the current schema fields.
4. Scaffold the file:

### For posts (`src/content/posts/<slug>.mdx`):
```yaml
---
title: "<title>"
publishDate: "<today YYYY-MM-DD>"
description: ""
author: "Imanol"
tags: []
keywords: []
---
```
Note: Post `tags` are free-form strings (not validated against techRegistry).

### For projects (`src/content/projects/<slug>.mdx`):
```yaml
---
title: "<title>"
startDate: "<today YYYY-MM-DD>"
summary: ""
tags: []
keywords: []
---
```
Note: Project `tags` must exist in `src/data/techRegistry.ts`. Use `/add-tech` first if needed.

5. Open the file for the user to fill in the content.
