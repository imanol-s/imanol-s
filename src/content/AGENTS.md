# Collection content

- Use Astro collections and `src/content.config.ts` for page content rather than raw file reads. Validate required fields, including project `coverAlt`, against the schema rather than a copied frontmatter checklist.
- Keep `cardSummary` limited to gallery copy with a `summary` fallback. Keep the full summary as the detail introduction and metadata source; keep alt text with its artwork.
- Before changing project tags, read `src/data/AGENTS.md` for registry ownership and the distinction from free-form post tags.
- Before drafting/reviewing project articles, including formatting-only work, read `.agents/skills/portfolio-writing/SKILL.md` for the Markdown audit and formatting decisions.
