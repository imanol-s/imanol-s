# Typed data and derived views

- Export typed non-content data from this directory. Keep career/education in `src/data/career.ts` and project facts in Astro collections.
- Edit career bullets only when explicitly requested; general copy improvements do not authorize those edits. When adding a current job, update the previous entry's `currentJob` flag.
- Keep project ordering in `src/data/projectCollection.ts`: dated projects newest first with stable ID tie-breaking, then undated projects in stable ID order.
