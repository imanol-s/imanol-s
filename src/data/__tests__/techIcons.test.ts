import { describe, it, expect } from "vitest";
import { getTechIconPath } from "../techIcons";

describe("getTechIconPath", () => {
  it("returns the correct path for a known icon", () => {
    expect(getTechIconPath("python")).toBe("/icons/catppuccin/python.svg");
  });

  it("returns null for an unknown tech", () => {
    expect(getTechIconPath("unknown-tech-xyz")).toBeNull();
  });

  it("returns null for a tech mapped to 'file'", () => {
    expect(getTechIconPath("accessibility")).toBeNull();
    expect(getTechIconPath("data analysis")).toBeNull();
  });

  it("normalizes input case-insensitively", () => {
    expect(getTechIconPath("Python")).toBe("/icons/catppuccin/python.svg");
    expect(getTechIconPath("TYPESCRIPT")).toBe(
      "/icons/catppuccin/typescript.svg",
    );
  });

  it("trims whitespace from input", () => {
    expect(getTechIconPath("  python  ")).toBe("/icons/catppuccin/python.svg");
  });

  it("handles multi-word tech names", () => {
    expect(getTechIconPath("database design")).toBe(
      "/icons/catppuccin/database.svg",
    );
    expect(getTechIconPath("typescript react")).toBe(
      "/icons/catppuccin/typescript-react.svg",
    );
  });
});
