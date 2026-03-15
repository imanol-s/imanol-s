// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import AnimationBoundary from "./AnimationBoundary";

function ThrowingChild() {
  throw new Error("test error");
}

function GoodChild() {
  return <div data-testid="child">OK</div>;
}

describe("AnimationBoundary", () => {
  it("renders children when no error occurs", () => {
    const { getByTestId } = render(
      <AnimationBoundary>
        <GoodChild />
      </AnimationBoundary>,
    );
    expect(getByTestId("child")).not.toBeNull();
  });

  it("renders null when a child throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <AnimationBoundary>
        <ThrowingChild />
      </AnimationBoundary>,
    );
    expect(container.innerHTML).toBe("");
    vi.restoreAllMocks();
  });
});
