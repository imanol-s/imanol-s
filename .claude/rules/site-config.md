---
paths:
  - "src/config.ts"
  - "src/data/career.ts"
---

# Site Configuration Rules

## `src/config.ts`

Single source of truth for site identity. Do not duplicate this data elsewhere.

- `SITE` — domain, title, description, tags, logo, favicon, repository
- `ME` — name, profession, profile image, about, location, focus areas, core languages, competencies, languages, contact
- `SOCIALS` — GitHub, LinkedIn with visibility flags

## `src/data/career.ts`

Work experience and education data. Key accessors:

- `timelineJobs()` — returns the 3 most recent jobs (used by ExperienceTimeline)
- `primaryEducation()` — returns the primary education entry
- `jobStartDate()` / `jobEndDate()` — date accessors for individual entries

When adding a new job, set `currentJob: true` on the new entry and `false` on the previous one.
