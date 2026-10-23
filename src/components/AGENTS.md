# Components

- Keep static content in Astro templates and collections; use CSS, browser JavaScript, or React for interactions. Justify added client JavaScript by purpose, complexity, and runtime cost, not island count.
- Keep typed component props; retain inferred React component return types. Preserve component-scoped CSS alongside shared Tailwind utilities.
- Keep the `TopoBackground.tsx` fade tied to mount so navigation does not replay it.
- Render charts/architecture diagrams as server-rendered Astro HTML/CSS with visible data and descriptions, without a chart runtime or React island.
