# Review guidelines

- Review only unless fixes are explicitly requested. Establish the base and reviewed revision; distinguish committed changes from local edits and preserve both.
- Read the full changed paths and relevant callers/tests, not only the diff. Check the requested behavior against `PRODUCT.md`, `DESIGN.md`, and the applicable rules in `AGENTS.md` and its linked guidance; consult `.claude/guidance/changing-code.md` for review criteria.
- Prioritize correctness, security, accessibility, and regressions over style. Check affected routes, Astro navigation cleanup, reduced-motion/no-script behavior, content schemas, and deployment boundaries when the change touches them.
- Report actionable defects introduced by the change, with a concrete trigger and consequence. Verify assumptions against callers or tests; separate pre-existing issues and open questions. Do not invent findings or request speculative abstractions and preference-only rewrites.
- Put findings first, ordered by severity (P0 urgent, P1 high, P2 normal, P3 low). Give each a concise title, file and narrow line reference, impact, and suggested correction. State any conditions that limit its severity.
- Finish with checks actually performed and remaining coverage gaps. If no actionable findings remain, say so explicitly; distinguish passing builds/tests from browser verification and do not claim unperformed checks.
