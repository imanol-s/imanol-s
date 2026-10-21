---
paths:
  - "src/components/*.tsx"
---

# React Island Rules

## Single-Island Limit

There is exactly 1 React island. Do NOT create new `.tsx` islands without explicit user approval:

1. `TopoBackground` — `client:only="react"`

## Required Hooks

- `useReducedMotion()` for any animation — never access `matchMedia` directly
- `useSessionState(key, default)` for session persistence — never use `sessionStorage` directly
