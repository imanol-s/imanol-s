# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Hiring managers and technical leads reviewing Imanol's work and professional background.

## Product Purpose

Present real project work and career context so visitors can assess relevance and capability. The existing site provides case studies, résumé access, and contact links; the confirmed primary goal is review, not a prescribed conversion funnel.

## Positioning

The current copy emphasizes practical tools and workflows that make enterprise data trustworthy and people's work simpler. This is a provisional direction, not settled positioning. The owner confirmed there is room for refinement; future work should refine it with approval rather than invent claims.

## Operating Context

Visitors can review the homepage, browse its project gallery, read individual case studies, access the résumé, and follow contact or professional-profile links. Existing Astro templates handle these established surfaces and should be reused rather than redesigned as a side effect of initialization.

## Capabilities and Constraints

- The homepage `/#projects` gallery is the sole project index. Individual `/projects/[id]` case studies remain public; legacy `/projects` and `/projects/` redirect exactly to the gallery, without a wildcard. Blog source is archived with no public routes or redirects. Résumé access is a PDF link, not a dedicated page.
- `src/config.ts` owns personal and site data; `src/data/career.ts` owns career and education context.
- Preserve factual content and metrics. Career bullets require explicit authorization to change.
- Read `AGENTS.md` for architecture approval boundaries, `src/components/AGENTS.md` before changing component behavior, and `.claude/rules/routes.md` before changing routes.
- Follow `AGENTS.md`, the single source of truth for repository agent instructions. `DESIGN.md` records the current implemented design.

## Brand Commitments

Use grounded, plain language. Avoid em dashes in visitor-facing copy, accessible labels, and metadata. Retain the existing portrait and project artwork unless their replacement is requested.

## Evidence on Hand

- Project case studies: `src/content/projects/`.
- Career and education history: `src/data/career.ts`.
- Personal content and professional links: `src/config.ts`.
- Project illustrations: `src/assets/projects/`; portrait: `src/assets/portrait-lineart.svg`.
- Cover illustrations are conceptual artwork, not screenshots or evidence of measured results. Do not fabricate testimonials, customers, or outcomes.

## Product Principles

- Make actual work and professional background easy to evaluate.
- Preserve evidence and distinguish demonstrated outcomes from illustrative assets.
- Reuse established templates for existing surfaces.
- Keep positioning open until its refinement is explicitly approved.
