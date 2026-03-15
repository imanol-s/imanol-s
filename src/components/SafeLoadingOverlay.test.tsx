// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import SafeLoadingOverlay from "./SafeLoadingOverlay";
import AnimationBoundary from "./AnimationBoundary";

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

  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );

  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("SafeLoadingOverlay", () => {
  it("renders without errors", () => {
    expect(() => render(<SafeLoadingOverlay />)).not.toThrow();
  });

  it("renders the overlay container", () => {
    const { container } = render(<SafeLoadingOverlay />);
    const overlay = container.querySelector("[aria-hidden]");
    expect(overlay).not.toBeNull();
  });

  it("catches child render errors and renders nothing (error boundary contract)", () => {
    const AlwaysThrows = () => { throw new Error("intentional test error"); };
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <AnimationBoundary>
        <AlwaysThrows />
      </AnimationBoundary>,
    );
    expect(container.firstChild).toBeNull();
  });
});
