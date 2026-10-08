---
name: portfolio-writing
description: Draft, format, and review portfolio project articles for clear, factual, hiring-manager-friendly reading.
---

# Portfolio writing

Read AGENTS.md and .github/copilot-instructions.md before working.
Follow the user's current scope and the editorial criteria in
.codex/agents/portfolio-writer.toml.

Use src/content/projects/crime-analysis.mdx as a reference for restrained
Markdown formatting, not as a mandatory article template.

## Headings and labels

Use plain headings that identify content. Avoid decorative numbered kickers, generic slogans, and redundant preambles. Keep supporting labels only when they provide useful information.

## Outcomes and metrics

Lead with what changed for the person using the tool, such as time freed for
other work or less repetitive manual work. State qualitative outcomes when
supported; never invent hours saved or infer them from operation timings.

Choose metrics that help readers understand that outcome. Do not promote an
isolated detection check or browser-probe count into the project's headline
result. Include a microbenchmark only when its connection to a meaningful
outcome is established and the technical detail helps explain an engineering
decision. A graph is optional; omit it when the evidence does not support a
useful comparison.

## Markdown formatting

Audit Markdown formatting in every project draft and review, including
formatting-only work.

- Use semantic H2 sections for the main article structure. Add H3 sections
  only when a substantial section has distinct subtopics. The page template
  supplies the article title; do not add another H1.
- Keep paragraphs short and connected. Use unordered lists for genuinely
  parallel responsibilities, capabilities, or distinctions. Use ordered
  lists when sequence matters. Do not turn every paragraph into a list.
- Apply bold selectively to a contribution, deliverable, finding, or useful
  distinction. Keep qualifiers and limitations attached to the claims they
  qualify. Avoid emphasizing entire paragraphs.
- Use inline code for actual identifiers and notation, such as table names,
  function names, CLI flags, and O(V+E). Use ordinary text for technologies
  mentioned as nouns, such as Python, Java, and Selenium.
- Keep YAML frontmatter plain text. Do not put Markdown emphasis, lists, or
  inline code into card summaries or metadata.
- Use Markdown for ordinary prose. Preserve MDX imports, graph components,
  and necessary image/figure markup; do not replace those components merely
  to increase Markdown usage.
- Preserve existing wording and facts during formatting-only tasks.
  Retain metrics, estimate labels, attribution, NDA limits, privacy
  redactions, links, artwork references, and graph captions.
- Use formatting where it improves understanding. No article must use
  every Markdown feature, and there are no formatting quotas.

## Review

Check that heading levels are logical, lists remain readable, and emphasis
helps readers find meaningful information without overpowering the prose.
Check headings, lists, inline code, and bold styling in the rendered article
when available.

For writing changes, also review the five editorial criteria: problem,
contribution and supported outcome; easy scanning; grounded voice;
preserved facts and metrics; and plain language without em dashes.

Career bullets remain protected unless the user explicitly requests edits
to those bullets. A general writing or formatting request does not authorize
career changes.

The writing agent returns drafts and findings. The parent applies changes,
validates the site, and handles Git and deployment.

Before returning any project draft, audit its Markdown against this skill
and include brief formatting decisions, noting where plain prose is more useful.
For reviews, include the Markdown audit and formatting decisions in the findings.
