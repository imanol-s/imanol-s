/** Formats a Date or ISO string as "MMM YYYY" in uppercase. Returns null for invalid dates. */
export function formatDate(date: Date | string): string | null {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return null;
  return d
    .toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase();
}
