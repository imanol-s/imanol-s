---
name: verify
description: Run the full CI-equivalent verification pipeline locally (tests + type-check + build).
---

Run the full local verification pipeline. This mirrors what CI runs on PRs.

## Steps

1. Run tests: `npm run test`
2. Run build (includes `astro check` for type-checking): `npm run build`

## Reporting

- If all steps pass, report success with a one-line summary.
- If any step fails, show the relevant error output and suggest a fix.
- Do not skip steps even if an earlier one fails — run all steps and report all issues.
