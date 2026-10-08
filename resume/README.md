# Resume publication

Edit `main.tex`, then push to `ui-migration`. GitHub Actions compiles with pdfLaTeX and publishes the PDF independently of the portfolio. Resume-only changes skip Netlify; mixed changes run both pipelines.

The public address is `/resume.pdf`, redirected by Netlify to the Pages PDF. Failed compilation preserves the previous publication. Publication is serialized and compares resume inputs with the current branch, so later site-only commits do not discard a valid build.

Overleaf saves do not trigger GitHub. If editing there, export the current source and replace `main.tex` before pushing. Preserve the engine guards around the pdfLaTeX-only Unicode commands. Do not commit generated PDFs or the old source variant.

Run `node --test scripts/resume-pipeline.check.mjs` to verify freshness and Netlify build-ignore decisions.
