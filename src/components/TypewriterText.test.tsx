// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
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

  it("keeps the full visible name through every intro phase", () => {
    const { container, rerender } = render(<TypewriterText text={name} />);
    expect(output(container)).toBe(name);
    phase = "overlay-playing";
    rerender(<TypewriterText text={name} />);
    expect(output(container)).toBe(name);
    phase = "overlay-fading";
    rerender(<TypewriterText text={name} />);
    expect(output(container)).toBe(name);
    phase = "ready";
    rerender(<TypewriterText text={name} />);
    expect(output(container)).toBe(name);
    expect(container.querySelector("h1")?.getAttribute("aria-label")).toBe(
      name,
    );
  });

  it("keeps the full name when mounted after the intro has started", () => {
    phase = "overlay-fading";
    const { container, rerender } = render(<TypewriterText text={name} />);
    expect(output(container)).toBe(name);
    phase = "ready";
    rerender(<TypewriterText text={name} />);
    expect(output(container)).toBe(name);
  });

  it.each(["ready", "overlay-fading"] as const)(
    "renders the full name immediately during %s",
    (state) => {
      phase = state;
      const { container } = render(<TypewriterText text={name} />);
      expect(output(container)).toBe(name);
    },
  );

  it("shows the full name immediately for reduced motion", () => {
    reduced = true;
    const { container } = render(<TypewriterText text={name} />);
    expect(output(container)).toBe(name);
  });
});
