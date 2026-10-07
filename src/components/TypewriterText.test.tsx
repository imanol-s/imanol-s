// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import TypewriterText from "./TypewriterText";

let phase: "loading" | "overlay-playing" | "overlay-fading" | "ready";
let reduced: boolean;
vi.mock("../hooks/useSiteLifecycle", () => ({
  useSiteLifecycle: () => ({ state: phase }),
}));
vi.mock("../hooks/useReducedMotion", () => ({
  useReducedMotion: () => reduced,
}));

const name = "Test Person";
const output = (container: HTMLElement) =>
  container.querySelector("[data-typewriter-output]")?.textContent ?? "";

beforeEach(() => {
  phase = "loading";
  reduced = false;
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("TypewriterText", () => {
  it("keeps the full name in server-rendered output for no-JS and screen readers", () => {
    const html = renderToString(<TypewriterText text={name} />);
    expect(html).toContain(`aria-label="${name}"`);
    expect(html).toMatch(/data-typewriter-output[^>]*>Test Person/);
    expect(html).not.toContain("Skip typewriter animation");
  });

  it("reveals monotonically through fading and ready without clearing the visible name", () => {
    const { container, rerender } = render(<TypewriterText text={name} />);
    expect(output(container)).toBe("");
    phase = "overlay-playing";
    rerender(<TypewriterText text={name} />);
    expect(output(container)).toBe("");
    phase = "overlay-fading";
    rerender(<TypewriterText text={name} />);
    act(() => vi.advanceTimersByTime(120));
    const fadingText = output(container);
    expect(fadingText.length).toBeGreaterThan(1);
    expect(name.startsWith(fadingText)).toBe(true);
    phase = "ready";
    rerender(<TypewriterText text={name} />);
    expect(output(container)).toBe(fadingText);
    act(() => vi.advanceTimersByTime(2000));
    expect(output(container)).toBe(name);
    expect(container.querySelector("h1")?.getAttribute("aria-label")).toBe(
      name,
    );
  });

  it("Escape finishes the name and later overlay phases cannot restart it", () => {
    const { container, rerender } = render(<TypewriterText text={name} />);
    act(() =>
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })),
    );
    expect(output(container)).toBe(name);
    phase = "overlay-fading";
    rerender(<TypewriterText text={name} />);
    act(() => vi.advanceTimersByTime(2000));
    expect(output(container)).toBe(name);
  });

  it.each(["ready", "overlay-fading"] as const)(
    "skips a late or returning mount during %s",
    (state) => {
      phase = state;
      const { container } = render(<TypewriterText text={name} />);
      expect(output(container)).toBe(name);
      expect(container.querySelector("button")).toBeNull();
    },
  );

  it("shows the full name immediately for reduced motion", () => {
    reduced = true;
    const { container } = render(<TypewriterText text={name} />);
    expect(output(container)).toBe(name);
    expect(container.querySelector("button")).toBeNull();
  });
});
