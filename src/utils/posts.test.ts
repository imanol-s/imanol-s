import { describe, it, expect, vi } from "vitest";

vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
}));

import { getCollection } from "astro:content";
import { getSortedPosts } from "./posts";

describe("getSortedPosts", () => {
  it("returns posts sorted by publishDate descending (newest first)", async () => {
    const mockPosts = [
      { id: "old", data: { publishDate: new Date("2023-01-01") } },
      { id: "newest", data: { publishDate: new Date("2025-06-01") } },
      { id: "middle", data: { publishDate: new Date("2024-03-15") } },
    ];
    vi.mocked(getCollection).mockResolvedValue(mockPosts as never);

    const result = await getSortedPosts();

    expect(result.map((p) => p.id)).toEqual(["newest", "middle", "old"]);
  });

  it("returns an empty array when there are no posts", async () => {
    vi.mocked(getCollection).mockResolvedValue([]);

    const result = await getSortedPosts();

    expect(result).toEqual([]);
  });
});
