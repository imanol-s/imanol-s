# Browser and formatting utilities

- Keep exported utility function declarations with explicit return types.
- Initialize page-owned DOM listeners/observers on `astro:page-load`; keep module-scoped cleanup and run it before reinitialization and on `astro:before-swap`. Processed component scripts do not rerun on each navigation. Document ownership at cross-component DOM-ID lookups.
- Use `src/utils/prefersReducedMotion.ts` for imperative motion snapshots; retain live preference subscriptions where needed. Read `src/hooks/AGENTS.md` before changing React consumers.
- Before changing the scenery pause integration in `src/utils/fieldMapTrail.ts`, read `src/components/AGENTS.md` for the shared state/event contract.
