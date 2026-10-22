# Browser tests

- Keep specs independent across files. Read `playwright.config.ts` before changing worker or browser coverage: Chromium runs the full suite; WebKit runs only `e2e/webkit-smoke.spec.ts`.
- Assert computed accessible names, including resolved label references, as in `e2e/accessibility.spec.ts`; a nonempty label attribute alone is not sufficient.
