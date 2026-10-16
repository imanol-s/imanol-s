import { describe, it, expect, vi } from "vitest";
import { buildDotGrid, dotAlpha, dotGlow } from "./dotMath";

describe("buildDotGrid", () => {
  it("covers a partial-width canvas with the complete staggered border grid", () => {
    const dots = buildDotGrid(13, 12, 12, 0.4, 1.2);
    expect(dots.map(({ x, y }) => [x, y])).toEqual([
      [-6, -12],
      [-12, 0],
      [-6, 12],
      [6, -12],
      [0, 0],
      [6, 12],
      [18, -12],
      [12, 0],
      [18, 12],
      [30, -12],
      [24, 0],
      [30, 12],
    ]);
  });

  it.each([0.25, 0.75])(
    "keeps nonempty randomized dots within positive phase/speed bounds for sample %s",
    (random) => {
      const randomInput = vi.spyOn(Math, "random").mockReturnValue(random);
      try {
        const dots = buildDotGrid(13, 12, 12, 0.4, 1.2);
        expect(dots).toHaveLength(12);
        for (const dot of dots) {
          expect(dot.phase).toBeGreaterThan(0);
          expect(dot.phase).toBeLessThan(Math.PI * 2);
          expect(dot.speed).toBeGreaterThan(0.4);
          expect(dot.speed).toBeLessThan(1.2);
        }
      } finally {
        randomInput.mockRestore();
      }
    },
  );
});

describe("dotAlpha", () => {
  it("always returns a value in [0.25, 0.80]", () => {
    const dot = { x: 0, y: 0, phase: 0, speed: 1.0 };
    // test over a full cycle with many time steps
    for (let t = 0; t < 10; t += 0.05) {
      const a = dotAlpha(dot, t, 1);
      expect(a).toBeGreaterThanOrEqual(0.25);
      expect(a).toBeLessThanOrEqual(0.8);
    }
  });

  it("is periodic — same value at t and t + full cycle", () => {
    const dot = { x: 0, y: 0, phase: Math.PI / 4, speed: 0.7 };
    // The cycle period in seconds = 2 / speed (mod=2 for triangle wave)
    const period = 2 / dot.speed;
    for (let t = 0; t < 5; t += 0.3) {
      const a1 = dotAlpha(dot, t, 1);
      const a2 = dotAlpha(dot, t + period, 1);
      expect(a1).toBeCloseTo(a2, 5);
    }
  });

  it("speedScale=0 freezes animation (constant alpha)", () => {
    const dot = { x: 0, y: 0, phase: 1.0, speed: 1.0 };
    const ref = dotAlpha(dot, 0, 0);
    for (let t = 0; t < 5; t += 0.5) {
      expect(dotAlpha(dot, t, 0)).toBeCloseTo(ref, 10);
    }
  });
});

describe("dotGlow", () => {
  it("returns 0 at or below the brightness threshold (0.6)", () => {
    expect(dotGlow(0.25)).toBe(0);
    expect(dotGlow(0.5)).toBe(0);
    expect(dotGlow(0.6)).toBe(0);
  });

  it("returns a positive value above the threshold", () => {
    expect(dotGlow(0.61)).toBeGreaterThan(0);
    expect(dotGlow(0.8)).toBeGreaterThan(0);
  });

  it("reaches 1.0 at maximum alpha (0.8)", () => {
    // glow = (alpha - 0.6) / 0.4; at alpha=1.0 → 1.0
    expect(dotGlow(1.0)).toBeCloseTo(1.0);
  });
});
