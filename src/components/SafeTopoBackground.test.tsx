// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import SafeTopoBackground from "./SafeTopoBackground";

beforeEach(() => {
  const mql = {
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    media: "",
    onchange: null,
  };
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mql));
  vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("SafeTopoBackground", () => {
  it("renders without errors", () => {
    expect(() => render(<SafeTopoBackground />)).not.toThrow();
  });

  it("renders an SVG inside the boundary", () => {
    const { container } = render(<SafeTopoBackground />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });
});
