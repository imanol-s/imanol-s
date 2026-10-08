import { afterEach, expect, it, vi } from "vitest";
import { netlifyImage } from "./netlifyImage";

afterEach(() => vi.unstubAllEnvs());

it("encodes source URLs and preserves dimensions across responsive CDN widths", () => {
  vi.stubEnv("NETLIFY", "true");
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
  vi.stubEnv("NETLIFY", "true");
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

it.each([undefined, "false"])(
  "preserves raster sources when NETLIFY is %s",
  (netlify) => {
    vi.stubEnv("NETLIFY", netlify);
    expect(
      netlifyImage({
        src: "/_astro/cover.webp",
        width: 1600,
        height: 900,
        format: "webp",
      }),
    ).toEqual({
      src: "/_astro/cover.webp",
      srcset: undefined,
      width: 1600,
      height: 900,
    });
  },
);
