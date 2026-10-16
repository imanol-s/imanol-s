# Resume publication

Edit `main.tex` on `ui-migration`, then merge into `main` to publish. GitHub Actions compiles with pdfLaTeX and publishes the PDF independently of the portfolio. Resume-only changes skip Netlify; mixed changes run both pipelines.

The public address is `/resume.pdf`, redirected by Netlify to the Pages PDF. Failed compilation preserves the previous publication. Publication is serialized and compares resume inputs with the current branch, so later site-only commits do not discard a valid build.

Overleaf saves do not trigger GitHub. If editing there, export the current source and replace `main.tex` before pushing. Preserve the engine guards around the pdfLaTeX-only Unicode commands. Do not commit generated PDFs or the old source variant.

Run `node --test scripts/resume-pipeline.check.mjs` to verify freshness and Netlify build-ignore decisions.

To retry without editing source, open GitHub Actions, select **Publish resume**, and run the workflow on `main`. Wait for its deployment to succeed before sharing the updated PDF; compilation errors leave the previously published version available.
