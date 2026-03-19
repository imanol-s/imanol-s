# Ubiquitous Language

## Content

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Post** | A blog article authored in Markdown/MDX within the `posts` collection | Blog post, article, entry |
| **Project** | A portfolio piece authored in MDX within the `projects` collection, with build-time validated tech tags | Work, case study |
| **Tag (project)** | A validated identifier from the Tech Registry attached to a Project for categorization | Label, category, skill |
| **Tag (post)** | A free-form string attached to a Post for categorization (NOT validated against the Tech Registry) | Label, topic |
| **Keyword** | An optional free-form string on a Post or Project used for SEO/discoverability, distinct from Tags | Tag (when meaning SEO term) |
| **Cover** | The hero image associated with a Post or Project, defined in frontmatter | Thumbnail, banner, hero image |

## Tech & Data

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Tech Registry** | The single-source-of-truth array in `techRegistry.ts` that defines every valid tech identifier, its display name, and optional icon path | Tag list, tech list |
| **Tech Entry** | A single record in the Tech Registry comprising an `id`, optional `iconPath`, `displayName`, and `category` | Tech item, tech tag definition |
| **Tech ID** | The lowercase string identifier for a Tech Entry (e.g. `"python"`, `"typescript react"`) | Tech name, tech slug |
| **Tag Pill** | The UI chip that renders a Tech ID with its icon and display name | Badge, chip, tech badge |
| **Career Data** | The structured arrays in `career.ts` defining Work Experience and Education entries | Resume data, CV data |

## Site Identity

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **SITE** | The global config object in `config.ts` holding site-wide metadata (title, URL, OG image, etc.) | Settings, site config |
| **ME** | The global config object in `config.ts` holding the site owner's personal/professional identity | Profile, author, user |
| **Focus Area** | One of the three professional domain strings displayed in the Hero Section (e.g. "Data science & analytics") | Specialty, domain, pillar |
| **Competency** | A professional skill area listed in the sidebar (e.g. "Data Governance", "Predictive Modeling") | Skill, expertise |
| **Core Language** | A programming language referenced by Tech ID in `ME.coreLanguages` and rendered in the sidebar | Primary language, main language |

## UI Components & Islands

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Island** | A React component hydrated on the client inside an otherwise static Astro page | Widget, interactive component |
| **Loading Overlay** | The full-screen animated overlay (React Island) shown during initial load and view transitions | Splash screen, loader, spinner |
| **Topo Background** | The full-page SVG topographic-line animation (React Island) rendered behind all content | Background animation, terrain lines |
| **Typewriter Text** | The React Island that animates the owner's name character-by-character in the Hero Section | Typing animation, hero text |
| **Hero Section** | The top-of-page Astro component containing the name, professions, focus areas, and profile image | Banner, header section, intro |
| **Projects Carousel** | The horizontal-scroll Astro component displaying Project cards with drag and button navigation | Project slider, project gallery |
| **Experience Timeline** | The Astro component rendering Work Experience as a vertical timeline with a sidebar | Resume section, work history |
| **Back to Top** | The fixed-position button that scrolls to the page top, with a collapsed state to avoid sidebar overlap | Scroll-to-top, BTT |

## Coordination & Lifecycle

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Overlay-Ready Signal** | The promise-based gate (`overlayReady.ts`) that resolves when the Loading Overlay finishes fading out | Overlay event, load complete |
| **View Transition** | Astro's client-side page navigation that swaps DOM content and fires `astro:before-swap` / `astro:after-swap` / `astro:page-load` events | SPA navigation, page transition |
| **Swap Guard** | The `registerOnceAfterSwap(key, callback)` utility ensuring a script runs exactly once per page lifecycle, re-running after each View Transition swap | After-swap hook, transition listener |
| **Reduced Motion** | The user's OS-level `prefers-reduced-motion` setting, accessed via `useReducedMotion()` (React) or `prefersReducedMotion()` (Astro) | Motion preference, a11y motion |
| **Session State** | Client-side state persisted in `sessionStorage` via the `useSessionState(key, default)` hook | Session storage, tab state |

## Content Collections

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Collection** | An Astro content collection defined in `content/config.ts` with a Zod schema and glob loader | Content type, content source |
| **Frontmatter** | The YAML metadata block at the top of a Post or Project MDX/Markdown file, validated by the Collection schema | Metadata, header, props |
| **Content Schema** | The Zod object in `content/config.ts` that validates Frontmatter fields at build time | Validation, type definition |

## Relationships

- A **Project** has one or more **Tags (project)**, each validated against the **Tech Registry**
- A **Post** has one or more **Tags (post)**, which are free-form strings (not validated)
- A **Post** or **Project** may optionally have **Keywords** for SEO
- A **Tag Pill** renders a single **Tech ID** by looking up the **Tech Entry** in the **Tech Registry**
- The **Loading Overlay** produces the **Overlay-Ready Signal** when it finishes fading out
- **Typewriter Text** consumes the **Overlay-Ready Signal** to know when to start typing
- **Swap Guards** re-initialize scripts after each **View Transition**
- **ME** references **Core Languages** by **Tech ID**
- **Career Data** feeds into the **Experience Timeline**

## Example dialogue

> **Dev:** "When a visitor lands on the homepage, what fires first — the **Typewriter Text** or the **Topo Background**?"
> **Domain expert:** "The **Loading Overlay** renders on top of everything. The **Topo Background** is always running underneath. Once the **Loading Overlay** fades out, it fires the **Overlay-Ready Signal**, and only then does the **Typewriter Text** begin animating."
> **Dev:** "What happens during a **View Transition** — does the **Typewriter Text** replay?"
> **Domain expert:** "The **Loading Overlay** resets the **Overlay-Ready Signal** on `astro:before-swap`, fades back in, then fades out again on `astro:page-load`. The **Typewriter Text** uses **Session State** to remember it already played — so it skips the animation on subsequent navigations within the same tab."
> **Dev:** "If I add a new tech tag to a **Project**, do I need to update anything else?"
> **Domain expert:** "Yes — add the **Tech Entry** to the **Tech Registry** first. The **Content Schema** validates **Tags (project)** against the registry at build time. If the **Tech ID** doesn't exist, `astro check` fails."

## Flagged ambiguities

- **"tag"** is used for two distinct concepts: **Tag (project)** is build-time validated against the Tech Registry, while **Tag (post)** is a free-form string. Code and conversation should always qualify which kind.
- **"keyword"** vs **"tag"**: Both appear in Frontmatter. **Keywords** are SEO-only strings; **Tags** drive UI rendering (pills, filtering). They should not be used interchangeably.
- **"overlay"** alone is ambiguous — it could mean the **Loading Overlay** (the React component), the **Overlay-Ready Signal** (the coordination primitive), or the static fallback `#loading-overlay` div in the HTML. Prefer the full term.
- **"island"** is Astro jargon for a hydrated component. The project has exactly two permanent Islands (**Topo Background**, **Typewriter Text**) plus the **Loading Overlay**. Do not call static Astro components "islands."
- **"Tech Stack"** was replaced with **"Profile"** as the sidebar heading — it covers Education, Core Languages, Competencies, and Communication. Avoid "Tech Stack" in all headings and domain language.
