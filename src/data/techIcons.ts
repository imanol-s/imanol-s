const TECH_ICON_BASE_PATH = '/icons/catppuccin';

const ICON_MAP: Record<string, string> = {
  accessibility: 'file',
  astro: 'astro',
  'control systems': 'file',
  'data analysis': 'file',
  'data structures': 'file',
  'database design': 'database',
  django: 'django',
  'dynamic programming': 'file',
  'graph theory': 'file',
  isaacsim: 'file',
  java: 'java',
  jupyter: 'jupyter',
  mysql: 'database',
  'nvidia isaaclab': 'file',
  'path planning': 'file',
  'predictive modeling': 'file',
  python: 'python',
  r: 'r',
  robotics: 'file',
  ruff: 'ruff',
  simulation: 'file',
  sql: 'database',
  sqlalchemy: 'database',
  tailwind: 'tailwind',
  typescript: 'typescript',
  'typescript react': 'typescript-react',
  'user research': 'file',
  uv: 'uv',
  vercel: 'vercel',
  netlify: 'netlify',
};

const normalizeTechName = (tech: string): string => tech.trim().toLowerCase();

export const getTechIconPath = (tech: string): string => {
  const normalizedTech = normalizeTechName(tech);
  const mappedIcon = ICON_MAP[normalizedTech] ?? 'file';

  return `${TECH_ICON_BASE_PATH}/${mappedIcon}.svg`;
};
