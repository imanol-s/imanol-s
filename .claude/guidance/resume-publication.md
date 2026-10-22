# Résumé publication and related CI

- Maintain `resume/main.tex` on `ui-migration`; merge to `main` to publish independently through GitHub Pages with pdfLaTeX. Only `main` publishes; workflow trigger, job guard, and freshness comparison must agree.
- Keep `ME.contactInfo.resumeDoc` as `resume.pdf`; site buttons use `/resume.pdf`, a forced Netlify 302 to the Pages PDF.
- Publication is serialized and compares current résumé inputs; later site-only changes do not invalidate a valid build. Résumé-only changes skip Netlify through `node scripts/resume-pipeline.mjs ignore`; uncertain history builds normally.
- PR validation (`.github/workflows/check-resume.yml`) and main publication share `.github/actions/compile-resume/action.yml`. Keep PR compilation free of deployment permissions. Compiler/workflow changes are publication inputs.
- Site checks may skip résumé-only synchronize pushes only after a successful preceding CI run for the same PR and base SHA. Failed, pending, missing, or unreadable results run checks; opened PRs always run them. `scripts/site-checks.mjs` uses the read-only Actions API with `actions: read`.
- Pipeline regressions run before any site-check skip, including résumé-only updates. When changing these paths, run `node --test scripts/resume-pipeline.check.mjs` and `node --test scripts/site-checks.node-test.mjs`.
