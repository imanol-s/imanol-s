// @vitest-environment jsdom
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import TopoBackground from "./TopoBackground";

const frames = new Map<number, FrameRequestCallback>();
let nextFrame = 0;
let reduced = false;
let phone = false;

beforeEach(() => {
  reduced = false;
  phone = false;
  nextFrame = 0;
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() {
      return query.includes("reduced-motion") ? reduced : phone;
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
});

afterEach(() => {
  cleanup();
  frames.clear();
  document.body.removeAttribute("data-field-map");
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

function advanceFrames(count: number) {
  act(() => {
    for (let i = 0; i < count; i++) {
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach((callback) => callback(i * 16));
    }
  });
}

function swapRoute(home: boolean) {
  act(() => {
    document.body.toggleAttribute("data-field-map", home);
    document.dispatchEvent(new Event("astro:after-swap"));
  });
}

describe("TopoBackground", () => {
  it("idles while suppressed, resumes one loop without resetting, and cleans up", () => {
    document.body.setAttribute("data-field-map", "");
    const { container, unmount } = render(
      <StrictMode>
        <TopoBackground />
      </StrictMode>,
    );
    const background = container.querySelector<HTMLElement>(
      "[data-topo-background]",
    )!;
    const turbulence = container.querySelector("feTurbulence")!;
    const snapshot = () => ({
      transform: background.style.transform,
      frequency: turbulence.getAttribute("baseFrequency"),
      seed: turbulence.getAttribute("seed"),
    });
    const initial = snapshot();
    expect(initial.transform).toBe("");
    expect(initial.frequency).toBe("0.002");
    expect(initial.seed).not.toBeNull();
    expect(frames.size).toBe(0);
    advanceFrames(60);
    expect(snapshot()).toEqual(initial);

    swapRoute(false);
    swapRoute(false);
    expect(frames.size).toBe(1);
    advanceFrames(30);
    const moving = snapshot();
    expect(moving.transform).toContain("translate(");
    expect(moving.frequency).not.toBe(initial.frequency);
    expect(moving.seed).toBe(initial.seed);
    expect(frames.size).toBe(1);

    swapRoute(true);
    expect(frames.size).toBe(0);
    advanceFrames(60);
    expect(snapshot()).toEqual(moving);

    swapRoute(false);
    advanceFrames(30);
    const resumed = snapshot();
    expect(resumed.frequency).toBe(moving.frequency);
    expect(resumed.transform).not.toBe(moving.transform);
    expect(resumed.seed).toBe(initial.seed);
    expect(background).toBe(container.querySelector("[data-topo-background]"));
    expect(frames.size).toBe(1);

    unmount();
    expect(frames.size).toBe(0);
    swapRoute(false);
    expect(frames.size).toBe(0);
  });

  it("holds the filtered shape on desktop while drift continues", () => {
    const { container } = render(<TopoBackground />);
    const background = container.querySelector<HTMLElement>(
      "[data-topo-background]",
    )!;
    const turbulence = container.querySelector("feTurbulence")!;
    const writes = vi.spyOn(turbulence, "setAttribute");

    advanceFrames(1);
    expect(writes).toHaveBeenCalledTimes(1);
    const frequency = turbulence.getAttribute("baseFrequency");
    const transform = background.style.transform;
    expect(frequency).not.toBeNull();
    expect(transform).toContain("translate(");

    advanceFrames(1);
    expect(turbulence.getAttribute("baseFrequency")).toBe(frequency);
    expect(background.style.transform).not.toBe(transform);
    expect(writes).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(1);

    advanceFrames(60);
    expect(turbulence.getAttribute("baseFrequency")).toBe(frequency);
    expect(writes).toHaveBeenCalledTimes(1);
    expect(writes).toHaveBeenLastCalledWith(
      "baseFrequency",
      turbulence.getAttribute("baseFrequency"),
    );
    expect(frames.size).toBe(1);
    writes.mockRestore();
  });

  it("holds the line shape on phones while the drift keeps moving", () => {
    phone = true;
    const { container } = render(<TopoBackground />);
    const background = container.querySelector<HTMLElement>(
      "[data-topo-background]",
    )!;
    const turbulence = container.querySelector("feTurbulence")!;

    advanceFrames(1);
    const frequency = turbulence.getAttribute("baseFrequency");
    const transform = background.style.transform;
    expect(frequency).not.toBe("0.002");

    advanceFrames(600);
    expect(turbulence.getAttribute("baseFrequency")).toBe(frequency);
    expect(background.style.transform).not.toBe(transform);
    expect(frames.size).toBe(1);
  });

  it("keeps the pattern size when only the window height changes", () => {
    vi.useFakeTimers();
    // jsdom has no layout; the 100lvh layer keeps one height while the URL bar moves.
    const layerHeight = vi
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockReturnValue(900);
    Object.defineProperty(window, "innerHeight", {
      value: 800,
      configurable: true,
    });
    const { container } = render(<TopoBackground />);
    const svg = container.querySelector("svg")!;
    const viewBox = svg.getAttribute("viewBox");

    Object.defineProperty(window, "innerHeight", {
      value: 740,
      configurable: true,
    });
    act(() => {
      window.dispatchEvent(new Event("resize"));
      vi.advanceTimersByTime(200);
    });
    expect(svg.getAttribute("viewBox")).toBe(viewBox);
    layerHeight.mockRestore();
    vi.useRealTimers();
  });

  it("keeps reduced-motion topography stationary on visible routes and swaps", () => {
    reduced = true;
    const { container } = render(<TopoBackground />);
    const background = container.querySelector<HTMLElement>(
      "[data-topo-background]",
    )!;
    const turbulence = container.querySelector("feTurbulence")!;
    swapRoute(true);
    swapRoute(false);
    expect(frames.size).toBe(0);
    advanceFrames(60);
    expect(background.style.transform).toBe("");
    expect(turbulence.getAttribute("baseFrequency")).toBe("0.002");
  });
});
