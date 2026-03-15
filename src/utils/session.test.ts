// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { safeSessionGet, safeSessionSet } from "./session";

beforeEach(() => {
  sessionStorage.clear();
});

describe("safeSessionGet", () => {
  it("returns null when key is not set", () => {
    expect(safeSessionGet("missing")).toBeNull();
  });

  it("returns stored value when key exists", () => {
    sessionStorage.setItem("foo", "bar");
    expect(safeSessionGet("foo")).toBe("bar");
  });

  it("returns null and does not throw when sessionStorage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    expect(() => safeSessionGet("key")).not.toThrow();
    expect(safeSessionGet("key")).toBeNull();
    vi.restoreAllMocks();
  });
});

describe("safeSessionSet", () => {
  it("stores a value retrievable by sessionStorage", () => {
    safeSessionSet("hello", "world");
    expect(sessionStorage.getItem("hello")).toBe("world");
  });

  it("does not throw when sessionStorage is unavailable", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    expect(() => safeSessionSet("key", "value")).not.toThrow();
    vi.restoreAllMocks();
  });
});
