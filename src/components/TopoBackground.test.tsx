// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import TopoBackground from "./TopoBackground";

function mockMatchMedia(matches = false) {
  const mql = {
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    media: "",
    onchange: null,
  };
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mql));
  return mql;
}

beforeEach(() => {
  mockMatchMedia(false);
  vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("TopoBackground", () => {
  it("renders the SVG with topo-warp filter", () => {
    const { container } = render(<TopoBackground />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();

    const filter = container.querySelector("#topo-warp");
    expect(filter).not.toBeNull();
  });

  it("renders feTurbulence with fractalNoise type", () => {
    const { container } = render(<TopoBackground />);
    const turbulence = container.querySelector("feTurbulence");
    expect(turbulence).not.toBeNull();
    expect(turbulence?.getAttribute("type")).toBe("fractalNoise");
  });

  it("renders feDisplacementMap with correct scale", () => {
    const { container } = render(<TopoBackground />);
    const displacement = container.querySelector("feDisplacementMap");
    expect(displacement).not.toBeNull();
    expect(displacement?.getAttribute("scale")).toBe("380");
  });

  it("renders the blueprint grid layer", () => {
    const { container } = render(<TopoBackground />);
    const grid = container.querySelector(".blueprint-grid");
    expect(grid).not.toBeNull();
  });

  it("generates horizontal lines for the topo pattern", () => {
    const { container } = render(<TopoBackground />);
    const lines = container.querySelectorAll("line");
    expect(lines.length).toBeGreaterThan(0);
  });

  it("stores seed in sessionStorage on first render", () => {
    render(<TopoBackground />);
    expect(Storage.prototype.setItem).toHaveBeenCalledWith(
      "topo-seed",
      expect.any(String),
    );
  });
});
