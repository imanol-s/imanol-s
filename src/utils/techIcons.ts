// Utility: resolves technology names to icon paths. Not a data array like sibling modules.
const TECH_ICON_BASE_PATH = "/icons/catppuccin";

/**
 * Maps technology names to icon filenames.
 * 'file' is a sentinel for techs that have no dedicated icon — getTechIconPath returns null for these.
 */
const ICON_MAP: Record<string, string | undefined> = {
  accessibility: "file",
  astro: "astro",
  "control systems": "file",
  "data analysis": "file",
  "data structures": "file",
  "database design": "database",
  django: "django",
  "dynamic programming": "file",
  "graph theory": "file",
  isaacsim: "file",
  java: "java",
  jupyter: "jupyter",
  mysql: "database",
  "nvidia isaaclab": "file",
  "path planning": "file",
  "predictive modeling": "file",
  python: "python",
  r: "r",
  robotics: "file",
  ruff: "ruff",
  simulation: "file",
  sql: "database",
  sqlalchemy: "database",
  tailwind: "tailwind",
  typescript: "typescript",
  "typescript react": "typescript-react",
  "user research": "file",
  uv: "uv",
  vercel: "vercel",
  netlify: "netlify",
};

/** Returns the SVG icon path for a technology name, or null if no icon is mapped. */
export function getTechIconPath(tech: string): string | null {
  const normalized = tech.trim().toLowerCase();
  const mappedIcon = ICON_MAP[normalized];

  if (!mappedIcon || mappedIcon === "file") return null;

  return `${TECH_ICON_BASE_PATH}/${mappedIcon}.svg`;
}
