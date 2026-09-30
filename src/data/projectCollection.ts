export interface ProjectEntry {
  id: string;
  data: {
    startDate: Date;
    title: string;
    url?: string;
  };
}

export interface ProjectPageData<T extends ProjectEntry> {
  prev: T | null;
  next: T | null;
  /** false when url is absent or empty */
  hasValidUrl: boolean;
}

/** Returns a new array sorted by startDate descending (newest first). */
export function getSortedProjects<T extends ProjectEntry>(projects: T[]): T[] {
  return [...projects].sort(
    (a, b) => b.data.startDate.getTime() - a.data.startDate.getTime(),
  );
}

/**
 * Computes all build-time page context for a project detail page.
 * Accepts an already-sorted collection array so this function stays framework-free.
 */
export function getProjectPageData<T extends ProjectEntry>(
  sortedProjects: T[],
  currentId: string,
): ProjectPageData<T> {
  const index = sortedProjects.findIndex((p) => p.id === currentId);
  const current = sortedProjects[index];

  const prev = index > 0 ? sortedProjects[index - 1] : null;
  const next =
    index < sortedProjects.length - 1 ? sortedProjects[index + 1] : null;

  const url = current?.data.url;
  const hasValidUrl = !!url && url.trim() !== "";

  return { prev, next, hasValidUrl };
}
