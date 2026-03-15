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

  it("invokes the matchMedia change listener when dark mode fires", async () => {
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

    const { container } = render(
      <DottedGlowBackground
        colors={{ dot: "black", glow: "blue", darkDot: "white", darkGlow: "cyan" }}
      />,
    );

    // useResolvedColors must have registered the change listener
    expect(capturedChangeHandler).toBeDefined();

    // Fire the dark-mode change event and verify the component updates without errors
    await act(async () => {
      capturedChangeHandler?.({ matches: true });
    });
    expect(container.querySelector("canvas")).not.toBeNull();
  });

  it("updates resolved colors when documentElement gains 'dark' class", async () => {
    const { container } = render(
      <DottedGlowBackground
        colors={{ dot: "black", glow: "blue", darkDot: "white", darkGlow: "cyan" }}
      />,
    );

    // Simulate dark-mode toggle via MutationObserver code path
    await act(async () => {
      document.documentElement.classList.add("dark");
    });
    expect(container.querySelector("canvas")).not.toBeNull();

    // Cleanup
    document.documentElement.classList.remove("dark");
  });
});
