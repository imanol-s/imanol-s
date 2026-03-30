export interface Dot {
  x: number;
  y: number;
  phase: number;
  speed: number;
}

/**
 * Build the hex-offset dot grid for a given canvas size.
 * Even rows (j % 2 === 0) have no x offset; odd rows are shifted by gap/2.
 * Dots extend one cell beyond each edge to avoid visible boundary gaps.
 */
export function buildDotGrid(
  width: number,
  height: number,
  gap: number,
  speedMin: number,
  speedMax: number,
): Dot[] {
  const dots: Dot[] = [];
  const cols = Math.ceil(width / gap) + 2;
  const rows = Math.ceil(height / gap) + 2;
  const min = Math.min(speedMin, speedMax);
  const max = Math.max(speedMin, speedMax);
  const span = Math.max(max - min, 0);

  for (let i = -1; i < cols - 1; i++) {
    for (let j = -1; j < rows - 1; j++) {
      const x = i * gap + (j % 2 === 0 ? 0 : gap * 0.5);
      const y = j * gap;
      const phase = Math.random() * Math.PI * 2;
      const speed = min + Math.random() * span;
      dots.push({ x, y, phase, speed });
    }
  }

  return dots;
}

/**
 * Compute the opacity multiplier for a dot at a given time.
 * Uses a triangle wave so alpha oscillates between 0.25 and 0.80.
 *
 * @param dot    - the dot with its phase and speed
 * @param timeSec - current time in seconds (DOMHighResTimeStamp / 1000)
 * @param speedScale - global speed multiplier (0 = frozen)
 */
export function dotAlpha(dot: Dot, timeSec: number, speedScale: number): number {
  const time = timeSec * Math.max(speedScale, 0);
  const mod = (time * dot.speed + dot.phase) % 2;
  const lin = mod < 1 ? mod : 2 - mod; // triangle wave 0→1→0
  return 0.25 + 0.55 * lin;
}

/**
 * Compute glow intensity from a dot's alpha value.
 * Returns 0 below threshold; rises linearly to 1.0 at alpha=1.0.
 */
export function dotGlow(alpha: number): number {
  if (alpha <= 0.6) return 0;
  return (alpha - 0.6) / 0.4;
}
