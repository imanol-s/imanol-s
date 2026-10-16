export interface ProjectEntry {
  id: string;
  data: {
    startDate?: Date;
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

/** Dated projects sort newest first; undated projects follow in stable ID order. */
export function getSortedProjects<T extends ProjectEntry>(projects: T[]): T[] {
  return [...projects].sort((a, b) => {
    const aDate = a.data.startDate?.getTime();
    const bDate = b.data.startDate?.getTime();
    if (aDate !== undefined && bDate !== undefined) {
      return bDate - aDate || a.id.localeCompare(b.id);
    }
    if (aDate !== undefined) return -1;
    if (bDate !== undefined) return 1;
    return a.id.localeCompare(b.id);
  });
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
