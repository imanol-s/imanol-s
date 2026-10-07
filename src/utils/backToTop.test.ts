// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { initBackToTop } from "./backToTop";

function createFixture() {
  const btn = document.createElement("button");
  btn.classList.add("opacity-0", "pointer-events-none");

  return { btn };
}

describe("initBackToTop", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", {
      value: 0,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "innerWidth", {
      value: 1280,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: 800,
      writable: true,
      configurable: true,
    });
    window.scrollTo = vi.fn();
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: false, addEventListener: vi.fn() });
  });

  it("shows button after scroll threshold", () => {
    const { btn } = createFixture();
    initBackToTop(btn);

    Object.defineProperty(window, "scrollY", { value: 400 });
    window.dispatchEvent(new Event("scroll"));

    expect(btn.classList.contains("opacity-100")).toBe(true);
    expect(btn.classList.contains("pointer-events-auto")).toBe(true);
  });

  it("hides button before scroll threshold", () => {
    const { btn } = createFixture();
    initBackToTop(btn);

    Object.defineProperty(window, "scrollY", { value: 400 });
    window.dispatchEvent(new Event("scroll"));
    Object.defineProperty(window, "scrollY", { value: 100 });
    window.dispatchEvent(new Event("scroll"));

    expect(btn.classList.contains("opacity-0")).toBe(true);
  });

  it("scrolls to top on click", () => {
    const { btn } = createFixture();
    initBackToTop(btn);
    btn.click();

    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 0 }),
    );
  });

  it("moves focus to main before scrolling and keeps a focused control visible", () => {
    const { btn } = createFixture();
    const main = document.createElement("main");
    main.id = "main-content";
    main.tabIndex = -1;
    document.body.append(main, btn);
    Object.defineProperty(window, "scrollY", { value: 400 });
    const cleanup = initBackToTop(btn);
    btn.focus();
    Object.defineProperty(window, "scrollY", { value: 0 });
    window.dispatchEvent(new Event("scroll"));
    expect(btn.getAttribute("aria-hidden")).toBeNull();
    btn.click();
    expect(document.activeElement).toBe(main);
    cleanup();
    main.remove();
    btn.remove();
  });

  it("cleanup removes all listeners", () => {
    const { btn } = createFixture();
    const cleanup = initBackToTop(btn);
    cleanup();

    Object.defineProperty(window, "scrollY", { value: 400 });
    window.dispatchEvent(new Event("scroll"));

    expect(btn.classList.contains("opacity-0")).toBe(true);
  });

  it("initializes visibility at the current scroll position", () => {
    const { btn } = createFixture();
    Object.defineProperty(window, "scrollY", { value: 400 });
    const cleanup = initBackToTop(btn);
    window.dispatchEvent(new Event("scroll"));

    expect(btn.classList.contains("opacity-100")).toBe(true);
    cleanup();
  });
});
