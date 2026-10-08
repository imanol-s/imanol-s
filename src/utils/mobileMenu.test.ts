// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { initMobileMenu } from "./mobileMenu";

function createFixture() {
  const btn = document.createElement("button");
  btn.setAttribute("aria-expanded", "false");
  btn.textContent = "Menu";

  const menu = document.createElement("div");
  menu.classList.add("hidden");
  menu.innerHTML = `
    <a href="/projects">Projects</a>
    <a href="/blog">Blog</a>
  `;

  document.body.append(btn, menu);
  return { btn, menu };
}

describe("initMobileMenu", () => {
  afterEach(() => document.body.replaceChildren());

  it("cycles keyboard focus, dismisses with Escape, and updates its label", () => {
    const { btn, menu } = createFixture();
    const cleanup = initMobileMenu(btn, menu);
    btn.click();
    expect(btn.getAttribute("aria-label")).toBe("Close menu");
    btn.focus();
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(menu.querySelectorAll("a")[1]);
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", cancelable: true }),
    );
    expect(document.activeElement).toBe(btn);
    menu.querySelector("a")!.focus();
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", cancelable: true }),
    );
    expect(document.activeElement).toBe(btn);
    expect(menu.classList.contains("hidden")).toBe(true);
    expect(btn.getAttribute("aria-label")).toBe("Open menu");
    cleanup();
  });
  it("closes on desktop resize and moves hidden focus to the brand", () => {
    const { btn, menu } = createFixture();
    const header = document.createElement("header");
    const brand = document.createElement("a");
    brand.href = "/";
    brand.className = "site-brand";
    header.append(brand, btn, menu);
    document.body.append(header);
    const cleanup = initMobileMenu(btn, menu);
    btn.click();
    menu.querySelector("a")!.focus();
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      configurable: true,
    });
    window.dispatchEvent(new Event("resize"));
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(brand);
    cleanup();
  });

  it("toggles menu visibility and aria-expanded on button click", () => {
    const { btn, menu } = createFixture();

    initMobileMenu(btn, menu);
    expect(menu.inert).toBe(true);

    btn.click();
    expect(menu.inert).toBe(false);
    expect(menu.classList.contains("hidden")).toBe(false);
    expect(btn.getAttribute("aria-expanded")).toBe("true");

    btn.click();
    expect(menu.inert).toBe(true);
    expect(menu.classList.contains("hidden")).toBe(true);
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("closes menu when a link is clicked", () => {
    const { btn, menu } = createFixture();
    const link = menu.querySelector<HTMLAnchorElement>("a")!;

    initMobileMenu(btn, menu);
    expect(menu.inert).toBe(true);

    btn.click();
    expect(menu.inert).toBe(false);
    expect(menu.classList.contains("hidden")).toBe(false);

    link.click();
    expect(menu.classList.contains("hidden")).toBe(true);
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("cleanup removes all listeners", () => {
    const { btn, menu } = createFixture();

    const cleanup = initMobileMenu(btn, menu);
    cleanup();

    btn.click();
    expect(menu.inert).toBe(true);
    expect(menu.classList.contains("hidden")).toBe(true);
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });
});
