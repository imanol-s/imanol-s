# Field-map expedition implementation specification

Status: historical implementation brief, 2026-10-12, superseded by the current [design record](../../DESIGN.md) and [canonical instructions](../../AGENTS.md). Retained as design history, not current acceptance criteria.

The accepted implementation now includes expanded mountain, lake, ridge, and cloud scenery; the homepage project gallery replaces the separate listing; individual case studies use the guided walkthrough. The enterprise-work excerpt and “How I work” section were subsequently removed. The original scope and constraints below describe the earlier proposal.

## Objective

Extend the homepage into a continuous, understated field-map journey while retaining its actual content, original watercolor project presentation, and campfire animation at its existing location. Achieve compactness through layout and spacing rather than smaller text, omitted roles, collapsed content, or theatrical landscape gaps.

## Authority and references

This document records the original implementation contract. Current repository instructions and `DESIGN.md` govern later work. Source content takes precedence over text pictured in generated mockups.

- Product and visual identity: `../../PRODUCT.md`, `../../DESIGN.md`.
- Real-content prototype: `build-field-map-preview.mjs`, `field-map-preview.css`, and local `/design-preview/` after generation. It demonstrates content fit, not finished scenery.
- Terrain asset: `field-map-terrain.webp`. Use this existing artwork; no further whole-page image generation is required.
- Earlier committed `field-map-concept.png` is historical inspiration only. It is not the latest target.
- Prior critique: `../../.impeccable/critique/2026-10-12T04-37-54Z__exec-14e9e1b8-5ff9-46e7-bea6-92ef7d3c9b8b-png.md`. Its findings concern the raster concept, not the current browser preview.

## Settled scope

Homepage only, including its footer background. Project listing/detail routes retain their current presentation. Preserve navigation, résumé/contact destinations, portrait, hero copy and enterprise-work excerpt, focus/context strip, every project, every career role/description/highlight, approach copy, education/toolkit, and contact note.

No editorial rewrite, new sections, interactive map controls, location labels, route markers, badges, dependency changes, new React islands, scroll hijacking, scroll-linked animation, or automatic movement through the page. Do not implement the earlier fixed/repeated/mirrored mountain wallpaper.

## Page composition

1. **Hero / base camp:** preserve the current layout, portrait, actions, context strip and forest animation geometry at each breakpoint. Replace only the static terrain treatment. The fire remains the sole warm scenery accent.
2. **Selected work:** preserve the existing two-column desktop and single-column mobile image-led card presentation, original covers, source summaries, technology labels and links. Render all projects in their source order, not just the two shown in mockups. Do not duplicate the component or substitute generated cover copies.
3. **Experience and Approach:** above 900 CSS pixels, use a shared grid with approximately 1.7fr / 1fr columns and a 3rem gap. Full career history sits on the left. Approach followed by Background & toolkit sits on the right. At 900px and below stack in this DOM order: complete Experience, Approach, Background & toolkit. No sticky column, equal-height filler or hidden/collapsed roles.
4. **Approach:** keep its heading, introduction and all three titled descriptions. Remove decorative step numbers/icons and boxed-card styling for this homepage treatment. Use ordinary text spacing, without removing actual content.
5. **Contact / overlook:** retain current heading, configured invitation, contact links and footer metadata. Use a quiet continuation of the page background, not a large scenic end panel. Preserve back-to-top clearance.

Keep the current 78rem maximum main container and readable text sizes. Use existing design tokens and self-hosted fonts. Start with the prototype's section spacing: 4rem after projects, 3rem around the lower sections, 2rem between career entries. Adjust only to correct demonstrated overlap, overflow or awkward wrapping.

The screenshot's implied half-height is not a production requirement. With unchanged content, the measured prototype is about 12% shorter on desktop and 6% shorter on mobile. Retain that approximate compactness; do not add scenery-only spacer sections. Never trade completeness or readability for a numeric height target.

## Artwork and topographic treatment

Use the supplied WebP once in a page-bound decorative layer. It scrolls with the document, never the viewport. Preserve its aspect ratio with width-based sizing; do not stretch it to the entire document height, mirror it, tile it, or duplicate it below the fold.

Begin at opacity 0.24 over the existing navy background, as in the prototype. Use a soft fade to navy at the image's bottom edge so it never appears as a hard rectangular panel. Preserve recognizable hero mountains, with lower terrain significantly quieter. No additional glossy rocks, dense tree forests, dramatic sky, tent, lantern monument or illuminated settlements.

The artwork does not supply all of the page's geography. Below it, continue the field-map motif with at most two small groups of static contour geometry in outer margins. Each group has roughly 4–7 smooth nested, non-crossing strokes, with consistent line weight and meaningful spacing variation. Use existing muted slate/mint tokens at low opacity. Do not fill the entire background with loops or draw elaborate scenic pictures in SVG. Keep text columns clear of contour detail.

Decorative elements are aria-hidden and pointer-events:none. They must not become layout spacers, hit targets, focus stops or horizontal overflow sources. Text, cards, controls and footer links always paint above them.

## Trail continuity and responsive geometry

Use one restrained, nonanimated dashed line connecting the campsite region to the contact region. It must remain within the page boundary throughout and must not travel behind paragraphs or project cards.

Implementation decision: use the **right outer gutter** for the main descent. The campsite is already on the right; this avoids crossing the entire hero text area to reach the left side. This deliberately corrects the mockup's left-edge clipping and the prototype's disconnected vertical rail.

