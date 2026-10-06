// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initFrogScroll } from "./frogScroll";

let callbacks: FrameRequestCallback[];
let reduced: boolean;
let motion: EventTarget;
let dispose: (() => void) | undefined;
let now: number;

function advance(milliseconds: number) {
  now += milliseconds;
  const pending = callbacks.splice(0);
  pending.forEach((callback) => callback(now));
}

function fixture() {
  const header = document.createElement("header");
  const logo = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const frog = document.createElement("div");
  header.append(logo);
  document.body.append(header, frog);
  logo.getBoundingClientRect = () => ({ left: 24, top: 42, width: 28 }) as DOMRect;
  dispose = initFrogScroll({ header, logo, frog, menuButton: null });
  const setHidden = (hidden: boolean) => header.dispatchEvent(new CustomEvent("portfolio:header-hide", { detail: { hidden } }));
  return { logo, frog, setHidden };
}

beforeEach(() => {
  callbacks = [];
  now = 0;
  reduced = false;
  motion = new EventTarget();
  Object.defineProperty(motion, "matches", { get: () => reduced });
  vi.stubGlobal("matchMedia", () => motion);
  vi.spyOn(performance, "now").mockImplementation(() => now);
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callbacks.push(callback);
    return callbacks.length;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => { callbacks = []; });
});

afterEach(() => {
  dispose?.();
  dispose = undefined;
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("hopping brand frog", () => {
  it("continues three hops after scroll input stops and restores the logo", () => {
    const { logo, frog, setHidden } = fixture();
    setHidden(true);
    expect(frog.hidden).toBe(false);
    expect(logo.style.opacity).toBe("0");
    const launch = frog.style.transform;
    advance(300);
    expect(frog.style.transform).not.toBe(launch);
    expect(frog.style.transform).toContain("scale(");
    const airborne = frog.style.transform;
    advance(300);
    expect(frog.style.transform).not.toBe(airborne);
    advance(1200);
    expect(frog.hidden).toBe(true);
    expect(logo.style.opacity).toBe("");
    expect(callbacks).toHaveLength(0);
  });

  it("cancels on header return and can launch again", () => {
    const { frog, logo, setHidden } = fixture();
    setHidden(true);
    advance(250);
    setHidden(false);
    expect(frog.hidden).toBe(true);
    expect(logo.style.opacity).toBe("");
    expect(callbacks).toHaveLength(0);
    setHidden(true);
    expect(frog.hidden).toBe(false);
  });

  it("honors reduced motion, including changes during flight", () => {
    const { frog, logo, setHidden } = fixture();
    reduced = true;
    setHidden(true);
    expect(frog.hidden).toBe(true);
    reduced = false;
    setHidden(true);
    expect(frog.hidden).toBe(false);
    reduced = true;
    motion.dispatchEvent(new Event("change"));
    expect(frog.hidden).toBe(true);
    expect(logo.style.opacity).toBe("");
  });

  it("cancels pending frames and listeners on disposal", () => {
    const { frog, setHidden } = fixture();
    setHidden(true);
    dispose?.();
    dispose = undefined;
    setHidden(true);
    advance(100);
    expect(frog.hidden).toBe(true);
    expect(frog.style.transform).toBe("");
    expect(callbacks).toHaveLength(0);
  });
});
