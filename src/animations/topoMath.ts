export interface TopoFrame {
  bfx: string;
  bfy: string;
  transform: string;
}

/**
 * Compute per-frame topographic animation values given the current phase and
 * drift-time accumulator. Both inputs are plain numbers; returns only strings.
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

  const t = (driftTime % 55) / 55; // 0→1 over 55s cycle
  const angle = t * Math.PI * 2;
  const tx = Math.sin(angle) * -5 + Math.sin(angle * 2) * 3;
  const ty = Math.cos(angle) * -3 + Math.cos(angle * 2) * -2;
  const rot = Math.sin(angle) * 1.5 - Math.sin(angle * 2) * 1;

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
