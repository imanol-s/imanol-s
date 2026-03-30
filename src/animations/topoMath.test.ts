import { describe, it, expect } from "vitest";
import { computeTopoFrame, buildLineYs } from "./topoMath";

describe("computeTopoFrame", () => {
  it("baseFrequency X stays within [0.0025, 0.0055] across 1000 phase steps", () => {
    for (let i = 0; i < 1000; i++) {
      const phase = i * 0.0006;
      const { bfx } = computeTopoFrame(phase, 0);
      const val = parseFloat(bfx);
      expect(val).toBeGreaterThanOrEqual(0.0025);
      expect(val).toBeLessThanOrEqual(0.0055);
    }
  });

  it("baseFrequency Y stays within [0.0025, 0.0055] across 1000 phase steps", () => {
    for (let i = 0; i < 1000; i++) {
      const phase = i * 0.0006;
      const { bfy } = computeTopoFrame(phase, 0);
      const val = parseFloat(bfy);
      expect(val).toBeGreaterThanOrEqual(0.0025);
      expect(val).toBeLessThanOrEqual(0.0055);
    }
  });

  it("baseFrequency values have exactly 5 decimal places", () => {
    const { bfx, bfy } = computeTopoFrame(0.5, 0);
    expect(bfx).toMatch(/^\d+\.\d{5}$/);
    expect(bfy).toMatch(/^\d+\.\d{5}$/);
  });

  it("drift moves continuously in one direction (never reverses)", () => {
    let prevTx = 0;
    let prevTy = 0;
    for (let i = 1; i <= 300; i++) {
      const driftTime = i / 6;
      const { transform } = computeTopoFrame(0, driftTime);
      const txMatch = transform.match(/translate\(([-\d.]+)%/);
      const tyMatch = transform.match(/translate\([-\d.]+%,\s*([-\d.]+)%\)/);
      const tx = parseFloat(txMatch![1]);
      const ty = parseFloat(tyMatch![1]);
      expect(tx).toBeLessThanOrEqual(prevTx);
      expect(ty).toBeLessThanOrEqual(prevTy);
      prevTx = tx;
      prevTy = ty;
    }
  });

  it("drift stays within oversized-container buffer over a 30-min session", () => {
    // Container is 150% at -25% inset → 25% buffer on each side
    const driftTime = 30 * 60; // 30 minutes
    const { transform } = computeTopoFrame(0, driftTime);
    const txMatch = transform.match(/translate\(([-\d.]+)%/);
    const tyMatch = transform.match(/translate\([-\d.]+%,\s*([-\d.]+)%\)/);
    const rotMatch = transform.match(/rotate\(([-\d.]+)deg\)/);
    expect(Math.abs(parseFloat(txMatch![1]))).toBeLessThanOrEqual(25);
    expect(Math.abs(parseFloat(tyMatch![1]))).toBeLessThanOrEqual(25);
    expect(parseFloat(rotMatch![1])).toBeLessThanOrEqual(360);
  });
});

describe("buildLineYs", () => {
  it("returns lines covering the full height plus buffer", () => {
    const ys = buildLineYs(600, 24);
    // first line at -20, last line at or beyond height
    expect(ys[0]).toBe(-20);
    expect(ys[ys.length - 1]).toBeGreaterThanOrEqual(600);
  });

  it("lines are spaced exactly gap apart", () => {
    const gap = 24;
    const ys = buildLineYs(480, gap);
    for (let i = 1; i < ys.length; i++) {
      expect(ys[i] - ys[i - 1]).toBeCloseTo(gap);
    }
  });

  it("produces more lines for taller viewports", () => {
    const short = buildLineYs(300, 24);
    const tall = buildLineYs(900, 24);
    expect(tall.length).toBeGreaterThan(short.length);
  });

  it("works with different gap sizes", () => {
    const ys = buildLineYs(480, 48);
    for (let i = 1; i < ys.length; i++) {
      expect(ys[i] - ys[i - 1]).toBeCloseTo(48);
    }
  });
});
