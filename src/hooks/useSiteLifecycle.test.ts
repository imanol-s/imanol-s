// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Stub matchMedia before module loads (initial state resolves on first read)
window.matchMedia = vi
  .fn()
  .mockReturnValue({ matches: false, addEventListener: vi.fn() });

import {
  useSiteLifecycle,
  _resetForTesting,
  LIFECYCLE_SESSION_KEY,
} from "./useSiteLifecycle";

describe("useSiteLifecycle", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    window.history.replaceState({}, "", "/");
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: undefined,
    });
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: false, addEventListener: vi.fn() });
    _resetForTesting();
  });

  it("starts in loading state on first visit", () => {
    const { result } = renderHook(() => useSiteLifecycle());
    expect(result.current.state).toBe("loading");
  });

  it("advances through the full sequence and stops at ready", () => {
    const { result } = renderHook(() => useSiteLifecycle());

    act(() => result.current.advance());
    expect(result.current.state).toBe("overlay-playing");

    act(() => result.current.advance());
    expect(result.current.state).toBe("overlay-fading");

    act(() => result.current.advance());
    expect(result.current.state).toBe("ready");

    // ready is terminal
    act(() => result.current.advance());
    expect(result.current.state).toBe("ready");
  });

  it("sets sessionStorage when reaching ready", () => {
    const { result } = renderHook(() => useSiteLifecycle());

    act(() => result.current.advance());
    act(() => result.current.advance());
    act(() => result.current.advance());

    expect(sessionStorage.getItem(LIFECYCLE_SESSION_KEY)).toBe("true");
  });

  it("starts in ready state on return visit", () => {
    sessionStorage.setItem(LIFECYCLE_SESSION_KEY, "true");
    _resetForTesting();
    const { result } = renderHook(() => useSiteLifecycle());
    expect(result.current.state).toBe("ready");
  });

  it("starts in ready state when reduced motion is preferred", () => {
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: true, addEventListener: vi.fn() });
    _resetForTesting();
    const { result } = renderHook(() => useSiteLifecycle());
    expect(result.current.state).toBe("ready");
  });

  it("starts ready on a direct project visit", () => {
    window.history.replaceState({}, "", "/projects/library-management/");
    const { result } = renderHook(() => useSiteLifecycle());
    expect(result.current.state).toBe("ready");
  });

  it.each([
    { saveData: true },
    { effectiveType: "slow-2g" },
    { effectiveType: "2g" },
    { effectiveType: "3g" },
  ])("starts ready on a constrained connection: %j", (connection) => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: connection,
    });
    const { result } = renderHook(() => useSiteLifecycle());
    expect(result.current.state).toBe("ready");
  });

  it("continues when session storage is denied", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Denied", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Denied", "SecurityError");
    });
    const { result } = renderHook(() => useSiteLifecycle());
    expect(result.current.state).toBe("loading");
    act(() => result.current.advance());
    act(() => result.current.advance());
    act(() => result.current.advance());
    expect(result.current.state).toBe("ready");
  });
});
