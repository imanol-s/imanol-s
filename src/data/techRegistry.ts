import { z } from 'astro/zod';

const TECH_ICON_BASE_PATH = '/icons/catppuccin';

export interface TechEntry {
  id: string;
  iconPath?: string;
  displayName?: string;
  category?: string;
}

const REGISTRY = [
  { id: 'astro', iconPath: `${TECH_ICON_BASE_PATH}/astro.svg` },
  { id: 'database design', iconPath: `${TECH_ICON_BASE_PATH}/database.svg` },
  { id: 'django', iconPath: `${TECH_ICON_BASE_PATH}/django.svg` },
  { id: 'java', iconPath: `${TECH_ICON_BASE_PATH}/java.svg`, displayName: 'Java' },
  { id: 'jupyter', iconPath: `${TECH_ICON_BASE_PATH}/jupyter.svg` },
  { id: 'mysql', iconPath: `${TECH_ICON_BASE_PATH}/database.svg` },
  { id: 'python', iconPath: `${TECH_ICON_BASE_PATH}/python.svg`, displayName: 'Python' },
  { id: 'r', iconPath: `${TECH_ICON_BASE_PATH}/r.svg`, displayName: 'R' },
  { id: 'ruff', iconPath: `${TECH_ICON_BASE_PATH}/ruff.svg` },
  { id: 'sql', iconPath: `${TECH_ICON_BASE_PATH}/database.svg`, displayName: 'SQL' },
  { id: 'sqlalchemy', iconPath: `${TECH_ICON_BASE_PATH}/database.svg`, displayName: 'SQLAlchemy' },
  { id: 'tailwind', iconPath: `${TECH_ICON_BASE_PATH}/tailwind.svg` },
  { id: 'typescript', iconPath: `${TECH_ICON_BASE_PATH}/typescript.svg` },
  { id: 'typescript react', iconPath: `${TECH_ICON_BASE_PATH}/typescript-react.svg` },
  { id: 'uv', iconPath: `${TECH_ICON_BASE_PATH}/uv.svg` },
  { id: 'vercel', iconPath: `${TECH_ICON_BASE_PATH}/vercel.svg` },
  { id: 'netlify', iconPath: `${TECH_ICON_BASE_PATH}/netlify.svg` },
  // Tech tags without icons (topic-like, kept for registry completeness)
  { id: 'accessibility' },
  { id: 'control systems' },
  { id: 'data analysis' },
  { id: 'data structures' },
  { id: 'dynamic programming' },
  { id: 'graph theory' },
  { id: 'isaacsim' },
  { id: 'nvidia isaaclab' },
  { id: 'path planning' },
  { id: 'predictive modeling' },
  { id: 'simulation' },
  { id: 'robotics' },
  { id: 'user research' },
  // Additional tags from frontmatter
  { id: 'ggplot2' },
  { id: 'dplyr' },
  { id: 'topological sort' },
  { id: 'complexity analysis' },
] as const satisfies readonly TechEntry[];

export type TechId = (typeof REGISTRY)[number]['id'];

const LOOKUP_MAP = new Map<string, TechEntry>(
  REGISTRY.map((entry) => [entry.id, entry]),
);

export function lookupTech(tech: string): TechEntry | null {
  return LOOKUP_MAP.get(tech.trim().toLowerCase()) ?? null;
}

export interface TechView {
  id: string;
  displayName: string;
  iconPath: string | null;
}

export function getTechView(id: string): TechView {
  const entry = LOOKUP_MAP.get(id.trim().toLowerCase());
  return {
    id: entry?.id ?? id,
    displayName: entry?.displayName ?? id,
    iconPath: entry?.iconPath ?? null,
  };
}

export const techTagSchema = z.string().transform((s) => {
  const normalized = s.trim().toLowerCase();
  if (!LOOKUP_MAP.has(normalized)) {
    throw new Error(`Unknown tech tag "${s}". Valid: ${[...LOOKUP_MAP.keys()].join(', ')}`);
  }
  return normalized;
});

export { REGISTRY as techRegistry };
