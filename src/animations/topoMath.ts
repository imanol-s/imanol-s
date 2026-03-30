export interface TopoFrame {
  bfx: string;
  bfy: string;
  transform: string;
}

/**
 * Compute per-frame topographic animation values given the current phase and
 * drift-time accumulator. Both inputs are plain numbers; returns only strings.
 *
 * INVARIANT: The CSS drift (tx, ty, rot) must be monotonic — translation
 * values must only decrease and rotation must only increase over time.
 * Never use oscillating functions (sin, cos, bounce, ping-pong) for the
 * drift transform. The topographic background must always move in one
 * continuous direction. Tests enforce this via the "never reverses" case.
 *
 * baseFrequency precision: toFixed(5) is intentional. The per-frame delta is
 * ~0.0000009 (phase step 0.0006 × amplitude 0.0015). At toFixed(4) the
 * attribute stays identical for ~111 frames before jumping, producing visible
 * stutter. 5 decimal places keeps each step (~0.00001) small enough to appear
 * continuous at 60 fps.
 */
export function computeTopoFrame(phase: number, driftTime: number): TopoFrame {
  const bfx = (0.004 + Math.sin(phase) * 0.0015).toFixed(5);
  const bfy = (0.004 + Math.cos(phase * 0.73) * 0.0015).toFixed(5);

  // Continuous unidirectional drift — never reverses.
  // Rates tuned so the 25% oversized-container buffer lasts ~45 min
  // before any edge could theoretically be exposed.
  const tx = -driftTime * 0.008;
  const ty = -driftTime * 0.005;
  const rot = driftTime * 0.02;

  const transform = `translate(${tx}%, ${ty}%) rotate(${rot}deg)`;

  return { bfx, bfy, transform };
}

/**
 * Compute the set of SVG horizontal line Y-coordinates for a given viewport
 * height and line gap. Returns an array starting at -20 (buffer above the
 * visible area) and continuing past height.
 */
export function buildLineYs(height: number, gap: number): number[] {
  const count = Math.ceil(height / gap) + 3;
  return Array.from({ length: count }, (_, i) => -20 + i * gap);
}
