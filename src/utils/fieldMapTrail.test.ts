import { describe, expect, it } from "vitest";
import { buildTrailPath, clearTurnY, lengthAtY } from "./fieldMapTrail";

const numbers = (d: string) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
const xs = (d: string) => numbers(d).filter((_, i) => i % 2 === 0);

describe("buildTrailPath", () => {
  const desktop = {
    startX: 790,
    startY: 360,
    gutterX: 1380,
    endY: 4200,
    amp: 10,
  };

  it("starts at the camp point and ends at the gutter beside contact", () => {
    const d = buildTrailPath(desktop);
    expect(d.startsWith("M790 360C")).toBe(true);
    expect(numbers(d).slice(-2)).toEqual([1380, 4200]);
    expect(d).not.toContain("NaN");
  });

  it("keeps every coordinate between the camp and the gutter's lateral band", () => {
    for (const x of xs(buildTrailPath(desktop))) {
      expect(x).toBeGreaterThanOrEqual(790);
      expect(x).toBeLessThanOrEqual(1390);
    }
  });

  it("descends the gutter without lateral variation when amp is 0", () => {
    const d = buildTrailPath({
      startX: 300,
      startY: 150,
      gutterX: 377,
      endY: 5200,
      amp: 0,
    });
    const descent = xs(d).slice(4);
    expect(descent.length).toBeGreaterThan(3);
    expect(new Set(descent)).toEqual(new Set([377]));
  });

  it("returns an empty path when contact is not below the camp", () => {
    expect(buildTrailPath({ ...desktop, endY: 300 })).toBe("");
    expect(buildTrailPath({ ...desktop, endY: Number.NaN })).toBe("");
  });
});

describe("clearTurnY", () => {
  const email = { left: 301, right: 350, top: 803, bottom: 847 };

  it("moves the leg below a link that sits level with the camp", () => {
    expect(clearTurnY(843, 302, 375, [email])).toBeGreaterThan(847);
  });

  it("keeps the camp height when nothing lies across the leg", () => {
    expect(
      clearTurnY(843, 302, 375, [{ ...email, left: 150, right: 206 }]),
    ).toBe(843);
  });

  it("clears stacked boxes in turn", () => {
    const below = { left: 320, right: 360, top: 850, bottom: 870 };
    expect(clearTurnY(843, 302, 375, [below, email])).toBeGreaterThan(870);
  });
});

describe("buildTrailPath with a lowered leg", () => {
  it("drops beside the camp before turning toward the gutter", () => {
    const d = buildTrailPath({
      startX: 302,
      startY: 843,
      gutterX: 375,
      endY: 7800,
      amp: 5,
      turnY: 852,
    });
    expect(d.startsWith("M302 843C302 852")).toBe(true);
    expect(numbers(d).slice(-2)).toEqual([375, 7800]);
  });
});

describe("lengthAtY", () => {
  // A drop, a flat leg, then a descent: y never decreases along the length.
  const yAt = (l: number) => (l < 100 ? l : l < 300 ? 100 : 100 + (l - 300));

  it("finds the first length that reaches y", () => {
    expect(lengthAtY(1000, yAt, 50)).toBeCloseTo(50, 3);
    expect(lengthAtY(1000, yAt, 400)).toBeCloseTo(600, 3);
  });

  it("clamps to the ends of the path", () => {
    expect(lengthAtY(1000, yAt, -Infinity)).toBeCloseTo(0, 3);
    expect(lengthAtY(1000, yAt, 5000)).toBe(1000);
  });
});
