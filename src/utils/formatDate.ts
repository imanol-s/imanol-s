/**
 * Formats a Date as "Mon YYYY" (e.g. "Jan 2025") in UTC.
 * Single source of truth for all date rendering across the site.
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
