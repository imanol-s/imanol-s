import { getCollection } from "astro:content";

/** Returns all blog posts sorted by publishDate descending (newest first). */
export async function getSortedPosts() {
  return (await getCollection("posts")).sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime(),
  );
}