- Start beside the existing fire using an SVG point in its local coordinate system, not a fixed screenshot pixel or an animated flame bounding box.
- Connect through the clear artwork area to the right gutter with a single gentle curve. Continue down the gutter with only small lateral variation; end beside the contact section. No arrows, numbered stops or glowing dashes.
- Reserve a narrow gutter inside the page edge: line stays outside content but never beyond the viewport. At 320–900px constrain it to the available outer padding, using smaller curves. Do not move the fire or content to manufacture room.
- Measure current element geometry after layout and update on resize/content-size changes. A small non-React utility may position the path; no scroll listener is needed because the path is in document coordinates. Schedule measurement outside resize observer delivery to avoid feedback loops.
- Account for font/image layout settling and Astro navigation. Disconnect observers and listeners during navigation cleanup. If the required anchors are absent, omit the decorative path without affecting content.
- With JavaScript disabled, preserve all content and static scenery; the trail may be absent. Reduced motion renders the same stationary path.

## Fire, motion and island contract

Preserve ForestScene's original SVG viewBox, transforms, width/position rules, breakpoint translations, animation keyframes, timing, pause control and visibility behavior. Hide/remove only its original static raster when the new terrain layer is present; keep actors and pines. Do not remove the original raster for unrelated uses or before replacement terrain exists.

At the same viewport, scroll position and animation time, the fire's screen position and size must remain equal to the pre-change baseline within 1 CSS pixel. Source identity alone is insufficient because parent layout can move it.

The three existing React islands remain mounted with their current lifecycle. The older animated topographic layer may be visually suppressed on the homepage to avoid competing scenery; preserve its behavior on other routes and restore visibility on Astro navigation. No new background motion. Existing scenery pause/resume and reduced-motion contracts remain intact.

## Source implementation boundaries

Do not ship the prototype HTML clone/generator as production routing. Integrate its useful layout changes through normal Astro components and the existing layout.

Expected impact surface:

- `src/pages/index.astro`: homepage composition and scoped integration.
- `src/components/HeroSection.astro` / `ForestScene.astro`: only hooks required to distinguish original static terrain from preserved animation; avoid geometry changes.
- `src/components/ExperienceTimeline.astro`: separate the existing toolkit aside into a reusable Astro component so it can follow Approach without client-side DOM reparenting. Preserve the career timeline output.
- A single new static scenery Astro component plus a small trail-positioning utility, if needed.
- `src/layouts/Layout.astro` and/or `SiteFooter.astro`: the smallest explicit homepage-only scenery hook so the backdrop includes the footer without leaking to other routes. Prefer an opt-in flag over incidental selectors based on text or route substrings.
- Copy the terrain asset into `src/assets/` and use the existing Astro image pipeline. Do not depend on `docs/design/` or generated `dist/` at runtime.
- Existing forest/navigation E2E tests plus narrowly scoped coverage of the new route geometry and content ordering.

Reuse existing project rendering, data accessors and design tokens. Do not change `src/config.ts` or career data. If infrastructure/config changes unexpectedly become necessary, follow the repository's paired documentation-update rule; none are planned here.

## Verification and acceptance

Capture the original homepage baseline from the actual working checkout before editing. Record content counts/text, fire geometry, screenshots, asset/network errors and relevant page dimensions. Keep unrelated dirty work intact on `ui-migration`.

Required browser widths: 1440, 1024, 900, 834, 390 and 320px. Use desktop and mobile temporal interaction, not only full-page screenshots. Verify:

- All source projects and career content survive unchanged. Current concrete fixture: 4 projects, 4 roles and 17 highlights, including the oldest role. Counts are evidence for today's content, not production caps.
- No horizontal overflow, clipped text, missing/lazy image placeholders in final screenshots, or overlap of trail/terrain with controls and body copy. All project covers decode successfully.
- Correct two-column/stacked layout and sensible source/focus order around the breakpoint. Anchor navigation reaches headings below the docked header.
- The fire geometry comparison passes at the existing timeline checkpoints, including the lit state. Existing forest story, pause/resume, offscreen/visibility and reduced-motion tests pass.
- Trail starts by the camp and ends by contact, remains visible within the viewport and is not clipped after resize, font loading or navigating away/back. Repeated navigation creates no duplicate observers, paths or handlers.
- Tab through menu, project cards, résumé, contact and scenery control. Focus is visible; hover never dims text. Test 200% zoom/reflow.
- Measure contrast against actual composited backgrounds: normal text at least 4.5:1, large text at least 3:1. Meaningful UI labels remain at least 0.75rem, existing 44px control minima retained. Decorative contours need not meet text contrast.
- Listing and project detail routes retain their prior background/navigation behavior.
- No new React island, third-party request, scroll animation loop, or dependency. Compare loading/network behavior with baseline and report actual changes rather than asserting a performance improvement.

Tests must assert independent behavior and contain required nonempty fixtures. Do not copy the path-construction algorithm into a test. A browser assertion that endpoints align with independently measured camp/contact anchors should fail if the path uses stale viewport coordinates or is clipped.

Run the repository build/typecheck, relevant focused tests while working, full unit suite at completion, and relevant browser suites. Follow local verification instructions. Start/reuse only one preview on port 4321 and leave it running for this user. Inspect desktop/mobile in one batch, make one focused correction batch, then confirm; broaden only for newly observed failures.

## Completion and delivery

Deliver source changes, comparison screenshots, checks/results, measured limitations and a working local preview. Retain a source-derived content checklist; do not claim the generated mockup proves accessibility or content fit.

This specification settles implementation direction. No additional design interview is required for routine choices within it. If a concrete conflict prevents retaining the fire geometry, full content or accessibility, explain that conflict before changing those contracts. Homepage integration is the next implementation task; publication/deployment is separate.
