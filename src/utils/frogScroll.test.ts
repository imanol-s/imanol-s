// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initFrogScroll } from "./frogScroll";

let callbacks: FrameRequestCallback[];
let reduced: boolean;
let motion: EventTarget;
let dispose: (() => void) | undefined;

function flush() {
  const pending = callbacks.splice(0);
  pending.forEach((callback) => callback(0));
}

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
  window.dispatchEvent(new Event("scroll"));
  flush();
}

function fixture() {
  const header = document.createElement("header");
  const logo = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const frog = document.createElement("div");
  const menuButton = document.createElement("button");
  header.append(logo, menuButton);
  document.body.append(header, frog);
  logo.getBoundingClientRect = () => ({ left: 24, top: 22 }) as DOMRect;
  header.getBoundingClientRect = () => ({ top: 0 }) as DOMRect;
  dispose = initFrogScroll({ header, logo, frog, menuButton });
  return { header, logo, frog, menuButton };
}

beforeEach(() => {
  callbacks = [];
  reduced = false;
  motion = new EventTarget();
  Object.defineProperty(motion, "matches", { get: () => reduced });
  vi.stubGlobal("matchMedia", () => motion);
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callbacks.push(callback);
    return callbacks.length;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {
    callbacks = [];
  });
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
});

afterEach(() => {
  dispose?.();
  dispose = undefined;
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("scrolling brand frog", () => {
  it("takes over only during travel and restores the brand on return", () => {
    const { logo, frog } = fixture();
    expect(frog.hidden).toBe(true);
    scrollTo(150);
    expect(frog.hidden).toBe(false);
    expect(logo.style.opacity).toBe("0");
    const outward = frog.style.transform;
    scrollTo(450);
    expect(frog.style.transform).not.toBe(outward);
    scrollTo(150);
    expect(frog.style.transform).toBe(outward);
    scrollTo(700);
    expect(frog.hidden).toBe(true);
    scrollTo(-10);
    expect(frog.hidden).toBe(true);
    expect(logo.style.opacity).toBe("");
  });

  it("keeps the frog still when reduced motion is enabled, including changes", () => {
    const { logo, frog } = fixture();
    scrollTo(200);
    reduced = true;
    motion.dispatchEvent(new Event("change"));
    flush();
    expect(frog.hidden).toBe(true);
    expect(logo.style.opacity).toBe("");
    scrollTo(300);
    expect(frog.hidden).toBe(true);
  });

  it("leaves an expanded menu's brand visible", () => {
    const { header, menuButton, logo, frog } = fixture();
    menuButton.setAttribute("aria-expanded", "true");
    header.dispatchEvent(new Event("click"));
    scrollTo(100);
    expect(frog.hidden).toBe(true);
    expect(logo.style.opacity).toBe("");
  });

  it("coalesces scroll events and stops pending work when disposed", () => {
    const { frog, logo } = fixture();
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("scroll"));
    expect(callbacks).toHaveLength(1);
    dispose?.();
    dispose = undefined;
    flush();
    scrollTo(200);
    expect(frog.hidden).toBe(true);
    expect(frog.style.transform).toBe("");
    expect(logo.style.opacity).toBe("");
    expect(callbacks).toHaveLength(0);
  });
});
