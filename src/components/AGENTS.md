# Components

- Keep static content in Astro templates and collections; use CSS, browser JavaScript, or React for interactions. Justify added client JavaScript by purpose, complexity, and runtime cost, not island count.
- Keep typed component props; retain inferred React component return types. Preserve component-scoped CSS alongside shared Tailwind utilities.
- Before changing page-owned scripts, read `src/utils/AGENTS.md` for lifecycle and DOM-ownership contracts. Before changing React motion or session state, read `src/hooks/AGENTS.md` and reuse its hooks.
- When changing `TopoBackground.tsx`, keep its fade tied to mount so navigation does not replay it; read `src/layouts/AGENTS.md` before changing its mounting or persistence.
- Preserve the shared `data-scenery-paused` document state and `scenery:pause-change` event between `src/components/ForestScene.astro`, `src/components/FieldMapScenery.astro`, and `src/utils/fieldMapTrail.ts`.
- Before changing project cards or metadata, read `src/content/AGENTS.md`; before changing career rendering, project ordering, or date display, read `src/data/AGENTS.md`.
- Render charts/architecture diagrams as server-rendered Astro HTML/CSS with visible data and descriptions, without a chart runtime or React island.
