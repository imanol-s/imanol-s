# Site structure

## Public routes

- `/`: homepage with hero, complete `#projects` gallery, experience, toolkit and contact footer.
- `/projects/[id]`: generated project case studies with MDX content and neighboring-project navigation.
- `404.astro`: not-found page.
- Exact legacy `/projects` and `/projects/` paths redirect to `/#projects`; do not add a wildcard redirect or a second project index.

Posts remain archived under `src/content/posts/`; there are no public blog routes or redirects.

## Source map

| Responsibility                                             | Source                                                                                                           |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Shared document, metadata, preloads, navigation and footer | `src/layouts/Layout.astro`                                                                                       |
| Homepage composition                                       | `src/pages/index.astro`                                                                                          |
| Hero, gallery, experience and toolkit                      | `src/components/HeroSection.astro`, `ProjectsCarousel.astro`, `ExperienceTimeline.astro`, `ProfileToolkit.astro` |
| Guided case-study template                                 | `src/pages/projects/[id].astro`                                                                                  |
| Collection loaders and schemas                             | `src/content.config.ts`                                                                                          |
| Personal/site content                                      | `src/config.ts`                                                                                                  |
| Career and education                                       | `src/data/career.ts`                                                                                             |
| Technology IDs and presentation                            | `src/data/techRegistry.ts`                                                                                       |
| Project sorting and navigation data                        | `src/data/projectCollection.ts`                                                                                  |
| Shared image delivery                                      | `src/components/SiteImage.astro`                                                                                 |
| Theme and shared styles                                    | `src/styles/globals.css`                                                                                         |

Project MDX lives in `src/content/projects/`. Artwork is imported from `src/assets/` or adjacent collection images. Keep evidence illustrations distinct from concept covers.

## Client behavior

Only three React islands exist: `TopoBackground` and `LoadingOverlay` use `client:only="react"`; `TypewriterText` uses `client:load`. Their shared state lives in `src/hooks/useSiteLifecycle.ts`, not React context. Astro components also own focused browser scripts; server-rendered Astro does not mean the whole site is JavaScript-free.

`ClientRouter` handles navigation. DOM setup uses `astro:page-load` with cleanup; navigation artwork preparation lives in `src/utils/pageTransition.ts`. Header docking and menu behavior remain in their existing utilities. Field-map and forest composition stay in their own components.

See [performance](PERFORMANCE.md), [developer docs](README.md), and the canonical [repository instructions](../AGENTS.md).
