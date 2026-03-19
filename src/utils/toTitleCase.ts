/**
 * Convert a string to AP-style Title Case.
 *
 * Articles, short prepositions, and coordinating conjunctions are lowercase
 * unless they are the first or last word.
 */
const AP_LOWERCASE = new Set([
  'a', 'an', 'the',                          // articles
  'and', 'but', 'or', 'nor', 'for', 'yet', 'so', // coordinating conjunctions
  'at', 'by', 'in', 'of', 'on', 'to', 'up',      // short prepositions
  'as', 'if', 'is', 'vs',                         // other AP-lowercase words
]);

export function toTitleCase(str: string): string {
  if (!str) return str;

  const words = str.split(' ');
  return words
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (i !== 0 && i !== words.length - 1 && AP_LOWERCASE.has(lower)) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}
