import { getCollection } from "astro:content";

/** Returns all projects sorted by startDate descending (newest first). */
export async function getSortedProjects() {
  return (await getCollection("projects")).sort(
    (a, b) => b.data.startDate.getTime() - a.data.startDate.getTime(),
  );
}
