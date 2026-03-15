// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import LoadingOverlay from "./LoadingOverlay";
import { OVERLAY_OPAQUE_MS } from "../constants";

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
  const staticEl = document.createElement("div");
  staticEl.id = "loading-overlay";
  document.body.appendChild(staticEl);

  mockMatchMedia(false);

  // Mock ResizeObserver and IntersectionObserver for DottedGlowBackground
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
  const el = document.getElementById("loading-overlay");
  if (el) el.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("LoadingOverlay", () => {
  it("renders when active", () => {
    const { container } = render(<LoadingOverlay />);
    const overlay = container.firstChild as HTMLElement;
    expect(overlay).not.toBeNull();
    expect(overlay.getAttribute("aria-hidden")).toBe("true");
  });

  it("hides the static #loading-overlay element on mount", () => {
    render(<LoadingOverlay />);
    const staticEl = document.getElementById("loading-overlay");
    expect(staticEl?.style.display).toBe("none");
  });

  it("deactivates immediately when reduced motion is preferred", () => {
    mockMatchMedia(true);
    const { container } = render(<LoadingOverlay />);
    expect(container.firstChild).toBeNull();
  });

  it("starts fading out after delay", () => {
    vi.useFakeTimers();
    const { container } = render(<LoadingOverlay />);

    const overlay = container.firstChild as HTMLElement;
    expect(overlay).not.toBeNull();
    expect(overlay.className).toContain("opacity-100");

    act(() => {
      vi.advanceTimersByTime(OVERLAY_OPAQUE_MS);
    });
    const overlayAfterFade = container.firstChild as HTMLElement;
    expect(overlayAfterFade.className).toContain("opacity-0");

    vi.useRealTimers();
  });
});
