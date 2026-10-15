---
name: Imanol Portfolio
description: The Field Engineer’s Sketchbook
colors:
  primary: "#64748b"
  accent: "#94a3b8"
  midnight-slate: "#0f172a"
  soft-mint: "#b6e5d3"
  mint-action: "#d7f5e9"
  mint-hover: "#f0fff9"
  paper: "#f8fafc"
  heading: "#f1f5f9"
  body: "#cbd5e1"
  border: "#334155"
  card: "#111c2e"
  card-hover: "#162338"
  supporting: "#b4c1d2"
  ink-muted: "#475569"
typography:
  display:
    fontFamily: '"JetBrains Mono Variable", "JetBrains Mono", monospace'
    fontSize: "clamp(2.4rem, 4.3vw, 3.75rem)"
    fontWeight: 650
    lineHeight: 1.18
    letterSpacing: "-0.04em"
  hero-value:
    fontFamily: '"IBM Plex Sans Variable", "IBM Plex Sans", sans-serif'
    fontSize: "clamp(2rem, 3.1vw, 2.75rem)"
    fontWeight: 550
    lineHeight: 1.16
    letterSpacing: "-0.04em"
  headline:
    fontFamily: '"JetBrains Mono Variable", "JetBrains Mono", monospace'
    fontSize: "clamp(1.5rem, 2.6vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.055em"
  title:
    fontFamily: '"JetBrains Mono Variable", "JetBrains Mono", monospace'
    fontSize: "1.1rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.035em"
  body:
    fontFamily: '"IBM Plex Sans Variable", "IBM Plex Sans", sans-serif'
    fontSize: "16px"
  gallery-label:
    fontFamily: '"JetBrains Mono Variable", "JetBrains Mono", monospace'
    fontSize: "0.75rem"
    fontWeight: 400
    letterSpacing: "normal"
  section-kicker:
    fontFamily: '"JetBrains Mono Variable", "JetBrains Mono", monospace'
    fontSize: "0.65rem"
    fontWeight: 500
    letterSpacing: "0.13em"
  hero-value-mobile:
    fontFamily: '"IBM Plex Sans Variable", "IBM Plex Sans", sans-serif'
    fontSize: "clamp(1.8rem, 6vw, 2.5rem)"
    fontWeight: 550
    lineHeight: 1.16
  subheading:
    fontFamily: '"JetBrains Mono Variable", "JetBrains Mono", monospace'
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.5
  body-intro:
    fontSize: "0.95rem"
  body-compact:
    fontSize: "0.9rem"
  body-small:
    fontSize: "0.875rem"
  supporting-copy:
    fontSize: "0.85rem"
  micro-label:
    fontSize: "0.8rem"
rounded:
  control: "3px"
  frame: "4px"
  pill: "28px"
spacing:
  control-block: "0.5rem"
  control-inline: "1rem"
  card: "1.5rem"
  card-mobile: "1.25rem"
  hero-separation: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.mint-action}"
    textColor: "{colors.midnight-slate}"
    rounded: "{rounded.control}"
    padding: "0.5rem 1rem"
  button-primary-hover:
    backgroundColor: "{colors.mint-hover}"
    textColor: "{colors.midnight-slate}"
  project-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.paper}"
    rounded: "{rounded.frame}"
  project-card-hover:
    backgroundColor: "{colors.card-hover}"
    textColor: "{colors.paper}"
---

# Design System: Imanol Portfolio

## Overview

**Creative North Star: "The Field Engineer’s Sketchbook"**

Precise, curious, approachable. Technical structure comes from fine borders, monospaced headings, short local rules, and measured spacing. The hand-drawn portrait, watercolor project illustrations, and quiet mountain landscape bring warmth without competing with the work.

Precise frames, approachable artwork, quiet controls. The homepage expresses the sketchbook as a Field-map expedition: a continuous painted landscape, a camp-to-contact trail, and framed project artwork. The project gallery uses Experience mode: work leads, supporting copy stays concise, and navigation recedes. Case studies make room for longer explanations and source evidence.

**Key Characteristics:**

