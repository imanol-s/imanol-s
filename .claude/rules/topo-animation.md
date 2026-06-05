---
paths:
  - src/animations/topoMath*
  - src/components/TopoBackground*
---

# Topographic background animation

The CSS drift transform in `computeTopoFrame` must be **unidirectional** — tx and ty must only decrease, rotation must only increase. Never use oscillating functions (Math.sin, Math.cos, bounce, ping-pong) for the drift values. The baseFrequency oscillation (feTurbulence) is intentionally sinusoidal and exempt from this rule.

Tests in `topoMath.test.ts` enforce the monotonic drift invariant. Run them after any change to this file.
