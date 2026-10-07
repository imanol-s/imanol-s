import { expect, it } from "vitest";
import { netlifyImage } from "./netlifyImage";

it("encodes source URLs and preserves dimensions across responsive CDN widths", () => {
  const image = {
    src: "/_astro/a cover.webp",
    width: 1600,
    height: 900,
    format: "webp" as const,
  };
  const result = netlifyImage(image);
  expect(result.width).toBe(1600);
  expect(result.height).toBe(900);
  const candidates = result.srcset!.split(", ");
  expect(
    candidates.map((candidate) => {
      const [source, descriptor] = candidate.split(" ");
      const params = new URL(source, "https://example.test").searchParams;
      expect(params.get("url")).toBe(image.src);
      expect(params.get("fm")).toBe("avif");
      expect(params.get("q")).toBe("80");
      expect(descriptor).toBe(`${params.get("w")}w`);
      return Number(params.get("w"));
    }),
  ).toEqual([400, 800, 1200]);
  expect(result.src).toBe(candidates[1].split(" ")[0]);
});

it("preserves SVGs without an unsupported raster transform", () => {
  expect(
    netlifyImage({
      src: "/_astro/portrait.svg",
      width: 200,
      height: 300,
      format: "svg",
    }),
  ).toEqual({
    src: "/_astro/portrait.svg",
    srcset: undefined,
    width: 200,
    height: 300,
  });
});
