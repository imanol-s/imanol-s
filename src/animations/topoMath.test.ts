import { describe, it, expect } from 'vitest';
import { computeTopoFrame, buildLineYs } from './topoMath';

describe('computeTopoFrame', () => {
  it('baseFrequency X stays within [0.0025, 0.0055] across 1000 phase steps', () => {
    for (let i = 0; i < 1000; i++) {
      const phase = i * 0.0006;
      const { bfx } = computeTopoFrame(phase, 0);
      const val = parseFloat(bfx);
      expect(val).toBeGreaterThanOrEqual(0.0025);
      expect(val).toBeLessThanOrEqual(0.0055);
    }
  });

  it('baseFrequency Y stays within [0.0025, 0.0055] across 1000 phase steps', () => {
    for (let i = 0; i < 1000; i++) {
      const phase = i * 0.0006;
      const { bfy } = computeTopoFrame(phase, 0);
      const val = parseFloat(bfy);
      expect(val).toBeGreaterThanOrEqual(0.0025);
      expect(val).toBeLessThanOrEqual(0.0055);
    }
  });

  it('baseFrequency values have exactly 5 decimal places', () => {
    const { bfx, bfy } = computeTopoFrame(0.5, 0);
    expect(bfx).toMatch(/^\d+\.\d{5}$/);
    expect(bfy).toMatch(/^\d+\.\d{5}$/);
  });

  it('transform contains translate values within ±10% range', () => {
    // tx = sin(angle)*-5 + sin(angle*2)*3 → max amplitude ≈ ±8
    // ty = cos(angle)*-3 + cos(angle*2)*-2 → max amplitude ≈ ±5
    for (let i = 0; i < 330; i++) {
      // cover full 55s cycle at 60fps
      const driftTime = i / 6;
      const { transform } = computeTopoFrame(0, driftTime);
      const txMatch = transform.match(/translate\(([-\d.]+)%/);
      const tyMatch = transform.match(/translate\([-\d.]+%,\s*([-\d.]+)%\)/);
      if (txMatch) {
        const tx = parseFloat(txMatch[1]);
        expect(Math.abs(tx)).toBeLessThanOrEqual(10);
      }
      if (tyMatch) {
        const ty = parseFloat(tyMatch[1]);
        expect(Math.abs(ty)).toBeLessThanOrEqual(7);
      }
    }
  });

  it('transform contains a rotate value within ±3 degrees', () => {
    // rot = sin(angle)*1.5 - sin(angle*2)*1 → max ≈ ±2.5
    for (let i = 0; i < 330; i++) {
      const driftTime = i / 6;
      const { transform } = computeTopoFrame(0, driftTime);
      const rotMatch = transform.match(/rotate\(([-\d.]+)deg\)/);
      if (rotMatch) {
        const rot = parseFloat(rotMatch[1]);
        expect(Math.abs(rot)).toBeLessThanOrEqual(3);
      }
    }
  });
});

describe('buildLineYs', () => {
  it('returns lines covering the full height plus buffer', () => {
    const ys = buildLineYs(600, 24);
    // first line at -20, last line at or beyond height
    expect(ys[0]).toBe(-20);
    expect(ys[ys.length - 1]).toBeGreaterThanOrEqual(600);
  });

  it('lines are spaced exactly gap apart', () => {
    const gap = 24;
    const ys = buildLineYs(480, gap);
    for (let i = 1; i < ys.length; i++) {
      expect(ys[i] - ys[i - 1]).toBeCloseTo(gap);
    }
  });

  it('produces more lines for taller viewports', () => {
    const short = buildLineYs(300, 24);
    const tall = buildLineYs(900, 24);
    expect(tall.length).toBeGreaterThan(short.length);
  });

  it('works with different gap sizes', () => {
    const ys = buildLineYs(480, 48);
    for (let i = 1; i < ys.length; i++) {
      expect(ys[i] - ys[i - 1]).toBeCloseTo(48);
    }
  });
});
