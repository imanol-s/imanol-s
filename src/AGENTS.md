# Shared source boundaries

Paths in source instructions are repository-root-relative. Read descendant `AGENTS.md` files only for the folders being edited or reviewed; inherit ancestor instructions without loading sibling folders indiscriminately.

- Before changing identity, profile copy, or contact links, read `src/config.ts` and search consumers of `SITE`, `ME`, and `SOCIALS`; derive those values from the existing fields.
- Never invent dates or measured outcomes. Omit unconfirmed dates and business identifiers rather than hiding identifiers in the DOM; state measurement scope and approximation qualifiers.
- Delegate substantive visitor-facing drafts and editorial reviews to `portfolio_writer`; `.codex/agents/portfolio-writer.toml` owns editorial criteria and the handoff.
- Render untrusted plain text with Astro interpolation or text nodes. Permit `innerHTML`/`set:html` only for static trusted markup, trusted-library-sanitized HTML, or controlled collection content.
- Keep `rel="noopener noreferrer"` on links opened with `target="_blank"`; ordinary MDX links need not open a new tab.
- Preserve surrounding relative or `@/*` imports and local versus shared type ownership. Use Astro `class:list`, template literals, or ternaries for conditional classes; do not introduce a `cn()` helper.
- For browser-API unit tests, add `// @vitest-environment jsdom`; Vitest's default environment is not a browser.
