# Development guide

Source for [imanols.dev](https://imanols.dev), presenting Imanol Saldana's work in data analysis, automation, and software development through project case studies and work history.

Built with Astro, TypeScript, React islands, and Tailwind CSS. Netlify serves the static site; the résumé publishes independently through GitHub Actions and GitHub Pages.

## Local setup

Use Node.js 22 and npm. `.nvmrc` and Netlify pin Node 22; `package.json` requires Node 22 or newer.

Outside CI, `npm ci` configures this repository's Git identity as `Imanol Saldana <72887568+imanol-s@users.noreply.github.com>` and enables its hooks. Global Git settings are unchanged. If adapting this repository for someone else, update the identity policy in `scripts/git-identity.mjs` before installing or committing.

```sh
npm ci
npm run dev
```

Open `http://localhost:4321`. Local development requires no API keys or service credentials.

## Commands

| Command                          | Purpose                                                              |
| -------------------------------- | -------------------------------------------------------------------- |
| `npm run dev`                    | Start the development server, normally on port 4321.                 |
| `npm run build`                  | Run Astro's type and content checks, then generate `dist/`.          |
| `npm run preview -- --port 4321` | Serve the existing production build locally.                         |
| `npm test`                       | Run the Vitest suite once.                                           |
| `npm run test:e2e`               | Run Playwright tests in Chromium against port 4321.                  |
| `npm run check:git-identity`     | Check the effective author and committer identity before committing. |

Build before running browser tests. Install Playwright's Chromium browser on first use:

```sh
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright starts the preview server automatically and can reuse an existing local server on port 4321. Stop a manually started background preview with `npx astro preview stop`; stop a foreground development server with Ctrl-C.

## Project map

| Path                              | Contents                                                           |
| --------------------------------- | ------------------------------------------------------------------ |
| `src/config.ts`                   | Personal details, homepage copy, contact links, and site metadata. |
| `src/content/projects/`           | MDX case studies and their frontmatter.                            |
| `src/content.config.ts`           | Content collection schemas.                                        |
| `src/assets/`                     | Imported artwork and images processed by Astro.                    |
| `src/pages/`                      | Homepage, project detail routes, and error page.                   |
| `src/components/`, `src/layouts/` | Shared UI, React islands, and page layout.                         |
| `src/data/`                       | Work history, education, and technology registry.                  |
| `src/styles/globals.css`          | Tailwind configuration, design tokens, and shared styles.          |
| `public/`                         | Files copied directly to the built site.                           |
| `e2e/`                            | Playwright browser tests.                                          |
| `resume/`                         | Maintained LaTeX résumé source and publication instructions.       |

The homepage gallery at `/#projects` is the project index. Case studies have individual `/projects/[id]` routes. Blog posts remain archived in `src/content/posts/` without public routes.

Keep generated builds, test reports, caches, and compiled résumé files untracked. Never commit credentials; use environment variables for any future secret configuration.

## Documentation

- [Product context](../PRODUCT.md) and [implemented design](../DESIGN.md)
- [Site structure](SITE_STRUCTURE.md)
- [Performance guidance](PERFORMANCE.md)
- [Netlify subdomain setup](deployment/netlify-subdomains.md)
- [Résumé workflow](../resume/README.md): edit `resume/main.tex` on `ui-migration`, then merge into `main` to publish.
