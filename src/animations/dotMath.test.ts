import { describe, it, expect } from 'vitest';
import { buildDotGrid, dotAlpha, dotGlow } from './dotMath';

describe('buildDotGrid', () => {
  it('produces a dot for every grid cell covering the canvas', () => {
    const gap = 12;
    const width = 120;
    const height = 60;
    const cols = Math.ceil(width / gap) + 2; // -1 to cols-1 → cols+1 iters
    const rows = Math.ceil(height / gap) + 2;
    const dots = buildDotGrid(width, height, gap, 0.4, 1.3);
    // implementation uses i from -1 to cols-1 and j from -1 to rows-1
    expect(dots.length).toBe(cols * rows);
  });

  it('even rows (j % 2 === 0) have x offset 0', () => {
    const gap = 12;
    const dots = buildDotGrid(120, 60, gap, 0.4, 1.3);
    // row j=0 (even): x = i * gap + 0
    const row0 = dots.filter((d) => d.y === 0); // j=0 → y = j*gap = 0
    for (const d of row0) {
      expect(d.x % gap).toBeCloseTo(0);
    }
  });

  it('odd rows (j % 2 !== 0) have x offset gap * 0.5', () => {
    const gap = 12;
    const dots = buildDotGrid(120, 60, gap, 0.4, 1.3);
    // row j=1 (odd): x = i * gap + gap * 0.5 → x mod gap should ≈ gap/2
    const row1 = dots.filter((d) => d.y === gap); // j=1 → y = 1*gap
    for (const d of row1) {
      expect(((d.x % gap) + gap) % gap).toBeCloseTo(gap * 0.5);
    }
  });

  it('speed values are within [speedMin, speedMax]', () => {
    const speedMin = 0.4;
    const speedMax = 1.3;
    const dots = buildDotGrid(120, 60, 12, speedMin, speedMax);
    for (const d of dots) {
      expect(d.speed).toBeGreaterThanOrEqual(speedMin);
      expect(d.speed).toBeLessThanOrEqual(speedMax);
    }
  });

  it('phase values are within [0, 2π)', () => {
    const dots = buildDotGrid(120, 60, 12, 0.4, 1.3);
    for (const d of dots) {
      expect(d.phase).toBeGreaterThanOrEqual(0);
      expect(d.phase).toBeLessThan(Math.PI * 2);
    }
  });
});

describe('dotAlpha', () => {
  it('always returns a value in [0.25, 0.80]', () => {
    const dot = { x: 0, y: 0, phase: 0, speed: 1.0 };
    // test over a full cycle with many time steps
    for (let t = 0; t < 10; t += 0.05) {
      const a = dotAlpha(dot, t, 1);
      expect(a).toBeGreaterThanOrEqual(0.25);
      expect(a).toBeLessThanOrEqual(0.8);
    }
  });

  it('is periodic — same value at t and t + full cycle', () => {
    const dot = { x: 0, y: 0, phase: Math.PI / 4, speed: 0.7 };
    // The cycle period in seconds = 2 / speed (mod=2 for triangle wave)
    const period = 2 / dot.speed;
    for (let t = 0; t < 5; t += 0.3) {
      const a1 = dotAlpha(dot, t, 1);
      const a2 = dotAlpha(dot, t + period, 1);
      expect(a1).toBeCloseTo(a2, 5);
    }
  });

  it('speedScale=0 freezes animation (constant alpha)', () => {
    const dot = { x: 0, y: 0, phase: 1.0, speed: 1.0 };
    const ref = dotAlpha(dot, 0, 0);
    for (let t = 0; t < 5; t += 0.5) {
      expect(dotAlpha(dot, t, 0)).toBeCloseTo(ref, 10);
    }
  });
});

describe('dotGlow', () => {
  it('returns 0 at or below the brightness threshold (0.6)', () => {
    expect(dotGlow(0.25)).toBe(0);
    expect(dotGlow(0.5)).toBe(0);
    expect(dotGlow(0.6)).toBe(0);
  });

  it('returns a positive value above the threshold', () => {
    expect(dotGlow(0.61)).toBeGreaterThan(0);
    expect(dotGlow(0.8)).toBeGreaterThan(0);
  });

  it('reaches 1.0 at maximum alpha (0.8)', () => {
    // glow = (alpha - 0.6) / 0.4; at alpha=1.0 → 1.0
    expect(dotGlow(1.0)).toBeCloseTo(1.0);
  });
});
