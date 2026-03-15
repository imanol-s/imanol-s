// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import TypewriterText from "./TypewriterText";

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
  sessionStorage.clear();
  mockMatchMedia(false);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("TypewriterText", () => {
  it("renders the full text as an accessible label", () => {
    render(<TypewriterText text="Hello" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute(
      "aria-label",
      "Hello",
    );
  });

  it("shows full text immediately when reduced motion is preferred", () => {
    mockMatchMedia(true);
    render(<TypewriterText text="Hello" />);
    const spans = screen.getByRole("heading").querySelectorAll("span");
    expect(spans[1].textContent).toBe("Hello");
  });

  it("shows full text when session has already played", () => {
    sessionStorage.setItem("heroNameTyped", "true");
    render(<TypewriterText text="Hello" />);
    const spans = screen.getByRole("heading").querySelectorAll("span");
    expect(spans[1].textContent).toBe("Hello");
  });

  it("provides a skip button for accessibility", () => {
    render(<TypewriterText text="Hello World" />);
    const btn = screen.getByRole("button", {
      name: "Skip typewriter animation",
    });
    expect(btn).toBeDefined();
  });

  it("skips animation on Escape key", async () => {
    vi.useFakeTimers();
    render(<TypewriterText text="Hello" />);

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    const spans = screen.getByRole("heading").querySelectorAll("span");
    expect(spans[1].textContent).toBe("Hello");
    expect(sessionStorage.getItem("heroNameTyped")).toBe("true");

    vi.useRealTimers();
  });

  it("hides the caret when reduced motion is on", () => {
    mockMatchMedia(true);
    render(<TypewriterText text="Hi" />);
    const heading = screen.getByRole("heading");
    expect(heading.querySelector(".typing-caret")).toBeNull();
  });
});
