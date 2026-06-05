---
paths:
  - "src/components/*.tsx"
  - "src/hooks/useSiteLifecycle.ts"
  - "src/hooks/useReadyGate.ts"
  - "src/utils/siteLifecycle.ts"
---

# React Island Rules

## 3-Island Hard Limit

There are exactly 3 React islands. Do NOT create new `.tsx` islands without explicit user approval:

1. `TopoBackground` — `client:only="react"`
2. `LoadingOverlay` — `client:only="react"`
3. `TypewriterText` — `client:load`

## State Coordination

Islands share state via a **module-level store** in `src/hooks/useSiteLifecycle.ts` using `useSyncExternalStore`. They do NOT use React context — there is no shared React tree.

## Required Hooks

- `useReducedMotion()` for any animation — never access `matchMedia` directly
- `useSessionState(key, default)` for session persistence — never use `sessionStorage` directly
- `useReadyGate()` to gate behavior on lifecycle readiness
