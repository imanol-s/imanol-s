import { describe, it, expect } from 'vitest';
import {
  gaussian,
  sweepOffset,
  buildSweepStops,
  SWEEP_DURATION,
  BASE_OPACITY,
  PEAK_OPACITY,
} from './lavaSweepMath';

describe('gaussian', () => {
  it('returns 1 at the center', () => {
    expect(gaussian(5, 5, 1)).toBe(1);
  });

  it('is symmetric around the center', () => {
    const left = gaussian(3, 5, 1);
    const right = gaussian(7, 5, 1);
    expect(left).toBeCloseTo(right);
  });

  it('decays toward 0 at large distance', () => {
    const far = gaussian(100, 0, 1);
    expect(far).toBeCloseTo(0, 10);
  });

  it('never returns a negative value', () => {
    for (let x = -10; x <= 10; x += 0.5) {
      expect(gaussian(x, 0, 2)).toBeGreaterThanOrEqual(0);
    }
  });

  it('returns smaller values further from center', () => {
    const close = gaussian(1, 0, 1);
    const far = gaussian(3, 0, 1);
    expect(close).toBeGreaterThan(far);
  });
});

describe('sweepOffset', () => {
  it('wraps at boundaries (time=0 and time=DURATION produce same offset)', () => {
    const width = 2000;
    const atZero = sweepOffset(0, width, SWEEP_DURATION);
    const atDuration = sweepOffset(SWEEP_DURATION, width, SWEEP_DURATION);
    expect(atZero).toBeCloseTo(atDuration);
  });

  it('always returns value in [0, svgWidth)', () => {
    const width = 2000;
    for (let t = -100; t <= 200; t += 7) {
      const offset = sweepOffset(t, width);
      expect(offset).toBeGreaterThanOrEqual(0);
      expect(offset).toBeLessThan(width);
    }
  });

  it('returns 0 when duration is 0 (reduced motion / speed=0)', () => {
    expect(sweepOffset(10, 2000, 0)).toBe(0);
  });

  it('increases monotonically within a single period', () => {
    const width = 2000;
    let prev = sweepOffset(0, width);
    for (let t = 1; t < SWEEP_DURATION; t++) {
      const cur = sweepOffset(t, width);
      expect(cur).toBeGreaterThan(prev);
      prev = cur;
    }
  });
});

describe('buildSweepStops', () => {
  const stops = buildSweepStops();

  it('all opacities are in [BASE_OPACITY, PEAK_OPACITY]', () => {
    for (const stop of stops) {
      expect(stop.opacity).toBeGreaterThanOrEqual(BASE_OPACITY - 1e-9);
      expect(stop.opacity).toBeLessThanOrEqual(PEAK_OPACITY + 1e-9);
    }
  });

  it('peak opacity exists among stops', () => {
    const maxOpacity = Math.max(...stops.map((s) => s.opacity));
    expect(maxOpacity).toBeCloseTo(PEAK_OPACITY, 2);
  });

  it('stops are sorted by offset', () => {
    for (let i = 1; i < stops.length; i++) {
      expect(stops[i].offset).toBeGreaterThanOrEqual(stops[i - 1].offset);
    }
  });

  it('monotonic from edge toward center', () => {
    const mid = Math.floor(stops.length / 2);
    // Left half: non-decreasing opacity
    for (let i = 1; i <= mid; i++) {
      expect(stops[i].opacity).toBeGreaterThanOrEqual(stops[i - 1].opacity - 1e-9);
    }
    // Right half: non-increasing opacity
    for (let i = mid + 1; i < stops.length; i++) {
      expect(stops[i].opacity).toBeLessThanOrEqual(stops[i - 1].opacity + 1e-9);
    }
  });

  it('first and last stops have near-base opacity', () => {
    expect(stops[0].opacity).toBeCloseTo(BASE_OPACITY, 2);
    expect(stops[stops.length - 1].opacity).toBeCloseTo(BASE_OPACITY, 2);
  });
});
