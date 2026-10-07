import type { ImageMetadata } from "astro";

export const netlifyImage = (image: ImageMetadata) => {
  const useCdn = process.env.NETLIFY === "true" && image.format !== "svg";
  const url = (width: number) =>
    `/.netlify/images?url=${encodeURIComponent(image.src)}&w=${width}&fm=avif&q=80`;
  return {
    src: useCdn ? url(800) : image.src,
    srcset: useCdn
      ? [400, 800, 1200].map((width) => `${url(width)} ${width}w`).join(", ")
      : undefined,
    width: image.width,
    height: image.height,
  };
};
