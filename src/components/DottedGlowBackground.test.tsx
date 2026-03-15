// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import DottedGlowBackground from "./DottedGlowBackground";

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

describe("DottedGlowBackground", () => {
  it("renders a canvas element inside a container div", () => {
    const { container } = render(<DottedGlowBackground />);
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
  });

  it("renders with default props without errors", () => {
    expect(() => render(<DottedGlowBackground />)).not.toThrow();
  });

  it("accepts custom gap, radius, and opacity", () => {
    expect(() =>
      render(<DottedGlowBackground gap={20} radius={3} opacity={0.5} />),
    ).not.toThrow();
  });

  it("accepts custom color configuration", () => {
    expect(() =>
      render(
        <DottedGlowBackground
          colors={{
            dot: "red",
            glow: "blue",
            darkDot: "white",
            darkGlow: "cyan",
          }}
        />,
      ),
    ).not.toThrow();
  });

  it("accepts custom speed configuration", () => {
    expect(() =>
      render(<DottedGlowBackground speed={{ min: 0.1, max: 2.0 }} />),
    ).not.toThrow();
  });

  it("container has absolute positioning for overlay", () => {
    const { container } = render(<DottedGlowBackground />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.position).toBe("absolute");
    expect(wrapper.style.inset).toBe("0px");
  });

  it("does not schedule rAF when reduced motion is preferred", () => {
    mockMatchMedia(true);
    const rafSpy = vi.spyOn(window, "requestAnimationFrame");
    render(<DottedGlowBackground />);
    expect(rafSpy).not.toHaveBeenCalled();
    rafSpy.mockRestore();
  });

  it("registers matchMedia change listener and switches fill color on dark-mode event", async () => {
    let capturedChangeHandler: ((e: { matches: boolean }) => void) | undefined;
    const mql = {
      matches: false,
      addEventListener: vi.fn((_type: string, handler: (e: { matches: boolean }) => void) => {
        capturedChangeHandler = handler;
      }),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      media: "(prefers-color-scheme: dark)",
      onchange: null,
    };
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mql));

    // Intercept canvas draws to capture the resolved fill color after mode switch.
    let capturedFillStyle = "";
    const mockCtx = {
      get fillStyle() { return capturedFillStyle; },
      set fillStyle(v: string) { capturedFillStyle = v; },
      shadowColor: "",
      shadowBlur: 0,
      globalAlpha: 1,
      canvas: { width: 0, height: 0 },
      clearRect: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      beginPath: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      setTransform: vi.fn(),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      mockCtx as unknown as CanvasRenderingContext2D,
    );

    let pendingRaf: FrameRequestCallback | undefined;
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      pendingRaf = cb;
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    render(
      <DottedGlowBackground
        colors={{ dot: "black", glow: "blue", darkDot: "white", darkGlow: "cyan" }}
      />,
    );

    expect(capturedChangeHandler).toBeDefined();

    // Make detectDarkMode() return true via the documentElement class (avoids mutating
    // the shared matchMedia mock which would also disable the animation loop).
    document.documentElement.classList.add("dark");
    await act(async () => { capturedChangeHandler?.({ matches: true }); });
    await act(async () => { pendingRaf?.(performance.now()); });
    expect(capturedFillStyle).toBe("white");
    document.documentElement.classList.remove("dark");
  });

  it("uses dark fill color when documentElement 'dark' class is present at mount", async () => {
    // Capture the fillStyle assigned inside drawDots via a canvas context mock.
    // jsdom does not ship CanvasRenderingContext2D without the optional 'canvas'
    // npm package, so we intercept getContext instead.
    let capturedFillStyle = "";
    const mockCtx = {
      get fillStyle() { return capturedFillStyle; },
      set fillStyle(v: string) { capturedFillStyle = v; },
      shadowColor: "",
      shadowBlur: 0,
      globalAlpha: 1,
      canvas: { width: 0, height: 0 },
      clearRect: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      beginPath: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      setTransform: vi.fn(),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      mockCtx as unknown as CanvasRenderingContext2D,
    );

    // Capture the rAF callback so we can trigger a draw manually
    let pendingRaf: FrameRequestCallback | undefined;
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      pendingRaf = cb;
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    document.documentElement.classList.add("dark");

    render(
      <DottedGlowBackground
        colors={{ dot: "black", glow: "blue", darkDot: "white", darkGlow: "cyan" }}
      />,
    );

    // Execute the pending rAF to trigger one draw with the dark-resolved color
    await act(async () => { pendingRaf?.(performance.now()); });

    expect(capturedFillStyle).toBe("white");

    document.documentElement.classList.remove("dark");
  });
});
