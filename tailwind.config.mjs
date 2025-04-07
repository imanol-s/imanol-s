/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["media"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    container: {
      center: true,
      screens: {
        sm: "100%",
        md: "100%",
        lg: "520px",
        xl: "620px",
      },
      padding: "2rem",
    },
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // Light mode colors
        "light-theme": "#E9EBEC",
        "primary-light": "#FBD144",
        "primary-hover-light": "#FFE071",

        // Olive Green Focus (ΔE < 15 for harmony)
        "dark-theme": "#1A1F1C", // Deep forest base
        "primary-dark": "#556B2F", // True olive
        "primary-hover-dark": "#6E8055", // Desaturated sage

        // Earthy complements (LAB color space optimized)
        "secondary-dark": "#B59F3A", // Mustard gold
        "tertiary-dark": "#8F6B5F", // Terracotta

        // Neutrals
        n200: "#d7d9da",
        // Neutral progression (green undertones)
        n900: "#0F1411", // Near-black
        n700: "#2D332D", // Mid-tone
        n500: "#404A42", // Subtle contrast
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
