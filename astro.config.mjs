// @ts-check
import {defineConfig} from 'astro/config';
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
    site: 'https://imanols.dev',
    integrations: [mdx(), react(), icon(), sitemap()],
    vite: {
        plugins: [tailwindcss()],
        build: {
            // Target modern browsers — drops legacy polyfills, enables smaller output
            target: 'es2022',
            // Inline small assets to reduce HTTP requests
            assetsInlineLimit: 4096,
        },
    },
    markdown: {
        shikiConfig: {
            theme: 'plastic',
            wrap: true,
        },
    },
});
