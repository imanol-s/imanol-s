// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { satteri } from "@astrojs/markdown-satteri";

// https://astro.build/config
export default defineConfig({
  site: "https://imanols.dev",
  image: {
    breakpoints: [320, 400, 640, 750, 828, 1080, 1280, 1668, 2048, 2560],
  },
  redirects: {
    "/projects": "/#projects",
  },
  integrations: [mdx(), react(), icon(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Target modern browsers — drops legacy polyfills, enables smaller output
      target: "es2022",
      // Inline small assets to reduce HTTP requests
      assetsInlineLimit: 4096,
    },
  },
  markdown: {
    processor: satteri({
      features: { directive: true },
    }),
  },
});
