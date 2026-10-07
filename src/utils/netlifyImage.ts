import type { ImageMetadata } from "astro";

export const netlifyImage = (image: ImageMetadata) => {
  const url = (width: number) =>
    `/.netlify/images?url=${encodeURIComponent(image.src)}&w=${width}&fm=avif&q=80`;
  return {
    src: image.format === "svg" ? image.src : url(800),
    srcset:
      image.format === "svg"
        ? undefined
        : [400, 800, 1200].map((width) => `${url(width)} ${width}w`).join(", "),
    width: image.width,
    height: image.height,
  };
};