- Short section-local rules, with fine technical frames where the surface calls for them.
- Hand-drawn portrait and watercolor project artwork.
- A continuous Field-map landscape with mountains, lower hills, pine scenery, a delayed campfire story, and a dashed trail to contact.
- Midnight Slate grounds the interface; Soft Mint signals interaction.
- Controls brighten on interaction without competing with the work.

Implementation snapshot: [PR #129](https://github.com/imanol-s/imanol-s/pull/129), commit `40008b3` (2026-10-14), which supplies the current local preview. CSS and components remain authoritative; legacy utilities are not automatically current component defaults.

## Colors

### Primary

Slate primary and accent tokens support borders, technical detail, and legacy utilities. Soft Mint supplies section kickers, the frog mark, focus outlines, and small signal accents. The lighter mint action and hover colors supply current primary controls.

**The Brighten Rule.** Interactive controls brighten rather than dim their text; project titles retain their readable emphasis.

### Neutral

Midnight Slate is the page ground. Dark cards use distinct resting and hover tones. Paper and heading tones carry emphasized text; the softer body tone carries supporting content. Borders establish structure without heavy separators.

The shared theme defines the base slate palette, page grounds, and font families. Component styles supply the mint actions, heading/body tones, card fills, and supporting colors recorded above. Illustration colors, masks, shadows, and intentional translucency remain separately authored; these recorded colors are not all global theme tokens.

The layout explicitly starts dark. Project cards and case-study styles also contain light-theme variants, but this record does not claim a fully verified light-theme experience.

## Typography

**Display Font:** JetBrains Mono Variable, with JetBrains Mono and monospace fallbacks.

**Body Font:** IBM Plex Sans Variable, with IBM Plex Sans and sans-serif fallbacks.

Mono type provides precise technical character; proportional body text keeps longer explanations approachable. Both families are self-hosted with variable Latin subsets.

The frontmatter records recurring roles, not a universal type scale. The hero name reaches 3.75rem on desktop; below 1024px it uses `clamp(2.4rem, 5vw, 3.5rem)`, and below 768px `clamp(2rem, 7.7vw, 3.5rem)`. The two-line value statement uses IBM Plex Sans rather than the mono section-heading role, with the second line in Soft Mint. On mobile its size is `clamp(1.8rem, 6vw, 2.5rem)`.

Section headings use balanced wrapping; project-detail titles use `clamp(2rem, 4.5vw, 3.5rem)`, a 1.2 line height, and -0.055em tracking, softened to -0.04em below 640px. Project-card descriptions use 0.9rem type, 1.75 line height, and a 46ch maximum on the homepage gallery. Gallery technology labels and action cues use 0.75rem (12px at the normal root); technology text can wrap anywhere, and the action row uses a 0.5rem gap. These are component-specific roles, not a universal 12px floor: some existing kickers and metadata remain smaller. The hero introduction uses 1rem with 1.85 line height; section introductions use 0.95rem with 1.8 line height. Case-study summaries extend to 65ch and use 1.1rem type, reduced to 1rem below 640px. Small uppercase kickers use wide tracking.

## Layout

Reuse the shared Astro layout and existing surface templates. The homepage order is introduction and context, projects, career with a supporting profile/toolkit column, then contact in the shared footer. There is no rendered “How I work” section or enterprise-work excerpt. The shared main container is capped at 80rem, with 1.5rem horizontal padding and 2.5rem vertical padding, increasing to 3rem vertically at 768px. The hero uses a 1.5fr / 1fr grid, a 4rem gap, and top alignment; below 1024px the grid is 1.3fr / 1fr with a 2.5rem gap. Below 768px it stacks, with a compact 7rem portrait beside its status and social links. The desktop portrait column is capped at 21rem.

The desktop hero-to-work separation is 2.5rem; mobile uses 1rem. Mobile reading and keyboard order is identity and headline, actions, introduction, portrait and context. Desktop places introduction before actions. The ruled context strip shows the current role, education, and focus areas from configuration and career data; it becomes two columns with focus areas spanning the final row on mobile. After projects, career and profile/toolkit use a 1.7fr / 1fr grid with a 3rem gap; at 900px and below, career precedes the supporting content in one column.

The homepage project gallery uses a framed two-column grid, becoming one column below 768px, with a 1.5rem gap. Each card contains original 2:1 artwork and padded copy: 1.5rem desktop, 1.25rem mobile. Gallery cards retain CAD borders, the artwork separator, the action-row divider, and resting/hover surface tones. `ProjectsCarousel.astro` renders this grid, not a carousel. Optional `cardSummary` supplies concise gallery copy, falling back to `summary`; the full `summary` remains the case-study introduction and metadata source. The five current gallery excerpts contain 17–22 words. Their source qualifications and the articles’ evidence and NDA limitations remain intact.

The floating header is capped at 960px with 24px desktop side clearance and 16px mobile clearance. Desktop links change to a menu below 768px. Case studies retain their breadcrumb, title and full summary, original artwork, narrative, and details sidebar. The narrative/sidebar grid stacks below 1024px, with stack information before the narrative and previous/next project links after it. Match each surface’s existing container rather than imposing a new universal width.

## Elevation & Depth

Mostly flat, with tonal layers and restrained glow. The header uses an almost-opaque slate ground, a fine translucent border, and `drop-shadow(0 8px 15px #02061726)` for separation. Shared project frames retain CAD corner marks and hover glow. Portrait lighting is atmospheric rather than a raised card treatment. The animated topographic layer is hidden on the Field-map homepage and its animation loop is stopped there; it remains on project details, with its island and phase preserved across navigation.

**The Work First Rule.** Depth and decoration support the work, never compete with it.

## Shapes

Frames have small corners; controls are slightly tighter. CAD framing uses fine outlines and opposing 8px corner marks on project cards and supporting frames. The portrait is transparent and unframed. Docked navigation contracts around the fixed frog anchor, whose button has the accessible label “Open navigation”; it does not display a separate Menu caption. The scenery control uses a 32px visible circle within a 44px target at the normal root. Circular signal dots remain small accents. The dashed right-gutter trail belongs to the landscape journey rather than an interactive section-navigation rail.

## Components

- **Primary action:** pale mint ground, dark mono text, a fine matching border, and a 44px minimum height. Hover brightens the ground. Header and hero variants adjust size and padding.
- **Hero and portrait status:** keep the two-column composition, proportional two-line statement, and unframed original portrait. `ME.portraitNote` supplies the mono status, currently “Iterating”, followed by three decorative dots revealed in a 1.4-second stepped cycle. Reduced motion shows all dots statically. Personal text remains sourced from configuration.
- **Text link:** quiet supporting text, mono label, optional directional arrow, and a brighter mint hover. Do not force button styling onto secondary links.
- **Navigation:** fine translucent frame, compact mono labels, mint current-page state, and bright hover. Downward scroll contracts navigation toward the fixed frog anchor; upward scroll or activation expands it. Keyboard and open-menu interaction are protected. The rail/end move with 420ms transitions; reduced motion disables transitions. WORK opens the homepage project gallery, EXPERIENCE routes to the homepage career anchor, and résumé access remains a PDF link.
- **Project card:** one native full-card link, original 2:1 watercolor cover, up to three slash-separated technology labels, bright title, concise gallery description, and a bottom “Explore project” affordance. Homepage gallery cards retain the framed treatment and dividers. Titles stay bright on hover, keyboard focus stays visible, and the 1.035× artwork zoom over 250ms is limited to motion-enabled users. The homepage gallery contains every project; case-study “All projects” links return to that section. Covers depict project subjects; they are not screenshots or measured results.
- **Technology labels:** collection labels are inline text separated by slashes. Case-study stack tags use their own dark filled, uppercase style; do not homogenize the two.
- **Section heading:** unnumbered mint uppercase label with a short section-local rule, balanced mono heading, and quieter proportional introduction.
- **Field-map scenery:** `FieldMapScenery.astro` supplies the homepage’s mountain painting, alpine lake, western range, near ridge, lower hills, footer pines, faint contours, and cloud shadows. It follows page height and normal scrolling. The lake is shown only from 1240px through 1624px to stay clear of portrait, trail, and cards; outer contours are hidden below 1400px. Preserve the mountain artwork and its responsive layers.

- **Trail:** a quiet, one-pixel mint dashed line starts at the campfire and descends through the right gutter to contact. Geometry is measured from the rendered camp, content, and contact positions, avoids hero text/controls and the portrait where applicable, and updates after resize, font and image loading. The ink reveal follows sections entering view, pauses with the scenery control, and leaves the whole trail visible under reduced motion. Do not turn it into scroll hijacking or a navigation widget.

- **Forest scenery:** `ForestScene.astro` retains its 2103 × 748 SVG coordinate frame, separate pine sprites, figure, and campfire geometry. The homepage passes `staticTerrain={false}`: the Field-map supplies the mountain painting, while the forest adds its sprites and a terrain-matched camp clearing instead of drawing a second mountain canvas. Desktop scene width is capped at 1250px; mobile uses a quieter 48rem crop. Clearing offsets keep the story away from foreground text and controls.

  Pine gusts vary in phase and duration (6.4–8.3 seconds), with roots fixed and rotation up to about 3°. After 25 seconds of active animation time, the figure walks in; chopping begins at 31 seconds, the tree falls at 39, wood returns at 44, firewood appears at 48, ignition begins at 50, and seated rest begins at 51. The 30-second story plays once per homepage visit; wind and gentle fire flicker continue afterward. The hero pause/play control freezes the forest, cloud shadows, and trail reveal. Offscreen and hidden-page signals pause forest motion; reduced motion or disabled JavaScript leaves stationary trees without the figure/fire story or scenery control. Do not move the fire as a side effect of background or layout work.

- **Back to top:** a 3rem square (48px at the normal root), with CAD corners, arrow, and a small TOP cue. It becomes visible after 300px of scrolling and remains available while focused. When hidden it is removed from keyboard navigation. Activation focuses the main landmark and scrolls to the top, instantly under reduced motion.
- **Motion and first visit:** preserve the three React islands: topographic background, session overlay, and typewriter. A fresh tab can show the opaque dotted intro: a 100ms render fence, 500ms play phase, then a 500ms fade. The full hero name is present in server HTML and its dimensions are reserved. On the first animated visit it is cleared only behind the opaque overlay, then revealed as the overlay fades; Escape or the skip control completes it immediately. Return visits in the same tab, late hydration, reduced motion, and no JavaScript retain the full name. Do not claim that cold non-home routes or constrained connections skip the intro: the current lifecycle has no such gates.

- **Page transitions:** retain Astro ClientRouter’s crossfade and ordinary links/history. Before a route swap, prominent incoming artwork is decoded with its actual responsive source and size attributes: homepage terrain/portrait/forest resources, detail cover, or the first two desktop/one mobile listing covers. One shared 800ms limit and cancellation prevent slow or failed art from blocking navigation indefinitely. The incoming static loading cover is hidden before the swap so it cannot reappear in the transition snapshot. Lower gallery content and body icons stay lazy; artwork exceeding the limit can still appear progressively.

There are no public form-input primitives to document. Blog content is archived; résumé access uses the existing PDF link, not a separate visual page system.

## Do's and Don'ts

### Do

- Reuse precise frames, approachable artwork, and quiet controls.
- Brighten interactive states while keeping titles readable.
- Preserve visible keyboard focus and reduced-motion behavior.
- Keep original case-study evidence distinct from conceptual cover illustrations.
- Keep gallery descriptions concise without shortening the full case-study summary, metadata, or article. Preserve original 2:1 project artwork and existing navigation affordances.

### Don't

- Introduce generic corporate styling.
- Use excessive neon.
- Add decoration that competes with the work.
- Treat legacy utility definitions as the rendered component defaults without checking the cascade.

## Verification Boundaries

The current project-card refinements were checked on desktop and at 390px and 320px, with both label color variants and generic-font fallback. Gallery labels and action rows fit at 200% root text scaling, but page-wide overflow and some body/title constraints remain at that scale. This is not a complete reflow certification or a claim of full light-theme, Safari, Firefox, or physical-device coverage. Keep that distinction when using this document as design authority.
