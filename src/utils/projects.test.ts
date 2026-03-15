import { describe, it, expect, vi } from "vitest";

vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
}));

import { getCollection } from "astro:content";
import { getSortedProjects } from "./projects";

describe("getSortedProjects", () => {
  it("returns projects sorted by startDate descending (newest first)", async () => {
    const mockProjects = [
      { id: "old", data: { startDate: new Date("2023-01-01") } },
      { id: "newest", data: { startDate: new Date("2025-06-01") } },
      { id: "middle", data: { startDate: new Date("2024-03-15") } },
    ];
    vi.mocked(getCollection).mockResolvedValue(mockProjects as never);

    const result = await getSortedProjects();

    expect(result.map((p) => p.id)).toEqual(["newest", "middle", "old"]);
  });

  it("returns an empty array when there are no projects", async () => {
    vi.mocked(getCollection).mockResolvedValue([]);

    const result = await getSortedProjects();

    expect(result).toEqual([]);
  });
});
